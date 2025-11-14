# 🔧 Quick Fix: Seed Data for Your Table Structure

## Your Table Structure

Based on your actual table, here are the key differences:

- ✅ `middle_initial` (not `middle_name`) - single character
- ✅ `phone_primary` and `phone_secondary` (not just `phone`)
- ✅ `emergency_contact_relationship` (not `emergency_contact_relation`)
- ✅ `user_id` is **REQUIRED** (NOT NULL)
- ✅ `gender` is a USER-DEFINED type (enum: probably 'M', 'F', 'O', 'U')

## Solution

I've created **`SEED_PATIENTS_MUSLIM_NAMES_CORRECTED.sql`** that matches your exact table structure.

### Important: user_id

The script uses:
```sql
(SELECT id FROM auth.users LIMIT 1)
```

This will use the first user in your auth.users table. 

**If you want to use a specific user ID:**
1. Get your user ID from Supabase Dashboard → Authentication → Users
2. Replace `(SELECT id FROM auth.users LIMIT 1)` with your actual UUID
3. Or run this first to get your user ID:
   ```sql
   SELECT id, email FROM auth.users;
   ```

## Steps to Run

1. **Open Supabase SQL Editor**
2. **Copy the entire content of `SEED_PATIENTS_MUSLIM_NAMES_CORRECTED.sql`**
3. **Paste and Run**
4. **Verify:**
   ```sql
   SELECT COUNT(*) FROM patients WHERE patient_id LIKE 'PAT-%';
   ```
   Should return 15.

5. **Refresh your browser** and check if patients appear!

## If Gender Enum Error

If you get an error about gender, check what values are allowed:
```sql
SELECT unnest(enum_range(NULL::gender)) AS gender_values;
```

Or check the enum type:
```sql
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname = 'gender';
```

Common values: 'M', 'F', 'O', 'U' (Male, Female, Other, Unknown)

---

**After running the seed script, refresh your browser and check the console for:**
`✅ Loaded 15 patients from database`



