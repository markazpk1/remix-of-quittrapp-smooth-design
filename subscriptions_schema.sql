-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL DEFAULT '/month', -- '/month', '/year', 'lifetime'
  icon TEXT DEFAULT 'Star',
  color TEXT DEFAULT 'text-blue-400',
  active BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscription plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active', -- 'active', 'canceled', 'expired', 'refunded'
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_plan_id ON subscribers(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(user_email);

-- Function to get subscriber count for each plan
CREATE OR REPLACE FUNCTION get_plan_subscriber_count(plan_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM subscribers
    WHERE plan_id = plan_id_param AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on plan name
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_name_unique UNIQUE (name);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, interval, icon, color, active, features) VALUES
  ('Free', 0.00, '/month', 'Star', 'text-gray-400', true, ARRAY['Basic features', 'Limited access']),
  ('Pro', 19.99, '/month', 'Zap', 'text-blue-400', true, ARRAY['All features', 'Priority support', 'Advanced analytics']),
  ('Lifetime', 299.99, 'lifetime', 'Crown', 'text-amber-400', true, ARRAY['Lifetime access', 'All features', 'VIP support'])
ON CONFLICT (name) DO NOTHING;
