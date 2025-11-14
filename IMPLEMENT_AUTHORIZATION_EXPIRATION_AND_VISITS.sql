-- ============================================================================
-- IMPLEMENT AUTHORIZATION EXPIRATION & VISIT MANAGEMENT
-- ============================================================================
-- This script adds expiration tracking and visit usage management to the
-- authorization system based on industry best practices
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD EXPIRATION TRACKING FIELDS TO authorization_requests
-- ============================================================================

-- Add expiration date (this is when the authorization expires)
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS authorization_expiration_date DATE;

-- Add expiration alert tracking (JSONB array of alert tiers sent)
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS expiration_alert_sent_tiers JSONB DEFAULT '[]'::jsonb;

-- Add renewal tracking
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_initiated BOOLEAN DEFAULT false;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_initiated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_of_authorization_id UUID REFERENCES authorization_requests(id) ON DELETE SET NULL;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(50); -- 'not_started', 'preparing', 'submitted', 'approved', 'denied'
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_expected_response_date DATE;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_actual_response_date DATE;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS renewal_auth_number VARCHAR(100);

-- Add expiration handling
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS expiration_handled BOOLEAN DEFAULT false;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS expiration_action VARCHAR(50); -- 'renewal_requested', 'new_auth_created', 'service_cancelled'
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS expiration_impact_notes TEXT;

-- ============================================================================
-- STEP 2: ADD VISIT TRACKING FIELDS TO authorization_requests
-- ============================================================================

-- Add visit count fields
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS visits_authorized INTEGER DEFAULT 0;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS visits_used INTEGER DEFAULT 0;

-- Add visit date tracking
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS last_visit_date DATE;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS first_visit_date DATE;
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS exhausted_at TIMESTAMP WITH TIME ZONE;

-- Add computed field for visits remaining (using generated column)
-- Note: PostgreSQL doesn't support computed columns directly, so we'll use a function
-- For now, we'll calculate it in the application layer

-- ============================================================================
-- STEP 3: CREATE authorization_visit_usage TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_visit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    service_type VARCHAR(100),
    cpt_codes TEXT[],
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    visit_number INTEGER NOT NULL, -- Sequential visit number (1, 2, 3...)
    status VARCHAR(50) DEFAULT 'completed', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for expiration queries
CREATE INDEX IF NOT EXISTS idx_auth_requests_expiration_date 
ON authorization_requests(authorization_expiration_date) 
WHERE authorization_expiration_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auth_requests_expired 
ON authorization_requests(expired_at) 
WHERE expired_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auth_requests_renewal 
ON authorization_requests(renewal_of_authorization_id) 
WHERE renewal_of_authorization_id IS NOT NULL;

-- Indexes for visit usage queries
CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_auth_id 
ON authorization_visit_usage(authorization_request_id);

CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_appt_id 
ON authorization_visit_usage(appointment_id) 
WHERE appointment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_date 
ON authorization_visit_usage(visit_date);

CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_status 
ON authorization_visit_usage(status);

-- ============================================================================
-- STEP 5: CREATE FUNCTIONS FOR AUTOMATED UPDATES
-- ============================================================================

-- Function to calculate visits remaining
CREATE OR REPLACE FUNCTION calculate_visits_remaining(
    auth_id UUID
) RETURNS INTEGER AS $$
DECLARE
    authorized_count INTEGER;
    used_count INTEGER;
BEGIN
    SELECT 
        COALESCE(visits_authorized, 0),
        COALESCE(visits_used, 0)
    INTO authorized_count, used_count
    FROM authorization_requests
    WHERE id = auth_id;
    
    RETURN GREATEST(0, authorized_count - used_count);
END;
$$ LANGUAGE plpgsql;

