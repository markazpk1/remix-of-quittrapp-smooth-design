-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL DEFAULT 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0'),
  subject TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'technical', 'billing', 'feature_request', 'bug_report'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);

-- Create ticket replies table
CREATE TABLE IF NOT EXISTS ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  reply_type TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'user'
  replier_name TEXT NOT NULL,
  replier_email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ticket replies
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_created_at ON ticket_replies(created_at);

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 1000000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM support_tickets WHERE ticket_number = new_number);
    counter := counter + 1;
    EXIT WHEN counter > 10; -- Prevent infinite loop
  END LOOP;
  
  IF counter > 10 THEN
    new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDDHHMISS') || '-' || LPAD(floor(random() * 1000)::text, 3, '0');
  END IF;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Update trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'resolved' THEN
      NEW.resolved_at = NOW();
    ELSIF NEW.status = 'closed' THEN
      NEW.closed_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for support tickets
CREATE TRIGGER support_tickets_update_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Insert sample support tickets
INSERT INTO support_tickets (subject, user_id, user_name, user_email, priority, category, description) VALUES
  ('Login Issues', 'user_001', 'John Doe', 'john@example.com', 'high', 'technical', 'User cannot log in to their account after password reset'),
  ('Billing Question', 'user_002', 'Jane Smith', 'jane@example.com', 'medium', 'billing', 'Question about recent subscription charge'),
  ('Feature Request', 'user_003', 'Bob Johnson', 'bob@example.com', 'low', 'feature_request', 'Would like to see dark mode option'),
  ('Bug Report', 'user_004', 'Alice Brown', 'alice@example.com', 'critical', 'bug_report', 'App crashes when uploading files')
ON CONFLICT (ticket_number) DO NOTHING;
