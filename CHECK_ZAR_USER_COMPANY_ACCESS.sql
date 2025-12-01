-- ============================================================================
-- CHECK ZAR USER COMPANY AND ACCESS
-- ============================================================================
-- This script checks which company zar@gmail.com belongs to and their access
-- ============================================================================

-- 1. Check user info
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.full_name,
    p.is_super_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'zar@gmail.com';

-- 2. Check which company zar belongs to
SELECT 
    cu.id,
    cu.company_id,
    cu.user_id,
    cu.role,
    cu.is_primary,
    cu.is_active,
    c.name as company_name,
    c.slug as company_slug,
    c.is_active as company_is_active
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN auth.users u ON cu.user_id = u.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true;

-- 3. Check company-level form/report access for zar's company
SELECT 
    c.name as company_name,
    sfr.name as form_report_name,
    sfr.type,
    sfr.route_path,
    cfa.is_enabled as company_access_enabled
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN auth.users u ON cu.user_id = u.id
LEFT JOIN company_form_report_access cfa ON cfa.company_id = c.id
LEFT JOIN system_forms_reports sfr ON cfa.form_report_id = sfr.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true
ORDER BY sfr.type, sfr.name;

-- 4. Check user-level form/report access overrides for zar
SELECT 
    c.name as company_name,
    sfr.name as form_report_name,
    sfr.type,
    sfr.route_path,
    ufa.is_enabled as user_access_enabled
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN auth.users u ON cu.user_id = u.id
LEFT JOIN user_form_report_access ufa ON ufa.user_id = u.id AND ufa.company_id = c.id
LEFT JOIN system_forms_reports sfr ON ufa.form_report_id = sfr.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true
ORDER BY sfr.type, sfr.name;

-- 5. Count enabled vs disabled access
SELECT 
    c.name as company_name,
    COUNT(*) FILTER (WHERE cfa.is_enabled = true) as enabled_count,
    COUNT(*) FILTER (WHERE cfa.is_enabled = false) as disabled_count,
    COUNT(*) FILTER (WHERE cfa.id IS NULL) as not_configured_count,
    COUNT(DISTINCT sfr.id) as total_forms_reports
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN auth.users u ON cu.user_id = u.id
CROSS JOIN system_forms_reports sfr
LEFT JOIN company_form_report_access cfa ON cfa.company_id = c.id AND cfa.form_report_id = sfr.id
WHERE u.email = 'zar@gmail.com'
AND cu.is_active = true
GROUP BY c.id, c.name;

