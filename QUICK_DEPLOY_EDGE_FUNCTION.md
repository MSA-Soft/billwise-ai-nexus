# Quick Guide: Deploy NPI Lookup Edge Function

## The Problem
You're seeing CORS errors because the Edge Function isn't deployed yet. The taxonomy search will work with local fallback, but NPI lookup needs the Edge Function.

## Quick Solution (3 Steps)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Link
```bash
# Login to Supabase
supabase login

# Link to your project (get project-ref from Supabase dashboard URL)
# Example: https://pusaxbvoiplsjflmnnyh.supabase.co
# Your project-ref is: pusaxbvoiplsjflmnnyh
supabase link --project-ref pusaxbvoiplsjflmnnyh
```

### Step 3: Deploy
```bash
supabase functions deploy npi-lookup
```

## Alternative: Deploy via Dashboard

1. Go to: https://supabase.com/dashboard/project/pusaxbvoiplsjflmnnyh/functions
2. Click **"Create a new function"**
3. Name: `npi-lookup`
4. Copy code from `supabase/functions/npi-lookup/index.ts`
5. Also create `_shared/cors.ts` with:
   ```typescript
   export const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   };
   ```
6. Click **Deploy**

## Verify It Works

After deployment, the NPI lookup should work without CORS errors. The taxonomy search already works with local fallback.

## Current Status

✅ **Taxonomy Search**: Works now (uses local fallback)  
⏳ **NPI Lookup**: Needs Edge Function deployment

## Troubleshooting

If you still see errors after deployment:
1. Check function logs: `supabase functions logs npi-lookup`
2. Verify function exists: `supabase functions list`
3. Make sure you're using the correct project-ref

