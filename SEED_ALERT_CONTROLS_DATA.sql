-- ============================================================================
-- SEED DATA FOR ALERT_CONTROLS TABLE
-- ============================================================================
-- This file contains sample alert control data for testing and development
-- Run this in Supabase SQL Editor after creating the alert_controls table
-- ============================================================================

-- Insert sample alert controls
-- Note: Using consistent snake_case naming for all columns
INSERT INTO alert_controls (
    alert_type,
    patient,
    message,
    create_user,
    is_global,
    patient_section,
    claim_section,
    payment_section,
    appointment_section,
    create_date_range,
    create_date_start,
    create_date_end,
    effective_start_date_range,
    effective_start_date_start,
    effective_start_date_end,
    effective_end_date_range,
    effective_end_date_start,
    effective_end_date_end,
    include_deleted,
    status,
    is_active
) VALUES
-- Alert 1: Patient Payment Overdue
(
    'Patient',
    'John Smith',
    'Payment overdue - Account balance exceeds $500',
    'Me',
    false,
    true,
    false,
    true,
    false,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 2: Claim Authorization Required
(
    'Claim',
    'Jane Doe',
    'Authorization required before submitting claim',
    'Admin',
    false,
    false,
    true,
    false,
    false,
    'This Week',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 3: Payment Processing Issue
(
    'Payment',
    'Robert Johnson',
    'Payment processing failed - Credit card declined',
    'Billing Manager',
    false,
    false,
    false,
    true,
    false,
    'Today',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 4: Appointment Reminder
(
    'Appointment',
    'Mary Williams',
    'Upcoming appointment scheduled for next week',
    'Provider',
    true,
    true,
    false,
    false,
    true,
    'All',
    NULL,
    NULL,
    'This Week',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 5: System Maintenance
(
    'System',
    NULL,
    'Scheduled system maintenance tonight at 11 PM',
    'Admin',
    true,
    true,
    true,
    true,
    true,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 6: Billing Alert
(
    'Billing',
    'David Brown',
    'Insurance claim denied - Requires resubmission',
    'Billing Manager',
    false,
    false,
    true,
    false,
    false,
    'Last Week',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 7: Authorization Alert
(
    'Authorization',
    'Sarah Davis',
    'Prior authorization expired - Renewal required',
    'Provider',
    false,
    true,
    true,
    false,
    false,
    'This Month',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'active',
    true
),

-- Alert 8: Inactive Alert (for testing)
(
    'Patient',
    'Inactive Patient',
    'This alert is no longer active',
    'Admin',
    false,
    false,
    false,
    false,
    false,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    'All',
    NULL,
    NULL,
    false,
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_alerts,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_alerts
FROM alert_controls;

-- Display all inserted alert controls
SELECT 
    alert_type,
    patient,
    message,
    create_user,
    status,
    created_at
FROM alert_controls
ORDER BY created_at DESC;

