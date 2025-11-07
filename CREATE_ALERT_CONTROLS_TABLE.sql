-- ============================================================================
-- ALERT CONTROLS TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the alert_controls table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Alert Controls Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS alert_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    alert_type VARCHAR(100),
    patient VARCHAR(255),
    message TEXT,
    create_user VARCHAR(100),
    
    -- Display Settings
    is_global BOOLEAN DEFAULT false,
    patient_section BOOLEAN DEFAULT false,
    claim_section BOOLEAN DEFAULT false,
    payment_section BOOLEAN DEFAULT false,
    appointment_section BOOLEAN DEFAULT false,
    
    -- Date Ranges
    create_date_range VARCHAR(50) DEFAULT 'All',
    create_date_start DATE,
    create_date_end DATE,
    effective_start_date_range VARCHAR(50) DEFAULT 'All',
    effective_start_date_start DATE,
    effective_start_date_end DATE,
    effective_end_date_range VARCHAR(50) DEFAULT 'All',
    effective_end_date_start DATE,
    effective_end_date_end DATE,
    
    -- Additional Settings
    include_deleted BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists (for backward compatibility)
DO $$ 
BEGIN
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'alert_type') THEN
        ALTER TABLE alert_controls ADD COLUMN alert_type VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'patient') THEN
        ALTER TABLE alert_controls ADD COLUMN patient VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'message') THEN
        ALTER TABLE alert_controls ADD COLUMN message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'create_user') THEN
        ALTER TABLE alert_controls ADD COLUMN create_user VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'is_global') THEN
        ALTER TABLE alert_controls ADD COLUMN is_global BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'patient_section') THEN
        ALTER TABLE alert_controls ADD COLUMN patient_section BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'claim_section') THEN
        ALTER TABLE alert_controls ADD COLUMN claim_section BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'payment_section') THEN
        ALTER TABLE alert_controls ADD COLUMN payment_section BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'appointment_section') THEN
        ALTER TABLE alert_controls ADD COLUMN appointment_section BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'create_date_range') THEN
        ALTER TABLE alert_controls ADD COLUMN create_date_range VARCHAR(50) DEFAULT 'All';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'create_date_start') THEN
        ALTER TABLE alert_controls ADD COLUMN create_date_start DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'create_date_end') THEN
        ALTER TABLE alert_controls ADD COLUMN create_date_end DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'effective_start_date_range') THEN
        ALTER TABLE alert_controls ADD COLUMN effective_start_date_range VARCHAR(50) DEFAULT 'All';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'effective_start_date_start') THEN
        ALTER TABLE alert_controls ADD COLUMN effective_start_date_start DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'effective_start_date_end') THEN
        ALTER TABLE alert_controls ADD COLUMN effective_start_date_end DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'effective_end_date_range') THEN
        ALTER TABLE alert_controls ADD COLUMN effective_end_date_range VARCHAR(50) DEFAULT 'All';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'effective_end_date_start') THEN
        ALTER TABLE alert_controls ADD COLUMN effective_end_date_start DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'effective_end_date_end') THEN
        ALTER TABLE alert_controls ADD COLUMN effective_end_date_end DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'include_deleted') THEN
        ALTER TABLE alert_controls ADD COLUMN include_deleted BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'status') THEN
        ALTER TABLE alert_controls ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE alert_controls SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'is_active') THEN
        ALTER TABLE alert_controls ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE alert_controls SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on alert_type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'alert_type') THEN
        CREATE INDEX IF NOT EXISTS idx_alert_controls_type ON alert_controls(alert_type);
    END IF;
    
    -- Create index on patient if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'patient') THEN
        CREATE INDEX IF NOT EXISTS idx_alert_controls_patient ON alert_controls(patient);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_alert_controls_status ON alert_controls(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_alert_controls_active ON alert_controls(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alert_controls' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_alert_controls_created_at ON alert_controls(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE alert_controls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view alert controls" ON alert_controls;
DROP POLICY IF EXISTS "Users can create alert controls" ON alert_controls;
DROP POLICY IF EXISTS "Users can update alert controls" ON alert_controls;
DROP POLICY IF EXISTS "Users can delete alert controls" ON alert_controls;

-- RLS Policies
CREATE POLICY "Users can view alert controls"
    ON alert_controls FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create alert controls"
    ON alert_controls FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update alert controls"
    ON alert_controls FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete alert controls"
    ON alert_controls FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_controls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_alert_controls_updated_at ON alert_controls;
CREATE TRIGGER update_alert_controls_updated_at
    BEFORE UPDATE ON alert_controls
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_controls_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_alert_controls_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Keep is_active in sync with status
    IF NEW.status IS NOT NULL THEN
        IF NEW.status = 'active' THEN
            NEW.is_active = true;
        ELSIF NEW.status = 'inactive' THEN
            NEW.is_active = false;
        END IF;
    ELSIF NEW.is_active IS NOT NULL THEN
        -- If status is not set but is_active is, sync status from is_active
        IF NEW.is_active THEN
            NEW.status = 'active';
        ELSE
            NEW.status = 'inactive';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_alert_controls_status ON alert_controls;
CREATE TRIGGER sync_alert_controls_status
    BEFORE INSERT OR UPDATE ON alert_controls
    FOR EACH ROW
    EXECUTE FUNCTION sync_alert_controls_status();

-- Verify table was created
SELECT '✅ Alert controls table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'alert_controls'
ORDER BY ordinal_position;

