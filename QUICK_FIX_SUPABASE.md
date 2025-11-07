# ⚡ Quick Fix: Get Supabase Working in 5 Minutes

## The Most Common Problem

**99% of Supabase connection issues are caused by missing or incorrect `.env.local` file.**

---

## Step-by-Step Fix (5 Minutes)

### Step 1: Get Your Supabase Credentials (2 minutes)

1. Go to: **https://supabase.com/dashboard**
2. Select your project (or create one if you don't have it)
3. Go to: **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJhbGc...`)

### Step 2: Create .env.local File (1 minute)

**Windows (PowerShell):**
```powershell
# Create the file
New-Item -Path .env.local -ItemType File -Force

# Open in notepad
notepad .env.local
```

**macOS/Linux:**
```bash
# Create the file
touch .env.local

# Open in editor
nano .env.local
# or
code .env.local
```

### Step 3: Add Your Credentials (1 minute)

Paste this into `.env.local` and replace with YOUR values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Restart Dev Server (1 minute)

```bash
# Stop current server (press Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Verify It Works

1. Open browser console (F12)
2. Look for: `🔧 Supabase Configuration: URL: ✅ From .env`
3. If you see this, you're good! ✅

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong Variable Names
```env
# ❌ WRONG - Missing VITE_ prefix
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# ✅ CORRECT - Has VITE_ prefix
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### ❌ Wrong File Name
```
❌ .env
❌ .env.development
❌ env.local
✅ .env.local  (CORRECT)
```

### ❌ Wrong Location
```
❌ src/.env.local
❌ public/.env.local
✅ .env.local  (in project root, same level as package.json)
```

### ❌ Using Wrong Key
```
❌ service_role key (NEVER use in frontend!)
✅ anon public key (CORRECT for frontend)
```

---

## 🎯 Still Not Working?

### Check 1: File Exists?
```bash
# Windows
dir .env.local

# macOS/Linux
ls -la .env.local
```

### Check 2: Variables Loaded?
Open browser console and type:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

If both show `undefined`, the file isn't being read. Make sure:
- File is named exactly `.env.local`
- File is in project root
- You restarted the dev server

### Check 3: Database Schema?
If you get "relation does not exist" errors:
1. Go to Supabase Dashboard → SQL Editor
2. Run `COMPLETE_DATABASE_SCHEMA.sql`
3. Wait for success message

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **Browser Console:**
   ```
   🔧 Supabase Configuration:
   URL: ✅ From .env
   Key: ✅ From .env (200+ chars)
   ```

2. **No Errors:**
   - No "Missing Supabase environment variable" errors
   - No CORS errors
   - No connection refused errors

3. **App Loads:**
   - Login page appears
   - No crashes on startup

---

**That's it!** If you followed these steps and it's still not working, check the detailed troubleshooting guide: `SUPABASE_TROUBLESHOOTING_COMPLETE.md`

