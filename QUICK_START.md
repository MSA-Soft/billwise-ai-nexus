# 🚀 Quick Start - Supabase Connection

## Quick Setup (Choose One)

### Option A: Supabase Cloud (Recommended)

1. **Get your Supabase credentials:**
   - Go to https://supabase.com/dashboard
   - Select your project → Settings → API
   - Copy **Project URL** and **anon/public key**

2. **Create `.env.local` file:**
   ```bash
   # Windows PowerShell
   .\setup-supabase.ps1
   
   # macOS/Linux
   ./setup-supabase.sh
   
   # Or manually create .env.local:
   ```
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

3. **Set up database:**
   - Go to Supabase Dashboard → SQL Editor
   - Run `COMPLETE_SUPABASE_SCHEMA.sql`
   - Then run `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql`

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

### Option B: Local Supabase (Development)

1. **Install Supabase CLI:**
   ```bash
   # Windows (PowerShell)
   scoop install supabase
   # OR
   npm install -g supabase
   
   # macOS
   brew install supabase/tap/supabase
   
   # Linux
   npm install -g supabase
   ```

2. **Run setup script:**
   ```bash
   # Windows
   .\setup-supabase.ps1
   
   # macOS/Linux
   ./setup-supabase.sh
   ```

3. **Start local Supabase:**
   ```bash
   supabase start
   ```

4. **Create `.env.local`** with the credentials shown

5. **Set up database** in Supabase Studio (http://localhost:54323)

---

## Verify Connection

After setup, check browser console for:
- ✅ `Database connection successful`
- ✅ `🔧 Supabase Configuration: URL: ✅ From .env`

If you see errors, check:
1. `.env.local` file exists and has correct values
2. Variable names are correct (`VITE_SUPABASE_URL`, not `SUPABASE_URL`)
3. Dev server was restarted after creating `.env.local`
4. Database schema was run

---

## Troubleshooting

**Error: "Missing Supabase environment variable(s)"**
→ Create `.env.local` file with your credentials

**Error: "Failed to fetch"**
→ Check your Supabase URL and key are correct

**Error: "relation does not exist"**
→ Run the database schema SQL files

**Still having issues?**
→ Run the debug script: `node debug-env.js`

