# 🔬 Diagnostic Steps to Find Exact Root Cause

## Step 1: Hard Refresh Browser
1. **Close all browser tabs** with your app
2. **Clear browser cache** (Ctrl+Shift+Delete → Clear cached images and files)
3. **Open new tab** and go to your app
4. **Open Developer Console** (F12) BEFORE the page loads

## Step 2: Check Console Logs

Look for these messages in order:

### Expected Flow (If Working):
```
🔍 Fetching patients from database...
🔐 Auth session: Authenticated
👤 User ID: [uuid-here]
📦 Raw data from Supabase: [array of patients]
📊 Data type: object
📊 Is array: true
📊 Data length: 16
📊 First patient (if any): {id: ..., first_name: "Ahmed", ...}
✅ Successfully loaded 16 patients from database
📋 Transformed patients: [...]
🏁 Fetch completed. Loading state set to false.
```

### If RLS is Blocking:
```
🔍 Fetching patients from database...
🔐 Auth session: Authenticated
👤 User ID: [uuid-here]
📦 Raw data from Supabase: []
📊 Data length: 0
⚠️ No patients found in database.
🚫 RLS Policy Error - Check your Row Level Security policies!
```

### If Auth Issue:
```
🔍 Fetching patients from database...
🔐 Auth session: Not authenticated
👤 User ID: No user
⚠️ No active session. Cannot fetch patients.
```

### If Table Missing:
```
❌ Error fetching patients: ...
Error code: 42P01
⚠️ Patients table not found.
```

## Step 3: Check Network Tab

1. **Open Network tab** in DevTools
2. **Filter by "patients"** or "rest"
3. **Refresh page**
4. **Look for request to:** `https://your-project.supabase.co/rest/v1/patients`
5. **Check:**
   - Status code (200 = success, 401 = auth, 403 = RLS)
   - Response body (what data is returned?)
   - Request headers (is auth token included?)

## Step 4: Test Direct Query

In browser console, run:
```javascript
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .limit(5);

console.log('Direct query result:', { data, error });
console.log('Data length:', data?.length);
console.log('First patient:', data?.[0]);
```

**If this works but component doesn't:** It's a timing/state issue
**If this fails:** It's an RLS/auth issue

## Step 5: Check RLS Policies

Run in Supabase SQL Editor:
```sql
-- Check policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'patients';
```

**If policy has `user_id = auth.uid()`:** That's filtering your data!

## Step 6: Check Patient user_id

Run in Supabase SQL Editor:
```sql
-- Get your user ID
SELECT id, email FROM auth.users;

-- Check patient user_ids
SELECT 
    patient_id,
    first_name,
    last_name,
    user_id,
    created_at
FROM patients
ORDER BY created_at DESC
LIMIT 20;
```

**If user_ids don't match:** That's why RLS filters them out!

## Most Likely Root Cause

Based on symptoms:
1. ✅ Data shows before refresh (16 patients)
2. ❌ After refresh, only 2 show

**This suggests:**
- RLS policy filters by `user_id`
- Your 16 patients have `user_id = 'user-A'`
- You're logged in as `user-B`
- Only 2 patients have `user_id = 'user-B'`

## The Fix

Update RLS policy to allow all authenticated users:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view patients" ON patients;

-- Create new policy (allows all authenticated users)
CREATE POLICY "Users can view patients"
    ON patients FOR SELECT
    TO authenticated
    USING (true);  -- No user_id filter!
```

Then refresh and check console!

