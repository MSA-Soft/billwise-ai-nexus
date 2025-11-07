-- Enhanced Security Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- USER MFA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_mfa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- MFA Configuration
    secret TEXT NOT NULL, -- TOTP secret (should be encrypted in production)
    backup_codes TEXT[], -- Array of backup codes
    is_enabled BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] NOT NULL, -- Array of permission strings
    is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, role_id)
);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- e.g., 'login', 'create_claim', 'delete_patient'
    resource VARCHAR(100) NOT NULL, -- e.g., 'user', 'claim', 'patient'
    resource_id UUID, -- ID of the affected resource
    details JSONB, -- Additional details about the action
    
    -- Security Context
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON user_mfa(is_enabled);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for user_mfa
CREATE POLICY "Users can view their own MFA settings"
    ON user_mfa FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own MFA settings"
    ON user_mfa FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own MFA settings"
    ON user_mfa FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policies for roles
CREATE POLICY "Authenticated users can view roles"
    ON roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage roles"
    ON roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    ));

CREATE POLICY "Only admins can assign roles"
    ON user_roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Policies for audit_logs
CREATE POLICY "Users can view their own audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND (r.name = 'admin' OR r.permissions && ARRAY['view_audit_logs'])
    ));

CREATE POLICY "System can create audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_security_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mfa_updated_at
    BEFORE UPDATE ON user_mfa
    FOR EACH ROW
    EXECUTE FUNCTION update_security_tables_updated_at();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_security_tables_updated_at();

-- ============================================================================
-- DEFAULT ROLES
-- ============================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
    ('admin', 'System Administrator', ARRAY['*'], true),
    ('billing_manager', 'Billing Manager', ARRAY[
        'view_patients', 'create_patients', 'update_patients',
        'view_billing', 'create_billing', 'update_billing', 'delete_billing',
        'view_collections', 'create_collections', 'update_collections',
        'view_authorizations', 'create_authorizations', 'update_authorizations',
        'view_analytics', 'export_data'
    ], true),
    ('billing_staff', 'Billing Staff', ARRAY[
        'view_patients', 'create_patients', 'update_patients',
        'view_billing', 'create_billing', 'update_billing',
        'view_collections', 'create_collections', 'update_collections',
        'view_authorizations', 'create_authorizations', 'update_authorizations'
    ], true),
    ('patient', 'Patient', ARRAY[
        'view_patients', 'update_patients'
    ], true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Enhanced security tables created successfully!' AS status;

