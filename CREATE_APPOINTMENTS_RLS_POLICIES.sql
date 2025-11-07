-- ============================================================================
-- APPOINTMENTS TABLE RLS POLICIES
-- ============================================================================
-- This file creates Row-Level Security policies for the appointments table
-- Run this in Supabase SQL Editor to fix the "new row violates row-level security policy" error
-- ============================================================================

-- Enable Row Level Security (if not already enabled)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON appointments;

-- Policy: Allow authenticated users to view all appointments
CREATE POLICY "Users can view appointments"
    ON appointments FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to create appointments
CREATE POLICY "Users can create appointments"
    ON appointments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update appointments
CREATE POLICY "Users can update appointments"
    ON appointments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete appointments
CREATE POLICY "Users can delete appointments"
    ON appointments FOR DELETE
    TO authenticated
    USING (true);

-- Verify policies were created
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
WHERE tablename = 'appointments'
ORDER BY policyname;

SELECT '✅ Appointments RLS policies created successfully!' AS status;

