-- STEP 3: Create Social/Threads tables
-- Run this after Step 2

-- Threads (Social Feed)
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text',
  media_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  hasanat_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread Likes
CREATE TABLE IF NOT EXISTS thread_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Thread Comments
CREATE TABLE IF NOT EXISTS thread_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID,
  user_id UUID,
  content TEXT NOT NULL,
  hasanat_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread Reposts
CREATE TABLE IF NOT EXISTS thread_reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);
