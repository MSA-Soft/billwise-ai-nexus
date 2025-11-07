-- ============================================================================
-- CHECK PATIENTS TABLE STRUCTURE
-- ============================================================================
-- Run this first to see what columns actually exist in your patients table
-- ============================================================================

-- Check if table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_name = 'patients';

-- Show all columns in patients table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- Show table structure in a readable format
SELECT 
    'Column: ' || column_name || 
    ' | Type: ' || data_type || 
    ' | Nullable: ' || is_nullable as column_info
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

