-- ============================================================================
-- CREATE STORAGE BUCKET FOR PATIENT DOCUMENTS (FIXED VERSION)
-- ============================================================================
-- Run this in Supabase SQL Editor
-- This creates the storage bucket needed for patient document uploads
-- FIXED: Removed IF NOT EXISTS from CREATE POLICY (not supported in PostgreSQL)
-- ============================================================================

-- Create storage bucket for patient documents
-- Note: If you get permission errors, create the bucket via Supabase Dashboard instead
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents',
  'patient-documents',
  true,  -- Set to false if you want private bucket (requires RLS policies)
  10485760,  -- 10MB in bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- OPTIONAL: RLS POLICIES FOR PRIVATE BUCKET
-- ============================================================================
-- Only run these if you set the bucket to private (public = false)
-- For PUBLIC buckets, these policies are NOT needed
-- ============================================================================

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can upload patient documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read patient documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete patient documents" ON storage.objects;

-- Allow authenticated users to upload documents
-- Note: Adjust the policy based on your access requirements
CREATE POLICY "Users can upload patient documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');

-- Allow authenticated users to read documents
CREATE POLICY "Users can read patient documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');

-- Allow authenticated users to delete documents
CREATE POLICY "Users can delete patient documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-documents');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, verify the bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'patient-documents';
-- ============================================================================

