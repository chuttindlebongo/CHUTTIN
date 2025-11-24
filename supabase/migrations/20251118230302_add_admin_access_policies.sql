/*
  # Add Admin Access Policies

  ## Overview
  This migration adds RLS policies to allow super-admin users full access to all platform data.
  Admins need to view all brands, products, and preorders for platform management.

  ## Changes
  1. Add admin SELECT policy for brands table
  2. Add admin SELECT policy for products table  
  3. Add admin SELECT and UPDATE policies for preorders table
  4. Keep existing brand owner policies unchanged

  ## Security
  - Only users in admin_users table with is_active=true can use these policies
  - Admins get read access to all data
  - Admins can update preorder status for any order
  - Brand owners retain their existing permissions
*/

-- Allow admins to view all brands
CREATE POLICY "Admins can view all brands"
  ON brands FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Allow admins to view all products
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Allow admins to view all preorders
CREATE POLICY "Admins can view all preorders"
  ON preorders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Allow admins to update preorder status for any order
CREATE POLICY "Admins can update all preorders"
  ON preorders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Allow admins to update brand status (activate/deactivate)
CREATE POLICY "Admins can update all brands"
  ON brands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );
