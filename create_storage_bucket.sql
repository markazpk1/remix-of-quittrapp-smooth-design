-- Create the media-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-files', 'media-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

-- Allow public uploads to the bucket
CREATE POLICY "Allow Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'media-files');

-- Allow public access to read files
CREATE POLICY "Allow Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-files');

-- Allow public delete
CREATE POLICY "Allow Public Delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'media-files');
