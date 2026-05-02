-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT 'bg-secondary text-muted-foreground border-border/30',
  system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_key)
);

-- Insert default system roles
INSERT INTO roles (name, color, system) VALUES 
  ('Admin', 'bg-primary/20 text-primary border-primary/30', true),
  ('User', 'bg-secondary text-muted-foreground border-border/30', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions for Admin role
INSERT INTO permissions (role_id, permission_key, enabled) 
SELECT r.id, p.key, true
FROM roles r, 
(VALUES 
  ('dashboard'), ('users'), ('content'), ('services'), ('billing'), 
  ('settings'), ('audit'), ('support'), ('roles'), ('reports'), 
  ('media'), ('api')
) AS p(key)
WHERE r.name = 'Admin'
ON CONFLICT (role_id, permission_key) DO NOTHING;

-- Insert default permissions for User role (all disabled)
INSERT INTO permissions (role_id, permission_key, enabled) 
SELECT r.id, p.key, false
FROM roles r, 
(VALUES 
  ('dashboard'), ('users'), ('content'), ('services'), ('billing'), 
  ('settings'), ('audit'), ('support'), ('roles'), ('reports'), 
  ('media'), ('api')
) AS p(key)
WHERE r.name = 'User'
ON CONFLICT (role_id, permission_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(permission_key);
