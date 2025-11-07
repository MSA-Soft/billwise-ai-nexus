# 🔧 Fix: Facilities Table Missing

## Issue
Your Supabase connection is working ✅, but the `facilities` table is missing, causing a 400 error.

**Error:** `Failed to load resource: the server responded with a status of 400 ()`  
**Message:** `Facilities table not found, using mock data`

## Quick Fix (2 minutes)

### Option 1: Run the Fix Script (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** (left sidebar)

2. **Run the fix script:**
   - Open `FIX_FACILITIES_TABLE.sql` from your project
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify it worked:**
   - Go to **Table Editor** → You should see `facilities` table
   - It should have 4 sample facilities

4. **Refresh your app:**
   - The error should be gone
   - Facilities dropdown should show real data instead of mock data

---

### Option 2: Run Complete Schema (If you haven't yet)

If you haven't run the complete database schema yet:

1. **In Supabase SQL Editor, run:**
   - First: `COMPLETE_SUPABASE_SCHEMA.sql` (creates all base tables)
   - Then: `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql` (creates additional tables)

2. **This will create ALL tables including facilities**

---

## What the Fix Does

The `FIX_FACILITIES_TABLE.sql` script:
- ✅ Creates the `facilities` table with correct structure
- ✅ Adds indexes for performance
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Inserts 4 sample facilities:
  - Main Office
  - Downtown Clinic
  - North Branch
  - South Medical Center

---

## Verify It's Fixed

After running the script:

1. **Check browser console** - Should NOT see the error anymore
2. **Check facilities dropdown** - Should show real facilities from database
3. **Check Supabase Table Editor** - Should see `facilities` table with data

---

## Expected Result

**Before:**
```
❌ Facilities table not found, using mock data
❌ 400 error in console
```

**After:**
```
✅ Facilities loaded from database
✅ No errors in console
✅ Dropdown shows: Main Office, Downtown Clinic, North Branch, South Medical Center
```

---

## Need More Tables?

If you see similar errors for other tables (like `providers`, `insurance_payers`, etc.), you need to run the complete schema:

1. Run `COMPLETE_SUPABASE_SCHEMA.sql`
2. Run `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql`

This will create all 50+ tables your app needs.

---

## Quick Test

After fixing, you can test in browser console:
```javascript
// This should work without errors
const { data, error } = await supabase
  .from('facilities')
  .select('id, name')
  .eq('status', 'active');
  
console.log('Facilities:', data);
```

You should see an array of facilities, not an error!

