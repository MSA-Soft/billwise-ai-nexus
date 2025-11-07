-- EHR Integration Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- EHR CONNECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ehr_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- EHR System Information
    ehr_system VARCHAR(50) NOT NULL, -- 'epic', 'cerner', 'allscripts', 'other'
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    
    -- Authentication
    client_id VARCHAR(255) NOT NULL,
    client_secret TEXT, -- Encrypted in production
    access_token TEXT, -- Encrypted in production
    refresh_token TEXT, -- Encrypted in production
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EHR SYNC LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ehr_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ehr_connection_id UUID REFERENCES ehr_connections(id) ON DELETE CASCADE,
    
    -- Sync Details
    sync_type VARCHAR(50) NOT NULL, -- 'patient', 'encounter', 'observation', 'prior_auth'
    resource_id UUID, -- ID of synced resource
    resource_type VARCHAR(100), -- 'Patient', 'Encounter', etc.
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    error_message TEXT,
    
    -- Metadata
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ehr_connections_system ON ehr_connections(ehr_system);
CREATE INDEX IF NOT EXISTS idx_ehr_connections_active ON ehr_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_ehr_sync_logs_connection ON ehr_sync_logs(ehr_connection_id);
CREATE INDEX IF NOT EXISTS idx_ehr_sync_logs_status ON ehr_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_ehr_sync_logs_synced_at ON ehr_sync_logs(synced_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ehr_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ehr_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies for ehr_connections
CREATE POLICY "Users can view EHR connections"
    ON ehr_connections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage EHR connections"
    ON ehr_connections FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Policies for ehr_sync_logs
CREATE POLICY "Users can view EHR sync logs"
    ON ehr_sync_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create EHR sync logs"
    ON ehr_sync_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ehr_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ehr_connections_updated_at
    BEFORE UPDATE ON ehr_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_ehr_connections_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'EHR integration tables created successfully!' AS status;

