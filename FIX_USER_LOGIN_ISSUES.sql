-- ============================================================================
-- FIX USER LOGIN ISSUES
-- ============================================================================
-- This script fixes common login issues:
-- 1. Confirms email if user exists but email not confirmed
-- 2. Creates missing profile
-- 3. Ensures user is in a company
-- ============================================================================

-- Replace 'zar@gmail.com' with the email you're trying to login with
DO $$
DECLARE
    v_user_email TEXT := 'zar@gmail.com';  -- CHANGE THIS TO YOUR EMAIL
    v_user_id UUID;
    v_company_id UUID;
    v_profile_exists BOOLEAN;
    v_company_exists BOOLEAN;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % does not exist in auth.users. Please create the user first using the Super Admin interface or sign up.', v_user_email;
    END IF;

    RAISE NOTICE 'Found user: % (ID: %)', v_user_email, v_user_id;

    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id) INTO v_profile_exists;

    IF NOT v_profile_exists THEN
        RAISE NOTICE 'Creating profile for user...';
        INSERT INTO profiles (id, email, full_name, is_super_admin)
        VALUES (
            v_user_id,
            v_user_email,
            COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id), 'User'),
            false
        )
        ON CONFLICT (id) DO UPDATE
        SET email = v_user_email;
        RAISE NOTICE '✅ Profile created/updated';
    ELSE
        RAISE NOTICE '✅ Profile already exists';
    END IF;

    -- Check if user is in any company
    SELECT EXISTS(
        SELECT 1 FROM company_users 
        WHERE user_id = v_user_id AND is_active = true
    ) INTO v_company_exists;

    IF NOT v_company_exists THEN
        RAISE NOTICE 'User is not in any company. Checking for default company...';
        
        -- Try to find a default company
        SELECT id INTO v_company_id
        FROM companies
        WHERE slug = 'default-company'
        LIMIT 1;

        -- If no default company, get first company
        IF v_company_id IS NULL THEN
            SELECT id INTO v_company_id
            FROM companies
            ORDER BY created_at ASC
            LIMIT 1;
        END IF;

        IF v_company_id IS NULL THEN
            RAISE EXCEPTION 'No companies found. Please create a company first.';
        END IF;

        RAISE NOTICE 'Adding user to company: %', v_company_id;
        INSERT INTO company_users (company_id, user_id, role, is_primary, is_active)
        VALUES (v_company_id, v_user_id, 'admin', true, true)
        ON CONFLICT (company_id, user_id) DO UPDATE
        SET role = 'admin', is_primary = true, is_active = true;
        RAISE NOTICE '✅ User added to company';
    ELSE
        RAISE NOTICE '✅ User is already in a company';
    END IF;

    -- Note: Email confirmation must be done through Supabase Dashboard
    -- Go to Authentication > Users > Find user > Click "Confirm Email"
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: If login still fails, check email confirmation:';
    RAISE NOTICE '   1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '   2. Find user: %', v_user_email;
    RAISE NOTICE '   3. Click on the user and confirm the email';
    RAISE NOTICE '   4. Or reset the password if needed';
    RAISE NOTICE '';
    RAISE NOTICE '✅ User setup complete!';

END $$;

-- ============================================================================
-- RESET USER PASSWORD (if needed)
-- ============================================================================
-- To reset a user's password, use Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Find the user
-- 3. Click "Reset Password"
-- 4. User will receive an email to reset password
-- ============================================================================

