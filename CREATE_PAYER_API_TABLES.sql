-- Payer API Connections Tables
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payer_api_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE CASCADE,
    payer_name VARCHAR(255),
    
    -- API Configuration
    api_type VARCHAR(50) NOT NULL, -- 'x12', 'rest', 'soap', 'fhir'
    base_url VARCHAR(500) NOT NULL,
    credentials JSONB, -- Encrypted in production
    
    -- Capabilities
    capabilities TEXT[], -- Array of capabilities
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payer_api_payer_id ON payer_api_connections(payer_id);
CREATE INDEX IF NOT EXISTS idx_payer_api_active ON payer_api_connections(is_active);

ALTER TABLE payer_api_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payer API connections"
    ON payer_api_connections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage payer API connections"
    ON payer_api_connections FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
        )
    );

SELECT 'Payer API connections table created successfully!' AS status;

