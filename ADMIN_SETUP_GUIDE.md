# 🔐 Admin User Setup Guide

## Overview

There is **NO default admin account** in the system. You need to create your first admin user manually. This guide shows you how.

---

## Quick Setup (5 Minutes)

### Step 1: Create User in Supabase Auth

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** → **"Create new user"**
4. Fill in:
   - **Email**: `admin@yourcompany.com` (or your email)
   - **Password**: Choose a strong password (save it!)
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create User"**
6. **Copy the User ID** (UUID) - you'll need it in the next step

### Step 2: Run SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `CREATE_DEFAULT_ADMIN_USER.sql`
3. **Option A - Quick Setup (Recommended)**:
   - Find the section: `OPTION 2: Quick Setup Script`
   - Replace `'USER_EMAIL_HERE'` with your email (the one you used in Step 1)
   - Run the script
   
4. **Option B - Manual Setup**:
   - Find the section: `OPTION 1: Create Admin User via Supabase Dashboard`
   - Replace `'USER_ID_HERE'` with the User ID you copied
   - Replace `'admin@yourcompany.com'` with your email
   - Run the script

### Step 3: Verify Setup

Run this query to verify:

```sql
SELECT 
    u.email,
    p.full_name,
    p.role as profile_role,
    c.name as company_name,
    cu.role as company_role,
    cu.is_primary
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email
```

You should see:
- ✅ Email matches
- ✅ Full name: "System Administrator"
- ✅ Company role: `admin` (in company_users table)
- ✅ is_primary: `true`

### Step 4: Sign In

1. Go to your application: `http://localhost:5173` (or your URL)
2. Click **"Sign In"**
3. Enter your email and password
4. You should now be logged in as admin!

---

## What Gets Created

When you run the script, it creates:

1. **User Profile** (`profiles` table)
   - Links to your Supabase Auth user
   - Stores full name and email
   - Note: Roles are NOT stored here

2. **Default Company** (`companies` table)
   - Name: "Default Company"
   - Slug: "default-company"
   - Subscription: Enterprise tier

3. **Company User** (`company_users` table)
   - Links you to the company
   - Sets your role as `admin` (THIS is where the role is stored)
   - Marks it as your primary company

---

## For Development/Testing

If you want a quick test admin account:

### Test Credentials (Development Only!)

```
Email: admin@billwise.local
Password: Admin123!
```

**Steps:**
1. Create this user in Supabase Auth (as shown in Step 1)
2. Run the SQL script with email: `admin@billwise.local`
3. Sign in with these credentials

⚠️ **WARNING**: Never use default credentials in production!

---

## Troubleshooting

### Issue: "User not found"
**Solution**: 
- Make sure you created the user in Supabase Auth first
- Check that the email matches exactly (case-sensitive)
- Verify the user exists: `SELECT * FROM auth.users WHERE email = 'your-email@example.com';`

### Issue: "Cannot insert into profiles"
**Solution**:
- Make sure you've run `CREATE_SAAS_MULTI_TENANT_SCHEMA.sql` first
- Check that the `profiles` table exists
- Verify RLS policies allow the insert

### Issue: "No company selected" after login
**Solution**:
- Verify the `company_users` entry was created
- Check `is_primary = true` is set
- Run the verification query to check

### Issue: Can't access `/companies` page
**Solution**:
- Verify your role is `admin` in `company_users` table
- Check that `is_active = true`
- Refresh the page after fixing

---

## Multiple Admin Users

To create additional admin users:

1. Create user in Supabase Auth
2. Run this SQL (replace values):

```sql
-- Get user ID
SELECT id FROM auth.users WHERE email = 'newadmin@example.com';

-- Create profile
-- Note: profiles table doesn't have a 'role' column
INSERT INTO profiles (id, email, full_name)
VALUES (
    'USER_ID_FROM_ABOVE',
    'newadmin@example.com',
    'Admin Name'
);

-- Add to existing company (or create new one)
INSERT INTO company_users (company_id, user_id, role, is_primary, is_active)
VALUES (
    (SELECT id FROM companies WHERE slug = 'default-company'),
    'USER_ID_FROM_ABOVE',
    'admin',
    false,  -- Not primary if you want to keep the first one as primary
    true
);
```

---

## Security Best Practices

1. **Strong Passwords**: Use complex passwords (12+ characters, mixed case, numbers, symbols)
2. **Change Defaults**: Never use default credentials in production
3. **Limit Admins**: Only create admin accounts for trusted users
4. **Regular Audits**: Periodically review admin users
5. **MFA**: Enable Multi-Factor Authentication in Supabase (recommended)

---

## Next Steps

After creating your admin account:

1. ✅ Sign in to the application
2. ✅ Create additional companies (if needed)
3. ✅ Add other users to companies
4. ✅ Configure company settings
5. ✅ Start using the system!

---

## Support

If you encounter issues:

1. Check Supabase SQL Editor for error messages
2. Verify all tables exist (run `\dt` in SQL Editor)
3. Check RLS policies are enabled
4. Review the verification query results

For more help, check:
- `SAAS_MULTI_TENANT_IMPLEMENTATION.md`
- Supabase documentation: https://supabase.com/docs

