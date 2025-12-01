-- ============================================================================
-- QUICK FIX: CREATE USER AND ADD TO COMPANY
-- ============================================================================
-- Use this if you need to manually create a user and add them to a company
-- Replace the values below with your actual data
-- ============================================================================

DO $$
DECLARE
    -- CHANGE THESE VALUES
    v_user_email TEXT := 'zar@gmail.com';
    v_user_password TEXT := 'yourpassword123';  -- Must be at least 6 characters
    v_user_full_name TEXT := 'Zar User';
    v_company_id UUID;  -- Will use first company if not specified
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_user_email) THEN
        RAISE NOTICE 'User % already exists. Use FIX_USER_LOGIN_ISSUES.sql instead.', v_user_email;
        RETURN;
    END IF;

    -- Get or create company
    SELECT id INTO v_company_id
    FROM companies
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'No companies found. Please create a company first using Super Admin interface.';
    END IF;

    RAISE NOTICE 'Creating user: %', v_user_email;
    RAISE NOTICE 'Company ID: %', v_company_id;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NOTE: This script cannot create users in auth.users directly.';
    RAISE NOTICE '   You must create the user through one of these methods:';
    RAISE NOTICE '   1. Use Super Admin interface to create user for company';
    RAISE NOTICE '   2. Use Supabase Dashboard > Authentication > Users > Add User';
    RAISE NOTICE '   3. Use the sign-up form in the application';
    RAISE NOTICE '';
    RAISE NOTICE '   After creating the user, run FIX_USER_LOGIN_ISSUES.sql to:';
    RAISE NOTICE '   - Create profile';
    RAISE NOTICE '   - Add user to company';
    RAISE NOTICE '   - Fix any missing associations';

END $$;

-- ============================================================================
-- ALTERNATIVE: Use Supabase Dashboard to create user
-- ============================================================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create New User"
-- 3. Enter:
--    - Email: zar@gmail.com
--    - Password: yourpassword123
--    - Auto Confirm User: YES (check this box)
-- 4. Click "Create User"
-- 5. Then run FIX_USER_LOGIN_ISSUES.sql to add profile and company association
-- ============================================================================

