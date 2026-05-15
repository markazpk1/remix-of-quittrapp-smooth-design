-- Agentic AI & Trainer Schema

-- AI Agent Settings
CREATE TABLE IF NOT EXISTS ai_agent_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT DEFAULT 'Quittr Guardian',
  provider TEXT DEFAULT 'openai', -- 'openai', 'google', 'anthropic'
  model_name TEXT DEFAULT 'gpt-4o',
  system_prompt TEXT,
  api_key TEXT, -- Encrypted or stored as secret
  is_active BOOLEAN DEFAULT true,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2048,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI Generated Lessons
CREATE TABLE IF NOT EXISTS ai_generated_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  islamic_context TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'published'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI Training & Knowledge Base
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT, -- 'video', 'article', 'manual'
  source_url TEXT,
  embedding VECTOR(1536), -- For RAG if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI Chat Logs (Admin Interaction)
CREATE TABLE IF NOT EXISTS ai_admin_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  action_taken TEXT, -- 'created_lesson', 'found_video', 'none'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial Settings
INSERT INTO ai_agent_settings (agent_name, system_prompt, model_name) VALUES
  ('Quittr Guardian', 'You are an expert recovery coach specializing in helping users overcome porn addiction through a combination of psychological techniques and Islamic motivational teachings. Your goal is to help the admin create lessons and find relevant resources.', 'gpt-4o')
ON CONFLICT DO NOTHING;
