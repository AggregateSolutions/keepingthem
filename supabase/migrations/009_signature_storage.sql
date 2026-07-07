-- Create storage bucket for family signature images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow service_role to upload
CREATE POLICY "Service role can upload signatures"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'signatures');

-- Allow anyone to read (bucket is public)
CREATE POLICY "Public can read signatures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'signatures');

-- Allow service_role to delete/replace
CREATE POLICY "Service role can delete signatures"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'signatures');
