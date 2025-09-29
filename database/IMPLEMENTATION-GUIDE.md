# Supabase Auth + Custom Users Table Sync Fix

## Problem Summary
Your Supabase Auth is working (creating entries in `auth.users`), but your custom `users` table isn't getting populated because there's no synchronization mechanism between the two systems.

## Root Causes Found
1. **No sync mechanism** - Missing triggers to connect auth.users with your custom users table
2. **Schema mismatch** - Your custom users table has `password_hash` field which conflicts with Supabase Auth handling
3. **ID mismatch** - Your custom users table generates its own UUIDs instead of using `auth.users.id`
4. **SQL syntax errors** - Malformed `validate_email` function in your original schema
5. **RLS policies** - Not properly aligned with auth system

## Solution Overview
The fixed schema creates automatic synchronization between Supabase Auth and your custom users table using database triggers.

## Implementation Steps

### Step 1: Backup Your Data (IMPORTANT!)
```sql
-- Create backup of existing users table if it has data
CREATE TABLE users_backup AS SELECT * FROM users;
```

### Step 2: Apply the Fixed Schema
1. Open Supabase SQL Editor
2. Run the complete script: `/database/schema-fix-auth-sync.sql`
3. This will create the corrected schema with sync triggers

### Step 3: Migrate Existing Auth Users
```sql
-- Run this to sync any existing auth.users to your custom table
SELECT migrate_existing_auth_users();
```

### Step 4: Verify the Setup
```sql
-- 1. Check existing auth users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Check corresponding custom users (should match)
SELECT id, email, role, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- 3. Check audit logs
SELECT user_id, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Step 5: Test New User Registration
1. Try signing up a new user through your app
2. Verify that BOTH tables get populated:
   - `auth.users` (handled by Supabase Auth)
   - `users` (handled by our sync trigger)

## What Changed in the Fixed Schema

### 1. Users Table Schema
```sql
-- OLD (problematic):
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
password_hash VARCHAR(255) NOT NULL,  -- ❌ Conflicts with Supabase Auth

-- NEW (fixed):
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  -- ✅ Syncs with auth
-- password_hash removed - Supabase Auth handles this  -- ✅ No conflicts
```

### 2. New Sync Functions
- `handle_new_user()` - Creates custom user profile when auth user is created
- `handle_user_update()` - Syncs updates from auth.users to custom users
- `handle_user_delete()` - Removes custom user when auth user is deleted
- `migrate_existing_auth_users()` - One-time migration for existing users

### 3. New Sync Triggers
- `on_auth_user_created` - Fires when new auth.users record is created
- `on_auth_user_updated` - Fires when auth.users record is updated
- `on_auth_user_deleted` - Fires when auth.users record is deleted

### 4. Fixed SQL Errors
- Corrected `validate_email()` function syntax
- Fixed all PLPGSQL syntax issues
- Updated RLS policies to work with auth.uid()

## How It Works Now

### User Registration Flow:
1. User signs up via Supabase Auth → Creates record in `auth.users`
2. `on_auth_user_created` trigger fires → Automatically creates matching record in `users`
3. Your app can now query the `users` table for role, profile data, etc.

### User Update Flow:
1. Auth user data changes (email confirmation, etc.) → Updates `auth.users`
2. `on_auth_user_updated` trigger fires → Updates corresponding `users` record
3. Data stays in sync automatically

## Key Benefits
✅ **Automatic Sync** - No manual intervention needed
✅ **Data Consistency** - auth.users and users table always match
✅ **Role Management** - Custom users table handles roles, profile data
✅ **Audit Trail** - All changes are logged in audit_logs
✅ **Security** - Proper RLS policies with auth.uid()
✅ **Migration Support** - Existing auth users can be migrated

## Testing Checklist
- [ ] Run the migration script successfully
- [ ] Verify existing auth users are synced to custom table
- [ ] Test new user registration (should populate both tables)
- [ ] Test user login (should update last_login_at)
- [ ] Verify RLS policies work (users can only see their own data)
- [ ] Check audit logs are being created

## Troubleshooting

### If you get foreign key errors:
```sql
-- Check if there are orphaned records
SELECT u.id, u.email FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;
```

### If triggers aren't firing:
```sql
-- Check if triggers exist
SELECT * FROM pg_trigger WHERE tgname LIKE 'on_auth_%';
```

### If sync gets out of sync:
```sql
-- Re-run migration to fix
SELECT migrate_existing_auth_users();
```

## Production Considerations
- Test thoroughly in development first
- Consider maintenance window for production deployment
- Monitor audit_logs table size (implement cleanup if needed)
- Set up monitoring for sync failures

## Next Steps
After implementation, your authentication flow will be:
1. **Frontend** → Supabase Auth (handles passwords, sessions, etc.)
2. **Database** → Automatic sync to custom users table (handles roles, profile data)
3. **Backend** → Query custom users table for application-specific data

Your auth system will now work seamlessly with both Supabase's built-in authentication and your custom business logic!