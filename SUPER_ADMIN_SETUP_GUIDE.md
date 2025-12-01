# 🔐 Super Admin System Setup Guide

## Overview

The Super Admin system allows a special user to manage all companies in the system with full access and control.

## Super Admin Capabilities

### ✅ Company Management
- **Create Companies**: Add new companies to the system
- **Edit Companies**: Update company information and settings
- **Delete Companies**: Permanently remove companies
- **Enable/Disable Companies**: Activate or deactivate company access
- **View All Companies**: See all companies regardless of membership

### ✅ User Management
- **Create Users**: Create new users with email/password
- **Add Users to Companies**: Assign users to any company
- **Assign Roles**: Set user roles (admin, manager, user, viewer)
- **View All Users**: See all users across all companies

### ✅ Statistics & Analytics
- **View All Statistics**: See statistics for all companies
- **Company Metrics**: Users, patients, claims, revenue per company
- **System-Wide Analytics**: Total users, revenue, claims across all companies

### ✅ Full Data Access
- **Access All Data**: View and manage data from all companies
- **No Company Restrictions**: Not limited to specific companies
- **Bypass RLS**: Can access data through special RLS policies

---

## Setup Steps

### Step 1: Run Database Schema

Run this SQL script in Supabase SQL Editor:

**`CREATE_SUPER_ADMIN_SYSTEM.sql`**

This will:
- Add `is_super_admin` column to profiles table
- Create helper functions for super admin checks
- Update RLS policies to allow super admin access
- Create statistics view
- Create audit log table

### Step 2: Make Your User Super Admin

Run this SQL script in Supabase SQL Editor:

**`CREATE_SUPER_ADMIN_USER.sql`**

Or run this command directly:

```sql
-- Make user super admin by email
SELECT make_super_admin('srjstd021@gmail.com');

-- OR by user ID
UPDATE profiles
SET is_super_admin = true
WHERE id = 'f1c1befc-b508-4141-a56c-ec9926708985';
```

### Step 3: Verify Super Admin Status

Run this query to verify:

```sql
SELECT 
    u.email,
    p.full_name,
    p.is_super_admin,
    CASE 
        WHEN p.is_super_admin = true THEN '✅ Super Admin'
        ELSE '❌ Regular User'
    END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';
```

### Step 4: Access Super Admin Dashboard

1. **Log in** to the application
2. **Look for "Super Admin"** in the sidebar (purple icon)
3. **Click "Super Admin"** to access the dashboard
4. You should see all companies and management options

---

## Super Admin Dashboard Features

### Companies Tab
- **View All Companies**: Table showing all companies
- **Create Company**: Button to add new companies
- **Edit Company**: Update company details
- **Delete Company**: Remove companies permanently
- **Enable/Disable**: Toggle company active status
- **View Statistics**: See detailed stats for each company

### Statistics Tab
- **Company Statistics**: Detailed metrics per company
- **User Counts**: Total users per company
- **Patient Counts**: Total patients per company
- **Claim Counts**: Professional and institutional claims
- **Revenue**: Paid and pending amounts per company

### Actions Available
- **Add User to Company**: Create user and assign to company
- **View Company Stats**: Detailed analytics per company
- **Manage Company Settings**: Update subscription, contact info, etc.

---

## Creating Companies with Limited Access

### Step 1: Create Company
1. Go to **Super Admin** dashboard
2. Click **"Create Company"**
3. Fill in company details:
   - Name: "Acme Medical Group"
   - Slug: "acme-medical" (auto-generated)
   - Email, phone, address
   - Subscription tier: basic/professional/enterprise
4. Click **"Create Company"**

### Step 2: Add Users to Company
1. Click **"Add User"** icon on the company row
2. Fill in user details:
   - Email: user@company.com
   - Password: (choose password)
   - Full Name: User Name
   - Role: admin/manager/user/viewer
3. Click **"Create User"**

The user will be:
- Created in Supabase Auth
- Added to the company
- Assigned the selected role
- Can log in immediately

### Step 3: Set Company Access Limits
- **Disable Company**: Click power icon to disable (stops all access)
- **Change Subscription**: Edit company to change tier
- **Manage Users**: Add/remove users as needed

---

## User Roles Explained

### Super Admin
- Full system access
- Can manage all companies
- Can create/delete companies
- Can access all data
- Not limited by company boundaries

### Company Admin
- Full access to their company
- Can manage company users
- Can update company settings
- Limited to their company only

### Manager
- Most management functions
- Can manage users (limited)
- Cannot change company settings
- Limited to their company

### User
- Standard read/write access
- Can create/edit records
- Cannot manage users
- Limited to their company

### Viewer
- Read-only access
- Can view data
- Cannot create/edit
- Limited to their company

---

## Managing Companies

### Enable/Disable Company
- **Enable**: Company users can access the system
- **Disable**: All company users are blocked (company still exists)

### Delete Company
- **Warning**: This permanently deletes the company and all its data
- Use with caution - cannot be undone
- All related data (patients, claims, etc.) will be deleted

### View Company Statistics
Click the **bar chart icon** to see:
- Total users
- Total patients
- Total claims (professional + institutional)
- Total revenue (paid + pending)
- Last activity dates

---

## Security Features

### Audit Logging
All super admin actions are logged:
- Company creation/deletion
- User creation
- Company status changes
- Access to company data

### RLS Policies
- Super admins bypass normal RLS restrictions
- Can access all companies through special policies
- Regular users still restricted to their companies

### Access Control
- Only users with `is_super_admin = true` can access super admin features
- Super admin status checked on every request
- Cannot be bypassed through UI manipulation

---

## Troubleshooting

### Issue: "Super Admin" not showing in sidebar
**Solution:**
1. Verify `is_super_admin = true` in profiles table
2. Refresh browser (hard refresh: Ctrl+Shift+R)
3. Check browser console for errors

### Issue: Can't create companies
**Solution:**
1. Verify super admin status in database
2. Check RLS policies are updated
3. Run `CREATE_SUPER_ADMIN_SYSTEM.sql` again

### Issue: Can't see all companies
**Solution:**
1. Verify `is_super_admin = true`
2. Check RLS policies allow super admin access
3. Verify `getAllCompanies()` method works

### Issue: Can't create users
**Solution:**
1. Verify you have super admin privileges
2. Check Supabase Auth settings allow user creation
3. Verify email is unique

---

## API Reference

### Super Admin Methods

```typescript
// Check if user is super admin
const isSuper = await companyService.isSuperAdmin();

// Get all companies
const companies = await companyService.getAllCompanies();

// Get company statistics
const stats = await companyService.getCompanyStatistics();

// Delete company
await companyService.deleteCompany(companyId);

// Enable/disable company
await companyService.toggleCompanyStatus(companyId, true);

// Create user for company
await companyService.createUserForCompany(companyId, {
  email: 'user@example.com',
  password: 'password123',
  fullName: 'User Name',
  role: 'user'
});
```

---

## Next Steps

1. ✅ Run `CREATE_SUPER_ADMIN_SYSTEM.sql`
2. ✅ Run `CREATE_SUPER_ADMIN_USER.sql`
3. ✅ Log in and access Super Admin dashboard
4. ✅ Create your first company
5. ✅ Add users to the company
6. ✅ Test company switching
7. ✅ Verify data isolation works

---

## Support

For issues:
1. Check database setup (tables, RLS policies)
2. Verify super admin status in profiles table
3. Check browser console for errors
4. Review audit logs for action history

