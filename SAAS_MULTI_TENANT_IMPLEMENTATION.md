# SaaS Multi-Tenant Implementation Guide

## Overview

This document describes the multi-tenant SaaS architecture implementation for BillWise AI Nexus. The system now supports:

1. **Multiple Companies**: Each company has isolated data
2. **Admin Role**: Can select which company to view/manage
3. **Company Users**: Each user belongs to one or more companies with specific roles
4. **Data Isolation**: All data is filtered by `company_id` using Row Level Security (RLS)

---

## Database Schema

### 1. Run SQL Scripts in Order

Execute these SQL files in Supabase SQL Editor in this order:

1. **`CREATE_SAAS_MULTI_TENANT_SCHEMA.sql`**
   - Creates `companies` table
   - Creates `company_users` junction table
   - Creates `roles` and `permissions` tables
   - Sets up RLS policies for company management

2. **`ADD_COMPANY_ID_TO_ALL_TABLES.sql`**
   - Adds `company_id` column to all existing tables
   - Creates indexes for performance

3. **`UPDATE_RLS_POLICIES_FOR_COMPANIES.sql`**
   - Updates all RLS policies to filter by `company_id`
   - Ensures users can only see data from their companies

---

## Application Architecture

### Key Components

#### 1. **Company Service** (`src/services/companyService.ts`)
- Manages company CRUD operations
- Handles user-company relationships
- Manages roles and permissions

#### 2. **Updated AuthContext** (`src/contexts/AuthContext.tsx`)
- Now includes company context
- Tracks current company
- Provides company switching functionality
- Includes role helpers (`isAdmin()`, `isManager()`, `hasPermission()`)

#### 3. **Company Selector Component** (`src/components/CompanySelector.tsx`)
- Dropdown to switch between companies
- Shows current company in header
- Only visible if user has multiple companies

#### 4. **Company Management Page** (`src/pages/CompaniesPage.tsx`)
- Admin-only page to create/edit companies
- View all companies
- Manage company settings

#### 5. **Company Context Utilities** (`src/utils/companyContext.ts`)
- Helper functions to automatically add `company_id` to queries
- Ensures data isolation in all service calls

---

## Usage Guide

### For Admins

1. **Create a Company**
   - Navigate to `/companies`
   - Click "Create Company"
   - Fill in company details
   - You'll automatically be added as admin

2. **Switch Companies**
   - Click the company selector in the header
   - Select the company you want to view
   - All data will be filtered to that company

3. **Manage Company Users**
   - Go to company management page
   - Add users to companies
   - Assign roles (admin, manager, user, viewer)

### For Regular Users

1. **View Your Company**
   - You'll automatically see data from your primary company
   - If you belong to multiple companies, use the selector to switch

2. **Your Role**
   - Your role determines what you can do:
     - **Admin**: Full access to company settings
     - **Manager**: Can manage most aspects
     - **User**: Standard read/write access
     - **Viewer**: Read-only access

---

## Data Isolation

### How It Works

1. **Row Level Security (RLS)**
   - All tables have RLS policies that filter by `company_id`
   - Users can only see data from companies they belong to

2. **Automatic Filtering**
   - Services automatically add `company_id` to queries
   - New records automatically get `company_id` set

3. **Company Context**
   - Current company is stored in AuthContext
   - All service calls use this context

### Example Service Call

```typescript
// Before (old way)
const { data } = await supabase
  .from('patients')
  .select('*');

// After (with company filtering)
let query = supabase
  .from('patients')
  .select('*');
query = await withCompanyFilter(query);
const { data } = await query;
```

---

## Migration Steps

### 1. Database Setup

```sql
-- Run in Supabase SQL Editor:
-- 1. CREATE_SAAS_MULTI_TENANT_SCHEMA.sql
-- 2. ADD_COMPANY_ID_TO_ALL_TABLES.sql
-- 3. UPDATE_RLS_POLICIES_FOR_COMPANIES.sql
```

### 2. Create First Company

After running the SQL scripts:

1. Log in as an admin user
2. Navigate to `/companies`
3. Create your first company
4. You'll be automatically added as admin

### 3. Migrate Existing Data (Optional)

If you have existing data, you need to assign it to a company:

```sql
-- Get your company ID
SELECT id FROM companies WHERE name = 'Your Company Name';

-- Update existing data (replace COMPANY_ID with actual UUID)
UPDATE patients SET company_id = 'COMPANY_ID' WHERE company_id IS NULL;
UPDATE professional_claims SET company_id = 'COMPANY_ID' WHERE company_id IS NULL;
-- ... repeat for all tables
```

### 4. Add Users to Companies

```sql
-- Add user to company
INSERT INTO company_users (company_id, user_id, role, is_primary, is_active)
VALUES ('COMPANY_ID', 'USER_ID', 'user', true, true);
```

---

## API Changes

### AuthContext API

```typescript
const {
  // Existing
  user,
  session,
  loading,
  signIn,
  signUp,
  signOut,
  
  // New - Company Context
  currentCompany,        // Current selected company
  userCompanies,         // All companies user belongs to
  companyLoading,        // Loading state for companies
  setCurrentCompany,     // Switch to different company
  refreshCompanies,      // Refresh company list
  
  // New - Role Helpers
  isAdmin,              // Check if user is admin in current company
  isManager,            // Check if user is manager in current company
  hasPermission,        // Check specific permission
} = useAuth();
```

### Company Service API

```typescript
import { companyService } from '@/services/companyService';

// Get user's companies
const companies = await companyService.getUserCompanies();

// Get current company
const company = await companyService.getCurrentCompany();

// Set primary company
await companyService.setPrimaryCompany(companyId);

// Create company (admin only)
const company = await companyService.createCompany({
  name: 'New Company',
  slug: 'new-company',
  // ... other fields
});
```

---

## Security Considerations

1. **RLS Policies**: All tables are protected by RLS
2. **Company Isolation**: Users can only access their company's data
3. **Role-Based Access**: Permissions are enforced at the database level
4. **Admin Controls**: Only admins can create/manage companies

---

## Testing

### Test Scenarios

1. **Create Company**
   - Admin creates a company
   - Verify admin is added to company_users
   - Verify company appears in selector

2. **Switch Companies**
   - User with multiple companies switches
   - Verify data changes to new company
   - Verify old company data is hidden

3. **Data Isolation**
   - Create data in Company A
   - Switch to Company B
   - Verify Company A data is not visible

4. **Permissions**
   - Test admin can manage companies
   - Test user can only view their company
   - Test viewer has read-only access

---

## Troubleshooting

### Issue: "No company selected"
**Solution**: User needs to belong to at least one company. Add them via SQL or company management page.

### Issue: Can't see any data
**Solution**: 
1. Check if user belongs to a company
2. Check if data has `company_id` set
3. Verify RLS policies are enabled

### Issue: Can't switch companies
**Solution**: 
1. Verify user belongs to multiple companies
2. Check `company_users` table
3. Verify `is_active = true`

---

## Next Steps

1. **Update All Services**: Add company filtering to remaining services
2. **Add User Management**: UI to add/remove users from companies
3. **Permission System**: Implement granular permissions
4. **Company Settings**: Allow companies to customize settings
5. **Billing Integration**: Track usage per company for billing

---

## Support

For issues or questions:
1. Check RLS policies in Supabase
2. Verify company_users table has correct entries
3. Check browser console for errors
4. Verify company_id is set on all records

