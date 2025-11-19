-- ============================================================================
-- CHARGE PANELS TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the charge_panels and charge_panel_details tables
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Charge Panels Table (Main table)
CREATE TABLE IF NOT EXISTS charge_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) DEFAULT 'Professional', -- 'Professional', 'Technical', 'Facility'
    description TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on code
    UNIQUE(code)
);

-- Charge Panel Details Table (Code details for each panel)
CREATE TABLE IF NOT EXISTS charge_panel_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_panel_id UUID NOT NULL REFERENCES charge_panels(id) ON DELETE CASCADE,
    
    -- Code Information
    code VARCHAR(50),
    pos VARCHAR(10), -- Place of Service
    tos VARCHAR(10), -- Type of Service
    
    -- Modifiers
    modifier_options VARCHAR(50) DEFAULT 'Code Defaults', -- 'Code Defaults', 'Custom'
    modifier1 VARCHAR(10),
    modifier2 VARCHAR(10),
    modifier3 VARCHAR(10),
    modifier4 VARCHAR(10),
    
    -- Pricing
    price VARCHAR(50) DEFAULT 'Code Default', -- 'Code Default', 'Custom', or numeric value
    units NUMERIC(10, 2) DEFAULT 0.00,
    total VARCHAR(50), -- Can be calculated or custom
    
    -- Other
    other VARCHAR(255),
    
    -- Order/Sequence
    sequence_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if tables already exist (for backward compatibility)
DO $$ 
BEGIN
    -- Charge Panels table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'title') THEN
        ALTER TABLE charge_panels ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Untitled Panel';
        ALTER TABLE charge_panels ALTER COLUMN title DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'code') THEN
        ALTER TABLE charge_panels ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'CP001';
        ALTER TABLE charge_panels ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'type') THEN
        ALTER TABLE charge_panels ADD COLUMN type VARCHAR(50) DEFAULT 'Professional';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'description') THEN
        ALTER TABLE charge_panels ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'status') THEN
        ALTER TABLE charge_panels ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'is_active') THEN
        ALTER TABLE charge_panels ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Indexes for charge_panels
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panels_code ON charge_panels(code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panels_type ON charge_panels(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panels_status ON charge_panels(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panels_active ON charge_panels(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panels' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panels_created_at ON charge_panels(created_at);
    END IF;
END $$;

-- Indexes for charge_panel_details
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panel_details' AND column_name = 'charge_panel_id') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panel_details_panel_id ON charge_panel_details(charge_panel_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panel_details' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panel_details_code ON charge_panel_details(code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charge_panel_details' AND column_name = 'sequence_order') THEN
        CREATE INDEX IF NOT EXISTS idx_charge_panel_details_sequence ON charge_panel_details(charge_panel_id, sequence_order);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE charge_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_panel_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon_select_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "authenticated_select_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "anon_insert_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "authenticated_insert_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "anon_update_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "authenticated_update_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "anon_delete_charge_panels" ON charge_panels;
DROP POLICY IF EXISTS "authenticated_delete_charge_panels" ON charge_panels;

DROP POLICY IF EXISTS "anon_select_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "authenticated_select_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "anon_insert_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "authenticated_insert_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "anon_update_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "authenticated_update_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "anon_delete_charge_panel_details" ON charge_panel_details;
DROP POLICY IF EXISTS "authenticated_delete_charge_panel_details" ON charge_panel_details;

-- RLS Policies for charge_panels
CREATE POLICY "anon_select_charge_panels"
    ON charge_panels FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "authenticated_select_charge_panels"
    ON charge_panels FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "anon_insert_charge_panels"
    ON charge_panels FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "authenticated_insert_charge_panels"
    ON charge_panels FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "anon_update_charge_panels"
    ON charge_panels FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_update_charge_panels"
    ON charge_panels FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "anon_delete_charge_panels"
    ON charge_panels FOR DELETE
    TO anon
    USING (true);

CREATE POLICY "authenticated_delete_charge_panels"
    ON charge_panels FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for charge_panel_details
CREATE POLICY "anon_select_charge_panel_details"
    ON charge_panel_details FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "authenticated_select_charge_panel_details"
    ON charge_panel_details FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "anon_insert_charge_panel_details"
    ON charge_panel_details FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "authenticated_insert_charge_panel_details"
    ON charge_panel_details FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "anon_update_charge_panel_details"
    ON charge_panel_details FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_update_charge_panel_details"
    ON charge_panel_details FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "anon_delete_charge_panel_details"
    ON charge_panel_details FOR DELETE
    TO anon
    USING (true);

CREATE POLICY "authenticated_delete_charge_panel_details"
    ON charge_panel_details FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.charge_panels TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.charge_panel_details TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_charge_panels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_charge_panels_updated_at ON charge_panels;
CREATE TRIGGER update_charge_panels_updated_at
    BEFORE UPDATE ON charge_panels
    FOR EACH ROW
    EXECUTE FUNCTION update_charge_panels_updated_at();

CREATE OR REPLACE FUNCTION update_charge_panel_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_charge_panel_details_updated_at ON charge_panel_details;
CREATE TRIGGER update_charge_panel_details_updated_at
    BEFORE UPDATE ON charge_panel_details
    FOR EACH ROW
    EXECUTE FUNCTION update_charge_panel_details_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_charge_panels_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS NOT NULL THEN
        IF NEW.status = 'active' THEN
            NEW.is_active = true;
        ELSIF NEW.status = 'inactive' THEN
            NEW.is_active = false;
        END IF;
    ELSIF NEW.is_active IS NOT NULL THEN
        IF NEW.is_active THEN
            NEW.status = 'active';
        ELSE
            NEW.status = 'inactive';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_charge_panels_status ON charge_panels;
CREATE TRIGGER sync_charge_panels_status
    BEFORE INSERT OR UPDATE ON charge_panels
    FOR EACH ROW
    EXECUTE FUNCTION sync_charge_panels_status();

-- Verify tables were created
SELECT '✅ Charge panels tables created successfully!' AS status;

-- Show table structures
SELECT 
    'charge_panels' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'charge_panels'
ORDER BY ordinal_position;

SELECT 
    'charge_panel_details' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'charge_panel_details'
ORDER BY ordinal_position;

