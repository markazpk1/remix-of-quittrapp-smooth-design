-- STEP 1: Create basic tables without foreign key constraints
-- Run this first

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (without family reference for now)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  city TEXT,
  madhab TEXT,
  goals JSONB,
  family_invite_code TEXT UNIQUE,
  family_id UUID,
  verified BOOLEAN DEFAULT FALSE,
  age_confirmed BOOLEAN DEFAULT FALSE,
  shariah_rules_agreed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Accounts Table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Goals & Progress
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  date DATE NOT NULL,
  prayers_completed INTEGER DEFAULT 0,
  quran_pages_read INTEGER DEFAULT 0,
  library_hours DECIMAL(5,2) DEFAULT 0,
  custom_habits JSONB,
  productivity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Streaks Tracking
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  prayer_streak INTEGER DEFAULT 0,
  quran_streak INTEGER DEFAULT 0,
  library_streak INTEGER DEFAULT 0,
  last_prayer_date DATE,
  last_quran_date DATE,
  last_library_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
