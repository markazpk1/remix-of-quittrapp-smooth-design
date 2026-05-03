-- Create content sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing table (if they don't exist)
ALTER TABLE content_sections 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS content TEXT;

-- Create indexes for content sections
CREATE INDEX IF NOT EXISTS idx_content_sections_enabled ON content_sections(enabled);
CREATE INDEX IF NOT EXISTS idx_content_sections_order ON content_sections(order_index);

-- Add unique constraint on name for conflict resolution
ALTER TABLE content_sections 
ADD CONSTRAINT IF NOT EXISTS content_sections_name_unique UNIQUE (name);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Guide',
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  order_index INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_enabled ON faqs(enabled);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(order_index);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);

-- Create SEO pages table
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  indexed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for SEO pages
CREATE INDEX IF NOT EXISTS idx_seo_pages_path ON seo_pages(path);
CREATE INDEX IF NOT EXISTS idx_seo_pages_indexed ON seo_pages(indexed);

-- Update trigger for blog posts
CREATE OR REPLACE FUNCTION update_blog_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.status != NEW.status AND NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blog posts
DROP TRIGGER IF EXISTS blog_posts_update_timestamp ON blog_posts;
CREATE TRIGGER blog_posts_update_timestamp
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_timestamp();

-- Insert or update default content sections
INSERT INTO content_sections (name, title, subtitle, content, enabled, order_index) VALUES
  ('Hero Section', 'Welcome to The Momin Core', 'Your halal-first productivity platform', 'Transform your daily routine with our comprehensive suite of tools designed to enhance both your deen and dunya.', true, 1),
  ('Features', 'Powerful Features', 'Everything you need to succeed', 'Discover our range of features designed to help you achieve more in your spiritual and daily life.', true, 2),
  ('How It Works', 'Simple & Effective', 'Get started in minutes', 'Our platform is designed to be intuitive and easy to use, helping you achieve your goals from day one.', true, 3),
  ('Testimonials', 'What Our Users Say', 'Join thousands of satisfied users', 'Read testimonials from users who have transformed their lives with The Momin Core.', true, 4),
  ('Pricing', 'Affordable Plans', 'Choose what works for you', 'Flexible pricing options designed to fit every budget and need.', true, 5),
  ('FAQ', 'Frequently Asked Questions', 'Get your answers here', 'Find answers to common questions about our platform and features.', true, 6),
  ('Contact', 'Get In Touch', 'We are here to help', 'Reach out to our support team for any questions or assistance you may need.', true, 7)
ON CONFLICT (name) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  enabled = EXCLUDED.enabled,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Insert sample blog posts
INSERT INTO blog_posts (title, content, category, author, status, views) VALUES
  ('Getting Started with Our Platform', 'Learn how to set up your account and start using all the features...', 'Guide', 'Admin Team', 'published', 245),
  ('10 Tips for Maximum Productivity', 'Discover our top tips for getting the most out of your day...', 'Tips', 'Productivity Expert', 'published', 189),
  ('The Science Behind Habit Formation', 'Understanding the psychology of building lasting habits...', 'Science', 'Research Team', 'draft', 0)
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, order_index) VALUES
  ('How do I reset my password?', 'Click on the "Forgot Password" link on the login page and follow the instructions...', 'Account', 1),
  ('What payment methods do you accept?', 'We accept all major credit cards, PayPal, and bank transfers...', 'Billing', 2),
  ('Can I cancel my subscription anytime?', 'Yes, you can cancel your subscription at any time from your account settings...', 'Billing', 3),
  ('Is my data secure?', 'Yes, we use industry-standard encryption and security measures...', 'Security', 4)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (name, quote, rating, status, featured) VALUES
  ('Sarah Johnson', 'This platform has completely transformed how I manage my daily tasks. Highly recommended!', 5, 'approved', true),
  ('Michael Chen', 'The best productivity tool I have ever used. Simple, intuitive, and powerful.', 5, 'approved', true),
  ('Emily Davis', 'Great features and excellent customer support. Worth every penny!', 4, 'approved', false),
  ('James Wilson', 'Still exploring the features but so far it looks promising.', 4, 'pending', false)
ON CONFLICT DO NOTHING;

-- Insert sample SEO pages
INSERT INTO seo_pages (path, title, description, indexed) VALUES
  ('/', 'Welcome to Our Platform - Your Productivity Solution', 'Discover the best tools and features to boost your productivity and achieve your goals.', true),
  ('/about', 'About Us - Our Mission and Team', 'Learn about our mission to help people achieve more and meet the dedicated team behind our platform.', true),
  ('/pricing', 'Pricing Plans - Find the Perfect Fit', 'Choose from our flexible pricing plans designed to meet your needs and budget.', true),
  ('/contact', 'Contact Us - Get in Touch', 'Have questions? Our support team is here to help. Reach out to us anytime.', true)
ON CONFLICT DO NOTHING;
