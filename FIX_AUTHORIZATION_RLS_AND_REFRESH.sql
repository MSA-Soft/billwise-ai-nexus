-- ============================================================================
-- FIX ALL RLS POLICIES FOR AUTHORIZATION SYSTEM
-- ============================================================================
-- This fixes issues with authorization saving, status updates, and task management
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. FIX authorization_requests RLS POLICIES
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE authorization_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can create authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can update their own authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can delete their own authorization requests" ON authorization_requests;

-- Create comprehensive policies
CREATE POLICY "Users can view their own authorization requests"
    ON authorization_requests FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create authorization requests"
    ON authorization_requests FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own authorization requests"
    ON authorization_requests FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own authorization requests"
    ON authorization_requests FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- 2. FIX authorization_tasks RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view tasks assigned to them or created by them" ON authorization_tasks;
DROP POLICY IF EXISTS "Users can create tasks for their authorization requests" ON authorization_tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them or their own tasks" ON authorization_tasks;

-- Create comprehensive policies
CREATE POLICY "Users can view tasks for their authorizations"
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

CREATE POLICY "Users can create tasks for their authorizations"
    ON authorization_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_tasks.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks for their authorizations"
    ON authorization_tasks FOR UPDATE
    TO authenticated
    USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_tasks.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    )
    WITH CHECK (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM authorization_requests ar
            WHERE ar.id = authorization_tasks.authorization_request_id
            AND ar.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. FIX authorization_task_history RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view history of tasks they have access to" ON authorization_task_history;
DROP POLICY IF EXISTS "Users can insert history for tasks they have access to" ON authorization_task_history;

-- Create comprehensive policies
CREATE POLICY "Users can view history of tasks they have access to"
    ON authorization_task_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorization_tasks at
            WHERE at.id = authorization_task_history.task_id
            AND (
                at.assigned_to = auth.uid() OR 
                at.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM authorization_requests ar
                    WHERE ar.id = at.authorization_request_id
                    AND ar.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert history for tasks they have access to"
    ON authorization_task_history FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow if user has access to the task
        EXISTS (
            SELECT 1 FROM authorization_tasks at
            WHERE at.id = authorization_task_history.task_id
            AND (
                at.assigned_to = auth.uid() OR 
                at.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM authorization_requests ar
                    WHERE ar.id = at.authorization_request_id
                    AND ar.user_id = auth.uid()
                )
            )
        )
        OR
        -- Allow if the changed_by field matches current user (for trigger inserts)
        authorization_task_history.changed_by = auth.uid()
    );

-- ============================================================================
-- 4. FIX authorization_task_comments RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments on tasks they have access to" ON authorization_task_comments;
DROP POLICY IF EXISTS "Users can create comments on tasks they have access to" ON authorization_task_comments;

-- Create comprehensive policies
CREATE POLICY "Users can view comments on tasks they have access to"
    ON authorization_task_comments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorization_tasks at
            WHERE at.id = authorization_task_comments.task_id
            AND (
                at.assigned_to = auth.uid() OR 
                at.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM authorization_requests ar
                    WHERE ar.id = at.authorization_request_id
                    AND ar.user_id = auth.uid()
                )
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
                at.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM authorization_requests ar
                    WHERE ar.id = at.authorization_request_id
                    AND ar.user_id = auth.uid()
                )
            )
        )
    );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '✅ All RLS policies for authorization system updated successfully!' AS status;

