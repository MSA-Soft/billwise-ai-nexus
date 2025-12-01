-- ============================================================================
-- FIX USER AFTER CREATION
-- ============================================================================
-- Run this AFTER creating the user in Supabase Auth Dashboard
-- This will create the profile and add user to company
-- ============================================================================

-- Replace 'zar@gmail.com' with the email you just created
DO $$
DECLARE
    v_user_email TEXT := 'zar@gmail.com';  -- CHANGE THIS TO YOUR EMAIL
    v_user_id UUID;
    v_company_id UUID;
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
        COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id), 'User'),
        false
    )
    ON CONFLICT (id) DO UPDATE
    SET email = v_user_email;

    RAISE NOTICE '✅ Profile created/updated';

    -- Get first company (or create default if none exists)
    SELECT id INTO v_company_id
    FROM companies
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'No companies found. Please create a company first using Super Admin interface.';
    END IF;

    -- Add user to company as admin
    INSERT INTO company_users (company_id, user_id, role, is_primary, is_active)
    VALUES (v_company_id, v_user_id, 'admin', true, true)
    ON CONFLICT (company_id, user_id) DO UPDATE
    SET role = 'admin', is_primary = true, is_active = true;

    RAISE NOTICE '✅ User added to company: %', v_company_id;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Setup complete! You can now login with:';
    RAISE NOTICE '   Email: %', v_user_email;
    RAISE NOTICE '   Password: (the one you set when creating the user)';

END $$;

