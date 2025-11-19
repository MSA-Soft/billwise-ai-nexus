-- ============================================================================
-- FEE SCHEDULES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the fee_schedules and fee_schedule_procedures tables
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Fee Schedules Table (Main table)
CREATE TABLE IF NOT EXISTS fee_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_number VARCHAR(50) NOT NULL,
    
    -- Effective Dates
    effective_from DATE,
    effective_to DATE,
    
    -- Price Creation Method
    price_creation_method VARCHAR(50) NOT NULL, -- 'empty', 'another-fee-schedule', 'medicare', 'contract', 'charges', 'import'
    
    -- Settings based on creation method (stored as JSONB for flexibility)
    creation_settings JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on sequence_number
    UNIQUE(sequence_number)
);

-- Fee Schedule Procedures Table (Procedure details for each fee schedule)
CREATE TABLE IF NOT EXISTS fee_schedule_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_schedule_id UUID NOT NULL REFERENCES fee_schedules(id) ON DELETE CASCADE,
    
    -- Procedure Information
    code VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    type VARCHAR(50) DEFAULT 'Procedure', -- 'Procedure', 'Diagnosis', etc.
    
    -- Order/Sequence
    sequence_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fee_schedules_sequence ON fee_schedules(sequence_number);
CREATE INDEX IF NOT EXISTS idx_fee_schedules_status ON fee_schedules(status);
CREATE INDEX IF NOT EXISTS idx_fee_schedules_method ON fee_schedules(price_creation_method);
CREATE INDEX IF NOT EXISTS idx_fee_schedule_procedures_schedule ON fee_schedule_procedures(fee_schedule_id);
CREATE INDEX IF NOT EXISTS idx_fee_schedule_procedures_code ON fee_schedule_procedures(code);

-- Add missing columns if tables already exist (for backward compatibility)
DO $$ 
BEGIN
    -- Fee schedules table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_schedules' AND column_name = 'creation_settings') THEN
        ALTER TABLE fee_schedules ADD COLUMN creation_settings JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_schedules' AND column_name = 'price_creation_method') THEN
        ALTER TABLE fee_schedules ADD COLUMN price_creation_method VARCHAR(50) DEFAULT 'empty';
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE fee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_schedule_procedures ENABLE ROW LEVEL SECURITY;

-- Create policies for fee_schedules
CREATE POLICY "Users can view all fee schedules"
    ON fee_schedules FOR SELECT
    USING (true);

CREATE POLICY "Users can insert fee schedules"
    ON fee_schedules FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update fee schedules"
    ON fee_schedules FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete fee schedules"
    ON fee_schedules FOR DELETE
    USING (true);

-- Create policies for fee_schedule_procedures
CREATE POLICY "Users can view all fee schedule procedures"
    ON fee_schedule_procedures FOR SELECT
    USING (true);

CREATE POLICY "Users can insert fee schedule procedures"
    ON fee_schedule_procedures FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update fee schedule procedures"
    ON fee_schedule_procedures FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete fee schedule procedures"
    ON fee_schedule_procedures FOR DELETE
    USING (true);

