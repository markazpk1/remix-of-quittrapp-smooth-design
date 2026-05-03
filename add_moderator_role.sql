-- Add missing Moderator role
INSERT INTO roles (name, color, system) VALUES 
  ('Moderator', 'bg-orange-100 text-orange-800 border-orange-300', true)
ON CONFLICT (name) DO NOTHING;

-- Add permissions for Moderator role (limited access)
INSERT INTO permissions (role_id, permission_key, enabled) 
SELECT r.id, p.key, CASE 
  WHEN p.key IN ('dashboard', 'content', 'support', 'reports') THEN true 
  ELSE false 
END
FROM roles r, 
(VALUES 
  ('dashboard'), ('users'), ('content'), ('services'), ('billing'), 
  ('settings'), ('audit'), ('support'), ('roles'), ('reports'), 
  ('media'), ('api')
) AS p(key)
WHERE r.name = 'Moderator'
ON CONFLICT (role_id, permission_key) DO NOTHING;
