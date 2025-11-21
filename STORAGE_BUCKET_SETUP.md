# 🪣 Supabase Storage Bucket Setup Guide

## Problem
You're seeing the error: **"File upload failed: Bucket not found"**

This means the `patient-documents` storage bucket doesn't exist in your Supabase project yet.

---

## ✅ Solution: Create the Storage Bucket

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open your Supabase project: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - Click **"New bucket"** button

3. **Create Bucket**
   - **Bucket name**: `patient-documents` (exactly as shown)
   - **Public bucket**: ✅ **Check this** (or leave unchecked for private)
   - **File size limit**: `10` MB
   - **Allowed MIME types**: Leave empty (or add: `application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
   - Click **"Create bucket"**

4. **Configure CORS (Optional)**
   - If you need to access files from your frontend, configure CORS:
   - Go to Storage → Settings → CORS
   - Add your frontend URL (e.g., `http://localhost:8082`)

### Option 2: Using SQL (Alternative)

You can also create the bucket using SQL in the Supabase SQL Editor. **Use the fixed script in `CREATE_STORAGE_BUCKET.sql`** - it has been corrected to work with PostgreSQL syntax.

**Note**: If you get a permission error, you may need to use the Dashboard method instead.

---

## 🔒 Storage Policies (Optional - for Private Buckets)

If you set the bucket to **private**, you'll need to add RLS policies:

```sql
-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload patient documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can read patient documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete patient documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**For Public Buckets**: No policies needed - files are accessible via public URLs.

---

## ✅ Verification

After creating the bucket:

1. **Check in Dashboard**:
   - Go to Storage → You should see `patient-documents` bucket
   - Click on it to verify it exists

2. **Test Upload**:
   - Try uploading a document again
   - The error should be gone
   - File should upload successfully

---

## 🎯 Quick Setup Checklist

- [ ] Go to Supabase Dashboard → Storage
- [ ] Click "New bucket"
- [ ] Name: `patient-documents`
- [ ] Set to Public (or Private with policies)
- [ ] File size limit: 10MB
- [ ] Click "Create bucket"
- [ ] Test document upload in the app

---

## 🔧 Troubleshooting

### Error: "Bucket not found"
- ✅ Make sure bucket name is exactly `patient-documents` (with hyphen)
- ✅ Check that bucket was created successfully in Dashboard

### Error: "Permission denied"
- ✅ If bucket is private, add RLS policies (see above)
- ✅ Check that your user is authenticated

### Error: "File too large"
- ✅ Check file size limit (should be 10MB or more)
- ✅ Verify the file you're uploading is under the limit

### Files not accessible
- ✅ If bucket is public, files should be accessible via public URL
- ✅ If bucket is private, ensure RLS policies are set correctly

---

## 📝 Notes

- **Public Bucket**: Files are accessible via public URLs (simpler, less secure)
- **Private Bucket**: Files require authentication and RLS policies (more secure)
- **File Path**: Files are stored as `{patientId}/{timestamp}_{filename}`
- **URL Format**: `https://{project}.supabase.co/storage/v1/object/public/patient-documents/{path}`

---

## 🔒 RLS Policies for patient_documents Table

If you get the error **"new row violates row-level security policy for table 'patient_documents'"**, you need to create RLS policies.

**Run the script**: `CREATE_PATIENT_DOCUMENTS_RLS.sql` in Supabase SQL Editor

This script will:
- Enable RLS on `patient_documents` table
- Create policies allowing authenticated users to:
  - View all patient documents
  - Insert new documents
  - Update existing documents
  - Delete documents

---

**Once the bucket is created and RLS policies are set up, try uploading a document again!** 🚀

