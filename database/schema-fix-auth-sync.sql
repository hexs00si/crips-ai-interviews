-- =====================================================
-- CRISP AI INTERVIEWS - CORRECTED SCHEMA WITH AUTH SYNC
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DROP AND RECREATE USERS TABLE (FIXED VERSION)
-- =====================================================
-- Drop existing users table if it exists (be careful in production!)
-- Comment out the next line if you have existing data you want to preserve
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table that syncs with Supabase Auth
CREATE TABLE IF NOT EXISTS users (
    -- Use auth.users.id as primary key for sync
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Remove password_hash since Supabase Auth handles this
    role VARCHAR(20) NOT NULL DEFAULT 'interviewer'
        CHECK (role IN ('interviewer', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- 3. CREATE AUDIT LOG TABLE (for security tracking)
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
-- 4. CREATE FUNCTIONS
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

-- FIXED: Function to validate email format (corrected syntax)
CREATE OR REPLACE FUNCTION validate_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. AUTH SYNC FUNCTIONS (NEW!)
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
    );

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
            WHEN NEW.last_sign_in_at > OLD.last_sign_in_at THEN NEW.last_sign_in_at
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
    -- This should cascade automatically due to foreign key, but we'll be explicit
    DELETE FROM public.users WHERE id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log user actions
DROP TRIGGER IF EXISTS log_users_actions ON users;
CREATE TRIGGER log_users_actions
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_action();

-- Trigger to validate email before insert/update
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

DROP TRIGGER IF EXISTS validate_users_email ON users;
CREATE TRIGGER validate_users_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_email();

-- =====================================================
-- 7. AUTH SYNC TRIGGERS (NEW!)
-- =====================================================

-- Trigger to create custom user when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger to update custom user when auth user is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_update();

-- Trigger to delete custom user when auth user is deleted
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_delete();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) SETUP (UPDATED)
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can view their audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role audit access" ON audit_logs;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view their own data" ON users
    FOR ALL USING (auth.uid() = id);

-- Policy: Service role can access all data (for serverless functions)
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Authenticated users can view audit logs related to them
CREATE POLICY "Users can view their audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Service role can manage all audit logs
CREATE POLICY "Service role audit access" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. HELPFUL VIEWS FOR QUERIES
-- =====================================================

-- View for active users only
CREATE OR REPLACE VIEW active_users AS
SELECT
    id,
    email,
    role,
    first_name,
    last_name,
    company,
    email_verified,
    last_login_at,
    created_at,
    updated_at
FROM users
WHERE is_active = true;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
    COUNT(*) FILTER (WHERE role = 'interviewer') as interviewers,
    COUNT(*) FILTER (WHERE role = 'admin') as admins,
    COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '30 days') as active_last_30_days
FROM users;

-- =====================================================
-- 10. UTILITY FUNCTIONS FOR APPLICATION (UPDATED)
-- =====================================================

-- Function to get user by email (for authentication) - UPDATED
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(
    id UUID,
    email VARCHAR,
    role VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    is_active BOOLEAN,
    email_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.is_active,
        u.email_verified
    FROM users u
    WHERE u.email = LOWER(user_email) AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = user_id;

    -- Log the login action
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (user_id, 'user_login', jsonb_build_object('timestamp', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. MIGRATION FUNCTION FOR EXISTING AUTH USERS (NEW!)
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
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Query to check if sync is working
-- Run this after setting up to verify the sync is working:
/*
-- 1. Check existing auth users:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Check corresponding custom users:
SELECT id, email, role, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- 3. Check audit logs:
SELECT user_id, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- 4. Test migration function:
SELECT migrate_existing_auth_users();
*/