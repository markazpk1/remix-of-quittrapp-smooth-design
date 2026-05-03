-- Create notification campaigns table
CREATE TABLE IF NOT EXISTS notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'All Users', -- 'All Users', 'Active Users', 'Pro Users', 'Free Users'
  channel TEXT NOT NULL DEFAULT 'Push', -- 'Push', 'Email', 'Push + Email'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notification campaigns
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_audience ON notification_campaigns(audience);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_channel ON notification_campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_created_at ON notification_campaigns(created_at);

-- Create notification deliveries table
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES notification_campaigns(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_email TEXT,
  device_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'opened', 'failed'
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notification deliveries
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_campaign_id ON notification_deliveries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_id ON notification_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);

-- Update trigger for notification campaigns
CREATE OR REPLACE FUNCTION update_notification_campaign_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
      NEW.sent_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification campaigns
DROP TRIGGER IF EXISTS notification_campaigns_update_timestamp ON notification_campaigns;
CREATE TRIGGER notification_campaigns_update_timestamp
  BEFORE UPDATE ON notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_campaign_timestamp();

-- Function to update delivery counts
CREATE OR REPLACE FUNCTION update_campaign_delivery_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update delivered count
  UPDATE notification_campaigns 
  SET delivered_count = (
    SELECT COUNT(*) 
    FROM notification_deliveries 
    WHERE campaign_id = NEW.campaign_id AND status = 'delivered'
  ),
  opened_count = (
    SELECT COUNT(*) 
    FROM notification_deliveries 
    WHERE campaign_id = NEW.campaign_id AND status = 'opened'
  )
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for delivery updates
DROP TRIGGER IF EXISTS update_delivered_count ON notification_deliveries;
CREATE TRIGGER update_delivered_count
  AFTER INSERT OR UPDATE ON notification_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_delivery_counts();

-- Insert sample notification campaigns
INSERT INTO notification_campaigns (title, body, audience, channel, status, delivered_count, opened_count) VALUES
  ('Welcome to the App!', 'Thank you for joining our community. Get started with our quick guide.', 'All Users', 'Push + Email', 'sent', 150, 89),
  ('New Features Available', 'Check out our latest features including dark mode and improved performance.', 'Active Users', 'Push', 'sent', 75, 45),
  ('Pro Tips for Power Users', 'Learn how to make the most of your Pro subscription with these advanced tips.', 'Pro Users', 'Email', 'draft', 0, 0),
  ('Weekly Progress Report', 'Your weekly activity summary and achievements are ready to view.', 'All Users', 'Push', 'scheduled', 0, 0)
ON CONFLICT DO NOTHING;
