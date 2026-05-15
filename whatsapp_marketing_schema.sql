-- WhatsApp Marketing Schema

-- WhatsApp Templates Table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'MARKETING', -- 'MARKETING', 'UTILITY', 'AUTHENTICATION'
  language TEXT DEFAULT 'en_US',
  body TEXT NOT NULL,
  header_text TEXT,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]', -- List of buttons
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WhatsApp Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WhatsApp Settings Table
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number_id TEXT,
  waba_id TEXT,
  access_token TEXT,
  display_phone_number TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status ON whatsapp_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_templates(status);

-- Sample Data for WhatsApp Templates
INSERT INTO whatsapp_templates (name, category, body, status) VALUES
  ('welcome_msg', 'MARKETING', 'Hello {{1}}! Welcome to QuittrApp. We are happy to have you on board.', 'approved'),
  ('recovery_tip', 'MARKETING', 'Your daily recovery tip is here: {{1}}', 'approved'),
  ('promo_offer', 'MARKETING', 'Exclusive offer for you! Get 20% off on your next subscription upgrade.', 'pending')
ON CONFLICT DO NOTHING;

-- Sample Data for WhatsApp Campaigns
INSERT INTO whatsapp_campaigns (name, status, sent_count, delivered_count, read_count, last_sent_at) VALUES
  ('Welcome Onboarding', 'sent', 500, 485, 420, NOW() - INTERVAL '1 day'),
  ('Weekend Recovery Tips', 'draft', 0, 0, 0, NULL)
ON CONFLICT DO NOTHING;
