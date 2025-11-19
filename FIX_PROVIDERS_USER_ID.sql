-- ============================================================================
-- FIX PROVIDERS TABLE USER_ID CONSTRAINT
-- ============================================================================
-- This script fixes the user_id NOT NULL constraint issue
-- Run this if you're getting "null value in column user_id" errors
-- ============================================================================

-- Option 1: Make user_id nullable (Recommended)
-- This allows providers to exist without being tied to auth users
ALTER TABLE providers 
ALTER COLUMN user_id DROP NOT NULL;

-- Option 2: If the column doesn't exist, add it as nullable
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'providers' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE providers 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'providers' AND column_name = 'user_id';

SELECT '✅ Providers table user_id column fixed!' AS status;

