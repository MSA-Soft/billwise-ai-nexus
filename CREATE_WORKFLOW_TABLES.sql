-- Workflow Automation Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- WORKFLOW RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger Configuration
    trigger JSONB NOT NULL, -- { type: 'event'|'schedule'|'manual', event: '...', schedule: '...' }
    
    -- Conditions (array of conditions)
    conditions JSONB NOT NULL, -- Array of { field, operator, value, logicalOperator }
    
    -- Actions (array of actions to execute)
    actions JSONB NOT NULL, -- Array of { type, target, parameters, delay }
    
    -- Rule Configuration
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority executes first
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES workflow_rules(id) ON DELETE SET NULL,
    rule_name VARCHAR(255),
    
    -- Execution Details
    trigger_data JSONB, -- Data that triggered the workflow
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    
    -- Results
    executed_actions INTEGER DEFAULT 0,
    failed_actions INTEGER DEFAULT 0,
    error TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_rules_active ON workflow_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_priority ON workflow_rules(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_rule_id ON workflow_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Policies for workflow_rules
CREATE POLICY "Users can view workflow rules"
    ON workflow_rules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create workflow rules"
    ON workflow_rules FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update workflow rules"
    ON workflow_rules FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Users can delete workflow rules"
    ON workflow_rules FOR DELETE
    TO authenticated
    USING (true);

-- Policies for workflow_executions
CREATE POLICY "Users can view workflow executions"
    ON workflow_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create workflow executions"
    ON workflow_executions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_rules_updated_at
    BEFORE UPDATE ON workflow_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_rules_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Workflow automation tables created successfully!' AS status;

