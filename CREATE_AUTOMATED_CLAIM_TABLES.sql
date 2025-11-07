-- Automated Claim Submission Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- CLAIM BATCH SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_batch_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    claim_ids UUID[] NOT NULL,
    submission_method VARCHAR(50) NOT NULL, -- 'EDI', 'Paper'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'partial'
    results JSONB, -- { total, successful, failed, errors }
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RESUBMISSION RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_resubmission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL, -- { status, denial_codes, days_since_submission, max_attempts }
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CLAIM RESUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_resubmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES claim_resubmission_rules(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- 'auto', 'manual'
    resubmitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- ============================================================================
-- CLAIM STATUS CHECKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_status_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    interval_days INTEGER DEFAULT 7,
    next_check_date TIMESTAMP WITH TIME ZONE NOT NULL,
    last_check_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_batch_submissions_status ON claim_batch_submissions(status);
CREATE INDEX IF NOT EXISTS idx_batch_submissions_created_by ON claim_batch_submissions(created_by);
CREATE INDEX IF NOT EXISTS idx_resubmission_rules_active ON claim_resubmission_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_resubmissions_claim_id ON claim_resubmissions(claim_id);
CREATE INDEX IF NOT EXISTS idx_status_checks_claim_id ON claim_status_checks(claim_id);
CREATE INDEX IF NOT EXISTS idx_status_checks_next_date ON claim_status_checks(next_check_date);
CREATE INDEX IF NOT EXISTS idx_status_checks_active ON claim_status_checks(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE claim_batch_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_resubmission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_resubmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_status_checks ENABLE ROW LEVEL SECURITY;

-- Policies for claim_batch_submissions
CREATE POLICY "Users can view batch submissions"
    ON claim_batch_submissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create batch submissions"
    ON claim_batch_submissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policies for claim_resubmission_rules
CREATE POLICY "Users can view resubmission rules"
    ON claim_resubmission_rules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage resubmission rules"
    ON claim_resubmission_rules FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policies for claim_resubmissions
CREATE POLICY "Users can view resubmissions"
    ON claim_resubmissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create resubmissions"
    ON claim_resubmissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policies for claim_status_checks
CREATE POLICY "Users can view status checks"
    ON claim_status_checks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage status checks"
    ON claim_status_checks FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resubmission_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resubmission_rules_updated_at
    BEFORE UPDATE ON claim_resubmission_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_resubmission_rules_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Automated claim submission tables created successfully!' AS status;

