-- ============================================================================
-- SETUP USER: zar@gmail.com
-- ============================================================================
-- Run this to complete the user setup after creating in Auth Dashboard
-- ============================================================================

DO $$
DECLARE
    v_user_email TEXT := 'zar@gmail.com';
    v_user_id UUID;
    v_company_id UUID;
    v_company_name TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % does not exist. Please create the user first in Supabase Dashboard > Authentication > Users > Add User', v_user_email;
    END IF;

    RAISE NOTICE '✅ Found user: % (ID: %)', v_user_email, v_user_id;

    -- Create or update profile
    INSERT INTO profiles (id, email, full_name, is_super_admin)
    VALUES (
        v_user_id,
        v_user_email,
        COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id), 'Zar User'),
        false
    )
    ON CONFLICT (id) DO UPDATE
    SET email = v_user_email;

    RAISE NOTICE '✅ Profile created/updated';

    -- Get first company (or create default if none exists)
    SELECT id, name INTO v_company_id, v_company_name
    FROM companies
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'No companies found. Please create a company first using Super Admin interface.';
    END IF;

    RAISE NOTICE '✅ Found company: % (ID: %)', v_company_name, v_company_id;

    -- Add user to company as admin
    INSERT INTO company_users (company_id, user_id, role, is_primary, is_active)
    VALUES (v_company_id, v_user_id, 'admin', true, true)
    ON CONFLICT (company_id, user_id) DO UPDATE
    SET role = 'admin', is_primary = true, is_active = true;

    RAISE NOTICE '✅ User added to company as admin';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now login with:';
    RAISE NOTICE '   Email: zar@gmail.com';
    RAISE NOTICE '   Password: 123456';
    RAISE NOTICE '';
    RAISE NOTICE 'Company: %', v_company_name;

END $$;

