-- ============================================================================
-- VERIFY ACCESS FUNCTION IS WORKING CORRECTLY
-- ============================================================================
-- This checks if the function correctly returns false when access is disabled
-- ============================================================================

-- 1. Check the current function definition
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'user_has_form_report_access';

-- 2. Test the function with a disabled access
-- Replace with actual IDs from your database
DO $$
DECLARE
    test_user_id UUID;
    test_company_id UUID;
    test_form_report_id UUID;
    access_result BOOLEAN;
BEGIN
    -- Get IDs (replace with actual values)
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'zar@gmail.com' LIMIT 1;
    SELECT id INTO test_company_id FROM companies WHERE name = 'ZarSolution' LIMIT 1;
    SELECT id INTO test_form_report_id FROM system_forms_reports WHERE route_path = '/claims' LIMIT 1;
    
    -- Check if access is disabled for this company
    SELECT is_enabled INTO access_result
    FROM company_form_report_access
    WHERE company_id = test_company_id
    AND form_report_id = test_form_report_id;
    
    RAISE NOTICE 'Company access setting: %', access_result;
    
    -- Test the function
    SELECT user_has_form_report_access(
        test_user_id,
        test_company_id,
        test_form_report_id
    ) INTO access_result;
    
    RAISE NOTICE 'Function returned: %', access_result;
    
    -- Expected: If is_enabled = false, function should return false
    -- Expected: If is_enabled = true, function should return true
    -- Expected: If no entry exists, function should return true (default)
END $$;

-- 3. Check what routes are actually in the database vs what's in routeMap
SELECT 
    sfr.name,
    sfr.route_path as db_route_path,
    CASE 
        WHEN sfr.route_path LIKE '/customer-setup%' THEN 'customer-setup route'
        WHEN sfr.route_path = '/' THEN 'dashboard'
        ELSE 'main route'
    END as route_type
FROM system_forms_reports sfr
ORDER BY sfr.route_path;

-- 4. Check company access for ZarSolution
SELECT 
    c.name as company_name,
    sfr.name as form_report_name,
    sfr.route_path,
    cfa.is_enabled,
    CASE 
        WHEN cfa.is_enabled = true THEN 'ENABLED'
        WHEN cfa.is_enabled = false THEN 'DISABLED'
        ELSE 'NOT CONFIGURED (Default: ENABLED)'
    END as status
FROM companies c
CROSS JOIN system_forms_reports sfr
LEFT JOIN company_form_report_access cfa ON cfa.company_id = c.id AND cfa.form_report_id = sfr.id
WHERE c.name = 'ZarSolution'
ORDER BY sfr.type, sfr.name;

