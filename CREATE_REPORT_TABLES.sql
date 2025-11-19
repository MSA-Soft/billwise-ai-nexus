-- Advanced Reporting Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- REPORT DEFINITIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Report Configuration
    type VARCHAR(50) NOT NULL, -- 'authorization', 'claim', 'revenue', 'task', 'payer', 'custom'
    data_source VARCHAR(100) NOT NULL, -- Table name
    
    -- Report Structure
    fields JSONB NOT NULL, -- Array of { name, label, type, aggregate, format }
    filters JSONB DEFAULT '[]', -- Array of { field, operator, value }
    grouping JSONB DEFAULT '[]', -- Array of { field, order }
    sorting JSONB DEFAULT '[]', -- Array of { field, order }
    
    -- Display Configuration
    format VARCHAR(50) DEFAULT 'table', -- 'table', 'chart', 'summary'
    chart_type VARCHAR(50), -- 'bar', 'line', 'pie', 'area'
    
    -- Scheduling
    schedule JSONB, -- { enabled, frequency, dayOfWeek, dayOfMonth, time, recipients, format }
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REPORT EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID REFERENCES report_definitions(id) ON DELETE SET NULL,
    report_name VARCHAR(255),
    
    -- Execution Details
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    record_count INTEGER DEFAULT 0,
    execution_time INTEGER, -- milliseconds
    
    -- Results
    file_url TEXT, -- URL to generated report file
    file_format VARCHAR(50), -- 'pdf', 'excel', 'csv'
    
    -- Metadata
    executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_report_definitions_type ON report_definitions(type);
CREATE INDEX IF NOT EXISTS idx_report_definitions_created_by ON report_definitions(created_by);
CREATE INDEX IF NOT EXISTS idx_report_executions_report_id ON report_executions(report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_executed_at ON report_executions(executed_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- Policies for report_definitions
CREATE POLICY "Users can view report definitions"
    ON report_definitions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create report definitions"
    ON report_definitions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own report definitions"
    ON report_definitions FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own report definitions"
    ON report_definitions FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- Policies for report_executions
CREATE POLICY "Users can view report executions"
    ON report_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create report executions"
    ON report_executions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_report_definitions_updated_at
    BEFORE UPDATE ON report_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_report_definitions_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Advanced reporting tables created successfully!' AS status;

