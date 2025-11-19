-- ============================================================================
-- FIX RLS POLICY FOR authorization_task_history
-- ============================================================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert history for tasks they have access to" ON authorization_task_history;

-- Create INSERT policy that allows history entries to be created
-- This policy allows inserts when:
-- 1. The user has access to the related task (assigned to them, created by them, or owns the auth request)
-- 2. OR the changed_by field matches the current user (for trigger-created entries)
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

-- Also ensure the trigger function can insert history
-- Update the trigger function to use SECURITY DEFINER if needed
-- But first, let's try with the policy above

-- If the above doesn't work, uncomment the following to make the function bypass RLS:
-- DROP FUNCTION IF EXISTS create_task_history_entry() CASCADE;
-- 
-- CREATE OR REPLACE FUNCTION create_task_history_entry()
-- RETURNS TRIGGER 
-- SECURITY DEFINER
-- SET search_path = public
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--     IF TG_OP = 'INSERT' THEN
--         INSERT INTO authorization_task_history (task_id, action, new_value, changed_by)
--         VALUES (NEW.id, 'created', row_to_json(NEW), NEW.created_by);
--     ELSIF TG_OP = 'UPDATE' THEN
--         IF OLD.status != NEW.status THEN
--             INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
--             VALUES (NEW.id, 'status_changed', 
--                 jsonb_build_object('status', OLD.status), 
--                 jsonb_build_object('status', NEW.status),
--                 auth.uid());
--         END IF;
--         IF OLD.priority != NEW.priority THEN
--             INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
--             VALUES (NEW.id, 'priority_changed', 
--                 jsonb_build_object('priority', OLD.priority), 
--                 jsonb_build_object('priority', NEW.priority),
--                 auth.uid());
--         END IF;
--         IF OLD.assigned_to != NEW.assigned_to THEN
--             INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
--             VALUES (NEW.id, 'assigned', 
--                 jsonb_build_object('assigned_to', OLD.assigned_to), 
--                 jsonb_build_object('assigned_to', NEW.assigned_to),
--                 auth.uid());
--         END IF;
--         IF OLD.due_date != NEW.due_date THEN
--             INSERT INTO authorization_task_history (task_id, action, old_value, new_value, changed_by)
--             VALUES (NEW.id, 'due_date_changed', 
--                 jsonb_build_object('due_date', OLD.due_date), 
--                 jsonb_build_object('due_date', NEW.due_date),
--                 auth.uid());
--         END IF;
--         IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
--             INSERT INTO authorization_task_history (task_id, action, new_value, changed_by)
--             VALUES (NEW.id, 'completed', row_to_json(NEW), auth.uid());
--         END IF;
--     END IF;
--     RETURN NEW;
-- END;
-- $$;
-- 
-- CREATE TRIGGER create_task_history_entry
--     AFTER INSERT OR UPDATE ON authorization_tasks
--     FOR EACH ROW
--     EXECUTE FUNCTION create_task_history_entry();

SELECT '✅ RLS policy for authorization_task_history updated successfully!' AS status;

