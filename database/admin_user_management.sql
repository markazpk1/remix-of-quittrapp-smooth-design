-- ========================================
-- ADMIN USER MANAGEMENT SQL QUERIES
-- ========================================
-- These queries are for manual database operations in Supabase
-- Run them in your Supabase SQL editor for direct database management

-- ========================================
-- 1. TABLE CREATION (if not exists)
-- ========================================

-- Extended profiles table with admin fields
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
    created_by_admin BOOLEAN DEFAULT false,
    banned_at TIMESTAMP WITH TIME ZONE,
    banned_by UUID REFERENCES profiles(id),
    ban_reason TEXT
);

-- User role history tracking
CREATE TABLE IF NOT EXISTS user_role_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_role TEXT,
    new_role TEXT,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_reason TEXT
);

-- User login history
CREATE TABLE IF NOT EXISTS user_login_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    failure_reason TEXT
);

-- User activity logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs for admin notifications
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sent_by UUID REFERENCES profiles(id),
    subject TEXT,
    message TEXT,
    email_address TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- ========================================
-- 2. USER CREATION QUERIES
-- ========================================

-- Create new user manually (after Supabase auth creation)
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
    'USER_UUID_FROM_AUTH',
    'John Doe',
    'john.doe@example.com',
    'user',
    'Starter',
    'active',
    true,
    true
);

-- Create admin user
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
    gen_random_uuid(),
    'System Admin',
    'admin@momincore.com',
    'admin',
    'Enterprise',
    'active',
    true,
    false
);

-- ========================================
-- 3. USER ROLE MANAGEMENT
-- ========================================

-- Update user role with history tracking
UPDATE profiles 
SET role = 'moderator', updated_at = NOW()
WHERE id = 'USER_UUID';

-- Record role change in history
INSERT INTO user_role_history (
    user_id,
    old_role,
    new_role,
    changed_by,
    changed_at,
    change_reason
) VALUES (
    'USER_UUID',
    'user',
    'moderator',
    'ADMIN_USER_UUID',
    NOW(),
    'Promoted to moderator for good conduct'
);

-- Get role change history for a user
SELECT 
    urh.old_role,
    urh.new_role,
    urh.changed_at,
    urh.change_reason,
    p.full_name as changed_by_name
FROM user_role_history urh
JOIN profiles p ON urh.changed_by = p.id
WHERE urh.user_id = 'USER_UUID'
ORDER BY urh.changed_at DESC;

-- Get all users by role
SELECT 
    id,
    full_name,
    email,
    role,
    plan,
    status,
    created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ========================================
-- 4. USER BAN/UNBAN MANAGEMENT
-- ========================================

-- Ban a user
UPDATE profiles 
SET 
    status = 'banned',
    banned_at = NOW(),
    banned_by = 'ADMIN_USER_UUID',
    ban_reason = 'Violation of community guidelines',
    updated_at = NOW()
WHERE id = 'USER_UUID';

-- Unban a user
UPDATE profiles 
SET 
    status = 'active',
    banned_at = NULL,
    banned_by = NULL,
    ban_reason = NULL,
    updated_at = NOW()
WHERE id = 'USER_UUID';

-- Get banned users
SELECT 
    id,
    full_name,
    email,
    role,
    plan,
    banned_at,
    ban_reason,
    p2.full_name as banned_by_name
FROM profiles p
LEFT JOIN profiles p2 ON p.banned_by = p2.id
WHERE p.status = 'banned'
ORDER BY p.banned_at DESC;

-- Get ban history
SELECT 
    full_name,
    email,
    banned_at,
    ban_reason,
    CASE 
        WHEN status = 'banned' THEN 'Currently Banned'
        ELSE 'Previously Banned (Now Unbanned)'
    END as ban_status
FROM profiles
WHERE banned_at IS NOT NULL
ORDER BY banned_at DESC;

-- ========================================
-- 5. USER DELETION
-- ========================================

-- Soft delete (set status to inactive)
UPDATE profiles 
SET status = 'inactive', updated_at = NOW()
WHERE id = 'USER_UUID';

-- Get inactive users for cleanup
SELECT 
    id,
    full_name,
    email,
    created_at,
    updated_at
FROM profiles
WHERE status = 'inactive'
ORDER BY updated_at DESC;

