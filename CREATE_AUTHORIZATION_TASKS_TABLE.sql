-- Authorization Task Management Tables
-- Based on X12 278 standards and industry best practices
-- Run this in Supabase SQL Editor

-- ============================================================================
-- AUTHORIZATION TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Related Authorization Request
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    
    -- Task Information
    task_type VARCHAR(100) NOT NULL, -- 'submit', 'follow_up', 'appeal', 'documentation', 'review', 'resubmit'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority and Urgency
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent', 'critical'
    urgency_level VARCHAR(50), -- 'routine', 'urgent', 'stat' (from authorization request)
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'on_hold', 'completed', 'cancelled', 'overdue'
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Dates
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- X12 278 Compliance
    x12_submission_status VARCHAR(50), -- 'not_submitted', 'submitted', 'acknowledged', 'response_received'
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
    attachments JSONB, -- Array of file references
    
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

-- ============================================================================
-- AUTHORIZATION TASK COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES authorization_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUTHORIZATION TASK HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES authorization_tasks(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'created', 'assigned', 'status_changed', 'priority_changed', 'due_date_changed', 'completed', 'cancelled'
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUTHORIZATION TASK TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    estimated_duration_minutes INTEGER,
    default_due_date_days INTEGER, -- Days from creation to due date
    required_fields JSONB, -- Fields that must be completed
    workflow_steps JSONB, -- Steps in the task workflow
    payer_specific BOOLEAN DEFAULT false,
    payer_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_auth_tasks_request_id ON authorization_tasks(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_assigned_to ON authorization_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_status ON authorization_tasks(status);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_priority ON authorization_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_due_date ON authorization_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_type ON authorization_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_auth_tasks_created_at ON authorization_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_task_comments_task_id ON authorization_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_auth_task_history_task_id ON authorization_task_history(task_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE authorization_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_task_templates ENABLE ROW LEVEL SECURITY;

-- Policies for authorization_tasks
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

-- Policies for authorization_task_comments
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

-- Policies for authorization_task_history
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

-- Policies for authorization_task_templates
CREATE POLICY "All authenticated users can view active templates"
    ON authorization_task_templates FOR SELECT
    TO authenticated
    USING (is_active = true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
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
-- VERIFICATION
-- ============================================================================

SELECT 'Authorization task management tables created successfully!' AS status;

