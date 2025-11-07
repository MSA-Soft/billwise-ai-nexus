-- Denial Management Automation Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- CLAIM DENIALS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_denials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Denial Information
    denial_code VARCHAR(50) NOT NULL,
    denial_reason TEXT,
    denied_amount DECIMAL(10, 2),
    denial_date DATE NOT NULL,
    
    -- Appeal Information
    appeal_status VARCHAR(50), -- 'not_appealed', 'draft', 'submitted', 'under_review', 'approved', 'denied', 'withdrawn'
    appeal_submitted_at TIMESTAMP WITH TIME ZONE,
    appeal_outcome VARCHAR(50), -- 'approved', 'denied', 'partial'
    appeal_outcome_amount DECIMAL(10, 2),
    appeal_notes TEXT,
    
    -- Analysis
    root_cause JSONB,
    category VARCHAR(50),
    appealability_score INTEGER, -- 0-100
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- APPEAL WORKFLOWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS appeal_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    denial_id UUID NOT NULL REFERENCES claim_denials(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Appeal Details
    appeal_type VARCHAR(50) NOT NULL, -- 'standard', 'expedited', 'external'
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'under_review', 'approved', 'denied', 'withdrawn'
    appeal_letter TEXT,
    supporting_documents TEXT[],
    
    -- Submission
    submitted_at TIMESTAMP WITH TIME ZONE,
    response_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Outcome
    outcome VARCHAR(50), -- 'approved', 'denied', 'partial'
    outcome_amount DECIMAL(10, 2),
    outcome_notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DENIAL ANALYSIS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS denial_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    denial_id UUID NOT NULL REFERENCES claim_denials(id) ON DELETE CASCADE,
    
    -- Analysis Results
    root_cause JSONB NOT NULL,
    category JSONB NOT NULL,
    appealability JSONB NOT NULL,
    recommended_actions JSONB,
    prevention_strategies TEXT[],
    
    -- Recovery Estimates
    estimated_recovery_amount DECIMAL(10, 2),
    estimated_recovery_probability INTEGER, -- 0-100
    
    -- Metadata
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_denials_claim_id ON claim_denials(claim_id);
CREATE INDEX IF NOT EXISTS idx_denials_denial_code ON claim_denials(denial_code);
CREATE INDEX IF NOT EXISTS idx_denials_appeal_status ON claim_denials(appeal_status);
CREATE INDEX IF NOT EXISTS idx_denials_denial_date ON claim_denials(denial_date);
CREATE INDEX IF NOT EXISTS idx_appeals_denial_id ON appeal_workflows(denial_id);
CREATE INDEX IF NOT EXISTS idx_appeals_claim_id ON appeal_workflows(claim_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeal_workflows(status);
CREATE INDEX IF NOT EXISTS idx_denial_analyses_denial_id ON denial_analyses(denial_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE claim_denials ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeal_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE denial_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for claim_denials
CREATE POLICY "Users can view claim denials"
    ON claim_denials FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create claim denials"
    ON claim_denials FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update claim denials"
    ON claim_denials FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for appeal_workflows
CREATE POLICY "Users can view appeal workflows"
    ON appeal_workflows FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create appeal workflows"
    ON appeal_workflows FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update appeal workflows"
    ON appeal_workflows FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for denial_analyses
CREATE POLICY "Users can view denial analyses"
    ON denial_analyses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create denial analyses"
    ON denial_analyses FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_denials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_denials_updated_at
    BEFORE UPDATE ON claim_denials
    FOR EACH ROW
    EXECUTE FUNCTION update_denials_updated_at();

CREATE TRIGGER update_appeals_updated_at
    BEFORE UPDATE ON appeal_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_denials_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Denial management automation tables created successfully!' AS status;