-- Hard delete (use with extreme caution)
-- This will cascade delete all related data
DELETE FROM profiles WHERE id = 'USER_UUID';

-- ========================================
-- 6. USER SEARCH AND FILTERING
-- ========================================

-- Search users by name or email
SELECT 
    id,
    full_name,
    email,
    role,
    plan,
    status,
    created_at
FROM profiles
WHERE 
    full_name ILIKE '%search_term%' OR 
    email ILIKE '%search_term%'
ORDER BY full_name;

-- Get users by multiple criteria
SELECT 
    id,
    full_name,
    email,
    role,
    plan,
    status,
    city,
    madhab,
    created_at
FROM profiles
WHERE 
    role = 'user'
    AND status = 'active'
    AND plan = 'Pro'
    AND created_at >= '2024-01-01'
ORDER BY created_at DESC;

-- Get users by city
SELECT 
    full_name,
    email,
    role,
    status,
    city
FROM profiles
WHERE city = 'New York'
ORDER BY full_name;

-- Get users by madhab
SELECT 
    full_name,
    email,
    role,
    status,
    madhab
FROM profiles
WHERE madhab = 'Hanafi'
ORDER BY full_name;

-- ========================================
-- 7. USER STATISTICS AND REPORTS
-- ========================================

-- User count by role
SELECT 
    role,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- User count by plan
SELECT 
    plan,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM profiles
GROUP BY plan
ORDER BY count DESC;

-- User count by status
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM profiles
GROUP BY status
ORDER BY count DESC;

-- New users per month
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as new_admins,
    COUNT(CASE WHEN plan = 'Pro' THEN 1 END) as new_pro_users
FROM profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- User growth over time
SELECT 
    created_at::date as date,
    COUNT(*) OVER (ORDER BY created_at::date) as cumulative_users,
    COUNT(*) OVER (ORDER BY created_at::date) - LAG(COUNT(*) OVER (ORDER BY created_at::date), 1, 0) OVER (ORDER BY created_at::date) as daily_new_users
FROM profiles
ORDER BY created_at::date;

-- Most active users (based on login history)
SELECT 
    p.full_name,
    p.email,
    p.role,
    COUNT(lh.id) as login_count,
    MAX(lh.login_time) as last_login
FROM profiles p
LEFT JOIN user_login_history lh ON p.id = lh.user_id
WHERE p.status = 'active'
GROUP BY p.id, p.full_name, p.email, p.role
ORDER BY login_count DESC
LIMIT 10;

-- Users with most role changes
SELECT 
    p.full_name,
    p.email,
    COUNT(urh.id) as role_changes,
    MAX(urh.changed_at) as last_role_change
FROM profiles p
LEFT JOIN user_role_history urh ON p.id = urh.user_id
GROUP BY p.id, p.full_name, p.email
HAVING COUNT(urh.id) > 0
ORDER BY role_changes DESC;

-- ========================================
-- 8. EMAIL MANAGEMENT
-- ========================================

-- Log email sent to user
INSERT INTO email_logs (
    user_id,
    sent_by,
    subject,
    message,
    email_address,
    sent_at,
    status
) VALUES (
    'USER_UUID',
    'ADMIN_USER_UUID',
    'Account Notification',
    'Your account has been updated.',
    'user@example.com',
    NOW(),
    'sent'
);

-- Get email logs for a user
SELECT 
    subject,
    message,
    email_address,
    sent_at,
    status,
    p.full_name as sent_by_name
FROM email_logs el
JOIN profiles p ON el.sent_by = p.id
WHERE el.user_id = 'USER_UUID'
ORDER BY el.sent_at DESC;

-- Get all email logs
SELECT 
    p.full_name,
    p.email,
    el.subject,
    el.sent_at,
    el.status,
    p2.full_name as sent_by_name
FROM email_logs el
JOIN profiles p ON el.user_id = p.id
JOIN profiles p2 ON el.sent_by = p2.id
ORDER BY el.sent_at DESC;

-- ========================================
-- 9. ACTIVITY LOGGING
-- ========================================

-- Log user activity
INSERT INTO user_activity_logs (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    created_at
) VALUES (
    'USER_UUID',
    'role_changed',
    '{"old_role": "user", "new_role": "moderator"}',
    '192.168.1.1',
    'Mozilla/5.0...',
    NOW()
);

