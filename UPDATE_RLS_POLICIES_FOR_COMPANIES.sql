-- ============================================================================
-- UPDATE RLS POLICIES FOR COMPANY-BASED FILTERING
-- ============================================================================
-- This script updates all RLS policies to filter by company_id
-- Users can only see data from companies they belong to
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Get user's accessible company IDs
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_company_ids(user_uuid UUID)
RETURNS TABLE(company_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = user_uuid
    AND cu.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view patients" ON patients;
DROP POLICY IF EXISTS "Users can create patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;
DROP POLICY IF EXISTS "Users can delete patients" ON patients;

CREATE POLICY "Users can view patients from their companies"
    ON patients FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create patients in their companies"
    ON patients FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update patients in their companies"
    ON patients FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete patients in their companies"
    ON patients FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- PROFESSIONAL CLAIMS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own claims" ON professional_claims;
DROP POLICY IF EXISTS "Users can create claims" ON professional_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON professional_claims;
DROP POLICY IF EXISTS "Users can delete their own claims" ON professional_claims;

CREATE POLICY "Users can view claims from their companies"
    ON professional_claims FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create claims in their companies"
    ON professional_claims FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update claims in their companies"
    ON professional_claims FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete claims in their companies"
    ON professional_claims FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- INSTITUTIONAL CLAIMS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own claims" ON institutional_claims;
DROP POLICY IF EXISTS "Users can create claims" ON institutional_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON institutional_claims;
DROP POLICY IF EXISTS "Users can delete their own claims" ON institutional_claims;

CREATE POLICY "Users can view claims from their companies"
    ON institutional_claims FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create claims in their companies"
    ON institutional_claims FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update claims in their companies"
    ON institutional_claims FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete claims in their companies"
    ON institutional_claims FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- AUTHORIZATION REQUESTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can create authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can update their own authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can delete their own authorization requests" ON authorization_requests;

CREATE POLICY "Users can view authorization requests from their companies"
    ON authorization_requests FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create authorization requests in their companies"
    ON authorization_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update authorization requests in their companies"
    ON authorization_requests FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete authorization requests in their companies"
    ON authorization_requests FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- BILLING STATEMENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view billing statements" ON billing_statements;
DROP POLICY IF EXISTS "Users can create billing statements" ON billing_statements;
DROP POLICY IF EXISTS "Users can update billing statements" ON billing_statements;
DROP POLICY IF EXISTS "Users can delete billing statements" ON billing_statements;

CREATE POLICY "Users can view billing statements from their companies"
    ON billing_statements FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create billing statements in their companies"
    ON billing_statements FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update billing statements in their companies"
    ON billing_statements FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete billing statements in their companies"
    ON billing_statements FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- COLLECTIONS ACCOUNTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view collections accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can create collections accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can update collections accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can delete collections accounts" ON collections_accounts;

CREATE POLICY "Users can view collections accounts from their companies"
    ON collections_accounts FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create collections accounts in their companies"
    ON collections_accounts FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update collections accounts in their companies"
    ON collections_accounts FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete collections accounts in their companies"
    ON collections_accounts FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON appointments;

CREATE POLICY "Users can view appointments from their companies"
    ON appointments FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create appointments in their companies"
    ON appointments FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update appointments in their companies"
    ON appointments FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete appointments in their companies"
    ON appointments FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- PROVIDERS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view providers" ON providers;
DROP POLICY IF EXISTS "Users can create providers" ON providers;
DROP POLICY IF EXISTS "Users can update providers" ON providers;
DROP POLICY IF EXISTS "Users can delete providers" ON providers;

CREATE POLICY "Users can view providers from their companies"
    ON providers FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create providers in their companies"
    ON providers FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update providers in their companies"
    ON providers FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete providers in their companies"
    ON providers FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- FACILITIES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view facilities" ON facilities;
DROP POLICY IF EXISTS "Users can create facilities" ON facilities;
DROP POLICY IF EXISTS "Users can update facilities" ON facilities;
DROP POLICY IF EXISTS "Users can delete facilities" ON facilities;

CREATE POLICY "Users can view facilities from their companies"
    ON facilities FOR SELECT
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can create facilities in their companies"
    ON facilities FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can update facilities in their companies"
    ON facilities FOR UPDATE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

CREATE POLICY "Users can delete facilities in their companies"
    ON facilities FOR DELETE
    TO authenticated
    USING (
        company_id IN (SELECT company_id FROM get_user_company_ids(auth.uid()))
    );

-- ============================================================================
-- NOTE: Apply similar policies to all other tables
-- ============================================================================
-- For remaining tables (payments, payment_plans, eligibility_verifications, etc.),
-- apply the same pattern:
-- 1. DROP existing policies
-- 2. CREATE new policies with company_id filtering
-- ============================================================================

