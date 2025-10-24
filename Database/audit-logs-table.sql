-- Audit logs table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details TEXT, -- Encrypted JSON data
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Function to automatically log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_resource_id TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource, resource_id, details,
    ip_address, user_agent, success, error_message
  ) VALUES (
    p_user_id, p_action, p_resource, p_resource_id, p_details::TEXT,
    p_ip_address, p_user_agent, p_success, p_error_message
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit trail for a resource
CREATE OR REPLACE FUNCTION get_resource_audit_trail(
  p_resource TEXT,
  p_resource_id TEXT,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  resource TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id, al.user_id, al.action, al.resource, al.resource_id,
    al.details, al.ip_address, al.user_agent, al.timestamp,
    al.success, al.error_message
  FROM audit_logs al
  WHERE al.resource = p_resource 
    AND al.resource_id = p_resource_id
  ORDER BY al.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity
CREATE OR REPLACE FUNCTION get_user_activity(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  resource TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id, al.user_id, al.action, al.resource, al.resource_id,
    al.details, al.ip_address, al.user_agent, al.timestamp,
    al.success, al.error_message
  FROM audit_logs al
  WHERE al.user_id = p_user_id
  ORDER BY al.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get failed login attempts
CREATE OR REPLACE FUNCTION get_failed_logins(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  resource TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id, al.user_id, al.action, al.resource, al.resource_id,
    al.details, al.ip_address, al.user_agent, al.timestamp,
    al.success, al.error_message
  FROM audit_logs al
  WHERE al.action = 'login' 
    AND al.success = false
    AND (p_start_date IS NULL OR al.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.timestamp <= p_end_date)
  ORDER BY al.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs (for compliance retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  p_retention_days INTEGER DEFAULT 2555 -- 7 years for HIPAA
) RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * p_retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_resource_audit_trail TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_failed_logins TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO service_role;
