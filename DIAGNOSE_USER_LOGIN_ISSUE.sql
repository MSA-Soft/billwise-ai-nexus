-- ============================================================================
-- DIAGNOSE USER LOGIN ISSUE
-- ============================================================================
-- Run this to check if a user exists and is properly set up
-- Replace 'zar@gmail.com' with the email you're trying to login with
-- ============================================================================

-- Check if user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'zar@gmail.com';  -- Replace with your email

-- Check if profile exists
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.is_super_admin
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'zar@gmail.com';  -- Replace with your email

-- Check if user is associated with any company
SELECT 
    cu.id,
    cu.company_id,
    cu.user_id,
    cu.role,
    cu.is_active,
    cu.is_primary,
    c.name as company_name,
    c.slug as company_slug
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN auth.users u ON cu.user_id = u.id
WHERE u.email = 'zar@gmail.com';  -- Replace with your email

-- Check all users and their company associations
SELECT 
    u.email,
    u.email_confirmed_at,
    p.full_name,
    p.is_super_admin,
    COUNT(cu.id) as company_count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN company_users cu ON u.id = cu.user_id AND cu.is_active = true
GROUP BY u.id, u.email, u.email_confirmed_at, p.full_name, p.is_super_admin
ORDER BY u.created_at DESC;

-- ============================================================================
-- COMMON ISSUES AND FIXES
-- ============================================================================
-- Issue 1: User exists but email not confirmed
-- Fix: Run the UPDATE_USER_EMAIL_CONFIRMED.sql script

-- Issue 2: User exists but no profile
-- Fix: Run the CREATE_MISSING_PROFILE.sql script

-- Issue 3: User exists but not in any company
-- Fix: Run the ADD_USER_TO_COMPANY.sql script

-- Issue 4: User password is incorrect
-- Fix: Reset password using Supabase Dashboard or run RESET_USER_PASSWORD.sql
-- ============================================================================

