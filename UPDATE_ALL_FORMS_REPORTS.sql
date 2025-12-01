-- ============================================================================
-- UPDATE ALL FORMS AND REPORTS IN SYSTEM
-- ============================================================================
-- This script adds all missing forms and reports from the application
-- Run this after COMPLETE_FIX_RLS_AND_DATA_ISOLATION.sql
-- ============================================================================

-- Ensure unique constraint exists on route_path
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'system_forms_reports_route_path_key'
    ) THEN
        ALTER TABLE system_forms_reports ADD CONSTRAINT system_forms_reports_route_path_key UNIQUE (route_path);
    END IF;
END $$;

-- Insert/Update all forms and reports from the application
INSERT INTO system_forms_reports (name, type, category, description, route_path, icon) VALUES
-- Main Navigation Forms
('Dashboard', 'form', 'main', 'Main dashboard and overview', '/', 'LayoutDashboard'),
('Scheduling', 'form', 'main', 'Schedule and manage appointments', '/scheduling', 'Calendar'),
('Patients', 'form', 'patients', 'Manage patient records', '/patients', 'Users'),
('Claims', 'form', 'claims', 'Create and manage claims', '/claims', 'FileText'),
('Billings', 'form', 'billing', 'Manage billing and invoices', '/billings', 'DollarSign'),
('Payments', 'form', 'payments', 'Process and track payments', '/payments', 'DollarSign'),
('Eligibility Verification', 'form', 'eligibility', 'Verify patient eligibility', '/eligibility-verification', 'Shield'),
('Code Validation', 'form', 'validation', 'Validate medical codes', '/code-validation', 'CheckCircle'),
('Authorization', 'form', 'authorization', 'Manage prior authorization requests', '/authorization', 'FileText'),
('Enhanced Claims', 'form', 'claims', 'AI-powered enhanced claims management', '/enhanced-claims', 'FileText'),
('Prior Authorization', 'form', 'authorization', 'Manage prior authorization', '/prior-authorization', 'FileText'),

-- Customer Setup Forms
('Practices', 'form', 'setup', 'Manage practice information', '/customer-setup?tab=practices', 'Building'),
('Providers', 'form', 'setup', 'Manage provider information', '/customer-setup?tab=providers', 'User'),
('Facilities', 'form', 'setup', 'Manage facility information', '/customer-setup?tab=facilities', 'Building'),
('Referring Providers', 'form', 'setup', 'Manage referring providers', '/customer-setup?tab=referring-providers', 'User'),
('Payers', 'form', 'setup', 'Manage insurance payers', '/customer-setup?tab=payers', 'DollarSign'),
('Payer Agreements', 'form', 'setup', 'Manage payer agreements', '/customer-setup?tab=payer-agreements', 'Users'),
('Collection Agencies', 'form', 'setup', 'Manage collection agencies', '/customer-setup?tab=collection-agencies', 'FileText'),
('Codes', 'form', 'setup', 'Manage medical codes (CPT, ICD, HCPCS)', '/customer-setup?tab=codes', 'Hash'),
('Alert Control', 'form', 'setup', 'Configure system alerts', '/customer-setup?tab=alert-control', 'AlertTriangle'),
('Statements', 'form', 'setup', 'Manage billing statements', '/customer-setup?tab=statements', 'FileText'),
('Superbills', 'form', 'setup', 'Manage superbills', '/customer-setup?tab=superbills', 'FileText'),
('Labels', 'form', 'setup', 'Manage labels and templates', '/customer-setup?tab=labels', 'Mail'),
('Customization', 'form', 'setup', 'Customize system settings', '/customer-setup?tab=customization', 'Settings'),
('Settings', 'form', 'setup', 'Application settings', '/customer-setup?tab=settings', 'Settings'),

-- Workflow Forms
('Billing Workflow', 'form', 'workflow', 'Billing workflow management', '/billing-workflow', 'Workflow'),
('Quick Actions', 'form', 'workflow', 'Quick action shortcuts', '/quick-actions', 'Zap'),
('Recent Activity', 'form', 'workflow', 'View recent system activity', '/recent-activity', 'Clock'),

-- Reports
('Reports', 'report', 'reports', 'General reports and analytics', '/reports', 'BarChart3'),
('Financial Reports', 'report', 'reports', 'View financial analytics and reports', '/financial-reports', 'BarChart3'),
('Performance Metrics', 'report', 'reports', 'View performance metrics and KPIs', '/performance-metrics', 'TrendingUp'),
('Audit Trail', 'report', 'reports', 'View system audit logs and history', '/audit-trail', 'History')
ON CONFLICT (route_path) DO UPDATE
SET 
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    updated_at = NOW();

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- This script ensures all forms and reports from the application are in the system
-- Forms are organized by category:
--   - main: Main navigation items
--   - patients: Patient-related forms
--   - claims: Claims-related forms
--   - billing: Billing-related forms
--   - payments: Payment-related forms
--   - eligibility: Eligibility verification
--   - validation: Code validation
--   - authorization: Authorization management
--   - setup: Customer setup forms
--   - workflow: Workflow management
--   - reports: Reports and analytics
-- ============================================================================

