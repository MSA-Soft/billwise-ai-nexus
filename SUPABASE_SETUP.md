# Supabase Setup Guide

This guide will help you connect your BillWise AI Nexus project to Supabase.

## Option 1: Using Supabase Cloud (Recommended for Production)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: billwise-ai-nexus (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes 2-3 minutes)

### Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### Step 3: Create Environment File

Create a `.env.local` file in the root of your project:

```bash
# Copy env.example to .env.local
cp env.example .env.local
```

Then edit `.env.local` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Run the SQL files in this order:
   - First: `COMPLETE_SUPABASE_SCHEMA.sql`
   - Then: `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql`

### Step 5: Test Connection

Restart your dev server and check the browser console for connection status.

---

## Option 2: Using Supabase CLI (Local Development)

### Step 1: Install Supabase CLI

**Windows (PowerShell):**
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase
```

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
# Using npm
npm install -g supabase

# Or download binary
# https://github.com/supabase/cli/releases
```

### Step 2: Initialize Supabase

```bash
# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init
```

### Step 3: Start Local Supabase

```bash
# Start local Supabase instance
supabase start
```

This will output your local credentials:
```
API URL: http://localhost:54321
anon key: your-local-anon-key
```

### Step 4: Create Environment File

Create `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-local-anon-key-from-above
```

### Step 5: Run Database Migrations

```bash
# Apply schema migrations
supabase db reset
# Or manually run the SQL files in Supabase Studio
# Access at http://localhost:54323
```

---

## Troubleshooting

### Error: "Missing Supabase environment variable(s)"

**Solution:** Make sure you have `.env.local` file with correct variable names:
- `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)

### Error: "Failed to fetch" or Connection Refused

**Solutions:**
1. Check your Supabase URL is correct
2. Check your API key is correct
3. Make sure Supabase project is active (not paused)
4. Check browser console for CORS errors
5. Restart your dev server after creating `.env.local`

### Error: "relation does not exist"

**Solution:** You need to run the database schema SQL files. See Step 4 in Option 1.

### Local Supabase Not Starting

**Solutions:**
1. Make sure Docker is running (Supabase CLI uses Docker)
2. Check ports 54321, 54322, 54323 are not in use
3. Try: `supabase stop` then `supabase start`

---

## Quick Test

After setup, you can test the connection by:

1. Opening browser console
2. The app should log: `✅ Database connection successful`
3. Or manually test in browser console:
```javascript
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.from('profiles').select('count');
console.log('Connection:', error ? 'Failed' : 'Success');
```

---

## Next Steps

1. ✅ Create `.env.local` with your credentials
2. ✅ Run database schema SQL files
3. ✅ Restart dev server: `npm run dev`
4. ✅ Test connection in browser console
5. ✅ Start building! 🚀

