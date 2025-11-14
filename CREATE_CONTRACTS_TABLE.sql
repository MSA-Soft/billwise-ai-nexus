-- ============================================================================
-- CONTRACTS TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the contracts and contract_procedures tables
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Contracts Table (Main table)
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'FFS', -- 'FFS', 'HMO', 'PPO'
    sequence_number VARCHAR(50) NOT NULL,
    
    -- Settings
    allow_users_to_update_prices BOOLEAN DEFAULT true,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on sequence_number
    UNIQUE(sequence_number)
);

-- Contract Procedures Table (Procedure details for each contract)
CREATE TABLE IF NOT EXISTS contract_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    
    -- Procedure Information
    code VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    type VARCHAR(50) DEFAULT 'Procedure', -- 'Procedure', 'Diagnosis', etc.
    
    -- Exclusion
    exclude BOOLEAN DEFAULT false,
    
    -- Order/Sequence
    sequence_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if tables already exist (for backward compatibility)
DO $$ 
BEGIN
    -- Contracts table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'name') THEN
        ALTER TABLE contracts ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Untitled Contract';
        ALTER TABLE contracts ALTER COLUMN name DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'type') THEN
        ALTER TABLE contracts ADD COLUMN type VARCHAR(50) DEFAULT 'FFS';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'sequence_number') THEN
        ALTER TABLE contracts ADD COLUMN sequence_number VARCHAR(50) NOT NULL DEFAULT 'NEW';
        ALTER TABLE contracts ALTER COLUMN sequence_number DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'allow_users_to_update_prices') THEN
        ALTER TABLE contracts ADD COLUMN allow_users_to_update_prices BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'status') THEN
        ALTER TABLE contracts ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'is_active') THEN
        ALTER TABLE contracts ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Indexes for contracts
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'sequence_number') THEN
        CREATE INDEX IF NOT EXISTS idx_contracts_sequence_number ON contracts(sequence_number);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_contracts_name ON contracts(name);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_contracts_is_active ON contracts(is_active);
    END IF;
END $$;

-- Indexes for contract_procedures
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_procedures' AND column_name = 'contract_id') THEN
        CREATE INDEX IF NOT EXISTS idx_contract_procedures_contract_id ON contract_procedures(contract_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_procedures' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_contract_procedures_code ON contract_procedures(code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_procedures' AND column_name = 'sequence_order') THEN
        CREATE INDEX IF NOT EXISTS idx_contract_procedures_sequence_order ON contract_procedures(contract_id, sequence_order);
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_procedures ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all operations for authenticated users on contracts" ON contracts;
    DROP POLICY IF EXISTS "Allow all operations for anon users on contracts" ON contracts;
    DROP POLICY IF EXISTS "Allow all operations for authenticated users on contract_procedures" ON contract_procedures;
    DROP POLICY IF EXISTS "Allow all operations for anon users on contract_procedures" ON contract_procedures;
END $$;

-- RLS Policies for contracts
CREATE POLICY "Allow all operations for authenticated users on contracts"
    ON contracts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users on contracts"
    ON contracts
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- RLS Policies for contract_procedures
CREATE POLICY "Allow all operations for authenticated users on contract_procedures"
    ON contract_procedures
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users on contract_procedures"
    ON contract_procedures
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON contracts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contract_procedures TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON contract_procedures TO authenticated;

-- Grant usage on sequences (if any)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_contract_procedures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_contracts_updated_at_trigger ON contracts;
CREATE TRIGGER update_contracts_updated_at_trigger
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_contracts_updated_at();

DROP TRIGGER IF EXISTS update_contract_procedures_updated_at_trigger ON contract_procedures;
CREATE TRIGGER update_contract_procedures_updated_at_trigger
    BEFORE UPDATE ON contract_procedures
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_procedures_updated_at();

-- Force PostgREST schema reload
DO $$ 
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Notify for schema reload
NOTIFY pgrst, 'reload schema';

-- Verification queries (commented out - uncomment to verify)
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('contracts', 'contract_procedures')
-- ORDER BY table_name, ordinal_position;

-- SELECT COUNT(*) as contracts_count FROM contracts;
-- SELECT COUNT(*) as contract_procedures_count FROM contract_procedures;

