/*
  # Create Storage Bucket for Product Images

  1. New Storage Bucket
    - `product-images` bucket for storing product photos
    - Public bucket to allow direct access to images
    - File size limit: 5MB
    - Allowed MIME types: image/jpeg, image/png, image/webp

  2. Security
    - Enable RLS on storage.objects
    - Allow authenticated users to upload images
    - Allow public read access to images
*/

-- Create the product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public read access to all product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');