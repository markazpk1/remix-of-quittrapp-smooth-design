
-- Audit logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- e.g., 'Delete User', 'Update Plan'
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL, -- cache name in case user is deleted
  target TEXT NOT NULL, -- e.g., 'User: john@example.com', 'Plan: Pro'
  category TEXT NOT NULL DEFAULT 'other', -- moderation, permissions, content, settings, auth, etc.
  severity TEXT NOT NULL DEFAULT 'info', -- high, medium, low, info
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Function to automatically log actions (optional, but good practice)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_actor_id UUID,
  p_actor_name TEXT,
  p_target TEXT,
  p_category TEXT,
  p_severity TEXT DEFAULT 'info',
  p_ip TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (action, actor_id, actor_name, target, category, severity, ip_address, metadata)
  VALUES (p_action, p_actor_id, p_actor_name, p_target, p_category, p_severity, p_ip, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
