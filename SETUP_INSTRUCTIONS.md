# 🚀 Supabase Connection Setup - Step by Step

## Current Status
✅ Node.js and npm are installed  
✅ Project files are ready  
❌ `.env.local` file is missing (this is why Supabase isn't connecting)

---

## Quick Fix (5 minutes)

### Step 1: Create `.env.local` File

**Option A: Using PowerShell (Easiest)**
```powershell
cd "D:\zar projects\billwise-ai-nexus"
Copy-Item env.example .env.local
```

**Option B: Manual Creation**
1. Open your project in VS Code or any editor
2. Create a new file called `.env.local` in the root directory
3. Copy the contents from `env.example` into it

### Step 2: Get Your Supabase Credentials

**If you DON'T have a Supabase account:**
1. Go to: https://supabase.com
2. Click "Start your project" → Sign up (free)
3. Click "New Project"
4. Fill in:
   - Name: `billwise-ai-nexus`
   - Password: Create a strong password (SAVE IT!)
   - Region: Choose closest
5. Wait 2-3 minutes for setup

**If you ALREADY have a project:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (long string)

### Step 3: Update `.env.local`

Open `.env.local` and replace:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-key-here
```

**Important:** 
- Remove `your_supabase_url_here` and paste your actual URL
- Remove `your_supabase_anon_key_here` and paste your actual key
- Keep the `VITE_` prefix on variable names

### Step 4: Set Up Database

1. In Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open `COMPLETE_SUPABASE_SCHEMA.sql` from your project
4. Copy ALL contents → Paste into SQL Editor → Click **Run**
5. Then do the same for `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql`

### Step 5: Restart Dev Server

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

### Step 6: Verify Connection

1. Open browser to your app (usually http://localhost:8080)
2. Press **F12** to open Developer Console
3. Look for:
   - ✅ `🔧 Supabase Configuration: URL: ✅ From .env`
   - ✅ `✅ Database connection successful`

---

## Troubleshooting

### ❌ Error: "Missing Supabase environment variable(s)"

**Fix:**
- Make sure `.env.local` exists in project root
- Check variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Restart dev server after creating/editing `.env.local`

### ❌ Error: "Failed to fetch" or Network Error

**Fix:**
- Verify your Supabase URL is correct (should start with `https://`)
- Verify your API key is correct (should be long string starting with `eyJ...`)
- Check Supabase project is not paused
- Check browser console for CORS errors

### ❌ Error: "relation does not exist"

**Fix:**
- Run the database schema SQL files (Step 4 above)
- Make sure you ran both files in order

### ❌ Still not working?

Run the debug script:
```bash
node debug-env.js
```

This will show you what environment variables are loaded.

---

## File Structure Should Look Like:

```
billwise-ai-nexus/
├── .env.local          ← YOU NEED THIS FILE
├── env.example
├── package.json
├── src/
│   └── integrations/
│       └── supabase/
│           └── client.ts
└── ...
```

---

## Quick Test After Setup

Once connected, you can test in browser console (F12):
```javascript
// This should work without errors
import { supabase } from '@/integrations/supabase/client';
console.log('Supabase client:', supabase);
```

---

## Need More Help?

- 📖 See `SUPABASE_SETUP.md` for detailed guide
- 📖 See `CHECK_CONNECTION.md` for troubleshooting
- 📖 See `CREATE_ENV_FILE.md` for file creation help

---

## Summary Checklist

- [ ] Created `.env.local` file
- [ ] Added Supabase URL to `.env.local`
- [ ] Added Supabase API key to `.env.local`
- [ ] Ran database schema SQL files
- [ ] Restarted dev server
- [ ] Checked browser console for connection success
- [ ] App loads without errors

Once all checked, you're good to go! 🎉

