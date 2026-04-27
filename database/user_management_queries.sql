-- ========================================
-- User Management SQL Queries
-- ========================================
-- These queries are for manual database operations
-- Run them in your Supabase SQL editor or database console

-- ========================================
-- 1. CREATE TABLES (if not exists)
-- ========================================

-- Profiles table (extended version)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    plan TEXT DEFAULT 'Starter' CHECK (plan IN ('Starter', 'Pro', 'Enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'inactive')),
    city TEXT,
    madhab TEXT,
    age_confirmed BOOLEAN DEFAULT false,
    shariah_rules_agreed BOOLEAN DEFAULT false,
    email_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_admin BOOLEAN DEFAULT false
);

-- User roles tracking
CREATE TABLE IF NOT EXISTS user_role_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_role TEXT,
    new_role TEXT,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User login tracking
CREATE TABLE IF NOT EXISTS user_login_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true
);

-- ========================================
-- 2. INSERT SAMPLE DATA (optional)
-- ========================================

-- Insert sample admin user
INSERT INTO profiles (id, full_name, email, role, plan, status, email_confirmed, created_by_admin)
VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@momincore.com',
    'admin',
    'Enterprise',
    'active',
    true,
    false
) ON CONFLICT DO NOTHING;

-- ========================================
-- 3. USER MANAGEMENT QUERIES
-- ========================================

-- Get all users with details
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.role,
    p.plan,
    p.status,
    p.created_at,
    p.email_confirmed,
    p.city,
    p.madhab,
    COUNT(DISTINCT dg.id) as daily_goals_count,
    COUNT(DISTINCT s.id) as streaks_count
FROM profiles p
LEFT JOIN daily_goals dg ON p.id = dg.user_id
LEFT JOIN streaks s ON p.id = s.user_id
GROUP BY p.id, p.full_name, p.email, p.role, p.plan, p.status, p.created_at, p.email_confirmed, p.city, p.madhab
ORDER BY p.created_at DESC;

-- Get user by email
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Get users by role
SELECT * FROM profiles WHERE role = 'admin';

-- Get users by plan
SELECT * FROM profiles WHERE plan = 'Pro';

-- Get active users
SELECT * FROM profiles WHERE status = 'active';

-- Get banned users
SELECT * FROM profiles WHERE status = 'banned';

-- Get users created by admin
SELECT * FROM profiles WHERE created_by_admin = true;

-- ========================================
-- 4. USER CREATION QUERIES
-- ========================================

-- Create new user profile (after Supabase auth user creation)
INSERT INTO profiles (
    id, 
    full_name, 
    email, 
    role, 
    plan, 
    status,
    email_confirmed,
    created_by_admin
) VALUES (
    'USER_UUID_FROM_SUPABASE_AUTH',
    'John Doe',
    'john.doe@example.com',
    'user',
    'Starter',
    'active',
    true,
    true
);

-- ========================================
-- 5. USER UPDATE QUERIES
-- ========================================

-- Update user role
UPDATE profiles 
SET role = 'moderator', updated_at = NOW()
WHERE id = 'USER_UUID';

-- Update user plan
UPDATE profiles 
SET plan = 'Pro', updated_at = NOW()
WHERE id = 'USER_UUID';

-- Update user status (ban/unban)
UPDATE profiles 
SET status = 'banned', updated_at = NOW()
WHERE id = 'USER_UUID';

-- Update user profile
UPDATE profiles 
SET 
    full_name = 'Jane Doe',
    city = 'New York',
    madhab = 'Hanafi',
    updated_at = NOW()
WHERE id = 'USER_UUID';

-- ========================================
-- 6. USER DELETION QUERIES
-- ========================================

-- Soft delete (change status to inactive)
UPDATE profiles 
SET status = 'inactive', updated_at = NOW()
WHERE id = 'USER_UUID';

-- Hard delete (use with caution - will cascade delete related data)
DELETE FROM profiles WHERE id = 'USER_UUID';

-- ========================================
-- 7. USER STATISTICS QUERIES
-- ========================================

-- User count by role
SELECT 
    role,
    COUNT(*) as count
FROM profiles
GROUP BY role;

