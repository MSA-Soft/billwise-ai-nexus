# Step-by-Step Fix for HTTP 500 Error

## The Problem
You're getting HTTP 500 errors when the app tries to fetch `company_users`. This means the database query is failing.

## Quick Diagnosis

### Step 1: Check if Tables Exist

Run this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'company_users');
```

**Expected:** Should show both `companies` and `company_users`

**If missing:** Run `CREATE_SAAS_MULTI_TENANT_SCHEMA.sql` first

### Step 2: Run the Quick Fix

Run `QUICK_FIX_COMPANY_500_ERROR.sql` in Supabase SQL Editor.

This will:
- ✅ Create/update RLS policies
- ✅ Test the query
- ✅ Show you what's wrong

### Step 3: Verify Your Admin User

Run this (with your user ID):

```sql
SELECT 
    u.email,
    cu.id as company_user_id,
    cu.role,
    cu.is_active,
    cu.is_primary,
    c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';
```

**Expected Result:**
- Your email
- A company_user_id (not NULL)
- role = 'admin'
- is_active = true
- is_primary = true
- A company name

**If any are NULL/missing:** Run `CREATE_DEFAULT_ADMIN_USER.sql` again

### Step 4: Test the Query Manually

Run this exact query (what the app is trying to do):

```sql
SELECT 
    id, company_id, user_id, role, is_primary, is_active, joined_at
FROM company_users
WHERE user_id = 'f1c1befc-b508-4141-a56c-ec9926708985'
AND is_active = true;
```

**If this fails:**
- Check RLS policies (run QUICK_FIX_COMPANY_500_ERROR.sql)
- Verify user_id exists in auth.users
- Check if company_users table has data

**If this works:** The app should work too after refreshing

## Common Issues & Fixes

### Issue 1: "relation company_users does not exist"
**Fix:** Run `CREATE_SAAS_MULTI_TENANT_SCHEMA.sql`

### Issue 2: "permission denied for table company_users"
**Fix:** Run `QUICK_FIX_COMPANY_500_ERROR.sql` to fix RLS policies

### Issue 3: Query returns empty (no rows)
**Fix:** Run `CREATE_DEFAULT_ADMIN_USER.sql` to create your admin user

### Issue 4: "column does not exist"
**Fix:** Check table structure matches the schema. Run:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'company_users';
```

## After Fixing

1. **Hard refresh browser:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Check console:** Should see "Successfully loaded companies: X"
3. **Check UI:** Should see company name in header, not "No Company Access"

## Still Not Working?

Run the diagnostic script:

```sql
-- Run DIAGNOSE_COMPANY_TABLES.sql
-- This will show you exactly what's wrong
```

Then share the results and I can help further!

