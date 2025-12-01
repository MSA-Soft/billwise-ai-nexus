-- ============================================================================
-- CREATE SUPER ADMIN USER
-- ============================================================================
-- Run this to make your user a super admin
-- Replace 'your-email@example.com' with your actual email
-- ============================================================================

-- Option 1: Make existing user super admin by email
SELECT make_super_admin('srjstd021@gmail.com');

-- Option 2: Make user super admin by user ID
UPDATE profiles
SET is_super_admin = true
WHERE id = 'f1c1befc-b508-4141-a56c-ec9926708985';

-- Verify super admin status
SELECT 
    u.email,
    p.full_name,
    p.is_super_admin,
    CASE 
        WHEN p.is_super_admin = true THEN '✅ Super Admin'
        ELSE '❌ Regular User'
    END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';

-- ============================================================================
-- Note: Super admins don't need to be in company_users table
-- They can access all companies automatically
-- ============================================================================

