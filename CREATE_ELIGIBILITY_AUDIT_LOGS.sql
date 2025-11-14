-- ============================================================================
-- ELIGIBILITY VERIFICATION AUDIT LOGS TABLE
-- ============================================================================
-- Complete audit trail for all eligibility verification actions
-- Tracks who did what, when, and why (HIPAA compliant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS eligibility_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Denormalized for quick access
    user_name VARCHAR(255), -- Denormalized for quick access
    
    -- Verification Reference
    eligibility_verification_id UUID NOT NULL REFERENCES eligibility_verifications(id) ON DELETE CASCADE,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'verify', 'refresh', 'duplicate', 'export', 'delete', 'view'
    action_category VARCHAR(50) NOT NULL, -- 'creation', 'verification', 'modification', 'access', 'export'
    
    -- Change Tracking
    old_values JSONB, -- Previous field values (for updates)
    new_values JSONB, -- New field values (for updates)
    
    -- Context Information
    notes TEXT, -- User-provided notes/reason
    reason TEXT, -- System or user-provided reason for action
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT, -- Browser/client information
    
    -- Additional Details
    details JSONB, -- Additional context (patient, payer, verification result, etc.)
    
    -- Severity & Priority
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_elig_audit_user_id ON eligibility_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_elig_audit_verification_id ON eligibility_audit_logs(eligibility_verification_id);
CREATE INDEX IF NOT EXISTS idx_elig_audit_action ON eligibility_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_elig_audit_category ON eligibility_audit_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_elig_audit_created_at ON eligibility_audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_elig_audit_verification_action ON eligibility_audit_logs(eligibility_verification_id, action);
CREATE INDEX IF NOT EXISTS idx_elig_audit_user_action ON eligibility_audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_elig_audit_verification_created ON eligibility_audit_logs(eligibility_verification_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE eligibility_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for verifications they have access to
CREATE POLICY "Users can view eligibility audit logs"
    ON eligibility_audit_logs FOR SELECT
    TO authenticated
    USING (
        -- User can see their own actions
        user_id = auth.uid()
        OR
        -- User can see logs for verifications they created
        eligibility_verification_id IN (
            SELECT id FROM eligibility_verifications WHERE user_id = auth.uid()
        )
    );

-- Policy: System can insert audit logs (authenticated users)
CREATE POLICY "Authenticated users can create eligibility audit logs"
    ON eligibility_audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: Only system/admins can update audit logs (read-only for most users)
CREATE POLICY "Only system can update eligibility audit logs"
    ON eligibility_audit_logs FOR UPDATE
    TO authenticated
    USING (false) -- Prevent updates (audit logs should be immutable)
    WITH CHECK (false);

-- Policy: Only system/admins can delete audit logs
CREATE POLICY "Only system can delete eligibility audit logs"
    ON eligibility_audit_logs FOR DELETE
    TO authenticated
    USING (false); -- Prevent deletes (audit logs should be immutable)

-- ============================================================================
-- VIEW FOR EASY QUERYING
-- ============================================================================

CREATE OR REPLACE VIEW eligibility_audit_summary AS
SELECT 
    eal.id,
    eal.created_at,
    eal.user_id,
    eal.user_email,
    eal.user_name,
    eal.eligibility_verification_id,
    ev.patient_name,
    ev.primary_insurance_name as payer_name,
    eal.action,
    eal.action_category,
    eal.notes,
    eal.reason,
    eal.severity,
    eal.details
FROM eligibility_audit_logs eal
LEFT JOIN eligibility_verifications ev ON ev.id = eal.eligibility_verification_id
ORDER BY eal.created_at DESC;

-- ============================================================================
-- FUNCTION TO GET AUDIT HISTORY FOR A VERIFICATION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_eligibility_audit_history(verification_id UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    user_email VARCHAR,
    user_name VARCHAR,
    action VARCHAR,
    action_category VARCHAR,
    notes TEXT,
    reason TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        eal.id,
        eal.created_at,
        eal.user_email,
        eal.user_name,
        eal.action,
        eal.action_category,
        eal.notes,
        eal.reason,
        eal.details
    FROM eligibility_audit_logs eal
    WHERE eal.eligibility_verification_id = verification_id
    ORDER BY eal.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE eligibility_audit_logs IS 'Complete audit trail for all eligibility verification actions. Tracks who did what, when, and why for HIPAA compliance and accountability.';
COMMENT ON COLUMN eligibility_audit_logs.action IS 'Action performed: create, update, verify, refresh, duplicate, export, delete, view';
COMMENT ON COLUMN eligibility_audit_logs.action_category IS 'Category of action: creation, verification, modification, access, export';
COMMENT ON COLUMN eligibility_audit_logs.old_values IS 'Previous field values (JSONB) for tracking what changed';
COMMENT ON COLUMN eligibility_audit_logs.new_values IS 'New field values (JSONB) for tracking what changed';
COMMENT ON COLUMN eligibility_audit_logs.details IS 'Additional context: patient info, payer info, verification result, etc.';

