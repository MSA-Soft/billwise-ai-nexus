# 🔑 Fix: "No API key found in request" Error

## Problem
Even though your `.env.local` file exists and shows "✅ From .env" in console, Supabase requests are failing with:
```json
"message": "No API key found in request"
"hint": "No `apikey` request header or url param was found."
```

## Root Causes

This usually happens when:
1. **Dev server wasn't restarted** after creating `.env.local`
2. **API key value is empty or incorrect** in `.env.local`
3. **Variable name mismatch** in `.env.local`
4. **Vite cache issue**

## Quick Fixes (Try in Order)

### Fix 1: Restart Dev Server ⚡ (Most Common)

1. **Stop your dev server:**
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Hard refresh browser:**
   - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

**Why:** Vite only reads `.env.local` when the dev server starts. Changes to `.env.local` require a restart.

---

### Fix 2: Verify .env.local File

1. **Open `.env.local`** in your editor
2. **Check these exact variable names:**
   ```env
   VITE_SUPABASE_URL=https://pusaxbvoiplsjflmnnyh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...your-actual-key-here
   ```

3. **Important checks:**
   - ✅ No spaces around `=`
   - ✅ No quotes around values (unless they're part of the key)
   - ✅ No trailing spaces
   - ✅ Key starts with `eyJ` (JWT token format)

4. **Example of CORRECT format:**
   ```env
   VITE_SUPABASE_URL=https://pusaxbvoiplsjflmnnyh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1c2F4YnZvaXBsbHNqZmxtbm55aCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg5ODc2NTIzLCJleHAiOjE3MjE0MTI1MjN9.example
   ```

5. **Example of WRONG format:**
   ```env
   # ❌ WRONG - Has quotes
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
   
   # ❌ WRONG - Has spaces
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGc...
   
   # ❌ WRONG - Wrong variable name
   SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
   ```

---

### Fix 3: Verify API Key in Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Go to **Settings** → **API**
4. Under **Project API keys**, find **"anon public"**
5. **Copy the entire key** (it's very long, starts with `eyJ`)
6. **Paste it into `.env.local`** (replace the old value)
7. **Save the file**
8. **Restart dev server** (Fix 1)

---

### Fix 4: Clear Vite Cache

Sometimes Vite caches environment variables incorrectly:

1. **Stop dev server** (Ctrl+C)

2. **Delete Vite cache:**
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
   
   # Or manually delete: node_modules/.vite folder
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

### Fix 5: Debug Environment Variables

Add this temporary code to see what's actually being loaded:

1. **Open:** `src/integrations/supabase/client.ts`

2. **Temporarily add** after line 23:
   ```typescript
   // Debug: Log actual values (REMOVE AFTER DEBUGGING!)
   console.log('🔍 Debug - Actual values:');
   console.log('URL:', SUPABASE_URL);
   console.log('Key length:', SUPABASE_ANON_KEY?.length);
   console.log('Key starts with:', SUPABASE_ANON_KEY?.substring(0, 10));
   ```

3. **Check browser console** - You should see:
   - URL: Your Supabase URL
   - Key length: Should be 200+ characters
   - Key starts with: Should be `eyJhbGciOi`

4. **If key is undefined or too short**, your `.env.local` isn't being read correctly.

5. **Remove the debug code** after checking.

---

### Fix 6: Check Browser Network Tab

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Try the request again** (refresh page)
4. **Click on the failed request** (the one to `/rest/v1/facilities`)
5. **Check Headers tab** → **Request Headers**
6. **Look for:** `apikey` header

**If `apikey` header is missing:**
- The Supabase client isn't sending it
- Check Fix 1-5 above

**If `apikey` header exists but is empty:**
- Your `.env.local` has an empty value
- Check Fix 2-3 above

---

## Verification Steps

After applying fixes:

1. **Restart dev server** (always do this!)
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Check browser console:**
   - Should see: `✅ Database connection successful`
   - Should NOT see: `No API key found`
4. **Check Network tab:**
   - Request to `/rest/v1/facilities` should have `apikey` header
   - Should return 200 OK (or 400 if table doesn't exist, but NOT "No API key")

---

## Common Mistakes

### ❌ Wrong Variable Name
```env
# WRONG - Missing VITE_ prefix
SUPABASE_PUBLISHABLE_KEY=eyJ...

# CORRECT
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### ❌ Quotes Around Value
```env
# WRONG
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."

# CORRECT
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### ❌ Spaces Around =
```env
# WRONG
VITE_SUPABASE_PUBLISHABLE_KEY = eyJ...

# CORRECT
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### ❌ Wrong Key Type
```env
# WRONG - Using service_role key (secret, not for frontend!)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...service_role...

# CORRECT - Using anon/public key
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...anon...
```

---

## Still Not Working?

1. **Double-check** you're using the **anon/public** key, NOT the service_role key
2. **Verify** `.env.local` is in the **root** of your project (same folder as `package.json`)
3. **Check** there are no syntax errors in `.env.local` (no extra characters)
4. **Try** creating a fresh `.env.local` from `env.example`
5. **Check** Supabase project isn't paused or deleted

---

## Quick Test

After fixing, test in browser console:
```javascript
// This should show your API key (first 20 chars)
console.log('API Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20));
```

If it shows `undefined`, the environment variable isn't being loaded.

