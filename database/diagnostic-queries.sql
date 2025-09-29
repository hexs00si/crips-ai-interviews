-- =====================================================
-- DIAGNOSTIC QUERIES - Check Current Auth Sync Status
-- Run these queries in Supabase SQL Editor to diagnose your current setup
-- =====================================================

-- =====================================================
-- 1. CHECK EXISTING AUTH USERS
-- =====================================================
SELECT
    'Auth Users Count' as check_type,
    COUNT(*) as count
FROM auth.users;

SELECT
    'Recent Auth Users' as check_type,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 2. CHECK CUSTOM USERS TABLE
-- =====================================================
SELECT
    'Custom Users Count' as check_type,
    COUNT(*) as count
FROM users;

SELECT
    'Recent Custom Users' as check_type,
    id,
    email,
    role,
    email_verified,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 3. CHECK SYNC STATUS
-- =====================================================
-- Auth users that are NOT in custom users table
SELECT
    'Auth users missing from custom table' as issue_type,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- Custom users that are NOT in auth users table
SELECT
    'Custom users missing from auth table' as issue_type,
    u.id,
    u.email,
    u.created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- 4. CHECK TRIGGERS EXISTENCE
-- =====================================================
SELECT
    'Auth Sync Triggers Status' as check_type,
    tgname as trigger_name,
    tgenabled as enabled
FROM pg_trigger
WHERE tgname IN ('on_auth_user_created', 'on_auth_user_updated', 'on_auth_user_deleted')
ORDER BY tgname;

-- =====================================================
-- 5. CHECK TABLE SCHEMAS
-- =====================================================
-- Check if users table has correct structure
SELECT
    'Users Table Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for foreign key constraint to auth.users
SELECT
    'Foreign Key Constraints' as check_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'users'
AND tc.table_schema = 'public';

-- =====================================================
-- 6. CHECK RLS POLICIES
-- =====================================================
SELECT
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('users', 'audit_logs')
ORDER BY tablename, policyname;

-- =====================================================
-- 7. SUMMARY DIAGNOSIS
-- =====================================================
WITH auth_count AS (
    SELECT COUNT(*) as auth_users FROM auth.users
),
custom_count AS (
    SELECT COUNT(*) as custom_users FROM users
),
sync_issues AS (
    SELECT COUNT(*) as missing_in_custom
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id
    WHERE u.id IS NULL
),
trigger_count AS (
    SELECT COUNT(*) as sync_triggers
    FROM pg_trigger
    WHERE tgname IN ('on_auth_user_created', 'on_auth_user_updated', 'on_auth_user_deleted')
    AND tgenabled = 'O'
)
SELECT
    'DIAGNOSIS SUMMARY' as summary,
    ac.auth_users,
    cc.custom_users,
    si.missing_in_custom as users_not_synced,
    tc.sync_triggers as active_sync_triggers,
    CASE
        WHEN ac.auth_users = 0 THEN 'No auth users exist yet'
        WHEN cc.custom_users = 0 THEN '❌ ISSUE: No custom users - sync is broken'
        WHEN si.missing_in_custom > 0 AND tc.sync_triggers = 0 THEN '❌ ISSUE: Users exist but no sync triggers'
        WHEN si.missing_in_custom > 0 AND tc.sync_triggers > 0 THEN '⚠️  ISSUE: Sync triggers exist but some users not synced'
        WHEN ac.auth_users = cc.custom_users AND tc.sync_triggers = 3 THEN '✅ PERFECT: All users synced and triggers active'
        ELSE '⚠️  Check individual issues above'
    END as diagnosis
FROM auth_count ac, custom_count cc, sync_issues si, trigger_count tc;

-- =====================================================
-- 8. RECOMMENDED ACTIONS BASED ON DIAGNOSIS
-- =====================================================
/*
Based on your diagnosis results:

If "users_not_synced" > 0 and "active_sync_triggers" = 0:
→ You need to run the schema-fix-auth-sync.sql script

If "users_not_synced" > 0 and "active_sync_triggers" = 3:
→ Run: SELECT migrate_existing_auth_users();

If "custom_users" = 0:
→ Your users table is empty, run the full schema setup

If diagnosis shows "PERFECT":
→ Your sync is working correctly! Test with a new user signup.
*/