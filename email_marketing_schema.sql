-- Email Marketing Schema

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Email Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS email_marketing_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'sent', 'paused'
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  type TEXT DEFAULT 'broadcast', -- 'broadcast', 'automation'
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_marketing_campaigns_status ON email_marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_status ON email_templates(status);

-- Sample Data for Email Templates
INSERT INTO email_templates (name, subject, body, status) VALUES
  ('Welcome Email', 'Welcome to QuittrApp! {{user_name}}', '<h1>Welcome aboard!</h1><p>We are excited to have you with us...</p>', 'published'),
  ('Weekly Tips', 'Recovery Tip of the Week: Persistence', '<p>This week we focus on the power of habit...</p>', 'published'),
  ('Premium Upgrade', 'Exclusive Offer: 50% Off Pro Plan', '<p>Upgrade today and unlock all features...</p>', 'draft')
ON CONFLICT DO NOTHING;

-- Sample Data for Campaigns
INSERT INTO email_marketing_campaigns (name, status, sent_count, open_count, click_count, last_sent_at, type) VALUES
  ('Welcome Series - New User', 'active', 1240, 845, 154, NOW() - INTERVAL '2 hours', 'automation'),
  ('Weekly Recovery Tips #14', 'sent', 8520, 1882, 408, NOW() - INTERVAL '2 days', 'broadcast'),
  ('Re-engagement Campaign', 'paused', 2450, 377, 29, NOW() - INTERVAL '9 days', 'automation')
ON CONFLICT DO NOTHING;

-- SMTP Settings Table
CREATE TABLE IF NOT EXISTS smtp_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  username TEXT,
  password TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  encryption TEXT DEFAULT 'tls', -- 'tls', 'ssl', 'none'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default SMTP settings (placeholder)
INSERT INTO smtp_settings (host, port, username, from_email, from_name) VALUES
  ('smtp.example.com', 587, 'user@example.com', 'noreply@quittrapp.com', 'QuittrApp')
ON CONFLICT DO NOTHING;
