# ⚡ Quick Fix: "No API key found in request"

## The Problem
Your browser shows: `"No API key found in request"` even though `.env.local` exists.

## Most Likely Cause
**The dev server wasn't restarted after creating/updating `.env.local`**

Vite only reads environment variables when the dev server **starts**. Changes to `.env.local` require a restart.

---

## ✅ Quick Fix (30 seconds)

### Step 1: Stop Dev Server
1. Go to the terminal where `npm run dev` is running
2. Press **`Ctrl+C`** to stop it

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Hard Refresh Browser
- Press **`Ctrl+Shift+R`** (Windows/Linux)
- Or **`Cmd+Shift+R`** (Mac)

### Step 4: Check Console
You should now see:
- ✅ `Key: ✅ From .env (XXX chars)` - Shows the key length
- ✅ `Key preview: eyJhbGciOiJIUzI1NiI...` - Shows first 20 chars
- ✅ No more "No API key found" errors

---

## If That Doesn't Work

### Check .env.local File

1. **Open `.env.local`** in your editor
2. **Verify it looks exactly like this:**
   ```env
   VITE_SUPABASE_URL=https://pusaxbvoiplsjflmnnyh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1c2F4YnZvaXBsbHNqZmxtbm55aCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg5ODc2NTIzLCJleHAiOjE3MjE0MTI1MjN9.your-full-key-here
   ```

3. **Important:**
   - ✅ No quotes around values
   - ✅ No spaces around `=`
   - ✅ Key should be very long (200+ characters)
   - ✅ Key should start with `eyJ`

4. **If key looks wrong:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the **anon public** key again
   - Paste it into `.env.local`
   - Save and restart dev server

---

## What I Changed

I updated `src/integrations/supabase/client.ts` to:
1. ✅ Show better debug info (key length, preview)
2. ✅ Explicitly add API key to request headers
3. ✅ Better error messages

---

## Test It Works

After restarting, open browser console and you should see:
```
🔧 Supabase Configuration:
URL: ✅ From .env
Key: ✅ From .env (XXX chars)
Key preview: eyJhbGciOiJIUzI1NiI...
```

If you see `Key: ❌ Missing` or key length is 0, your `.env.local` isn't being read.

---

## Still Not Working?

See `FIX_API_KEY_ISSUE.md` for detailed troubleshooting.

