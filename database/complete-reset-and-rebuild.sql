-- =====================================================
-- COMPLETE RESET AND REBUILD - SUPABASE FROM SCRATCH
-- ⚠️  WARNING: This will DELETE ALL your custom data!
-- Only run this if you're okay with losing everything!
-- =====================================================

-- =====================================================
-- 1. NUCLEAR OPTION - DROP EVERYTHING
-- =====================================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS active_users CASCADE;
DROP VIEW IF EXISTS user_stats CASCADE;

-- Drop all triggers on auth.users (must do this before dropping functions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Drop all triggers on custom tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS log_users_actions ON users;
DROP TRIGGER IF EXISTS validate_users_email ON users;

-- Drop all custom tables (CASCADE will handle dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS users_backup CASCADE;
DROP TABLE IF EXISTS users_backup_pre_sync CASCADE;

-- Drop all custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_user_action() CASCADE;
DROP FUNCTION IF EXISTS validate_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS validate_user_email() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS handle_user_delete() CASCADE;
DROP FUNCTION IF EXISTS get_user_by_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS migrate_existing_auth_users() CASCADE;

-- Note: We can't drop auth.users table (it's managed by Supabase)
-- But we can clear existing auth users if you want
-- Uncomment the next line ONLY if you want to delete your auth user too
-- DELETE FROM auth.users;

DO $$
BEGIN
    RAISE NOTICE '🧹 CLEANUP COMPLETE - All custom tables, functions, and triggers removed!';
END $$;

-- =====================================================
-- 2. FRESH START - CREATE EVERYTHING FROM SCRATCH
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    RAISE NOTICE '🏗️  STARTING FRESH BUILD...';
END $$;

-- =====================================================
-- 3. CREATE USERS TABLE (SYNCED WITH AUTH)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
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

DO $$
BEGIN
    RAISE NOTICE '✅ Users table created';
END $$;

-- =====================================================
-- 4. CREATE AUDIT LOG TABLE
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    RAISE NOTICE '✅ Audit logs table created';
END $$;

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

DO $$
BEGIN
    RAISE NOTICE '✅ Indexes created';
END $$;

-- =====================================================
-- 6. CREATE UTILITY FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Email validation
CREATE OR REPLACE FUNCTION validate_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Email validation trigger function
CREATE OR REPLACE FUNCTION validate_user_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_email(NEW.email) THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;

    NEW.email = LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_user_action()
RETURNS TRIGGER AS $$
BEGIN
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

    IF TG_OP = 'UPDATE' THEN
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

DO $$
BEGIN
    RAISE NOTICE '✅ Utility functions created';
END $$;

-- =====================================================
-- 7. AUTH SYNC FUNCTIONS (THE MAGIC!)
-- =====================================================

-- Handle new auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL,
        NEW.created_at,
        NEW.updated_at
    );

    INSERT INTO audit_logs (user_id, action, details)
    VALUES (NEW.id, 'auth_user_created',
            jsonb_build_object(
                'email', NEW.email,
                'provider', COALESCE(NEW.app_metadata->>'provider', 'email')
            ));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle auth user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET
        email = NEW.email,
        email_verified = NEW.email_confirmed_at IS NOT NULL,
        last_login_at = CASE
            WHEN NEW.last_sign_in_at > COALESCE(OLD.last_sign_in_at, '1970-01-01'::timestamptz)
            THEN NEW.last_sign_in_at
            ELSE last_login_at
        END,
        updated_at = NEW.updated_at
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle auth user deletion
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    RAISE NOTICE '✅ Auth sync functions created';
END $$;

-- =====================================================
-- 8. APPLICATION HELPER FUNCTIONS
-- =====================================================

-- Get user by email
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

-- Update last login
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = user_id;

    INSERT INTO audit_logs (user_id, action, details)
    VALUES (user_id, 'user_login', jsonb_build_object('timestamp', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    RAISE NOTICE '✅ Helper functions created';
END $$;

-- =====================================================
-- 9. CREATE ALL TRIGGERS
-- =====================================================

-- Users table triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_users_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_email();

CREATE TRIGGER log_users_actions
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_action();

-- Auth sync triggers (THE MAGIC HAPPENS HERE!)
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

DO $$
BEGIN
    RAISE NOTICE '✅ All triggers created - AUTH SYNC IS ACTIVE!';
END $$;

-- =====================================================
-- 10. SETUP ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can manage their own data"
    ON users FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Service role has full access"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage audit logs"
    ON audit_logs FOR ALL
    USING (auth.role() = 'service_role');

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies created';
END $$;

-- =====================================================
-- 11. CREATE HELPFUL VIEWS
-- =====================================================

CREATE VIEW active_users AS
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

CREATE VIEW user_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
    COUNT(*) FILTER (WHERE role = 'interviewer') as interviewers,
    COUNT(*) FILTER (WHERE role = 'admin') as admins,
    COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '30 days') as active_last_30_days
FROM users;

DO $$
BEGIN
    RAISE NOTICE '✅ Views created';
END $$;

-- =====================================================
-- 12. SYNC EXISTING AUTH USER (IF ANY)
-- =====================================================

-- Check if there are existing auth users and sync them
DO $$
DECLARE
    auth_user_count INTEGER;
    auth_user RECORD;
BEGIN
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;

    IF auth_user_count > 0 THEN
        RAISE NOTICE '🔄 Found % existing auth user(s), syncing...', auth_user_count;

        FOR auth_user IN
            SELECT id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at
            FROM auth.users
        LOOP
            INSERT INTO public.users (id, email, email_verified, last_login_at, created_at, updated_at)
            VALUES (
                auth_user.id,
                auth_user.email,
                auth_user.email_confirmed_at IS NOT NULL,
                auth_user.last_sign_in_at,
                auth_user.created_at,
                auth_user.updated_at
            );

            RAISE NOTICE '✅ Synced user: %', auth_user.email;
        END LOOP;

        RAISE NOTICE '🎉 All existing users synced!';
    ELSE
        RAISE NOTICE '👤 No existing auth users found - ready for first signup!';
    END IF;
END $$;

-- =====================================================
-- 13. FINAL STATUS CHECK
-- =====================================================

DO $$
DECLARE
    auth_count INTEGER;
    custom_count INTEGER;
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO custom_count FROM users;

    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname IN ('on_auth_user_created', 'on_auth_user_updated', 'on_auth_user_deleted')
    AND tgenabled = 'O';

    RAISE NOTICE '';
    RAISE NOTICE '🎯 === FINAL STATUS === ';
    RAISE NOTICE '👥 Auth users: %', auth_count;
    RAISE NOTICE '📊 Custom users: %', custom_count;
    RAISE NOTICE '🔗 Active sync triggers: %', trigger_count;
    RAISE NOTICE '';

    IF auth_count = custom_count AND trigger_count = 3 THEN
        RAISE NOTICE '🎉 SUCCESS! Your Supabase setup is PERFECT!';
        RAISE NOTICE '✅ Auth sync is working';
        RAISE NOTICE '✅ All users are synced';
        RAISE NOTICE '✅ Ready for production!';
    ELSE
        RAISE WARNING '⚠️  Something might be wrong. Check the counts above.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🚀 NEXT STEPS:';
    RAISE NOTICE '1. Test signup: Create a new user in your app';
    RAISE NOTICE '2. Verify: Both auth.users and users tables should get entries';
    RAISE NOTICE '3. Check: SELECT * FROM users; should show your user';
    RAISE NOTICE '';
END $$;