# BillWise AI Nexus - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Environment Variables Error

**Error:** `Missing Supabase environment variables. Please check your .env.local file.`

**Solution:**
1. Make sure you have a `.env.local` file in your project root
2. Check that the file contains:
   ```
   VITE_SUPABASE_URL=https://pusaxbvoiplsjflmnnyh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart your development server after creating/updating the file
4. Check the browser console for environment validation messages

### 2. Database Connection Issues

**Error:** Database queries failing or timeout errors

**Solution:**
1. Run the database setup script: `Database/complete-database-setup.sql`
2. Check your Supabase project is active
3. Verify RLS policies are created
4. Check the browser console for connection test results

### 3. No Data Showing

**Issue:** Components show loading or empty states

**Solution:**
1. Check if sample data was inserted during setup
2. Verify database tables exist
3. Check RLS policies allow data access
4. Look for errors in browser console

### 4. TypeScript Errors

**Error:** Type mismatches or missing types

**Solution:**
1. Restart your TypeScript server
2. Check that all imports are correct
3. Verify database types are up to date
4. Clear node_modules and reinstall if needed

## 🔧 Debug Steps

### Step 1: Check Environment
Open browser console and look for:
```
Environment Info: {
  supabaseUrl: "✅ Set",
  supabaseKey: "✅ Set"
}
```

### Step 2: Test Database Connection
Look for these messages in console:
```
🔍 Testing database connection...
✅ Database connection successful
🎉 All database tests passed!
```

### Step 3: Check Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Look for Supabase API calls
4. Check for any failed requests

### Step 4: Verify Database Setup
1. Go to your Supabase dashboard
2. Check SQL Editor
3. Run: `SELECT * FROM collections_accounts LIMIT 5;`
4. Should return sample data

## 🛠️ Quick Fixes

### Reset Environment
```bash
# Delete and recreate .env.local
rm .env.local
# Copy the environment variables from the setup guide
```

### Restart Everything
```bash
# Stop the dev server (Ctrl+C)
# Clear cache
npm run dev
# or
yarn dev
```

### Check Database
1. Go to Supabase dashboard
2. Check if tables exist
3. Run the complete setup script again
4. Verify sample data is inserted

## 📞 Still Having Issues?

### Check These Files
- `.env.local` - Environment variables
- `Database/complete-database-setup.sql` - Database schema
- Browser console - Error messages
- Supabase dashboard - Database status

### Common Solutions
1. **Restart dev server** after environment changes
2. **Clear browser cache** if seeing old errors
3. **Check Supabase project** is not paused
4. **Verify RLS policies** are created
5. **Check network connectivity** to Supabase

### Debug Mode
Set `VITE_APP_ENV=development` in `.env.local` for:
- Detailed error messages
- Database query logging
- Environment validation
- Connection testing

## ✅ Success Indicators

You'll know everything is working when you see:
- ✅ Environment variables loaded
- ✅ Database connection successful
- ✅ Real data in components (not mock data)
- ✅ No console errors
- ✅ CRUD operations working

## 🆘 Emergency Reset

If nothing works, try this complete reset:

1. **Delete .env.local**
2. **Recreate .env.local** with correct values
3. **Run database setup script** in Supabase
4. **Clear browser cache**
5. **Restart dev server**
6. **Check console for success messages**

The application should now work with real database data!
