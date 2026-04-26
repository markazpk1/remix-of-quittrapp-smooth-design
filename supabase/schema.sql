-- The Momin Core Database Schema
-- A halal-first, productivity-first, safe social + learning platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  city TEXT,
  madhab TEXT, -- Hanafi, Shafi'i, Maliki, Hanbali
  goals JSONB, -- { prayer: boolean, quran: boolean, skills: string[] }
  family_invite_code TEXT UNIQUE,
  family_id UUID REFERENCES families(id),
  verified BOOLEAN DEFAULT FALSE,
  age_confirmed BOOLEAN DEFAULT FALSE,
  shariah_rules_agreed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Accounts Table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Goals & Progress
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  prayers_completed INTEGER DEFAULT 0, -- out of 5
  quran_pages_read INTEGER DEFAULT 0,
  library_hours DECIMAL(5,2) DEFAULT 0,
  custom_habits JSONB, -- { habit_name: { target: number, completed: number } }
  productivity_score INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Streaks Tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  prayer_streak INTEGER DEFAULT 0,
  quran_streak INTEGER DEFAULT 0,
  library_streak INTEGER DEFAULT 0,
  last_prayer_date DATE,
  last_quran_date DATE,
  last_library_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Library Content
CREATE TABLE library_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE library_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES library_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- audio_book, quran_recitation, prophetic_story, hadith, dua
  audio_url TEXT,
  text_content TEXT,
  narrator TEXT,
  qari TEXT, -- for Quran recitation
  duration INTEGER, -- in seconds
  language TEXT DEFAULT 'english',
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Library Progress
CREATE TABLE user_library_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  content_id UUID REFERENCES library_content(id),
  progress_percentage INTEGER DEFAULT 0, -- 0-100
  last_position INTEGER, -- for audio/video in seconds
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id),
  content_id UUID REFERENCES library_content(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threads (Social Feed)
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text', -- text, image, voice_note, poll
  media_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  hasanat_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE thread_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

CREATE TABLE thread_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  hasanat_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE thread_reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Productivity Tools
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  task TEXT,
  duration INTEGER, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  target_frequency INTEGER, -- per day/week
  frequency_type TEXT DEFAULT 'daily', -- daily, weekly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habit_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, user_id, date)
);

-- Zakat/Sadaqah Tracker
CREATE TABLE zakat_sadaqah (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- zakat, sadaqah
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood & Gratitude Journal
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  mood TEXT NOT NULL, -- happy, grateful, calm, anxious, etc.
  gratitude_text TEXT,
  quran_verse_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- info, reminder, achievement
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports (for moderation)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  content_type TEXT NOT NULL, -- thread, comment, user
  content_id UUID,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs (for transparency)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, date);
CREATE INDEX idx_library_content_category ON library_content(category_id);
CREATE INDEX idx_user_library_progress_user ON user_library_progress(user_id);
CREATE INDEX idx_threads_user ON threads(user_id);
CREATE INDEX idx_threads_created ON threads(created_at DESC);
CREATE INDEX idx_thread_likes_thread ON thread_likes(thread_id);
CREATE INDEX idx_thread_comments_thread ON thread_comments(thread_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_sadaqah ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Daily Goals
CREATE POLICY "Users can view own goals" ON daily_goals
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own goals" ON daily_goals
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own goals" ON daily_goals
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Streaks
CREATE POLICY "Users can view own streaks" ON streaks
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own streaks" ON streaks
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own streaks" ON streaks
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Library Content (Public read, admin write)
CREATE POLICY "Public can view library content" ON library_content
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert library content" ON library_content
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND verified = true
  ));

-- RLS Policies for User Library Progress
CREATE POLICY "Users can view own progress" ON user_library_progress
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own progress" ON user_library_progress
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own progress" ON user_library_progress
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Playlists
CREATE POLICY "Users can view own playlists" ON playlists
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own playlists" ON playlists
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own playlists" ON playlists
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Threads (Public read, user write own)
CREATE POLICY "Public can view threads" ON threads
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own threads" ON threads
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own threads" ON threads
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Thread Interactions
CREATE POLICY "Users can view thread likes" ON thread_likes
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON thread_likes
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own likes" ON thread_likes
  FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Public can view comments" ON thread_comments
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON thread_comments
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own reposts" ON thread_reposts
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own reposts" ON thread_reposts
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Productivity Tools
CREATE POLICY "Users can view own pomodoro" ON pomodoro_sessions
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own pomodoro" ON pomodoro_sessions
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own habit tracking" ON habit_tracking
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own habit tracking" ON habit_tracking
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own habit tracking" ON habit_tracking
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Zakat/Sadaqah
CREATE POLICY "Users can view own zakat" ON zakat_sadaqah
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own zakat" ON zakat_sadaqah
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Journal
CREATE POLICY "Users can view own journal" ON journal_entries
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own journal" ON journal_entries
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Reports
CREATE POLICY "Users can insert reports" ON reports
  FOR INSERT WITH CHECK (reporter_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND verified = true
  ));

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND verified = true
  ));

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, age_confirmed, shariah_rules_agreed)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'age_confirmed')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'shariah_rules_agreed')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON daily_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_content_updated_at BEFORE UPDATE ON library_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_library_progress_updated_at BEFORE UPDATE ON user_library_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
