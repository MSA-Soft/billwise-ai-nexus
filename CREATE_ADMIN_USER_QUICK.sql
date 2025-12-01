-- ============================================================================
-- QUICK ADMIN USER SETUP
-- ============================================================================
-- This script creates an admin user with the provided UUID
-- User ID: f1c1befc-b508-4141-a56c-ec9926708985
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID := 'f1c1befc-b508-4141-a56c-ec9926708985';
    v_user_email TEXT;
    v_company_id UUID;
BEGIN
    -- Get user email from auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'User not found with ID: %. Please verify the user exists in Supabase Auth.', v_user_id;
    END IF;

    RAISE NOTICE 'Found user: % (%)', v_user_email, v_user_id;

    -- Create profile
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        v_user_id,
        v_user_email,
        'System Administrator'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = 'System Administrator', email = v_user_email;

    RAISE NOTICE 'Profile created/updated';

    -- Create default company if it doesn't exist
    INSERT INTO companies (
        name,
        slug,
        email,
        subscription_tier,
        subscription_status,
        is_active,
        created_by
    )
    VALUES (
        'Default Company',
        'default-company',
        v_user_email,
        'enterprise',
        'active',
        true,
        v_user_id
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_company_id;

    -- Get company ID if it already existed
    IF v_company_id IS NULL THEN
        SELECT id INTO v_company_id
        FROM companies
        WHERE slug = 'default-company'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Company ID: %', v_company_id;

    -- Add user to company as admin
    INSERT INTO company_users (
        company_id,
        user_id,
        role,
        is_primary,
        is_active
    )
    VALUES (
        v_company_id,
        v_user_id,
        'admin',
        true,
        true
    )
    ON CONFLICT (company_id, user_id) DO UPDATE
    SET role = 'admin', is_primary = true, is_active = true;

    RAISE NOTICE '✅ Admin user setup complete!';
    RAISE NOTICE 'User: %', v_user_email;
    RAISE NOTICE 'Company: Default Company';
    RAISE NOTICE 'Role: admin';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify everything was created correctly:

SELECT 
    u.id as user_id,
    u.email,
    p.full_name,
    c.name as company_name,
    cu.role as company_role,
    cu.is_primary,
    cu.is_active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';

