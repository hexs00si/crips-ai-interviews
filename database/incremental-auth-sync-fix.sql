-- =====================================================
-- INCREMENTAL AUTH SYNC FIX - SAFE FOR EXISTING DATA
-- Run this if you want to keep your existing users table data
-- =====================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BACKUP EXISTING DATA (SAFETY FIRST)
-- =====================================================
-- Create backup table if users table has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE IF NOT EXISTS users_backup_pre_sync AS SELECT * FROM users;
        RAISE NOTICE 'Backup created: users_backup_pre_sync';
    END IF;
END $$;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO EXISTING USERS TABLE
-- =====================================================
-- Add email_verified column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added email_verified column';
    END IF;
END $$;

-- =====================================================
-- 3. REMOVE PROBLEMATIC COLUMNS
-- =====================================================
-- Remove password_hash column if it exists (Supabase Auth handles this)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users DROP COLUMN password_hash;
        RAISE NOTICE 'Removed password_hash column - Supabase Auth handles passwords';
    END IF;
END $$;

-- =====================================================
-- 4. MODIFY PRIMARY KEY TO REFERENCE AUTH.USERS
-- =====================================================
-- This is more complex for existing tables with data
-- We'll create a new approach that works with existing data

-- First, check if we need to modify the primary key relationship
DO $$
DECLARE
    has_auth_fk BOOLEAN := false;
BEGIN
    -- Check if foreign key to auth.users already exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'users'
        AND ccu.table_name = 'users'  -- This should be auth.users but information_schema shows it as users
        AND kcu.column_name = 'id'
    ) INTO has_auth_fk;

    IF NOT has_auth_fk THEN
        -- Add foreign key constraint if it doesn't exist
        -- Note: This will only work if all IDs in users table exist in auth.users
        BEGIN
            ALTER TABLE users ADD CONSTRAINT users_id_fkey
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint to auth.users';
        EXCEPTION
            WHEN foreign_key_violation THEN
                RAISE WARNING 'Cannot add foreign key constraint - some user IDs do not exist in auth.users. Manual sync needed.';
            WHEN OTHERS THEN
                RAISE WARNING 'Could not add foreign key constraint: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- =====================================================
-- 5. CREATE AUDIT LOG TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);

-- =====================================================
-- 6. CREATE/UPDATE FUNCTIONS
-- =====================================================

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log user creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (NEW.id, 'user_created',
                jsonb_build_object(
                    'email', NEW.email,
                    'role', NEW.role,
                    'first_name', NEW.first_name,
                    'last_name', NEW.last_name
                ));
        RETURN NEW;
    END IF;

    -- Log user updates
    IF TG_OP = 'UPDATE' THEN
        -- Only log significant changes
        IF OLD.email != NEW.email OR
           OLD.is_active != NEW.is_active OR
           OLD.role != NEW.role THEN
            INSERT INTO audit_logs (user_id, action, details)
            VALUES (NEW.id, 'user_updated',
                    jsonb_build_object(
                        'old_email', OLD.email,
                        'new_email', NEW.email,
                        'old_active', OLD.is_active,
                        'new_active', NEW.is_active,
                        'old_role', OLD.role,
                        'new_role', NEW.role
                    ));
        END IF;
        RETURN NEW;
    END IF;

    -- Log user deletion
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (OLD.id, 'user_deleted',
                jsonb_build_object(
                    'email', OLD.email,
                    'role', OLD.role
                ));
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- FIXED: Function to validate email format
CREATE OR REPLACE FUNCTION validate_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. AUTH SYNC FUNCTIONS
-- =====================================================

-- Function to handle new auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert new user into custom users table when auth.users record is created
    INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified,
        updated_at = EXCLUDED.updated_at;

    -- Log the auth user creation
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (NEW.id, 'auth_user_created',
            jsonb_build_object(
                'email', NEW.email,
                'provider', COALESCE(NEW.app_metadata->>'provider', 'email')
            ));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auth user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update corresponding record in custom users table
    UPDATE public.users
    SET
        email = NEW.email,
        email_verified = NEW.email_confirmed_at IS NOT NULL,
        last_login_at = CASE
            WHEN NEW.last_sign_in_at > COALESCE(OLD.last_sign_in_at, '1970-01-01'::timestamptz) THEN NEW.last_sign_in_at
            ELSE last_login_at
        END,
        updated_at = NEW.updated_at
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auth user deletion
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete corresponding record from custom users table
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE/UPDATE TRIGGERS
-- =====================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS log_users_actions ON users;
DROP TRIGGER IF EXISTS validate_users_email ON users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Recreate all triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER log_users_actions
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_action();

-- Email validation trigger
CREATE OR REPLACE FUNCTION validate_user_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_email(NEW.email) THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;

    -- Convert email to lowercase for consistency
    NEW.email = LOWER(NEW.email);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_users_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_email();

-- Auth sync triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_update();

CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_delete();

-- =====================================================
-- 9. UPDATE RLS POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can view their audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role audit access" ON audit_logs;

-- Recreate policies
CREATE POLICY "Users can view their own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role audit access" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 10. SYNC EXISTING AUTH USERS
-- =====================================================

-- Function to sync existing auth users to custom users table
CREATE OR REPLACE FUNCTION migrate_existing_auth_users()
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER := 0;
    auth_user RECORD;
BEGIN
    -- Loop through all existing auth users
    FOR auth_user IN
        SELECT id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at
        FROM auth.users
    LOOP
        -- Insert into custom users table if not exists
        INSERT INTO public.users (id, email, email_verified, last_login_at, created_at, updated_at)
        VALUES (
            auth_user.id,
            auth_user.email,
            auth_user.email_confirmed_at IS NOT NULL,
            auth_user.last_sign_in_at,
            auth_user.created_at,
            auth_user.updated_at
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            email_verified = EXCLUDED.email_verified,
            last_login_at = EXCLUDED.last_login_at,
            updated_at = EXCLUDED.updated_at;

        user_count := user_count + 1;
    END LOOP;

    -- Log the migration
    INSERT INTO audit_logs (action, details)
    VALUES ('migration_completed',
            jsonb_build_object(
                'migrated_users', user_count,
                'timestamp', NOW()
            ));

    RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. EXECUTE MIGRATION
-- =====================================================

-- Automatically run the migration
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT migrate_existing_auth_users() INTO migrated_count;
    RAISE NOTICE 'Migration completed: % users synced', migrated_count;
END $$;

-- =====================================================
-- 12. FINAL VERIFICATION
-- =====================================================

-- Show sync status
DO $$
DECLARE
    auth_count INTEGER;
    custom_count INTEGER;
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO custom_count FROM users;

    SELECT COUNT(*) INTO missing_count
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id
    WHERE u.id IS NULL;

    RAISE NOTICE '=== SYNC STATUS ===';
    RAISE NOTICE 'Auth users: %', auth_count;
    RAISE NOTICE 'Custom users: %', custom_count;
    RAISE NOTICE 'Missing in custom: %', missing_count;

    IF missing_count = 0 AND auth_count = custom_count THEN
        RAISE NOTICE '✅ SUCCESS: All users are synced!';
    ELSE
        RAISE WARNING '⚠️  Some users may not be synced properly';
    END IF;
END $$;