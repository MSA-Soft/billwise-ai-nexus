# 📝 Create .env.local File

Since `.env.local` is protected, please create it manually:

## Quick Steps:

1. **Create a new file** in the root of your project called `.env.local`

2. **Copy and paste this template:**

```env
# Supabase Configuration
# Get these from: https://supabase.com/dashboard → Your Project → Settings → API
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# AI Configuration (optional)
LOVABLE_API_KEY=your_lovable_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

3. **Replace the placeholder values:**
   - `your_supabase_url_here` → Your actual Supabase project URL
   - `your_supabase_anon_key_here` → Your actual anon/public key

4. **Save the file**

---

## Where to Get Your Credentials:

### Option A: You have a Supabase project
1. Go to: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Option B: You need to create a project
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up (free account)
4. Click "New Project"
5. Fill in:
   - Name: `billwise-ai-nexus`
   - Database Password: **Save this!**
   - Region: Choose closest
6. Wait 2-3 minutes
7. Then follow Option A above

---

## After Creating .env.local:

1. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Check browser console** for connection status

3. **Run database schema** (see CHECK_CONNECTION.md)

---

## File Location:

Make sure `.env.local` is in the **root** of your project:
```
billwise-ai-nexus/
├── .env.local          ← HERE
├── package.json
├── src/
└── ...
```

