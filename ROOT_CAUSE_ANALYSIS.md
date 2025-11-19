# 🔍 ROOT CAUSE ANALYSIS: Why Data Disappears on Reload

## The Problem
- ✅ Before refresh: 16 Muslim names show (fetch works)
- ❌ After refresh: 2 English names show (mock data appears)

## Investigation Findings

### 1. Component Structure
- `Patients` component is used in `CustomerSetup.tsx` when `tab=patients`
- Component initializes with `patients = []` (empty array) ✅
- Mock data is defined but NOT used in initialization ✅

### 2. Data Flow
```
Patients Component
  ↓
  useEffect (on mount)
    ↓
  fetchPatientsFromDatabase()
    ↓
  Supabase query
    ↓
  Transform data
    ↓
  setPatients(transformedPatients)
    ↓
  PatientSearchSystem receives patients prop
    ↓
  Renders list
```

### 3. Potential Issues Found

#### Issue A: Early Returns Without State Update
If `fetchPatientsFromDatabase` returns early (no session, error, etc.), `isLoading` might stay `true` or state might not update properly.

#### Issue B: RLS Policy Filtering
If RLS policy filters by `user_id`, and the patients have different `user_id` than the logged-in user, they won't be returned.

#### Issue C: Data Transformation Failure
If transformation fails silently, `data` might exist but `transformedPatients` could be empty.

#### Issue D: Component Remounting
If component unmounts/remounts, state resets to `[]`.

#### Issue E: Browser Cache
Old JavaScript bundle might be cached, showing old code with mock data.

## Most Likely Root Cause

**RLS Policy Filtering by `user_id`**

Your patients table has `user_id` as NOT NULL. If:
1. Patients were inserted with one `user_id`
2. You're logged in with a different `user_id`
3. RLS policy filters: `USING (user_id = auth.uid())`

Then on reload, the query returns empty array `[]`, and since we removed mock data fallback, it shows empty. But wait - you said you see 2 English names, not empty!

## Wait - Where Are 2 English Names Coming From?

If we removed mock data initialization, where are "John Doe" and "Sarah Wilson" coming from?

**Possible sources:**
1. Browser cache - old JavaScript bundle
2. Another component rendering mock data
3. Database actually has 2 patients with those names
4. React DevTools showing stale state

## Next Steps to Identify Exact Cause

1. **Check browser console** - What do the logs say?
2. **Check Network tab** - Is the API call successful? What does it return?
3. **Check Supabase directly** - Run `SELECT * FROM patients` - how many rows?
4. **Check RLS policies** - Do they filter by user_id?
5. **Hard refresh** - Clear cache completely



