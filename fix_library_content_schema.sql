-- Add missing columns to library_content table
ALTER TABLE library_content ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE library_content ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_library_content_status ON library_content(status);
CREATE INDEX IF NOT EXISTS idx_library_content_order ON library_content(order_index);

-- Update existing records if any
UPDATE library_content SET status = 'published' WHERE status IS NULL;
UPDATE library_content SET order_index = 0 WHERE order_index IS NULL;
