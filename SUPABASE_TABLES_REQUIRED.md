# Supabase Tables Required for Eligibility Verification

## Summary
The Eligibility Verification component requires these Supabase tables to function properly. Currently, some tables are missing or don't have the expected structure.

## Required Tables

### 1. ✅ `collections_accounts` (Seems to exist)
**Purpose:** Stores patient information for quick lookup and patient search

**Required Columns:**
```sql
- id (uuid, primary key)
- patient_id (text/varchar) - Unique patient identifier
- patient_name (text/varchar) - Patient full name
- patient_email (text/varchar, nullable)
- patient_phone (text/varchar, nullable)
- current_balance (numeric/decimal, default 0)
- original_balance (numeric/decimal, default 0)
- days_overdue (integer, default 0)
- collection_stage (text/varchar, default 'early_collection')
- collection_status (text/varchar, default 'active')
```

**Usage:**
- Patient search by ID
- Patient dropdown population
- Quick Add Patient functionality

---

### 2. ❌ `facilities` (MISSING - Getting 400 error)
**Purpose:** Stores facility/location information for appointment locations

**Required Columns:**
```sql
- id (uuid, primary key)
- name (text/varchar) - Facility name
- status (text/varchar) - 'active' or 'inactive'
- address (text/varchar, nullable)
- city (text/varchar, nullable)
- state (text/varchar, nullable)
- zip (text/varchar, nullable)
```

**SQL to Create:**
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active facilities
CREATE INDEX idx_facilities_status ON facilities(status);

-- Insert sample data
INSERT INTO facilities (name, status) VALUES
  ('Main Clinic', 'active'),
  ('Downtown Office', 'active'),
  ('Westside Branch', 'active');
```

**Usage:**
- Appointment Location dropdown
- Currently using mock data as fallback

---

### 3. ⚠️ `providers` (May exist, verify structure)
**Purpose:** Stores provider and NPP (Non-Physician Practitioner) information

**Required Columns:**
```sql
- id (uuid, primary key)
- npi (text/varchar) - National Provider Identifier
- first_name (text/varchar)
- last_name (text/varchar)
- title (text/varchar, nullable) - e.g., 'MD', 'PA-C', 'NP'
- is_active (boolean, default true)
- specialty (text/varchar, nullable)
```

**SQL to Create (if doesn't exist):**
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npi VARCHAR(10) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(50), -- MD, DO, PA-C, NP, etc.
  is_active BOOLEAN DEFAULT true,
  specialty VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active providers
CREATE INDEX idx_providers_active ON providers(is_active);

-- Sample data for providers
INSERT INTO providers (npi, first_name, last_name, title, is_active) VALUES
  ('1234567890', 'John', 'Smith', 'MD', true),
  ('9876543210', 'Sarah', 'Johnson', 'PA-C', true),
  ('8765432109', 'Michael', 'Brown', 'NP', true);
```

**Usage:**
- Provider dropdown
- NPP dropdown
- Rendering NPI selection for CPT codes

---

## Current Status

| Table | Status | Notes |
|-------|--------|-------|
| `collections_accounts` | ✅ Working | Patient data exists |
| `facilities` | ❌ Missing | 400 error, using mock data fallback |
| `providers` | ⚠️ Unknown | May exist but needs verification |

---

## Quick Fix Options

### Option 1: Create Missing Tables (Recommended)
Run the SQL scripts above in your Supabase SQL Editor to create the missing tables.

### Option 2: Use Mock Data (Current Behavior)
The code already has fallback mock data, so the app will work, but:
- Facilities dropdown will show mock locations
- If providers table is missing, it will use mock providers
- Patient search/add will still work with `collections_accounts`

### Option 3: Update Code to Use Different Table Names
If you have different table names in Supabase, we can update the code to match your schema.

---

## Next Steps

1. **Check if `facilities` table exists:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'facilities';
   ```

2. **Check if `providers` table exists:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'providers';
   ```

3. **Create missing tables** using the SQL scripts above

4. **Verify RLS (Row Level Security) policies** - Make sure your tables have appropriate access policies if you're using RLS

---

## Note on Database Connection
The connection is working (✅ Database connection successful), so the issue is specifically missing tables or table structure mismatches, not connection problems.

