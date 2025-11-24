/*
  # Fix Public Access to Products

  ## Changes
  This migration fixes the RLS policy for the products table to allow anonymous (non-authenticated) users to view active products in the public catalog.

  ## Security
  - Drops the existing restrictive SELECT policy on products
  - Creates a new policy that allows anyone (including anonymous users) to view active products
  - Brand owners can still view all their products (active or not) when authenticated

  ## Notes
  - This is essential for the public catalog page to work for non-logged-in visitors
  - Only active products are visible to the public
  - Brand owners retain full access to their own products
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Create new policy that allows anonymous users to view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (
    is_active = true 
    OR 
    (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM brands
        WHERE brands.id = products.brand_id
        AND brands.user_id = auth.uid()
      )
    )
  );
