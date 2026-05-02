-- Add status column to admin_users table
ALTER TABLE admin_users ADD COLUMN status TEXT DEFAULT 'active';

-- Create index for better performance
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- Update existing records to have 'active' status
UPDATE admin_users SET status = 'active' WHERE status IS NULL;
