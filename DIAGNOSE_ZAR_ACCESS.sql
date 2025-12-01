-- ============================================================================
-- DIAGNOSE ZAR USER ACCESS ISSUE
-- ============================================================================
-- Run this to see what company zar belongs to and what access is configured
-- ============================================================================

-- 1. Check zar's user info and company
SELECT 
    u.email,
    u.id as user_id,
    c.id as company_id,
    c.name as company_name,
    c.slug as company_slug,
    cu.role,
    cu.is_primary,
    cu.is_active as user_active_in_company,
    c.is_active as company_is_active
FROM auth.users u
JOIN company_users cu ON u.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true;

-- 2. Check what forms/reports are configured for zar's company
SELECT 
    c.name as company_name,
    sfr.name as form_report_name,
    sfr.type,
    sfr.route_path,
    COALESCE(cfa.is_enabled, true) as company_access, -- true if not configured
    CASE 
        WHEN cfa.id IS NULL THEN 'Not Configured (Default: Allowed)'
        WHEN cfa.is_enabled = true THEN 'Enabled'
        WHEN cfa.is_enabled = false THEN 'Disabled'
    END as access_status
FROM auth.users u
JOIN company_users cu ON u.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
CROSS JOIN system_forms_reports sfr
LEFT JOIN company_form_report_access cfa ON cfa.company_id = c.id AND cfa.form_report_id = sfr.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true
ORDER BY sfr.type, sfr.name;

-- 3. Count enabled vs disabled
SELECT 
    c.name as company_name,
    COUNT(*) FILTER (WHERE cfa.is_enabled = true) as explicitly_enabled,
    COUNT(*) FILTER (WHERE cfa.is_enabled = false) as explicitly_disabled,
    COUNT(*) FILTER (WHERE cfa.id IS NULL) as not_configured,
    COUNT(DISTINCT sfr.id) as total_forms_reports,
    CASE 
        WHEN COUNT(*) FILTER (WHERE cfa.is_enabled = false) > 0 THEN 'Has Restrictions'
        WHEN COUNT(*) FILTER (WHERE cfa.is_enabled = true) > 0 THEN 'Has Explicit Access'
        ELSE 'No Configuration (All Allowed)'
    END as access_summary
FROM auth.users u
JOIN company_users cu ON u.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
CROSS JOIN system_forms_reports sfr
LEFT JOIN company_form_report_access cfa ON cfa.company_id = c.id AND cfa.form_report_id = sfr.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true
GROUP BY c.id, c.name;

-- 4. Show only disabled forms/reports (if any)
SELECT 
    c.name as company_name,
    sfr.name as form_report_name,
    sfr.type,
    sfr.route_path,
    'DISABLED' as status
FROM auth.users u
JOIN company_users cu ON u.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
JOIN company_form_report_access cfa ON cfa.company_id = c.id
JOIN system_forms_reports sfr ON cfa.form_report_id = sfr.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true
AND cfa.is_enabled = false
ORDER BY sfr.type, sfr.name;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- If zar has limited access, you should see:
-- - Some forms/reports with is_enabled = false in company_form_report_access
-- - The "Show only disabled" query should return those items
--
-- If zar sees all items, it means:
-- - No access restrictions are configured (all items default to allowed)
-- - OR the access check isn't working properly
-- ============================================================================

