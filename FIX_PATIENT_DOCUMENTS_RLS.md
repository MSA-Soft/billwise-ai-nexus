# 🔒 Fix: RLS Policy Error for patient_documents

## ❌ Error Message
```
new row violates row-level security policy for table "patient_documents"
```

## 🎯 Problem
The `patient_documents` table has Row-Level Security (RLS) enabled, but there are no policies allowing inserts. This blocks all insert operations.

## ✅ Solution

Run the SQL script `CREATE_PATIENT_DOCUMENTS_RLS.sql` in your Supabase SQL Editor.

### Quick Fix Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run the Script**
   - Open `CREATE_PATIENT_DOCUMENTS_RLS.sql`
   - Copy the entire script
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify Policies Created**
   - The script includes verification queries at the end
   - You should see 4 policies created:
     - Staff can view patient documents
     - Staff can insert patient documents
     - Staff can update patient documents
     - Staff can delete patient documents

4. **Test Document Upload**
   - Go back to your application
   - Try uploading a document again
   - The error should be resolved!

## 📋 What the Script Does

1. **Enables RLS** (if not already enabled)
   ```sql
   ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
   ```

2. **Drops Existing Policies** (to avoid conflicts)
   - Safely removes any existing policies

3. **Creates New Policies**
   - **SELECT**: Allows viewing all patient documents
   - **INSERT**: Allows creating new documents
   - **UPDATE**: Allows updating existing documents
   - **DELETE**: Allows deleting documents

4. **Verification Queries**
   - Shows RLS status
   - Lists all policies on the table

## 🔐 Policy Details

All policies are set for `authenticated` users, meaning:
- ✅ Any logged-in user can perform these operations
- ✅ This is appropriate for a medical billing system where staff need access
- ⚠️ If you need more restrictive access, modify the policies

### Example: More Restrictive Policy (Optional)

If you want users to only see documents for patients they're assigned to:

```sql
-- More restrictive SELECT policy
CREATE POLICY "Users can view assigned patient documents"
    ON patient_documents FOR SELECT
    TO authenticated
    USING (
        patient_id IN (
            SELECT patient_id 
            FROM patient_assignments 
            WHERE user_id = auth.uid()
        )
    );
```

But for now, the simpler policies in the script should work fine for your use case.

## ✅ Verification

After running the script, you should see:

1. **RLS Enabled**: `rls_enabled = true`
2. **4 Policies Created**: 
   - Staff can view patient documents
   - Staff can insert patient documents
   - Staff can update patient documents
   - Staff can delete patient documents

## 🎯 Next Steps

1. ✅ Run `CREATE_PATIENT_DOCUMENTS_RLS.sql`
2. ✅ Verify policies are created
3. ✅ Test document upload in your application
4. ✅ Document should upload successfully!

---

**If you still get errors after running the script, check:**
- Are you authenticated? (logged in)
- Does the `patient_documents` table exist?
- Are there any other errors in the SQL Editor?

