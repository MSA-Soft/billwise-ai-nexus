# 🔧 Step-by-Step: Fix Facilities Table Error

## Current Error
```
GET .../facilities?select=id%2Cname&status=eq.active 400 (Bad Request)
Facilities table not found, using mock data
```

## Solution: Create the Facilities Table

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. **Sign in** if needed
3. **Click on your project** (the one you're using)

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"** (icon looks like a database/terminal)
2. Click the **"New Query"** button (top right, or use the + icon)

### Step 3: Copy the SQL Script
1. Open the file **`CREATE_FACILITIES_TABLE.sql`** from your project
2. **Select ALL** the text (Ctrl+A)
3. **Copy** it (Ctrl+C)

### Step 4: Paste and Run
1. **Paste** the copied SQL into the Supabase SQL Editor (Ctrl+V)
2. **Click the "Run" button** (green button, or press **Ctrl+Enter**)
3. Wait a few seconds for it to complete

### Step 5: Verify It Worked
1. In Supabase Dashboard, click **"Table Editor"** (left sidebar)
2. You should see **`facilities`** in the list of tables
3. Click on **`facilities`** to see the 4 sample facilities:
   - Main Office
   - Downtown Clinic
   - North Branch
   - South Medical Center

### Step 6: Refresh Your App
1. Go back to your app (http://localhost:8080)
2. **Refresh the page** (F5 or Ctrl+R)
3. **Open browser console** (F12)
4. The error should be **GONE** ✅
5. The facilities dropdown should now show real data from database

---

## Visual Guide

```
Supabase Dashboard
├── SQL Editor (click this)
│   ├── New Query (click this)
│   ├── Paste CREATE_FACILITIES_TABLE.sql
│   └── Run (click this)
│
└── Table Editor (verify here)
    └── facilities (should appear here)
```

---

## Troubleshooting

### ❌ "relation already exists" error
**Meaning:** Table already exists but might have wrong structure  
**Fix:** The script uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen. If it does, the table exists but might need data. Check Table Editor.

### ❌ "permission denied" error
**Meaning:** RLS policies might be blocking  
**Fix:** The script creates policies, but if you see this, you might need to temporarily disable RLS:
```sql
ALTER TABLE facilities DISABLE ROW LEVEL SECURITY;
```
Then re-enable it after.

### ❌ Still getting 400 error after running script
**Possible causes:**
1. **Script didn't run completely** - Check for any error messages in SQL Editor
2. **Table exists but wrong structure** - Check Table Editor → facilities → see if columns match
3. **RLS blocking access** - Try the permission fix above
4. **Cache issue** - Hard refresh browser (Ctrl+Shift+R)

### ✅ Script ran successfully but still see error
1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Clear browser cache**
3. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev` again
4. Check browser console for new errors

---

## Quick Test After Fix

Open browser console (F12) and run:
```javascript
// This should work without errors
const { data, error } = await supabase
  .from('facilities')
  .select('id, name')
  .eq('status', 'active');
  
if (error) {
  console.error('❌ Error:', error);
} else {
  console.log('✅ Success! Facilities:', data);
}
```

You should see an array of facilities, not an error!

---

## Expected Result

**Before:**
- ❌ 400 Bad Request error
- ❌ "Facilities table not found, using mock data"
- ❌ Dropdown shows mock data

**After:**
- ✅ No errors in console
- ✅ Facilities loaded from database
- ✅ Dropdown shows: Main Office, Downtown Clinic, North Branch, South Medical Center

---

## Need Help?

If you're still having issues:
1. Check the **SQL Editor** for any error messages
2. Check **Table Editor** to see if `facilities` table exists
3. Share the error message you see in SQL Editor

