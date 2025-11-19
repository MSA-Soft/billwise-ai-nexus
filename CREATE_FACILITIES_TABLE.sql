-- ============================================================================
-- CREATE FACILITIES TABLE - Copy and paste this entire script
-- ============================================================================
-- Instructions:
-- 1. Go to Supabase Dashboard → Your Project → SQL Editor
-- 2. Click "New Query"
-- 3. Copy ALL the code below (from CREATE TABLE to the end)
-- 4. Paste into SQL Editor
-- 5. Click "Run" button (or press Ctrl+Enter)
-- ============================================================================

-- Create the facilities table
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);

-- Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read facilities
DROP POLICY IF EXISTS "Allow authenticated users to read facilities" ON facilities;
CREATE POLICY "Allow authenticated users to read facilities"
    ON facilities
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert facilities
DROP POLICY IF EXISTS "Allow authenticated users to insert facilities" ON facilities;
CREATE POLICY "Allow authenticated users to insert facilities"
    ON facilities
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update facilities
DROP POLICY IF EXISTS "Allow authenticated users to update facilities" ON facilities;
CREATE POLICY "Allow authenticated users to update facilities"
    ON facilities
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow all authenticated users to delete facilities
DROP POLICY IF EXISTS "Allow authenticated users to delete facilities" ON facilities;
CREATE POLICY "Allow authenticated users to delete facilities"
    ON facilities
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample facilities (only if table is empty)
INSERT INTO facilities (name, status, address, city, state, zip)
SELECT * FROM (VALUES
    ('Main Office', 'active', '123 Main Street', 'New York', 'NY', '10001'),
    ('Downtown Clinic', 'active', '456 Downtown Ave', 'New York', 'NY', '10002'),
    ('North Branch', 'active', '789 North Blvd', 'New York', 'NY', '10003'),
    ('South Medical Center', 'active', '321 South St', 'New York', 'NY', '10004')
) AS v(name, status, address, city, state, zip)
WHERE NOT EXISTS (SELECT 1 FROM facilities);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_facilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on update
DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_facilities_updated_at();

-- Verify the table was created (this will show a success message)
SELECT '✅ Facilities table created successfully! Check Table Editor to see it.' AS result;

