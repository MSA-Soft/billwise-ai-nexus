-- ============================================================================
-- SAAS MULTI-TENANT SCHEMA FOR BILLWISE AI NEXUS
-- ============================================================================
-- This file creates the multi-tenant architecture where:
-- 1. Admin users can select which company to view/manage
-- 2. Company users only see their own company's data
-- 3. All data is isolated by company_id
-- ============================================================================

-- ============================================================================
-- 1. COMPANIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    domain VARCHAR(255), -- Optional custom domain
    logo_url TEXT,
    
    -- Company Details
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Subscription & Billing
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, professional, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
    subscription_start_date DATE,
    subscription_end_date DATE,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}', -- Enabled features per company
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_trial BOOLEAN DEFAULT false,
    trial_end_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 2. COMPANY USERS (Junction Table - Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Role in this company
    role VARCHAR(50) DEFAULT 'user', -- admin, manager, user, viewer
    is_primary BOOLEAN DEFAULT false, -- Primary company for this user
    
    -- Permissions (JSONB for granular control)
    permissions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: user can only have one role per company
    UNIQUE(company_id, user_id)
);

-- ============================================================================
-- 3. ROLES TABLE (Predefined Roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    
    -- Permissions (JSONB structure)
    permissions JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. PERMISSIONS TABLE (Granular Permissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL, -- patients, claims, billing, etc.
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, manage
    description TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. ROLE PERMISSIONS (Junction Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role_id, permission_id)
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_is_primary ON company_users(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(role);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Companies Policies
-- Users can view companies they belong to
CREATE POLICY "Users can view their companies"
    ON companies FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Only system admins can create companies (we'll handle this in application logic)
CREATE POLICY "System admins can create companies"
    ON companies FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Company admins can update their company
CREATE POLICY "Company admins can update their company"
    ON companies FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    )
    WITH CHECK (
        id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Company Users Policies
-- Users can view their own company memberships
CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Company admins can add users to their company
CREATE POLICY "Company admins can add users"
    ON company_users FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Company admins can update user roles in their company
CREATE POLICY "Company admins can update user roles"
    ON company_users FOR UPDATE
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Roles and Permissions - Read only for authenticated users
CREATE POLICY "Authenticated users can view roles"
    ON roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view permissions"
    ON permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view role permissions"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's current company (primary or first active)
CREATE OR REPLACE FUNCTION get_user_company(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    company_uuid UUID;
BEGIN
    -- Try to get primary company first
    SELECT company_id INTO company_uuid
    FROM company_users
    WHERE user_id = user_uuid 
    AND is_primary = true 
    AND is_active = true
    LIMIT 1;
    
    -- If no primary, get first active company
    IF company_uuid IS NULL THEN
        SELECT company_id INTO company_uuid
        FROM company_users
        WHERE user_id = user_uuid 
        AND is_active = true
        ORDER BY joined_at ASC
        LIMIT 1;
    END IF;
    
    RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    user_uuid UUID,
    company_uuid UUID,
    permission_name VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
    user_role VARCHAR;
BEGIN
    -- Get user's role in company
    SELECT role INTO user_role
    FROM company_users
    WHERE user_id = user_uuid 
    AND company_id = company_uuid
    AND is_active = true;
    
    -- Admin and manager have all permissions
    IF user_role IN ('admin', 'manager') THEN
        RETURN true;
    END IF;
    
    -- Check if role has permission
    SELECT EXISTS (
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        JOIN roles r ON rp.role_id = r.id
        WHERE r.name = user_role
        AND p.name = permission_name
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. SEED DEFAULT ROLES AND PERMISSIONS
-- ============================================================================

-- Insert default roles
INSERT INTO roles (name, description, is_system_role, permissions) VALUES
('admin', 'Full system access - can manage all aspects of the company', true, '{"all": true}'),
('manager', 'Can manage most aspects except company settings', true, '{"patients": true, "claims": true, "billing": true, "reports": true}'),
('user', 'Standard user with read/write access to assigned areas', true, '{"patients": {"read": true, "create": true, "update": true}, "claims": {"read": true, "create": true}}'),
('viewer', 'Read-only access', true, '{"patients": {"read": true}, "claims": {"read": true}, "billing": {"read": true}}')
ON CONFLICT (name) DO NOTHING;

-- Insert common permissions
INSERT INTO permissions (name, resource, action, description) VALUES
-- Patients
('patients.read', 'patients', 'read', 'View patients'),
('patients.create', 'patients', 'create', 'Create new patients'),
('patients.update', 'patients', 'update', 'Update patient information'),
('patients.delete', 'patients', 'delete', 'Delete patients'),
-- Claims
('claims.read', 'claims', 'read', 'View claims'),
('claims.create', 'claims', 'create', 'Create new claims'),
('claims.update', 'claims', 'update', 'Update claims'),
('claims.delete', 'claims', 'delete', 'Delete claims'),
('claims.submit', 'claims', 'submit', 'Submit claims to payers'),
-- Billing
('billing.read', 'billing', 'read', 'View billing information'),
('billing.create', 'billing', 'create', 'Create billing statements'),
('billing.update', 'billing', 'update', 'Update billing information'),
-- Reports
('reports.read', 'reports', 'read', 'View reports'),
('reports.create', 'reports', 'create', 'Create custom reports'),
-- Settings
('settings.read', 'settings', 'read', 'View company settings'),
('settings.update', 'settings', 'update', 'Update company settings'),
-- Users
('users.read', 'users', 'read', 'View company users'),
('users.create', 'users', 'create', 'Invite new users'),
('users.update', 'users', 'update', 'Update user roles'),
('users.delete', 'users', 'delete', 'Remove users from company')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at
    BEFORE UPDATE ON company_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Next Steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Update all existing tables to add company_id column
-- 3. Update RLS policies on all tables to filter by company_id
-- 4. Update application code to use company context
-- ============================================================================

