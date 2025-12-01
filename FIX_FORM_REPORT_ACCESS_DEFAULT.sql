-- ============================================================================
-- FIX FORM/REPORT ACCESS DEFAULT BEHAVIOR
-- ============================================================================
-- This fixes the access function to default to ALLOWING access if not explicitly set
-- This maintains backward compatibility - users have access unless explicitly denied
-- ============================================================================

-- Update the function to default to true (allow access) if no explicit setting
CREATE OR REPLACE FUNCTION user_has_form_report_access(
    user_uuid UUID,
    company_uuid UUID,
    form_report_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := true; -- Default to true for backward compatibility
    user_override BOOLEAN;
    company_access BOOLEAN;
BEGIN
    -- Super admins have access to everything
    IF is_super_admin(user_uuid) THEN
        RETURN true;
    END IF;
    
    -- Check user-level override first (user settings override company settings)
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
    
    -- Default: allow access if not explicitly set (for backward compatibility)
    -- This means if no access is configured, users have access by default
    -- Super admin can explicitly disable access to restrict it
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EXPLANATION
-- ============================================================================
-- Previous behavior: Defaulted to false (deny access) if not explicitly set
-- New behavior: Defaults to true (allow access) if not explicitly set
--
-- This means:
-- - If Super Admin hasn't configured access for a company, users have access (backward compatible)
-- - Super Admin can explicitly disable access by setting is_enabled = false
-- - Super Admin can explicitly enable access by setting is_enabled = true
-- - If no entry exists in company_form_report_access, access is allowed
--
-- To restrict access:
-- 1. Go to Super Admin → Form/Report Access
-- 2. Select company
-- 3. Toggle OFF the forms/reports you want to restrict
-- 4. Users will then be denied access
-- ============================================================================

