# Fix HTTP 500 Error - Company Users

## Problem
Getting HTTP 500 error when trying to fetch user companies. This usually means:
1. The `company_users` or `companies` tables don't exist
2. RLS policies are blocking the query
3. The tables exist but aren't accessible

## Solution Steps

### Step 1: Verify Tables Exist

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'company_users');
```

**If tables don't exist**, run:
1. `CREATE_SAAS_MULTI_TENANT_SCHEMA.sql` - Creates the tables
2. `ADD_COMPANY_ID_TO_ALL_TABLES.sql` - Adds company_id to existing tables
3. `UPDATE_RLS_POLICIES_FOR_COMPANIES.sql` - Updates RLS policies

### Step 2: Check RLS Policies

```sql
-- Check RLS policies on company_users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'company_users';
```

**If policies are missing**, run `FIX_COMPANY_USERS_QUERY.sql`

### Step 3: Test the Query Directly

Run this in Supabase SQL Editor (replace with your user ID):

```sql
-- Test query (replace with your user ID)
SELECT 
    cu.*,
    c.*
FROM company_users cu
LEFT JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = 'f1c1befc-b508-4141-a56c-ec9926708985'
AND cu.is_active = true;
```

**If this fails**, check:
- User exists in `auth.users`
- User has entries in `company_users` table
- RLS policies allow the query

### Step 4: Verify Your Admin Setup

Run this to check if your admin user is set up correctly:

```sql
SELECT 
    u.id as user_id,
    u.email,
    p.full_name,
    c.name as company_name,
    cu.role as company_role,
    cu.is_primary,
    cu.is_active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';
```

**Expected result:**
- Should show your email
- Should show a company name
- Should show role as 'admin'
- Should show is_primary as true
- Should show is_active as true

**If missing data**, run `CREATE_DEFAULT_ADMIN_USER.sql` again

### Step 5: Fix RLS Policies (If Needed)

If the query works in SQL Editor but fails in the app, run:

```sql
-- Drop and recreate the policy
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;

CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Also fix companies policy
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies"
    ON companies FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );
```

## Quick Fix Script

Run this complete fix script:

```sql
-- 1. Ensure tables exist (run CREATE_SAAS_MULTI_TENANT_SCHEMA.sql first if needed)

-- 2. Fix RLS policies
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;
CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their companies" ON companies;
CREATE POLICY "Users can view their companies"
    ON companies FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- 3. Verify your admin user exists
SELECT 
    u.email,
    c.name as company_name,
    cu.role,
    cu.is_active
FROM auth.users u
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';
```

## After Fixing

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R)
2. **Check browser console** - errors should be gone
3. **You should see** your company name in the header
4. **Dashboard should load** with your company data

## Still Having Issues?

1. Check Supabase Dashboard → Logs for detailed error messages
2. Verify all SQL scripts were run successfully
3. Check that your user ID matches in all tables
4. Try logging out and logging back in

