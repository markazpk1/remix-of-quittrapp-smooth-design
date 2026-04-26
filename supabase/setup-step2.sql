-- STEP 2: Create Library tables
-- Run this after Step 1

-- Library Categories
CREATE TABLE IF NOT EXISTS library_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library Content
CREATE TABLE IF NOT EXISTS library_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  audio_url TEXT,
  text_content TEXT,
  narrator TEXT,
  qari TEXT,
  duration INTEGER,
  language TEXT DEFAULT 'english',
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Library Progress
CREATE TABLE IF NOT EXISTS user_library_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  content_id UUID,
  progress_percentage INTEGER DEFAULT 0,
  last_position INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist Items
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID,
  content_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