-- Function to check if authorization is expired
CREATE OR REPLACE FUNCTION is_authorization_expired(
    auth_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    exp_date DATE;
    expired_at_ts TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT authorization_expiration_date, expired_at
    INTO exp_date, expired_at_ts
    FROM authorization_requests
    WHERE id = auth_id;
    
    -- If already marked as expired, return true
    IF expired_at_ts IS NOT NULL THEN
        RETURN true;
    END IF;
    
    -- Check expiration date
    IF exp_date IS NOT NULL AND exp_date < CURRENT_DATE THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to check if visits are exhausted
CREATE OR REPLACE FUNCTION is_visits_exhausted(
    auth_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    authorized_count INTEGER;
    used_count INTEGER;
BEGIN
    SELECT 
        COALESCE(visits_authorized, 0),
        COALESCE(visits_used, 0)
    INTO authorized_count, used_count
    FROM authorization_requests
    WHERE id = auth_id;
    
    RETURN used_count >= authorized_count AND authorized_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get days until expiration
CREATE OR REPLACE FUNCTION days_until_expiration(
    auth_id UUID
) RETURNS INTEGER AS $$
DECLARE
    exp_date DATE;
BEGIN
    SELECT authorization_expiration_date
    INTO exp_date
    FROM authorization_requests
    WHERE id = auth_id;
    
    IF exp_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN exp_date - CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: CREATE TRIGGER TO AUTO-UPDATE VISIT COUNTS
-- ============================================================================

-- Function to update visit counts when visit is recorded
CREATE OR REPLACE FUNCTION update_authorization_visit_counts()
RETURNS TRIGGER AS $$
DECLARE
    auth_id UUID;
    visit_num INTEGER;
    first_visit_date_val DATE;
BEGIN
    auth_id := NEW.authorization_request_id;
    visit_num := NEW.visit_number;
    
    -- Update visits_used count
    UPDATE authorization_requests
    SET 
        visits_used = visit_num,
        last_visit_date = NEW.visit_date,
        first_visit_date = COALESCE(
            first_visit_date,
            NEW.visit_date
        ),
        updated_at = NOW()
    WHERE id = auth_id;
    
    -- Check if exhausted and update status
    IF is_visits_exhausted(auth_id) THEN
        UPDATE authorization_requests
        SET 
            exhausted_at = NOW(),
            status = CASE 
                WHEN status = 'approved' THEN 'exhausted'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = auth_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_visit_counts ON authorization_visit_usage;
CREATE TRIGGER trigger_update_visit_counts
    AFTER INSERT ON authorization_visit_usage
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_authorization_visit_counts();

-- ============================================================================
-- STEP 7: CREATE TRIGGER TO AUTO-MARK EXPIRED
-- ============================================================================

-- Function to mark authorization as expired
CREATE OR REPLACE FUNCTION check_and_mark_expired()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if expiration date has passed and not already marked
    IF NEW.authorization_expiration_date IS NOT NULL 
       AND NEW.authorization_expiration_date < CURRENT_DATE
       AND NEW.expired_at IS NULL THEN
        
        UPDATE authorization_requests
        SET 
            expired_at = NOW(),
            status = CASE 
                WHEN status = 'approved' THEN 'expired'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (runs on update to check expiration)
DROP TRIGGER IF EXISTS trigger_check_expired ON authorization_requests;
CREATE TRIGGER trigger_check_expired
    AFTER UPDATE OF authorization_expiration_date, status ON authorization_requests
    FOR EACH ROW
    EXECUTE FUNCTION check_and_mark_expired();

-- ============================================================================
-- STEP 8: ENABLE RLS FOR NEW TABLE
-- ============================================================================

ALTER TABLE authorization_visit_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view visit usage for authorizations they have access to
CREATE POLICY "Users can view visit usage for their authorizations"
    ON authorization_visit_usage FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_visit_usage.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

-- RLS Policy: Users can insert visit usage for their authorizations
CREATE POLICY "Users can insert visit usage for their authorizations"
    ON authorization_visit_usage FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_visit_usage.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

-- RLS Policy: Users can update visit usage for their authorizations
CREATE POLICY "Users can update visit usage for their authorizations"
    ON authorization_visit_usage FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_visit_usage.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

-- ============================================================================
-- STEP 9: MIGRATE EXISTING DATA (if needed)
-- ============================================================================

-- If service_end_date exists, use it as expiration_date for approved authorizations
UPDATE authorization_requests
SET authorization_expiration_date = service_end_date
WHERE authorization_expiration_date IS NULL 
  AND service_end_date IS NOT NULL
  AND status = 'approved';

-- If units_requested exists, use it as visits_authorized
UPDATE authorization_requests
SET visits_authorized = units_requested
WHERE visits_authorized = 0 
  AND units_requested > 0
  AND status = 'approved';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Authorization expiration and visit management tables and functions created successfully!' AS status;

-- Test queries
SELECT 
    'Expiration fields added' AS check_1,
    COUNT(*) AS count
FROM information_schema.columns 
WHERE table_name = 'authorization_requests' 
  AND column_name IN ('authorization_expiration_date', 'visits_authorized', 'visits_used');

SELECT 
    'Visit usage table created' AS check_2,
    COUNT(*) AS count
FROM information_schema.tables 
WHERE table_name = 'authorization_visit_usage';

SELECT 
    'Functions created' AS check_3,
    COUNT(*) AS count
FROM information_schema.routines 
WHERE routine_name IN (
    'calculate_visits_remaining',
    'is_authorization_expired',
    'is_visits_exhausted',
    'days_until_expiration'
);

