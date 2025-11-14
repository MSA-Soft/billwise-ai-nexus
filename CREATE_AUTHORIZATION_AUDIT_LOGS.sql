-- ============================================================================
-- AUTHORIZATION AUDIT LOGS TABLE
-- ============================================================================
-- Complete audit trail for all authorization actions
-- Tracks who did what, when, and why (HIPAA compliant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Denormalized for quick access
    user_name VARCHAR(255), -- Denormalized for quick access
    
    -- Authorization Reference
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'submit', 'approve', 'deny', 'use_visit', 'renew', 'appeal', 'cancel', 'delete'
    action_category VARCHAR(50) NOT NULL, -- 'creation', 'status_change', 'visit_usage', 'renewal', 'appeal', 'modification'
    
    -- Change Tracking
    old_status VARCHAR(50), -- Previous status
    new_status VARCHAR(50), -- New status
    old_values JSONB, -- Previous field values (for updates)
    new_values JSONB, -- New field values (for updates)
    
    -- Context Information
    notes TEXT, -- User-provided notes/reason
    reason TEXT, -- System or user-provided reason for action
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT, -- Browser/client information
    
    -- Additional Details
    details JSONB, -- Additional context (payer, patient, service type, etc.)
    
    -- Severity & Priority
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON authorization_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_auth_id ON authorization_audit_logs(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_action ON authorization_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_category ON authorization_audit_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON authorization_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_severity ON authorization_audit_logs(severity);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_auth_audit_auth_action ON authorization_audit_logs(authorization_request_id, action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_action ON authorization_audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_auth_created ON authorization_audit_logs(authorization_request_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE authorization_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for authorizations they have access to
CREATE POLICY "Users can view authorization audit logs"
    ON authorization_audit_logs FOR SELECT
    TO authenticated
    USING (
        -- User can see their own actions
        user_id = auth.uid()
        OR
        -- User can see logs for authorizations they created
        authorization_request_id IN (
            SELECT id FROM authorization_requests WHERE user_id = auth.uid()
        )
        OR
        -- User can see logs for authorizations assigned to them (if assignment exists)
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_audit_logs.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

-- Policy: System can insert audit logs (authenticated users)
CREATE POLICY "Authenticated users can create audit logs"
    ON authorization_audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: Only system/admins can update audit logs (read-only for most users)
CREATE POLICY "Only system can update audit logs"
    ON authorization_audit_logs FOR UPDATE
    TO authenticated
    USING (false) -- Prevent updates (audit logs should be immutable)
    WITH CHECK (false);

-- Policy: Only system/admins can delete audit logs
CREATE POLICY "Only system can delete audit logs"
    ON authorization_audit_logs FOR DELETE
    TO authenticated
    USING (false); -- Prevent deletes (audit logs should be immutable)

-- ============================================================================
-- VIEW FOR EASY QUERYING
-- ============================================================================

CREATE OR REPLACE VIEW authorization_audit_summary AS
SELECT 
    aal.id,
    aal.created_at,
    aal.user_id,
    aal.user_email,
    aal.user_name,
    aal.authorization_request_id,
    ar.patient_name,
    ar.payer_name_custom as payer_name,
    aal.action,
    aal.action_category,
    aal.old_status,
    aal.new_status,
    aal.notes,
    aal.reason,
    aal.severity,
    aal.details
FROM authorization_audit_logs aal
LEFT JOIN authorization_requests ar ON ar.id = aal.authorization_request_id
ORDER BY aal.created_at DESC;

-- ============================================================================
-- FUNCTION TO GET AUDIT HISTORY FOR AN AUTHORIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_authorization_audit_history(auth_id UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    user_email VARCHAR,
    user_name VARCHAR,
    action VARCHAR,
    action_category VARCHAR,
    old_status VARCHAR,
    new_status VARCHAR,
    notes TEXT,
    reason TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aal.id,
        aal.created_at,
        aal.user_email,
        aal.user_name,
        aal.action,
        aal.action_category,
        aal.old_status,
        aal.new_status,
        aal.notes,
        aal.reason,
        aal.details
    FROM authorization_audit_logs aal
    WHERE aal.authorization_request_id = auth_id
    ORDER BY aal.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION TO GET USER ACTIVITY
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_authorization_activity(user_uuid UUID, limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    authorization_request_id UUID,
    patient_name VARCHAR,
    payer_name VARCHAR,
    action VARCHAR,
    action_category VARCHAR,
    old_status VARCHAR,
    new_status VARCHAR,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aal.id,
        aal.created_at,
        aal.authorization_request_id,
        ar.patient_name,
        ar.payer_name_custom,
        aal.action,
        aal.action_category,
        aal.old_status,
        aal.new_status,
        aal.notes
    FROM authorization_audit_logs aal
    LEFT JOIN authorization_requests ar ON ar.id = aal.authorization_request_id
    WHERE aal.user_id = user_uuid
    ORDER BY aal.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE authorization_audit_logs IS 'Complete audit trail for all authorization actions. Tracks who did what, when, and why for HIPAA compliance and accountability.';
COMMENT ON COLUMN authorization_audit_logs.action IS 'Action performed: create, update, submit, approve, deny, use_visit, renew, appeal, cancel, delete';
COMMENT ON COLUMN authorization_audit_logs.action_category IS 'Category of action: creation, status_change, visit_usage, renewal, appeal, modification';
COMMENT ON COLUMN authorization_audit_logs.old_values IS 'Previous field values (JSONB) for tracking what changed';
COMMENT ON COLUMN authorization_audit_logs.new_values IS 'New field values (JSONB) for tracking what changed';
COMMENT ON COLUMN authorization_audit_logs.details IS 'Additional context: payer info, patient info, service type, visit counts, etc.';