-- User count by plan
SELECT 
    plan,
    COUNT(*) as count
FROM profiles
GROUP BY plan;

-- User count by status
SELECT 
    status,
    COUNT(*) as count
FROM profiles
GROUP BY status;

-- New users per month
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_users
FROM profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- User growth over time
SELECT 
    created_at::date as date,
    COUNT(*) OVER (ORDER BY created_at::date) as cumulative_users
FROM profiles
ORDER BY created_at::date;

-- Most active users (based on daily goals)
SELECT 
    p.full_name,
    p.email,
    COUNT(dg.id) as goals_count
FROM profiles p
JOIN daily_goals dg ON p.id = dg.user_id
WHERE p.status = 'active'
GROUP BY p.id, p.full_name, p.email
ORDER BY goals_count DESC
LIMIT 10;

-- ========================================
-- 8. USER SEARCH QUERIES
-- ========================================

-- Search users by name or email
SELECT * FROM profiles 
WHERE 
    full_name ILIKE '%search_term%' OR 
    email ILIKE '%search_term%'
ORDER BY full_name;

-- Get users by city
SELECT * FROM profiles WHERE city = 'New York';

-- Get users by madhab
SELECT * FROM profiles WHERE madhab = 'Hanafi';

-- ========================================
-- 9. USER ROLE HISTORY QUERIES
-- ========================================

-- Create role change record
INSERT INTO user_role_history (
    user_id,
    old_role,
    new_role,
    changed_by
) VALUES (
    'USER_UUID',
    'user',
    'moderator',
    'ADMIN_UUID'
);

-- Get role change history for a user
SELECT 
    urh.old_role,
    urh.new_role,
    urh.changed_at,
    p.full_name as changed_by_name
FROM user_role_history urh
JOIN profiles p ON urh.changed_by = p.id
WHERE urh.user_id = 'USER_UUID'
ORDER BY urh.changed_at DESC;

-- ========================================
-- 10. USER LOGIN HISTORY QUERIES
-- ========================================

-- Record login attempt
INSERT INTO user_login_history (
    user_id,
    ip_address,
    user_agent,
    success
) VALUES (
    'USER_UUID',
    '192.168.1.1',
    'Mozilla/5.0...',
    true
);

-- Get recent login history for a user
SELECT 
    login_time,
    ip_address,
    user_agent,
    success
FROM user_login_history
WHERE user_id = 'USER_UUID'
ORDER BY login_time DESC
LIMIT 10;

-- ========================================
-- 11. CLEANUP AND MAINTENANCE QUERIES
-- ========================================

-- Delete inactive users (older than 1 year)
DELETE FROM profiles 
WHERE status = 'inactive' 
AND created_at < NOW() - INTERVAL '1 year';

-- Update updated_at timestamp for all records
UPDATE profiles SET updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_user_id ON user_role_history(user_id);

-- ========================================
-- 12. BACKUP QUERIES
-- ========================================

-- Export all user data
SELECT 
    id,
    full_name,
    email,
    role,
    plan,
    status,
    city,
    madhab,
    age_confirmed,
    shariah_rules_agreed,
    email_confirmed,
    created_at,
    updated_at,
    created_by_admin
FROM profiles
ORDER BY created_at;

-- Export user statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderator_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN plan = 'Pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN plan = 'Enterprise' THEN 1 END) as enterprise_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN status = 'banned' THEN 1 END) as banned_users
FROM profiles;

-- ========================================
-- USAGE INSTRUCTIONS:
-- ========================================
-- 1. Run the CREATE TABLES section first
-- 2. Use the INSERT queries to add sample data
-- 3. Use the SELECT queries to retrieve user data
-- 4. Use the UPDATE queries to modify user information
-- 5. Use the DELETE queries for user removal (with caution)
-- 6. Run the INDEX creation queries for better performance
-- 7. Use the BACKUP queries to export data when needed

-- ========================================
-- NOTES:
-- ========================================
-- - Replace 'USER_UUID' with actual user IDs
-- - Replace 'search_term' with actual search terms
-- - Always backup data before running DELETE operations
-- - Some queries may need adjustment based on your specific database schema
-- - The auth.users table is managed by Supabase authentication
