# Quick Fix: Access Denied Issue

## Problem
Users are seeing "Access Denied" even though they should have access.

## Root Cause
The access check was defaulting to **deny access** when no explicit access was configured. This is too restrictive.

## Solution
Changed the default behavior to **allow access** when not explicitly restricted. This maintains backward compatibility.

## What Changed

### 1. Database Function (`user_has_form_report_access`)
- **Before:** Defaulted to `false` (deny) if no access configured
- **After:** Defaults to `true` (allow) if no access configured

### 2. Frontend Logic
- **Before:** Defaulted to `false` on errors
- **After:** Defaults to `true` on errors (for backward compatibility)

## How It Works Now

1. **If Super Admin hasn't configured access:**
   - ✅ Users have access by default (backward compatible)

2. **If Super Admin explicitly disables access:**
   - ❌ Users are denied access

3. **If Super Admin explicitly enables access:**
   - ✅ Users have access

## To Apply the Fix

**Run this SQL script in Supabase SQL Editor:**

```sql
-- Update the function to default to allowing access
CREATE OR REPLACE FUNCTION user_has_form_report_access(
    user_uuid UUID,
    company_uuid UUID,
    form_report_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := true; -- Default to true
    user_override BOOLEAN;
    company_access BOOLEAN;
BEGIN
    -- Super admins have access to everything
    IF is_super_admin(user_uuid) THEN
        RETURN true;
    END IF;
    
    -- Check user-level override first
    SELECT is_enabled INTO user_override
    FROM user_form_report_access
    WHERE user_id = user_uuid
    AND company_id = company_uuid
    AND form_report_id = form_report_uuid;
    
    IF user_override IS NOT NULL THEN
        RETURN user_override;
    END IF;
    
    -- Check company-level access
    SELECT is_enabled INTO company_access
    FROM company_form_report_access
    WHERE company_id = company_uuid
    AND form_report_id = form_report_uuid;
    
    IF company_access IS NOT NULL THEN
        RETURN company_access;
    END IF;
    
    -- Default: allow access if not explicitly set
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Or use the file:** `FIX_FORM_REPORT_ACCESS_DEFAULT.sql`

## After Running the Fix

1. **Refresh your browser**
2. Users should now have access by default
3. Super Admin can still restrict access by explicitly disabling forms/reports

## How to Restrict Access (If Needed)

1. Go to **Super Admin → Form/Report Access**
2. Select the company
3. **Toggle OFF** the forms/reports you want to restrict
4. Users will then be denied access to those items

## Summary

- ✅ **Default behavior:** Allow access (backward compatible)
- ✅ **Super Admin can restrict:** By explicitly disabling access
- ✅ **Super Admin can enable:** By explicitly enabling access
- ✅ **User-level overrides:** Still work as expected

