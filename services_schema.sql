-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  users_active INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO services (name, description, category, enabled, users_active, version) VALUES 
  ('Islamic Library', 'Access to Islamic texts, Quran, Hadith collections and scholarly resources', 'Education', true, 245, '2.1.0'),
  ('Community Threads', 'Discussion forums for Islamic topics and community support', 'Social', true, 189, '1.5.0'),
  ('Daily Goals', 'Set and track daily Islamic goals and habits', 'Wellness', true, 312, '3.0.0'),
  ('Productivity Timer', 'Pomodoro-style timer for focused work and study sessions', 'Wellness', true, 156, '1.2.0'),
  ('Prayer Tracker', 'Track and manage daily prayer times and reminders', 'Recovery', true, 423, '2.3.0'),
  ('Analytics Dashboard', 'View detailed analytics about app usage and engagement', 'Analytics', true, 89, '1.8.0'),
  ('Content Moderation', 'AI-powered content filtering and moderation tools', 'Safety', true, 67, '1.1.0'),
  ('Q&A Assistant', 'AI-powered assistant for Islamic questions and answers', 'AI', false, 0, '1.0.0')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_enabled ON services(enabled);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
