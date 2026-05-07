
-- Platform settings table (Global configuration)
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'general', 'branding', 'security', 'smtp'
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active', -- active, revoked
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, draft
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  connected BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO platform_settings (category, key, value) VALUES
  ('general', 'site_name', '"QuittrApp"'),
  ('general', 'support_email', '"support@quittrapp.com"'),
  ('general', 'site_url', '"https://quittrapp.com"'),
  ('general', 'default_timezone', '"utc"'),
  ('general', 'features', '[
    {"label": "User Registration", "desc": "Allow new users to sign up", "value": true},
    {"label": "Community Forum", "desc": "Enable the community discussion board", "value": true},
    {"label": "AI Coaching", "desc": "Enable AI-powered recovery coaching", "value": false}
  ]'),
  ('branding', 'logo', '"Q"'),
  ('branding', 'brand_color', '"#7C3AED"'),
  ('branding', 'app_description', '"Break free from addiction with science-backed tools."'),
  ('security', 'settings', '[
    {"label": "Two-Factor Auth", "desc": "Require 2FA for all admin accounts", "value": false},
    {"label": "Login Notifications", "desc": "Notify users of new login attempts", "value": true},
    {"label": "Session Timeout", "desc": "Automatically log out inactive users", "value": true}
  ]'),
  ('security', 'password_policy', '{"minLength": 8}')
ON CONFLICT (category, key) DO NOTHING;

INSERT INTO integrations (name, description, icon, connected) VALUES
  ('Stripe', 'Payment processing and subscriptions', '💳', true),
  ('SendGrid', 'Transactional email delivery', '📧', true),
  ('Twilio', 'SMS notifications and verification', '📱', false),
  ('Slack', 'Internal team notifications', '💬', false)
ON CONFLICT (name) DO NOTHING;
