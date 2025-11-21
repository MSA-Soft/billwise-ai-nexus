-- ============================================================================
-- RLS POLICIES FOR PATIENT_DOCUMENTS TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor
-- This fixes the "new row violates row-level security policy" error
-- ============================================================================

-- Enable RLS on patient_documents table (if not already enabled)
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Staff can view patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Staff can insert patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Staff can update patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Staff can delete patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Users can view patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Users can insert patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Users can update patient documents" ON patient_documents;
DROP POLICY IF EXISTS "Users can delete patient documents" ON patient_documents;

-- ============================================================================
-- POLICIES FOR AUTHENTICATED USERS (STAFF)
-- ============================================================================

-- Allow authenticated users (staff) to view all patient documents
CREATE POLICY "Staff can view patient documents"
    ON patient_documents FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users (staff) to insert patient documents
CREATE POLICY "Staff can insert patient documents"
    ON patient_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users (staff) to update patient documents
CREATE POLICY "Staff can update patient documents"
    ON patient_documents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users (staff) to delete patient documents
CREATE POLICY "Staff can delete patient documents"
    ON patient_documents FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, verify the policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'patient_documents';
-- ============================================================================

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'patient_documents';

-- Show all policies on patient_documents
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patient_documents';

