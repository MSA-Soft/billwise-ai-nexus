-- ============================================================================
-- COMPLETE FIX: RLS RECURSION + DATA ISOLATION + SUPER ADMIN ACCESS CONTROL
-- ============================================================================
-- This script fixes:
-- 1. Infinite recursion in company_users RLS policy
-- 2. Ensures proper company data isolation (no data merging)
-- 3. Sets up form/report access management for super admin
-- ============================================================================

-- ============================================================================
-- PART 1: FIX INFINITE RECURSION IN COMPANY_USERS
-- ============================================================================

-- Helper function to get user's accessible company IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_accessible_company_ids(user_uuid UUID)
RETURNS TABLE(company_id UUID) AS $$
BEGIN
    -- This function runs with SECURITY DEFINER, so it bypasses RLS
    -- and can query company_users directly without recursion
    RETURN QUERY
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = user_uuid
    AND cu.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin/manager in company (bypasses RLS)
CREATE OR REPLACE FUNCTION user_is_admin_in_company(user_uuid UUID, company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function runs with SECURITY DEFINER, so it bypasses RLS
    RETURN EXISTS (
        SELECT 1 FROM company_users
        WHERE user_id = user_uuid
        AND company_id = company_uuid
        AND role IN ('admin', 'manager')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix company_users SELECT policy (remove recursion)
DROP POLICY IF EXISTS "Users can view their memberships or super admin can view all" ON company_users;
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;

CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (
        -- Super admins can see all
        is_super_admin(auth.uid())
        -- Users can see their own memberships
        OR user_id = auth.uid()
        -- Admins/managers can see memberships in their companies
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- Fix company_users INSERT policy
DROP POLICY IF EXISTS "Super admins or company admins can add users" ON company_users;
DROP POLICY IF EXISTS "Company admins can add users" ON company_users;

CREATE POLICY "Super admins or company admins can add users"
    ON company_users FOR INSERT
    TO authenticated
    WITH CHECK (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- Fix company_users UPDATE policy
DROP POLICY IF EXISTS "Super admins or company admins can update user roles" ON company_users;
DROP POLICY IF EXISTS "Company admins can update user roles" ON company_users;

CREATE POLICY "Super admins or company admins can update user roles"
    ON company_users FOR UPDATE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- Fix company_users DELETE policy
DROP POLICY IF EXISTS "Super admins or company admins can remove users" ON company_users;

CREATE POLICY "Super admins or company admins can remove users"
    ON company_users FOR DELETE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- ============================================================================
-- PART 2: FIX COMPANIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their companies or super admin can view all" ON companies;
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies or super admin can view all"
    ON companies FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

DROP POLICY IF EXISTS "Super admins or company admins can update companies" ON companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON companies;

CREATE POLICY "Super admins or company admins can update companies"
    ON companies FOR UPDATE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), id)
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), id)
    );

-- ============================================================================
-- PART 3: ENSURE ALL TABLES HAVE PROPER COMPANY DATA ISOLATION
-- ============================================================================
-- Update all RLS policies to use the helper function for proper isolation
-- ============================================================================

-- PATIENTS TABLE - Ensure company isolation
DROP POLICY IF EXISTS "Users can view patients from their companies" ON patients;
DROP POLICY IF EXISTS "Users can view patients" ON patients;

CREATE POLICY "Users can view patients from their companies"
    ON patients FOR SELECT
    TO authenticated
    USING (
        -- Super admins can see all
        is_super_admin(auth.uid())
        -- Regular users only see their company's patients
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create patients in their companies" ON patients;
DROP POLICY IF EXISTS "Users can create patients" ON patients;

CREATE POLICY "Users can create patients in their companies"
    ON patients FOR INSERT
    TO authenticated
    WITH CHECK (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update patients in their companies" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;

CREATE POLICY "Users can update patients in their companies"
    ON patients FOR UPDATE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can delete patients in their companies" ON patients;
DROP POLICY IF EXISTS "Users can delete patients" ON patients;

CREATE POLICY "Users can delete patients in their companies"
    ON patients FOR DELETE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- PROFESSIONAL CLAIMS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view claims from their companies" ON professional_claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON professional_claims;

CREATE POLICY "Users can view claims from their companies"
    ON professional_claims FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create claims in their companies" ON professional_claims;
DROP POLICY IF EXISTS "Users can create claims" ON professional_claims;

CREATE POLICY "Users can create claims in their companies"
    ON professional_claims FOR INSERT
    TO authenticated
    WITH CHECK (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update claims in their companies" ON professional_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON professional_claims;

CREATE POLICY "Users can update claims in their companies"
    ON professional_claims FOR UPDATE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- INSTITUTIONAL CLAIMS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view claims from their companies" ON institutional_claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON institutional_claims;

CREATE POLICY "Users can view institutional claims from their companies"
    ON institutional_claims FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- AUTHORIZATION REQUESTS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view authorization requests from their companies" ON authorization_requests;
DROP POLICY IF EXISTS "Users can view their own authorization requests" ON authorization_requests;

CREATE POLICY "Users can view authorization requests from their companies"
    ON authorization_requests FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- BILLING STATEMENTS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view billing statements from their companies" ON billing_statements;
DROP POLICY IF EXISTS "Users can view billing statements" ON billing_statements;

CREATE POLICY "Users can view billing statements from their companies"
    ON billing_statements FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- COLLECTIONS ACCOUNTS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view collections accounts from their companies" ON collections_accounts;
DROP POLICY IF EXISTS "Users can view collections accounts" ON collections_accounts;

CREATE POLICY "Users can view collections accounts from their companies"
    ON collections_accounts FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- APPOINTMENTS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view appointments from their companies" ON appointments;
DROP POLICY IF EXISTS "Users can view appointments" ON appointments;

CREATE POLICY "Users can view appointments from their companies"
    ON appointments FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- PROVIDERS - Ensure company isolation
DROP POLICY IF EXISTS "Users can view providers from their companies" ON providers;
DROP POLICY IF EXISTS "Users can view providers" ON providers;

CREATE POLICY "Users can view providers from their companies"
    ON providers FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- FACILITIES - Ensure company isolation
DROP POLICY IF EXISTS "Users can view facilities from their companies" ON facilities;
DROP POLICY IF EXISTS "Users can view facilities" ON facilities;

CREATE POLICY "Users can view facilities from their companies"
    ON facilities FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- ============================================================================
-- PART 4: CREATE FORM/REPORT ACCESS MANAGEMENT SYSTEM
-- ============================================================================

-- Table to store available forms/reports in the system
CREATE TABLE IF NOT EXISTS system_forms_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'form' or 'report'
    category VARCHAR(100), -- 'patients', 'claims', 'billing', 'reports', etc.
    description TEXT,
    route_path VARCHAR(255), -- Frontend route
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on route_path if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'system_forms_reports_route_path_key'
    ) THEN
        ALTER TABLE system_forms_reports ADD CONSTRAINT system_forms_reports_route_path_key UNIQUE (route_path);
    END IF;
END $$;

-- Table to manage which forms/reports each company can access
CREATE TABLE IF NOT EXISTS company_form_report_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    form_report_id UUID REFERENCES system_forms_reports(id) ON DELETE CASCADE NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    -- Optional: Custom permissions per company
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, form_report_id)
);

