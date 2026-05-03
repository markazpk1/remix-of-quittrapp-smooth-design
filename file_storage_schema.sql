-- Create file storage schema for lessons and media files

-- Create a table to track uploaded files
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'video', 'audio', 'document', 'image'
  file_size INTEGER NOT NULL, -- in bytes
  file_path TEXT NOT NULL, -- Storage path
  public_url TEXT, -- Public URL from Supabase Storage
  mime_type TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_files_type ON uploaded_files(file_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_name ON uploaded_files(file_name);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created ON uploaded_files(created_at);

-- Create a table for lesson content with file references
CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'article', 'video', 'audio'
  content TEXT, -- For articles
  file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL, -- For video/audio
  duration TEXT, -- Duration for video/audio
  status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
  view_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for lesson content
CREATE INDEX IF NOT EXISTS idx_lesson_content_type ON lesson_content(content_type);
CREATE INDEX IF NOT EXISTS idx_lesson_content_category ON lesson_content(category);
CREATE INDEX IF NOT EXISTS idx_lesson_content_status ON lesson_content(status);
CREATE INDEX IF NOT EXISTS idx_lesson_content_file ON lesson_content(file_id);

-- Create a table for sound therapy tracks
CREATE TABLE IF NOT EXISTS sound_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
  duration TEXT,
  play_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sound tracks
CREATE INDEX IF NOT EXISTS idx_sound_tracks_category ON sound_tracks(category);
CREATE INDEX IF NOT EXISTS idx_sound_tracks_status ON sound_tracks(status);

-- Create a table for voice therapy tracks
CREATE TABLE IF NOT EXISTS voice_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
  duration TEXT,
  file_size TEXT,
  source TEXT DEFAULT 'uploaded', -- 'uploaded', 'tts'
  play_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for voice tracks
CREATE INDEX IF NOT EXISTS idx_voice_tracks_category ON voice_tracks(category);
CREATE INDEX IF NOT EXISTS idx_voice_tracks_voice ON voice_tracks(voice_name);
CREATE INDEX IF NOT EXISTS idx_voice_tracks_status ON voice_tracks(status);
