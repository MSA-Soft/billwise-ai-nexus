# Deploy NPI Lookup Edge Function

This document explains how to deploy the Supabase Edge Function that proxies NPPES API requests to avoid CORS issues.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Logged into Supabase: `supabase login`
3. Linked to your project: `supabase link --project-ref your-project-ref`

## Deployment Steps

### 1. Initialize Supabase Functions (if not already done)

```bash
supabase functions new npi-lookup
```

### 2. Deploy the Function

```bash
supabase functions deploy npi-lookup
```

### 3. Verify Deployment

The function should be available at:
```
https://your-project-ref.supabase.co/functions/v1/npi-lookup
```

## Testing the Function

You can test the function using curl:

```bash
# Test NPI lookup
curl -X POST https://your-project-ref.supabase.co/functions/v1/npi-lookup \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "searchByNumber",
    "number": "1234567890"
  }'

# Test Taxonomy search
curl -X POST https://your-project-ref.supabase.co/functions/v1/npi-lookup \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "searchTaxonomy",
    "description": "Family Medicine",
    "limit": 10
  }'
```

## Alternative: Quick Deploy via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it `npi-lookup`
5. Copy the contents of `supabase/functions/npi-lookup/index.ts`
6. Also create the shared CORS file at `supabase/functions/_shared/cors.ts`
7. Click **Deploy**

## Troubleshooting

### CORS Still Appearing
- Make sure the Edge Function is deployed and accessible
- Check that you're using `supabase.functions.invoke()` in the frontend
- Verify the function name matches exactly: `npi-lookup`

### Function Not Found
- Ensure the function is deployed: `supabase functions list`
- Check the function logs: `supabase functions logs npi-lookup`

### Authentication Errors
- The function uses the anon key automatically when called via `supabase.functions.invoke()`
- Make sure your Supabase client is properly configured

## Notes

- The Edge Function acts as a proxy, making requests server-side where CORS doesn't apply
- All requests are logged in Supabase function logs
- The function includes error handling and validation
- Rate limiting is handled by the NPPES API itself

