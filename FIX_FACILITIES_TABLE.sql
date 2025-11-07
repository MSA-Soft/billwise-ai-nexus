-- ============================================================================
-- FIX: Create Facilities Table
-- ============================================================================
-- This script creates the facilities table that's missing from your database.
-- Run this in your Supabase SQL Editor.
-- ============================================================================

-- Create facilities table
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

-- Create index for active facilities (for faster queries)
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);

-- Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read facilities
CREATE POLICY "Allow authenticated users to read facilities"
    ON facilities
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert facilities
CREATE POLICY "Allow authenticated users to insert facilities"
    ON facilities
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update facilities
CREATE POLICY "Allow authenticated users to update facilities"
    ON facilities
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to delete facilities
CREATE POLICY "Allow authenticated users to delete facilities"
    ON facilities
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample facilities data
INSERT INTO facilities (name, status, address, city, state, zip) VALUES
    ('Main Office', 'active', '123 Main Street', 'New York', 'NY', '10001'),
    ('Downtown Clinic', 'active', '456 Downtown Ave', 'New York', 'NY', '10002'),
    ('North Branch', 'active', '789 North Blvd', 'New York', 'NY', '10003'),
    ('South Medical Center', 'active', '321 South St', 'New York', 'NY', '10004')
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_facilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_facilities_updated_at();

-- Verify the table was created
SELECT 'Facilities table created successfully!' AS status;

