-- Notification System Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- USER NOTIFICATION PREFERENCES TABLE
-- ============================================================================

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
    reminder_days INTEGER[] DEFAULT ARRAY[1, 3, 7], -- Days before due date to send reminders
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================================================
-- NOTIFICATION LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Details
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT,
    type VARCHAR(100) NOT NULL, -- 'status_change', 'due_date_reminder', 'overdue', 'approval', 'denial', 'task_assignment'
    
    -- Related Entity
    related_type VARCHAR(100), -- 'authorization_request', 'task', 'claim'
    related_id UUID,
    
    -- Delivery Status
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(50), -- 'sent', 'delivered', 'failed', 'bounced'
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_related ON notification_logs(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent ON notification_logs(sent, sent_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policies for user_notification_preferences
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

-- Policies for notification_logs
CREATE POLICY "Users can view their own notification logs"
    ON notification_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "System can insert notification logs"
    ON notification_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
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
-- VERIFICATION
-- ============================================================================

SELECT 'Notification system tables created successfully!' AS status;

