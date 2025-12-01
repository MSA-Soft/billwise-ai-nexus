# How to Switch to ZarSolution Company

## The Problem
You configured access restrictions for **"ZarSolution"** company, but zar is currently viewing **"Default Company"**. Access restrictions are **company-specific**, so you need to switch to the correct company to see the restrictions.

## Solution: Switch Company

1. **Look at the top header** - you should see a button/dropdown showing "Default Company"
2. **Click on "Default Company"** button
3. **Select "ZarSolution"** from the dropdown
4. **The page will reload** and you should now see the restricted menu

## After Switching

Once you switch to "ZarSolution":
- The header will show "ZarSolution" instead of "Default Company"
- The sidebar will only show the forms/reports that are **enabled** for ZarSolution
- Forms/reports that are **disabled** will be hidden from the sidebar

## Verify It's Working

1. **Check the browser console** (F12) - you should see:
   ```
   🔒 Loading route access for:
   🔒   Company Name: ZarSolution
   ❌ DENIED: [form names that are disabled]
   ```

2. **Check the sidebar** - you should only see:
   - Dashboard ✅
   - Eligibility Verification ✅
   - Prior Authorization ✅
   - Facilities ✅
   - Providers ✅
   - Payers ✅
   - Codes ✅
   - And any other forms you enabled

3. **Hidden items** (should NOT appear):
   - Authorization ❌ (explicitly disabled)
   - Claims ❌ (not configured = default enabled, but if you disable it, it will hide)
   - Patients ❌
   - Scheduling ❌
   - And all other disabled/not-configured items

## If You Don't See ZarSolution in the Dropdown

This means zar is not associated with ZarSolution company. You need to:

1. **As Super Admin**, go to Super Admin → Companies
2. **Find ZarSolution** company
3. **Add zar@gmail.com** to ZarSolution company
4. **Then zar can switch** to ZarSolution

## Important Note

The access restrictions you configured are **ONLY** for "ZarSolution" company. If zar switches back to "Default Company", they will see all menu items again (because Default Company has no restrictions configured).

