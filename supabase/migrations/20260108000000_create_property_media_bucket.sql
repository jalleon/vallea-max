-- Create storage bucket for property media (photos)
-- This bucket stores property photos uploaded through the library module

-- Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-media',
  'property-media',
  true,  -- Public bucket so photos can be displayed without auth
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload property photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-media'
);

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update property photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'property-media')
WITH CHECK (bucket_id = 'property-media');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete property photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-media');

-- Policy: Allow public read access (since bucket is public)
CREATE POLICY "Public read access for property photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-media');
