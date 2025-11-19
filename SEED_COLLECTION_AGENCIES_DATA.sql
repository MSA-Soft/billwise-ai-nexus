-- ============================================================================
-- SEED DATA FOR COLLECTION_AGENCIES TABLE
-- ============================================================================
-- This file contains sample collection agency data for testing and development
-- Run this in Supabase SQL Editor after creating the collection_agencies table
-- ============================================================================

-- Insert sample collection agencies
-- Note: Using consistent snake_case naming for all columns
INSERT INTO collection_agencies (
    name,
    address,
    address_line2,
    city,
    state,
    zip_code,
    phone,
    fax,
    email,
    agency_type,
    status,
    is_active,
    commission_rate,
    notes
) VALUES
-- Agency 1: Medical Collections Specialist
(
    'ABC Collection Services',
    '123 Collection Street',
    'Suite 100',
    'Los Angeles',
    'CA',
    '90210',
    '(555) 123-4567',
    '(555) 123-4568',
    'info@abccollections.com',
    'Medical Collections',
    'active',
    true,
    25.00,
    'Specializes in medical debt collection with high recovery rates'
),

-- Agency 2: General Collections
(
    'Premier Recovery Group',
    '456 Recovery Avenue',
    NULL,
    'New York',
    'NY',
    '10001',
    '(555) 987-6543',
    '(555) 987-6544',
    'contact@premierrecovery.com',
    'General Collections',
    'active',
    true,
    30.00,
    'Full-service collection agency with nationwide coverage'
),

-- Agency 3: Healthcare Collections
(
    'MedRecovery Solutions',
    '789 Healthcare Drive',
    'Floor 5',
    'Chicago',
    'IL',
    '60601',
    '(312) 555-1111',
    '(312) 555-1112',
    'info@medrecovery.com',
    'Healthcare Collections',
    'active',
    true,
    28.50,
    'Expert in healthcare billing and collections'
),

-- Agency 4: Commercial Collections
(
    'Commercial Debt Recovery',
    '321 Business Boulevard',
    NULL,
    'Houston',
    'TX',
    '77001',
    '(713) 555-2222',
    '(713) 555-2223',
    'info@commercialdebt.com',
    'Commercial Collections',
    'active',
    true,
    35.00,
    'Focuses on B2B debt collection services'
),

-- Agency 5: Consumer Collections
(
    'Consumer Recovery Network',
    '654 Consumer Lane',
    'Building B',
    'Phoenix',
    'AZ',
    '85001',
    '(602) 555-3333',
    '(602) 555-3334',
    'contact@consumerrecovery.com',
    'Consumer Collections',
    'active',
    true,
    22.00,
    'Consumer-focused collection agency with compliance expertise'
),

-- Agency 6: Medical Collections (Inactive for testing)
(
    'Inactive Collection Agency',
    '999 Closed Street',
    NULL,
    'Detroit',
    'MI',
    '48201',
    '(313) 555-0000',
    NULL,
    'inactive@example.com',
    'Medical Collections',
    'inactive',
    false,
    0.00,
    'This agency is no longer active'
);

-- Verify the insert
SELECT 
    COUNT(*) as total_agencies,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_agencies,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_agencies
FROM collection_agencies;

-- Display all inserted collection agencies
SELECT 
    name,
    agency_type,
    city,
    state,
    commission_rate,
    status,
    created_at
FROM collection_agencies
ORDER BY created_at DESC;

