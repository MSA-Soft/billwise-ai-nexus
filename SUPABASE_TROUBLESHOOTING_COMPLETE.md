# 🔍 Complete Supabase Troubleshooting Guide

## Common Issues & Solutions

Based on Supabase documentation and your codebase analysis, here are the most common issues and their solutions:

---

## ❌ Issue 1: Missing Environment Variables

### Symptoms:
- Error: `Missing Supabase environment variable(s): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY`
- App crashes on startup
- Console shows environment variable errors

### Root Cause:
The `.env.local` file is missing or has incorrect variable names.

### Solution:

1. **Create `.env.local` file** in the project root:
   ```bash
   # Windows PowerShell
   New-Item -Path .env.local -ItemType File
   
   # macOS/Linux
   touch .env.local
   ```

2. **Add these EXACT variable names** (Vite requires `VITE_` prefix):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Get your credentials from Supabase:**
   - Go to: https://supabase.com/dashboard
   - Select your project → Settings → API
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public key** → `VITE_SUPABASE_ANON_KEY`

4. **Restart your dev server** (Vite only reads env files on startup):
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### ⚠️ Important Notes:
- Variable names MUST start with `VITE_` for Vite to expose them
- File MUST be named `.env.local` (not `.env` or `.env.development`)
- Restart dev server after creating/modifying `.env.local`
- Never commit `.env.local` to Git (it's in `.gitignore`)

---

## ❌ Issue 2: Wrong Environment Variable Names

### Symptoms:
- Variables exist but app still shows "Missing" error
- Console shows one variable found but not the other

### Root Cause:
Your code accepts both `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`, but `env.example` only shows `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Solution:

**Option A: Use `VITE_SUPABASE_ANON_KEY` (Recommended)**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Option B: Use `VITE_SUPABASE_PUBLISHABLE_KEY`**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

Both work, but `VITE_SUPABASE_ANON_KEY` is more standard.

---

## ❌ Issue 3: Database Connection Errors

### Symptoms:
- Error: `relation "profiles" does not exist`
- Error: `relation "authorization_requests" does not exist`
- 404 errors when trying to query tables

### Root Cause:
Database schema hasn't been set up yet.

### Solution:

1. **Run the complete database schema:**
   - Go to Supabase Dashboard → SQL Editor
   - Open `COMPLETE_DATABASE_SCHEMA.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" (or Ctrl+Enter)
   - Wait for success message

2. **Verify tables were created:**
   - Go to Supabase Dashboard → Table Editor
   - You should see tables like:
     - `profiles`
     - `authorization_requests`
     - `claims`
     - `patients`
     - etc.

---

## ❌ Issue 4: CORS Errors

### Symptoms:
- Browser console shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Network tab shows CORS errors
- Requests fail with CORS errors

### Root Cause:
Supabase project settings may have CORS restrictions, or the URL is incorrect.

### Solution:

1. **Check your Supabase URL:**
   - Should be: `https://xxxxx.supabase.co`
   - NOT: `http://localhost:54321` (unless using local Supabase)
   - NOT: Missing `https://`

2. **Verify in Supabase Dashboard:**
   - Settings → API → Project URL
   - Make sure it matches your `.env.local`

3. **For local development:**
   - If using local Supabase CLI, use: `http://localhost:54321`
   - Make sure local Supabase is running: `supabase status`

---

## ❌ Issue 5: Authentication Errors

### Symptoms:
- Error: `401: invalid claim: missing sub`
- Error: `Invalid API key`
- Can't sign in or sign up

### Root Cause:
- Wrong API key (using service_role instead of anon key)
- API key is incorrect or expired
- Auth settings misconfigured

### Solution:

1. **Use the ANON key, NOT service_role key:**
   - In Supabase Dashboard → Settings → API
   - Use **anon public** key (safe for client-side)
   - NEVER use **service_role** key in frontend code

2. **Check API key format:**
   - Should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Should be very long (200+ characters)

3. **Verify Auth is enabled:**
   - Supabase Dashboard → Authentication → Settings
   - Make sure "Enable Email Auth" is ON

---

## ❌ Issue 6: Package Not Installed

### Symptoms:
- Error: `Cannot find module '@supabase/supabase-js'`
- Import errors in console

### Solution:

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Verify installation
npm list @supabase/supabase-js
```

---

## ❌ Issue 7: Vite Not Reading Environment Variables

### Symptoms:
- Variables are in `.env.local` but `import.meta.env.VITE_SUPABASE_URL` is undefined
- Console shows variables as missing even though file exists

### Solution:

1. **Check file location:**
   - `.env.local` MUST be in project root (same level as `package.json`)
   - NOT in `src/` folder
   - NOT in any subdirectory

2. **Check file format:**
   ```env
   # ✅ Correct
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   
   # ❌ Wrong (no quotes needed)
   VITE_SUPABASE_URL="https://xxx.supabase.co"
   
   # ❌ Wrong (spaces around =)
   VITE_SUPABASE_URL = https://xxx.supabase.co
   ```

3. **Restart dev server:**
   ```bash
   # Stop server completely (Ctrl+C)
   # Then restart
   npm run dev
   ```

4. **Check Vite config:**
   - Your `vite.config.ts` looks correct
   - No special configuration needed for env variables

---

## ❌ Issue 8: Local Supabase Not Working

### Symptoms:
- Using local Supabase but connection fails
- Error: `ECONNREFUSED` or `Connection refused`

### Solution:

1. **Install Supabase CLI:**
   ```bash
   # Windows (PowerShell)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   
   # macOS
   brew install supabase/tap/supabase
   
   # Or via npm
   npm install -g supabase
   ```

2. **Start local Supabase:**
   ```bash
   # Login first
   supabase login
   
   # Initialize (if not done)
   supabase init
   
   # Start local instance
   supabase start
   ```

3. **Check Docker is running:**
   - Supabase CLI requires Docker
   - Make sure Docker Desktop is running
   - Check: `docker ps`

4. **Get local credentials:**
   - After `supabase start`, it shows:
     ```
     API URL: http://localhost:54321
     anon key: eyJhbGc...
     ```
   - Use these in `.env.local`

---

## ✅ Complete Setup Checklist

Follow this checklist in order:

- [ ] **1. Create Supabase Project**
  - [ ] Go to https://supabase.com
  - [ ] Create new project
  - [ ] Wait for project to be ready (2-3 minutes)

- [ ] **2. Get Credentials**
  - [ ] Go to Settings → API
  - [ ] Copy Project URL
  - [ ] Copy anon public key

- [ ] **3. Create .env.local**
  - [ ] Create file in project root
  - [ ] Add `VITE_SUPABASE_URL`
  - [ ] Add `VITE_SUPABASE_ANON_KEY`
  - [ ] Save file

- [ ] **4. Install Dependencies**
  - [ ] Run: `npm install`
  - [ ] Verify: `npm list @supabase/supabase-js`

- [ ] **5. Set Up Database**
  - [ ] Go to Supabase Dashboard → SQL Editor
  - [ ] Run `COMPLETE_DATABASE_SCHEMA.sql`
  - [ ] Verify tables created in Table Editor

- [ ] **6. Restart Dev Server**
  - [ ] Stop current server (Ctrl+C)
  - [ ] Run: `npm run dev`
  - [ ] Check browser console for success messages

- [ ] **7. Test Connection**
  - [ ] Open app in browser
  - [ ] Check console for: `✅ Database connection successful`
  - [ ] Try to sign up/sign in

---

## 🔧 Quick Diagnostic Script

Create a test file to check your setup:

```typescript
// test-supabase.ts (temporary file)
import { supabase } from './src/integrations/supabase/client';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Check environment variables
  console.log('Env URL:', import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌');
  console.log('Env Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌');
  
  // Test 2: Test connection
  const { data, error } = await supabase.from('profiles').select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful!');
  }
}

testConnection();
```

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Supabase React Guide**: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- **Troubleshooting Auth**: https://supabase.com/docs/guides/auth/troubleshooting

---

## 🆘 Still Having Issues?

If you've tried everything above and still have issues:

1. **Check browser console** for specific error messages
2. **Check network tab** for failed requests
3. **Verify Supabase project is active** (not paused)
4. **Check Supabase status page**: https://status.supabase.com
5. **Review Supabase logs**: Dashboard → Logs

---

**Most Common Fix**: Create `.env.local` with correct variable names and restart dev server! 🚀

