-- ============================================================================
-- SUPER ADMIN SYSTEM FOR BILLWISE AI NEXUS
-- ============================================================================
-- This creates a super admin role that can manage all companies
-- Super admins have full access to all data across all companies
-- ============================================================================

-- ============================================================================
-- 1. ADD SUPER ADMIN SUPPORT TO PROFILES
-- ============================================================================

-- Add is_super_admin column to profiles (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add index for super admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin 
ON profiles(is_super_admin) 
WHERE is_super_admin = true;

-- ============================================================================
-- 2. UPDATE COMPANY_USERS TO SUPPORT SUPER ADMIN
-- ============================================================================

-- Super admins don't need to be in company_users table
-- They access everything through is_super_admin flag

-- ============================================================================
-- 3. CREATE SUPER ADMIN HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_uuid 
        AND is_super_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. UPDATE RLS POLICIES FOR SUPER ADMIN ACCESS
-- ============================================================================

-- Helper function to check if user is super admin or has company access
CREATE OR REPLACE FUNCTION user_has_company_access(
    user_uuid UUID,
    company_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admins have access to all companies
    IF is_super_admin(user_uuid) THEN
        RETURN true;
    END IF;
    
    -- Regular users need to be in company_users
    RETURN EXISTS (
        SELECT 1 FROM company_users
        WHERE user_id = user_uuid
        AND company_id = company_uuid
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. UPDATE COMPANIES RLS POLICY FOR SUPER ADMIN
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies or super admin can view all"
    ON companies FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Super admin can create companies
DROP POLICY IF EXISTS "System admins can create companies" ON companies;

CREATE POLICY "Super admins can create companies"
    ON companies FOR INSERT
    TO authenticated
    WITH CHECK (is_super_admin(auth.uid()));

-- Super admin can update any company
DROP POLICY IF EXISTS "Company admins can update their company" ON companies;

CREATE POLICY "Super admins or company admins can update companies"
    ON companies FOR UPDATE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Super admin can delete companies
CREATE POLICY "Super admins can delete companies"
    ON companies FOR DELETE
    TO authenticated
    USING (is_super_admin(auth.uid()));

-- ============================================================================
-- 6. UPDATE COMPANY_USERS RLS POLICY FOR SUPER ADMIN
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;

CREATE POLICY "Users can view their memberships or super admin can view all"
    ON company_users FOR SELECT
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR user_id = auth.uid()
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Super admin can add users to any company
DROP POLICY IF EXISTS "Company admins can add users" ON company_users;

CREATE POLICY "Super admins or company admins can add users"
    ON company_users FOR INSERT
    TO authenticated
    WITH CHECK (
        is_super_admin(auth.uid())
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Super admin can update any user's role
DROP POLICY IF EXISTS "Company admins can update user roles" ON company_users;

CREATE POLICY "Super admins or company admins can update user roles"
    ON company_users FOR UPDATE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    )
    WITH CHECK (
        is_super_admin(auth.uid())
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Super admin can remove users from any company
CREATE POLICY "Super admins or company admins can remove users"
    ON company_users FOR DELETE
    TO authenticated
    USING (
        is_super_admin(auth.uid())
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- ============================================================================
-- 7. CREATE SUPER ADMIN STATISTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW super_admin_company_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.slug,
    c.subscription_tier,
    c.subscription_status,
    c.is_active,
    c.created_at,
    -- User counts
    (SELECT COUNT(*) FROM company_users cu WHERE cu.company_id = c.id AND cu.is_active = true) as total_users,
    (SELECT COUNT(*) FROM company_users cu WHERE cu.company_id = c.id AND cu.role = 'admin' AND cu.is_active = true) as admin_count,
    -- Patient counts
    (SELECT COUNT(*) FROM patients p WHERE p.company_id = c.id) as total_patients,
    -- Claim counts
    (SELECT COUNT(*) FROM professional_claims pc WHERE pc.company_id = c.id) as professional_claims_count,
    (SELECT COUNT(*) FROM institutional_claims ic WHERE ic.company_id = c.id) as institutional_claims_count,
    -- Billing stats
    (SELECT COUNT(*) FROM billing_statements bs WHERE bs.company_id = c.id) as billing_statements_count,
    (SELECT COALESCE(SUM(amount_due), 0) FROM billing_statements bs WHERE bs.company_id = c.id AND bs.status = 'pending') as pending_amount,
    (SELECT COALESCE(SUM(amount_due), 0) FROM billing_statements bs WHERE bs.company_id = c.id AND bs.status = 'paid') as paid_amount,
    -- Authorization stats
    (SELECT COUNT(*) FROM authorization_requests ar WHERE ar.company_id = c.id) as authorization_requests_count,
    -- Last activity
    (SELECT MAX(updated_at) FROM patients p WHERE p.company_id = c.id) as last_patient_activity,
    (SELECT MAX(updated_at) FROM professional_claims pc WHERE pc.company_id = c.id) as last_claim_activity
FROM companies c;

-- Grant access to authenticated users (RLS will filter)
GRANT SELECT ON super_admin_company_stats TO authenticated;

-- ============================================================================
-- 8. CREATE FUNCTION TO MAKE USER SUPER ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION make_super_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Update or insert profile with super admin flag
    INSERT INTO profiles (id, email, full_name, is_super_admin)
    VALUES (
        v_user_id,
        user_email,
        'Super Administrator',
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET is_super_admin = true;

    RAISE NOTICE 'User % is now a super admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. CREATE FUNCTION TO REMOVE SUPER ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION remove_super_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Remove super admin flag
    UPDATE profiles
    SET is_super_admin = false
    WHERE id = v_user_id;

    RAISE NOTICE 'Super admin removed from user %', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. CREATE SUPER ADMIN AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS super_admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create_company', 'delete_company', 'disable_company', 'add_user', etc.
    target_type VARCHAR(50), -- 'company', 'user', 'company_user'
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_super_admin_audit_log_super_admin_id 
ON super_admin_audit_log(super_admin_id);

CREATE INDEX IF NOT EXISTS idx_super_admin_audit_log_created_at 
ON super_admin_audit_log(created_at);

-- RLS for audit log (only super admins can view)
ALTER TABLE super_admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit logs"
    ON super_admin_audit_log FOR SELECT
    TO authenticated
    USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert audit logs"
    ON super_admin_audit_log FOR INSERT
    TO authenticated
    WITH CHECK (is_super_admin(auth.uid()));

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- To make a user super admin, run:
-- SELECT make_super_admin('your-email@example.com');
-- ============================================================================

