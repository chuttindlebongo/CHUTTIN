/*
  # Fix Public Access to Brands

  ## Changes
  This migration fixes the RLS policy for the brands table to allow anonymous (non-authenticated) users to view brand information in the public catalog.

  ## Security
  - Drops the existing restrictive SELECT policy on brands
  - Creates a new policy that allows anyone (including anonymous users) to view all brands
  - This is necessary for the catalog to display brand names with products

  ## Notes
  - Brand information is public data that should be visible to all visitors
  - Only SELECT access is granted to anonymous users
  - Brand owners retain full CRUD access to their own brands
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view brands" ON brands;

-- Create new policy that allows public access to view brands
CREATE POLICY "Public can view all brands"
  ON brands FOR SELECT
  USING (true);
