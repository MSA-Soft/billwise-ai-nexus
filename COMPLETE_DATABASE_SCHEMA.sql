-- ============================================================================
-- BILLWISE AI NEXUS - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This file contains all database tables, indexes, RLS policies, and triggers
-- for the BillWise AI Nexus medical billing and authorization management system.
--
-- Instructions:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Tables are organized by feature/module
-- 3. Dependencies are handled automatically (IF NOT EXISTS)
-- 4. All RLS policies and triggers are included
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: NOTIFICATION SYSTEM
-- ============================================================================

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Channels
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- Notification Types
    status_changes BOOLEAN DEFAULT true,
    due_date_reminders BOOLEAN DEFAULT true,
    overdue_alerts BOOLEAN DEFAULT true,
    approval_notifications BOOLEAN DEFAULT true,
    denial_notifications BOOLEAN DEFAULT true,
    task_assignment BOOLEAN DEFAULT true,
    
    -- Reminder Settings
    reminder_days INTEGER[] DEFAULT ARRAY[1, 3, 7],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Details
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT,
    type VARCHAR(100) NOT NULL,
    
    -- Related Entity
    related_type VARCHAR(100),
    related_id UUID,
    
    -- Delivery Status
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(50),
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Notification System
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_related ON notification_logs(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent ON notification_logs(sent, sent_at);

-- RLS for Notification System
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
    ON user_notification_preferences FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON user_notification_preferences FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
    ON user_notification_preferences FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own notification logs"
    ON notification_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "System can insert notification logs"
    ON notification_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Trigger for Notification Preferences
CREATE OR REPLACE FUNCTION update_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_prefs_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_prefs_updated_at();

-- ============================================================================
-- SECTION 2: WORKFLOW AUTOMATION
-- ============================================================================

-- Workflow Rules
CREATE TABLE IF NOT EXISTS workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger Configuration
    trigger JSONB NOT NULL,
    
    -- Conditions
    conditions JSONB NOT NULL,
    
    -- Actions
    actions JSONB NOT NULL,
    
    -- Rule Configuration
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES workflow_rules(id) ON DELETE SET NULL,
    rule_name VARCHAR(255),
    
    -- Execution Details
    trigger_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Results
    executed_actions INTEGER DEFAULT 0,
    failed_actions INTEGER DEFAULT 0,
    error TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Workflow Automation
CREATE INDEX IF NOT EXISTS idx_workflow_rules_active ON workflow_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_priority ON workflow_rules(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_rule_id ON workflow_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

-- RLS for Workflow Automation
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow rules"
    ON workflow_rules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage workflow rules"
    ON workflow_rules FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view workflow executions"
    ON workflow_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create workflow executions"
    ON workflow_executions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Trigger for Workflow Rules
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
-- SECTION 3: ADVANCED REPORTING
-- ============================================================================

-- Report Definitions
CREATE TABLE IF NOT EXISTS report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Report Configuration
    type VARCHAR(50) NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    
    -- Report Structure
    fields JSONB NOT NULL,
    filters JSONB DEFAULT '[]',
    grouping JSONB DEFAULT '[]',
    sorting JSONB DEFAULT '[]',
    
    -- Display Configuration
    format VARCHAR(50) DEFAULT 'table',
    chart_type VARCHAR(50),
    
    -- Scheduling
    schedule JSONB,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Executions
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID REFERENCES report_definitions(id) ON DELETE SET NULL,
    report_name VARCHAR(255),
    
    -- Execution Details
    status VARCHAR(50) DEFAULT 'pending',
    record_count INTEGER DEFAULT 0,
    execution_time INTEGER,
    
    -- Results
    file_url TEXT,
    file_format VARCHAR(50),
    
    -- Metadata
    executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

-- Indexes for Advanced Reporting
CREATE INDEX IF NOT EXISTS idx_report_definitions_type ON report_definitions(type);
CREATE INDEX IF NOT EXISTS idx_report_definitions_created_by ON report_definitions(created_by);
CREATE INDEX IF NOT EXISTS idx_report_executions_report_id ON report_executions(report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_executed_at ON report_executions(executed_at);

-- RLS for Advanced Reporting
ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view report executions"
    ON report_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create report executions"
    ON report_executions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Trigger for Report Definitions
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
-- SECTION 4: AUTOMATED CLAIM SUBMISSION
-- ============================================================================

-- Claim Batch Submissions
CREATE TABLE IF NOT EXISTS claim_batch_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    claim_ids UUID[] NOT NULL,
    submission_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    results JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Resubmission Rules
CREATE TABLE IF NOT EXISTS claim_resubmission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Resubmissions
CREATE TABLE IF NOT EXISTS claim_resubmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES claim_resubmission_rules(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    resubmitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Claim Status Checks
CREATE TABLE IF NOT EXISTS claim_status_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    interval_days INTEGER DEFAULT 7,
    next_check_date TIMESTAMP WITH TIME ZONE NOT NULL,
    last_check_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Automated Claim Submission
CREATE INDEX IF NOT EXISTS idx_batch_submissions_status ON claim_batch_submissions(status);
CREATE INDEX IF NOT EXISTS idx_batch_submissions_created_by ON claim_batch_submissions(created_by);
CREATE INDEX IF NOT EXISTS idx_resubmission_rules_active ON claim_resubmission_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_resubmissions_claim_id ON claim_resubmissions(claim_id);
CREATE INDEX IF NOT EXISTS idx_status_checks_claim_id ON claim_status_checks(claim_id);
CREATE INDEX IF NOT EXISTS idx_status_checks_next_date ON claim_status_checks(next_check_date);
CREATE INDEX IF NOT EXISTS idx_status_checks_active ON claim_status_checks(is_active);

-- RLS for Automated Claim Submission
ALTER TABLE claim_batch_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_resubmission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_resubmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_status_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view batch submissions"
    ON claim_batch_submissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create batch submissions"
    ON claim_batch_submissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view resubmission rules"
    ON claim_resubmission_rules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage resubmission rules"
    ON claim_resubmission_rules FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view resubmissions"
    ON claim_resubmissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create resubmissions"
    ON claim_resubmissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view status checks"
    ON claim_status_checks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage status checks"
    ON claim_status_checks FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for Resubmission Rules
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
-- SECTION 5: DENIAL MANAGEMENT
-- ============================================================================

-- Claim Denials
CREATE TABLE IF NOT EXISTS claim_denials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Denial Information
    denial_code VARCHAR(50) NOT NULL,
    denial_reason TEXT,
    denied_amount DECIMAL(10, 2),
    denial_date DATE NOT NULL,
    
    -- Appeal Information
    appeal_status VARCHAR(50),
    appeal_submitted_at TIMESTAMP WITH TIME ZONE,
    appeal_outcome VARCHAR(50),
    appeal_outcome_amount DECIMAL(10, 2),
    appeal_notes TEXT,
    
    -- Analysis
    root_cause JSONB,
    category VARCHAR(50),
    appealability_score INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appeal Workflows
CREATE TABLE IF NOT EXISTS appeal_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    denial_id UUID NOT NULL REFERENCES claim_denials(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Appeal Details
    appeal_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    appeal_letter TEXT,
    supporting_documents TEXT[],
    
    -- Submission
    submitted_at TIMESTAMP WITH TIME ZONE,
    response_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Outcome
    outcome VARCHAR(50),
    outcome_amount DECIMAL(10, 2),
    outcome_notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Denial Analyses
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
    estimated_recovery_probability INTEGER,
    
    -- Metadata
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for Denial Management
CREATE INDEX IF NOT EXISTS idx_denials_claim_id ON claim_denials(claim_id);
CREATE INDEX IF NOT EXISTS idx_denials_denial_code ON claim_denials(denial_code);
CREATE INDEX IF NOT EXISTS idx_denials_appeal_status ON claim_denials(appeal_status);
CREATE INDEX IF NOT EXISTS idx_denials_denial_date ON claim_denials(denial_date);
CREATE INDEX IF NOT EXISTS idx_appeals_denial_id ON appeal_workflows(denial_id);
CREATE INDEX IF NOT EXISTS idx_appeals_claim_id ON appeal_workflows(claim_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeal_workflows(status);
CREATE INDEX IF NOT EXISTS idx_denial_analyses_denial_id ON denial_analyses(denial_id);

-- RLS for Denial Management
ALTER TABLE claim_denials ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeal_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE denial_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view claim denials"
    ON claim_denials FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage claim denials"
    ON claim_denials FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view appeal workflows"
    ON appeal_workflows FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage appeal workflows"
    ON appeal_workflows FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view denial analyses"
    ON denial_analyses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create denial analyses"
    ON denial_analyses FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Triggers for Denial Management
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
-- SECTION 6: PAYER RELATIONSHIP MANAGEMENT
-- ============================================================================

-- Payer Communications
CREATE TABLE IF NOT EXISTS payer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE CASCADE,
    
    -- Communication Details
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(500),
    message TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payer Portal Integrations
CREATE TABLE IF NOT EXISTS payer_portal_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE CASCADE,
    
    -- Portal Configuration
    portal_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT,
    username VARCHAR(255),
    
    -- Capabilities
    capabilities TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Payer Relationship Management
CREATE INDEX IF NOT EXISTS idx_payer_communications_payer_id ON payer_communications(payer_id);
CREATE INDEX IF NOT EXISTS idx_payer_communications_status ON payer_communications(status);
CREATE INDEX IF NOT EXISTS idx_payer_communications_created_at ON payer_communications(created_at);
CREATE INDEX IF NOT EXISTS idx_portal_integrations_payer_id ON payer_portal_integrations(payer_id);
CREATE INDEX IF NOT EXISTS idx_portal_integrations_active ON payer_portal_integrations(is_active);

-- RLS for Payer Relationship Management
ALTER TABLE payer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payer_portal_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payer communications"
    ON payer_communications FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage payer communications"
    ON payer_communications FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view portal integrations"
    ON payer_portal_integrations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage portal integrations"
    ON payer_portal_integrations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for Portal Integrations
CREATE OR REPLACE FUNCTION update_portal_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portal_integrations_updated_at
    BEFORE UPDATE ON payer_portal_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_portal_integrations_updated_at();

-- ============================================================================
-- SECTION 7: PATIENT PORTAL
-- ============================================================================

-- Patient Messages
CREATE TABLE IF NOT EXISTS patient_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Message Details
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    message_from VARCHAR(50) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'unread',
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Attachments
    attachments TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authorization Documents
CREATE TABLE IF NOT EXISTS authorization_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    
    -- Document Details
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    statement_id UUID REFERENCES billing_statements(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Metadata
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Patient Portal
CREATE INDEX IF NOT EXISTS idx_patient_messages_patient_id ON patient_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_status ON patient_messages(status);
CREATE INDEX IF NOT EXISTS idx_patient_messages_created_at ON patient_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_documents_auth_id ON authorization_documents(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_auth_documents_status ON authorization_documents(status);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_statement_id ON payments(statement_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS for Patient Portal
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own messages"
    ON patient_messages FOR SELECT
    TO authenticated
    USING (patient_id IN (SELECT id FROM patients WHERE id = auth.uid()::text));

CREATE POLICY "Patients can create messages"
    ON patient_messages FOR INSERT
    TO authenticated
    WITH CHECK (patient_id IN (SELECT id FROM patients WHERE id = auth.uid()::text));

CREATE POLICY "Staff can view all messages"
    ON patient_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can create messages"
    ON patient_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view authorization documents"
    ON authorization_documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can upload authorization documents"
    ON authorization_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Staff can update authorization documents"
    ON authorization_documents FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Patients can view their own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (patient_id IN (SELECT id FROM patients WHERE id = auth.uid()::text));

CREATE POLICY "Staff can view all payments"
    ON payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Trigger for Patient Messages
CREATE OR REPLACE FUNCTION update_patient_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_messages_updated_at
    BEFORE UPDATE ON patient_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_messages_updated_at();

-- ============================================================================
-- SECTION 8: ENHANCED SECURITY
-- ============================================================================

-- User MFA
CREATE TABLE IF NOT EXISTS user_mfa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- MFA Configuration
    secret TEXT NOT NULL,
    backup_codes TEXT[],
    is_enabled BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] NOT NULL,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, role_id)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    
    -- Security Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'low',
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Enhanced Security
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

-- RLS for Enhanced Security
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MFA settings"
    ON user_mfa FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own MFA settings"
    ON user_mfa FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

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

-- Triggers for Enhanced Security
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

-- Default Roles
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
-- SECTION 9: API-FIRST DESIGN
-- ============================================================================

-- Webhook Subscriptions
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Webhook Configuration
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Key Details
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(10) NOT NULL,
    
    -- Permissions
    permissions TEXT[],
    rate_limit INTEGER DEFAULT 1000,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Usage Logs
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Request Details
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for API-First Design
CREATE INDEX IF NOT EXISTS idx_webhooks_url ON webhook_subscriptions(url);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhook_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_logs(created_at);

-- RLS for API-First Design
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhook subscriptions"
    ON webhook_subscriptions FOR SELECT
    TO authenticated
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    ));

CREATE POLICY "Users can create webhook subscriptions"
    ON webhook_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own webhook subscriptions"
    ON webhook_subscriptions FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can view their own API keys"
    ON api_keys FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own API keys"
    ON api_keys FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own API usage logs"
    ON api_usage_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    ));

CREATE POLICY "System can create API usage logs"
    ON api_usage_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Triggers for API-First Design
CREATE OR REPLACE FUNCTION update_api_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhook_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_api_tables_updated_at();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_api_tables_updated_at();

-- ============================================================================
-- SECTION 10: EHR INTEGRATION
-- ============================================================================

-- EHR Connections
CREATE TABLE IF NOT EXISTS ehr_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- EHR System Information
    ehr_system VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    
    -- Authentication
    client_id VARCHAR(255) NOT NULL,
    client_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EHR Sync Logs
CREATE TABLE IF NOT EXISTS ehr_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ehr_connection_id UUID REFERENCES ehr_connections(id) ON DELETE CASCADE,
    
    -- Sync Details
    sync_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    resource_type VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    
    -- Metadata
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for EHR Integration
CREATE INDEX IF NOT EXISTS idx_ehr_connections_system ON ehr_connections(ehr_system);
CREATE INDEX IF NOT EXISTS idx_ehr_connections_active ON ehr_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_ehr_sync_logs_connection ON ehr_sync_logs(ehr_connection_id);
CREATE INDEX IF NOT EXISTS idx_ehr_sync_logs_status ON ehr_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_ehr_sync_logs_synced_at ON ehr_sync_logs(synced_at);

-- RLS for EHR Integration
ALTER TABLE ehr_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ehr_sync_logs ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view EHR sync logs"
    ON ehr_sync_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create EHR sync logs"
    ON ehr_sync_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Trigger for EHR Connections
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
-- SECTION 11: PAYER API CONNECTIONS
-- ============================================================================

-- Payer API Connections
CREATE TABLE IF NOT EXISTS payer_api_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE CASCADE,
    payer_name VARCHAR(255),
    
    -- API Configuration
    api_type VARCHAR(50) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    credentials JSONB,
    
    -- Capabilities
    capabilities TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Payer API Connections
CREATE INDEX IF NOT EXISTS idx_payer_api_payer_id ON payer_api_connections(payer_id);
CREATE INDEX IF NOT EXISTS idx_payer_api_active ON payer_api_connections(is_active);

-- RLS for Payer API Connections
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

-- Trigger for Payer API Connections
CREATE OR REPLACE FUNCTION update_payer_api_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payer_api_connections_updated_at
    BEFORE UPDATE ON payer_api_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_payer_api_connections_updated_at();

-- ============================================================================
-- SECTION 12: AUTHORIZATION TASKS
-- ============================================================================

-- Authorization Tasks
CREATE TABLE IF NOT EXISTS authorization_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    
    -- Task Information
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority and Urgency
    priority VARCHAR(50) DEFAULT 'medium',
    urgency_level VARCHAR(50),
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'pending',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Dates
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- X12 278 Compliance
    x12_submission_status VARCHAR(50),
    x12_transaction_id VARCHAR(100),
    x12_response_code VARCHAR(50),
    x12_response_message TEXT,
    x12_submitted_at TIMESTAMP WITH TIME ZONE,
    x12_response_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Task Dependencies
    depends_on_task_id UUID REFERENCES authorization_tasks(id) ON DELETE SET NULL,
    blocks_task_id UUID REFERENCES authorization_tasks(id) ON DELETE SET NULL,
    
    -- Notes and Attachments
    notes TEXT,
    internal_notes TEXT,
    attachments JSONB,
    
    -- Reminders and Notifications
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    last_notified_at TIMESTAMP WITH TIME ZONE,
    
    -- Escalation
    escalated BOOLEAN DEFAULT false,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    escalation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Task Comments
CREATE TABLE IF NOT EXISTS authorization_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES authorization_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task History
CREATE TABLE IF NOT EXISTS authorization_task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES authorization_tasks(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Templates
CREATE TABLE IF NOT EXISTS authorization_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    estimated_duration_minutes INTEGER,
    default_due_date_days INTEGER,
    required_fields JSONB,
    workflow_steps JSONB,
    payer_specific BOOLEAN DEFAULT false,
    payer_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Authorization Tasks
CREATE INDEX IF NOT EXISTS idx_auth_tasks_request_id ON authorization_tasks(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_assigned_to ON authorization_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_status ON authorization_tasks(status);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_priority ON authorization_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_due_date ON authorization_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_type ON authorization_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_created_at ON authorization_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_task_comments_task_id ON authorization_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_auth_task_history_task_id ON authorization_task_history(task_id);

-- RLS for Authorization Tasks
ALTER TABLE authorization_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks assigned to them or created by them"
    ON authorization_tasks FOR SELECT
    TO authenticated
    USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_tasks.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks for their authorization requests"
    ON authorization_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_tasks.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks assigned to them or their own tasks"
    ON authorization_tasks FOR UPDATE
    TO authenticated
    USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid()
    );

CREATE POLICY "Users can view comments on tasks they have access to"
    ON authorization_task_comments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorization_tasks at
            WHERE at.id = authorization_task_comments.task_id
            AND (
                at.assigned_to = auth.uid() OR 
                at.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments on tasks they have access to"
    ON authorization_task_comments FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM authorization_tasks at
            WHERE at.id = authorization_task_comments.task_id
            AND (
                at.assigned_to = auth.uid() OR 
                at.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Users can view history of tasks they have access to"
    ON authorization_task_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorization_tasks at
            WHERE at.id = authorization_task_history.task_id
            AND (
                at.assigned_to = auth.uid() OR 
                at.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "All authenticated users can view active templates"
    ON authorization_task_templates FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Triggers for Authorization Tasks
CREATE OR REPLACE FUNCTION update_authorization_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_authorization_tasks_updated_at
    BEFORE UPDATE ON authorization_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_authorization_tasks_updated_at();

-- Create history entry on task changes
CREATE OR REPLACE FUNCTION create_task_history_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO authorization_task_history (task_id, action, new_value, changed_by)
        VALUES (NEW.id, 'created', row_to_json(NEW), NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
            VALUES (NEW.id, 'status_changed', 
                jsonb_build_object('status', OLD.status), 
                jsonb_build_object('status', NEW.status),
                auth.uid());
        END IF;
        IF OLD.priority != NEW.priority THEN
            INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
            VALUES (NEW.id, 'priority_changed', 
                jsonb_build_object('priority', OLD.priority), 
                jsonb_build_object('priority', NEW.priority),
                auth.uid());
        END IF;
        IF OLD.assigned_to != NEW.assigned_to THEN
            INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
            VALUES (NEW.id, 'assigned', 
                jsonb_build_object('assigned_to', OLD.assigned_to), 
                jsonb_build_object('assigned_to', NEW.assigned_to),
                auth.uid());
        END IF;
        IF OLD.due_date != NEW.due_date THEN
            INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
            VALUES (NEW.id, 'due_date_changed', 
                jsonb_build_object('due_date', OLD.due_date), 
                jsonb_build_object('due_date', NEW.due_date),
                auth.uid());
        END IF;
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            INSERT INTO authorization_task_history (task_id, action, new_value, changed_by)
            VALUES (NEW.id, 'completed', row_to_json(NEW), auth.uid());
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_task_history_entry
    AFTER INSERT OR UPDATE ON authorization_tasks
    FOR EACH ROW
    EXECUTE FUNCTION create_task_history_entry();

-- ============================================================================
-- SECTION 13: FACILITIES
-- ============================================================================

-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100),
    npi VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Facilities
CREATE INDEX IF NOT EXISTS idx_facilities_npi ON facilities(npi);
CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(is_active);

-- RLS for Facilities
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view facilities"
    ON facilities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage facilities"
    ON facilities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for Facilities
CREATE OR REPLACE FUNCTION update_facilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_facilities_updated_at();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT '✅ Complete database schema created successfully! All tables, indexes, RLS policies, and triggers have been set up.' AS status;

