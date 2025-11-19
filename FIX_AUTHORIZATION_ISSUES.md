# Fix Authorization Issues - Step by Step Guide

## Problems Identified:
1. ❌ Authorizations not saving
2. ❌ Status updates not working
3. ❌ Task Management showing blank

## Root Causes:
1. **RLS (Row Level Security) policies** are blocking inserts/updates
2. **Missing refresh logic** after operations
3. **Task filtering** too restrictive

## Solution Steps:

### Step 1: Fix RLS Policies (CRITICAL)
Run this SQL file in Supabase SQL Editor:
**`FIX_AUTHORIZATION_RLS_AND_REFRESH.sql`**

This will:
- ✅ Fix RLS policies for `authorization_requests` table
- ✅ Fix RLS policies for `authorization_tasks` table
- ✅ Fix RLS policies for `authorization_task_history` table
- ✅ Fix RLS policies for `authorization_task_comments` table

### Step 2: Verify Tables Exist
Make sure these tables exist:
- `authorization_requests`
- `authorization_tasks`
- `authorization_task_history`
- `authorization_task_comments`

If `authorization_tasks` doesn't exist, run:
**`CREATE_AUTHORIZATION_TASKS_TABLE.sql`**

### Step 3: Test the Fixes

1. **Create Authorization:**
   - Click "New Authorization" button
   - Fill out the form
   - Submit
   - Should see success message and authorization appears in list

2. **Update Status:**
   - Click "Update Status" on any authorization
   - Select new status and add notes
   - Click "Update"
   - Should see success message and:
     - Authorization status updated
     - Task created in Task Management
     - Notes saved as task comment

3. **View Tasks:**
   - Go to "Task Management" tab
   - Should see all tasks for your authorizations
   - Tasks should show patient names and notes

### Step 4: Check Browser Console
Open browser console (F12) and look for:
- ✅ `📋 Tasks loaded: X` - Shows tasks are loading
- ✅ `✅ Loaded tasks: X` - Confirms task count
- ❌ Any error messages - Report these

## Code Changes Made:

1. **AuthorizationTracking.tsx:**
   - Added `fetchAuthorizations()` function
   - Added refresh after status update
   - Added refresh after authorization creation
   - Fixed authorization form to use `AuthorizationRequestDialog`

2. **authorizationTaskService.ts:**
   - Removed restrictive `assigned_to` filter
   - Now shows all tasks user has access to (via RLS)
   - Added better error logging

3. **AuthorizationTaskManagement.tsx:**
   - Removed default `assigned_to` filter
   - Added refresh on filter changes
   - Added better error handling

## If Still Not Working:

1. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'authorization_requests';
   SELECT * FROM pg_policies WHERE tablename = 'authorization_tasks';
   ```

2. **Check if user is authenticated:**
   - Open browser console
   - Check if `user` object exists
   - Verify `user.id` is set

3. **Check database directly:**
   ```sql
   SELECT * FROM authorization_requests ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM authorization_tasks ORDER BY created_at DESC LIMIT 5;
   ```

4. **Check browser console for errors:**
   - Look for RLS policy violations
   - Look for missing table errors
   - Look for authentication errors

## Expected Behavior After Fix:

✅ Creating authorization → Saves to database → Appears in list
✅ Updating status → Updates database → Creates task → Task appears in Task Management
✅ Task Management → Shows all tasks with patient names and notes
✅ Visit completion → Creates next visit task automatically