-- Get activity logs for a user
SELECT 
    action,
    details,
    ip_address,
    user_agent,
    created_at
FROM user_activity_logs
WHERE user_id = 'USER_UUID'
ORDER BY created_at DESC;

-- Get recent admin activities
SELECT 
    p.full_name,
    p.email,
    action,
    details,
    created_at
FROM user_activity_logs ual
JOIN profiles p ON ual.user_id = p.id
WHERE p.role IN ('admin', 'moderator')
ORDER BY ual.created_at DESC
LIMIT 50;

-- ========================================
-- 10. MAINTENANCE AND CLEANUP
-- ========================================

-- Update updated_at timestamp for all records
UPDATE profiles SET updated_at = NOW();

-- Clean up old login history (keep last 90 days)
DELETE FROM user_login_history
WHERE login_time < NOW() - INTERVAL '90 days';

-- Clean up old activity logs (keep last 180 days)
DELETE FROM user_activity_logs
WHERE created_at < NOW() - INTERVAL '180 days';

-- Clean up old email logs (keep last 365 days)
DELETE FROM email_logs
WHERE sent_at < NOW() - INTERVAL '365 days';

-- ========================================
-- 11. PERFORMANCE INDEXES
-- ========================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_profiles_banned_at ON profiles(banned_at);
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_login_time ON user_login_history(login_time);
CREATE INDEX IF NOT EXISTS idx_user_role_history_user_id ON user_role_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_changed_at ON user_role_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- ========================================
-- 12. BACKUP AND EXPORT QUERIES
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
    created_by_admin,
    banned_at,
    ban_reason
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
    COUNT(CASE WHEN status = 'banned' THEN 1 END) as banned_users,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
    COUNT(CASE WHEN created_by_admin = true THEN 1 END) as admin_created_users
FROM profiles;

-- Export role change history
SELECT 
    p.full_name,
    p.email,
    urh.old_role,
    urh.new_role,
    urh.changed_at,
    urh.change_reason,
    p2.full_name as changed_by_name
FROM user_role_history urh
JOIN profiles p ON urh.user_id = p.id
JOIN profiles p2 ON urh.changed_by = p2.id
ORDER BY urh.changed_at DESC;

-- ========================================
-- 13. SECURITY AND AUDIT QUERIES
-- ========================================

-- Get suspicious login attempts
SELECT 
    p.full_name,
    p.email,
    lh.login_time,
    lh.ip_address,
    lh.user_agent,
    lh.failure_reason
FROM user_login_history lh
JOIN profiles p ON lh.user_id = p.id
WHERE lh.success = false
ORDER BY lh.login_time DESC;

-- Get users with multiple failed logins
SELECT 
    p.full_name,
    p.email,
    COUNT(*) as failed_attempts,
    MAX(lh.login_time) as last_attempt
FROM user_login_history lh
JOIN profiles p ON lh.user_id = p.id
WHERE lh.success = false
GROUP BY p.id, p.full_name, p.email
HAVING COUNT(*) >= 5
ORDER BY failed_attempts DESC;

-- Get admin activity summary
SELECT 
    p.full_name,
    COUNT(CASE WHEN ual.action = 'role_changed' THEN 1 END) as role_changes,
    COUNT(CASE WHEN ual.action = 'user_banned' THEN 1 END) as bans,
    COUNT(CASE WHEN ual.action = 'user_deleted' THEN 1 END) as deletions,
    COUNT(*) as total_actions
FROM profiles p
LEFT JOIN user_activity_logs ual ON p.id = ual.user_id
WHERE p.role = 'admin'
GROUP BY p.id, p.full_name
ORDER BY total_actions DESC;

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
-- 8. Run MAINTENANCE queries periodically for cleanup

-- ========================================
-- IMPORTANT NOTES:
-- ========================================
-- - Replace 'USER_UUID' with actual user IDs
-- - Replace 'ADMIN_USER_UUID' with actual admin user IDs
-- - Replace 'search_term' with actual search terms
-- - Always backup data before running DELETE operations
-- - Some queries may need adjustment based on your specific database schema
-- - The auth.users table is managed by Supabase authentication
-- - Use these queries for manual database operations and troubleshooting
