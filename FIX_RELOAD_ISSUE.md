# 🔧 Fix: Data Disappears on Reload

## Problem
- ✅ Data shows before refresh (16 Muslim names)
- ❌ After reload, only 2 mock patients show

## Root Cause
The fetch function runs before authentication is ready, or RLS policies are filtering by `user_id` incorrectly.

## Solution Applied

### 1. Added Authentication Check
- Now checks if user is authenticated before fetching
- Logs authentication status to console

### 2. Added Delay for Auth Initialization
- Waits 500ms for Supabase auth to initialize
- Prevents race condition

### 3. Enhanced Logging
- Shows if user is authenticated
- Shows user ID
- Shows why fetch might fail

## Next Steps

### Step 1: Check RLS Policies
Run in Supabase SQL Editor:
```sql
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';
```

**If policies filter by `user_id`:**
```sql
-- Check if your RLS policy filters by user_id
-- If it does, you need to either:
-- 1. Remove the user_id filter from SELECT policy
-- 2. Or ensure all patients have the correct user_id
```

**Fix RLS Policy (if needed):**
```sql
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view patients" ON patients;

-- Create new policy that allows all authenticated users to see all patients
CREATE POLICY "Users can view patients"
    ON patients FOR SELECT
    TO authenticated
    USING (true);  -- No user_id filter - all authenticated users can see all patients
```

### Step 2: Verify Patient Data Has user_id
Run in Supabase SQL Editor:
```sql
SELECT 
    patient_id,
    first_name,
    last_name,
    user_id,
    created_at
FROM patients
WHERE patient_id LIKE 'PAT-%'
ORDER BY created_at DESC
LIMIT 5;
```

**If user_id is NULL or wrong:**
```sql
-- Update patients to have your user_id
-- First, get your user ID:
SELECT id, email FROM auth.users;

-- Then update (replace 'YOUR_USER_ID' with actual UUID):
UPDATE patients 
SET user_id = 'YOUR_USER_ID'
WHERE user_id IS NULL OR patient_id LIKE 'PAT-%';
```

### Step 3: Test After Fix
1. **Refresh browser** (Ctrl+Shift+R)
2. **Open Console** (F12)
3. **Look for:**
   ```
   🔐 Auth session: Authenticated
   👤 User ID: [your-user-id]
   🔍 Fetching patients from database...
   📦 Raw data from Supabase: [...]
   ✅ Successfully loaded 16 patients from database
   ```

## Common Issues

### Issue 1: RLS Policy Filters by user_id
**Symptom:** Data shows initially but disappears on reload
**Solution:** Update RLS policy to allow all authenticated users (see Step 1)

### Issue 2: Patients Have Wrong user_id
**Symptom:** Data exists but RLS filters it out
**Solution:** Update patient records with correct user_id (see Step 2)

### Issue 3: Auth Not Ready
**Symptom:** Console shows "Not authenticated"
**Solution:** Already fixed with delay - but check if you're logged in

## Quick Test

Run this in browser console after page loads:
```javascript
// Check auth
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check if you can query patients
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .limit(5);
console.log('Patients:', data);
console.log('Error:', error);
```

If this works but the component doesn't, it's a timing/RLS issue.

