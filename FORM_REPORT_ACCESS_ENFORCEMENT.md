# Form/Report Access Enforcement

## Problem
You set limited access for a company in the Super Admin interface, but users were still seeing all forms/reports in the navigation and could access all routes.

## Solution Implemented

### 1. Added Access Checking to AuthContext
- Added `hasFormReportAccess(routePath)` function to check if user has access to a specific route
- Added `accessibleRoutes` state to track which routes the user can access
- Automatically loads accessible routes when company changes

### 2. Updated ProtectedRoute Component
- Now checks form/report access before allowing access to a route
- Shows "Access Denied" message if user doesn't have access
- Super admins bypass all access checks

### 3. Updated Sidebar Component
- Filters navigation items based on form/report access
- Only shows menu items the user has access to
- Hides restricted forms/reports from navigation

## How It Works

1. **When user logs in:**
   - System loads all forms/reports from database
   - Checks company-level access for each form/report
   - Checks user-level access (overrides company-level)
   - Caches access results for performance

2. **When user navigates:**
   - ProtectedRoute checks if user has access to the route
   - If no access, shows "Access Denied" page
   - If access granted, shows the page

3. **Navigation filtering:**
   - Sidebar checks access for each menu item
   - Only displays items user has access to
   - Automatically hides restricted items

## Testing

1. **As Super Admin:**
   - Go to Super Admin → Form/Report Access
   - Select a company
   - Disable some forms/reports (e.g., disable "Claims", "Reports")
   - Save changes

2. **As Company User:**
   - Log in as a user from that company
   - Check sidebar - disabled items should be hidden
   - Try to access disabled routes directly - should show "Access Denied"

## Important Notes

- **Super Admins** always have full access (bypasses all checks)
- **Default behavior**: If a route is not in the form/report system, access is allowed (for backward compatibility)
- **Caching**: Access results are cached for performance
- **User-level overrides**: User-specific access settings override company-level settings

## Troubleshooting

If access restrictions aren't working:

1. **Check database:**
   ```sql
   -- Check company access
   SELECT * FROM company_form_report_access 
   WHERE company_id = 'YOUR_COMPANY_ID';
   
   -- Check user access
   SELECT * FROM user_form_report_access 
   WHERE user_id = 'YOUR_USER_ID' AND company_id = 'YOUR_COMPANY_ID';
   ```

2. **Clear cache:**
   - Refresh the page
   - Or log out and log back in

3. **Verify form/report exists:**
   ```sql
   SELECT * FROM system_forms_reports 
   WHERE route_path = '/your-route';
   ```

4. **Check browser console:**
   - Look for errors in the console
   - Check network tab for failed API calls

## Files Modified

- `src/contexts/AuthContext.tsx` - Added access checking
- `src/components/ProtectedRoute.tsx` - Added route protection
- `src/components/Sidebar.tsx` - Added navigation filtering
- `src/hooks/useFormReportAccess.ts` - New hook for access checking