-- Table to manage which forms/reports each user can access (overrides company-level)
CREATE TABLE IF NOT EXISTS user_form_report_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    form_report_id UUID REFERENCES system_forms_reports(id) ON DELETE CASCADE NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    -- Optional: Custom permissions per user
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id, form_report_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_form_report_access_company_id 
    ON company_form_report_access(company_id);
CREATE INDEX IF NOT EXISTS idx_company_form_report_access_form_report_id 
    ON company_form_report_access(form_report_id);
CREATE INDEX IF NOT EXISTS idx_user_form_report_access_user_id 
    ON user_form_report_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_form_report_access_company_id 
    ON user_form_report_access(company_id);
CREATE INDEX IF NOT EXISTS idx_user_form_report_access_form_report_id 
    ON user_form_report_access(form_report_id);

-- Enable RLS
ALTER TABLE system_forms_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_form_report_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_form_report_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_forms_reports (all authenticated users can view)
CREATE POLICY "Authenticated users can view system forms and reports"
    ON system_forms_reports FOR SELECT
    TO authenticated
    USING (true);

-- Only super admins can manage system forms/reports
CREATE POLICY "Super admins can manage system forms and reports"
    ON system_forms_reports FOR ALL
    TO authenticated
    USING (is_super_admin(auth.uid()))
    WITH CHECK (is_super_admin(auth.uid()));

-- RLS Policies for company_form_report_access
CREATE POLICY "Users can view their company's form/report access"
    ON company_form_report_access FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- Only super admins and company admins can manage company access
CREATE POLICY "Super admins and company admins can manage company form/report access"
    ON company_form_report_access FOR ALL
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- RLS Policies for user_form_report_access
CREATE POLICY "Users can view their own form/report access"
    ON user_form_report_access FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_id = auth.uid()
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- Only super admins and company admins can manage user access
CREATE POLICY "Super admins and company admins can manage user form/report access"
    ON user_form_report_access FOR ALL
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- Helper function to check if user has access to a form/report
CREATE OR REPLACE FUNCTION user_has_form_report_access(
    user_uuid UUID,
    company_uuid UUID,
    form_report_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := true; -- Default to true for backward compatibility
    user_override BOOLEAN;
    company_access BOOLEAN;
BEGIN
    -- Super admins have access to everything
    IF is_super_admin(user_uuid) THEN
        RETURN true;
    END IF;
    
    -- Check user-level override first (user settings override company settings)
    SELECT is_enabled INTO user_override
    FROM user_form_report_access
    WHERE user_id = user_uuid
    AND company_id = company_uuid
    AND form_report_id = form_report_uuid;
    
    IF user_override IS NOT NULL THEN
        RETURN user_override;
    END IF;
    
    -- Check company-level access
    SELECT is_enabled INTO company_access
    FROM company_form_report_access
    WHERE company_id = company_uuid
    AND form_report_id = form_report_uuid;
    
    IF company_access IS NOT NULL THEN
        RETURN company_access;
    END IF;
    
    -- Default: allow access if not explicitly set (for backward compatibility)
    -- This means if no access is configured, users have access by default
    -- Super admin can explicitly disable access to restrict it
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed all forms and reports from the application
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
ON CONFLICT (route_path) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Summary of fixes:
-- 1. ✅ Fixed infinite recursion in company_users RLS policy
-- 2. ✅ Ensured all tables have proper company data isolation
-- 3. ✅ Created form/report access management system
-- 4. ✅ Super admins can now manage which forms/reports each company/user can access
-- ============================================================================

