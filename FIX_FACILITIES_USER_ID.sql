-- ============================================================================
-- FIX FACILITIES TABLE USER_ID CONSTRAINT
-- ============================================================================
-- This script fixes the user_id NOT NULL constraint issue
-- Run this if you're getting "null value in column user_id" errors
-- ============================================================================

-- Make user_id nullable (facilities don't need to be tied to auth users)
ALTER TABLE facilities 
ALTER COLUMN user_id DROP NOT NULL;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facilities' AND column_name = 'user_id';

SELECT '✅ Facilities table user_id column fixed!' AS status;

