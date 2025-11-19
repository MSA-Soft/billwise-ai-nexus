# ✅ Supabase Connection Checklist

## Step 1: Get Your Supabase Credentials

### If you DON'T have a Supabase project yet:

1. **Create a free account:**
   - Go to: https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub, Google, or email

2. **Create a new project:**
   - Click "New Project"
   - Name: `billwise-ai-nexus` (or any name)
   - Database Password: **SAVE THIS PASSWORD!**
   - Region: Choose closest to you
   - Click "Create new project"
   - ⏳ Wait 2-3 minutes for setup

### If you ALREADY have a Supabase project:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

---

## Step 2: Update .env.local

I've created a `.env.local` template file for you. Now you need to:

1. **Open `.env.local`** in your editor
2. **Replace these values:**
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-key-here
   ```

3. **Save the file**

---

## Step 3: Set Up Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. **First**, run this file: `COMPLETE_SUPABASE_SCHEMA.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
4. **Then**, run this file: `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql`
   - Same process

---

## Step 4: Test Connection

1. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Open browser console** (F12)
3. **Look for:**
   - ✅ `🔧 Supabase Configuration: URL: ✅ From .env`
   - ✅ `✅ Database connection successful`

---

## Step 5: Verify It Works

Open your app in browser and check:
- Can you see the login page?
- Does the app load without errors?
- Check browser console for any red errors

---

## 🆘 Still Having Issues?

### Error: "Missing Supabase environment variable(s)"
- ✅ Make sure `.env.local` exists
- ✅ Check variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- ✅ Restart dev server after creating/editing `.env.local`

### Error: "Failed to fetch" or Network Error
- ✅ Check your Supabase URL is correct (should start with `https://`)
- ✅ Check your API key is correct
- ✅ Make sure your Supabase project is not paused
- ✅ Check browser console for CORS errors

### Error: "relation does not exist"
- ✅ Run the database schema SQL files (Step 3)
- ✅ Make sure you ran both SQL files in order

### Connection works but no data?
- ✅ Database tables might not exist - run the SQL schema files
- ✅ Check Supabase Dashboard → Table Editor to see if tables exist

---

## Quick Test Command

You can also test the connection manually:

```javascript
// In browser console (F12)
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.from('profiles').select('count');
console.log(error ? '❌ Failed: ' + error.message : '✅ Connected!');
```

---

## Next Steps After Connection Works

1. ✅ Create some test data in Supabase Dashboard
2. ✅ Test authentication (sign up/login)
3. ✅ Test creating a patient
4. ✅ Test billing workflow

---

**Need help?** Check `SUPABASE_SETUP.md` for detailed instructions.

