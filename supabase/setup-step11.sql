-- STEP 11: Create admin user
-- Run this after Step 10

-- Replace 'admin@admin.com' with your admin email
-- First, register a user through the app at /register
-- Then run this to make them admin:

UPDATE profiles 
SET verified = true 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@admin.com');

-- If the profile doesn't exist, you can insert it directly:
-- First get the user ID from auth.users table:
-- SELECT id, email FROM auth.users;

-- Then insert the profile:
INSERT INTO profiles (id, full_name, verified, age_confirmed, shariah_rules_agreed)
VALUES (
  'YOUR_USER_ID_HERE',
  'Admin User',
  true,
  true,
  true
);
