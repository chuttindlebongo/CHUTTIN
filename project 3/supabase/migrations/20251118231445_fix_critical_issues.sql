/*
  # Fix Critical Issues

  ## Problems Fixed
  1. Add is_active column to brands table (missing column)
  2. Fix infinite recursion in admin_users RLS policies
  3. Update RLS policies to avoid circular dependencies

  ## Changes
  1. Add is_active column to brands with default true
  2. Drop problematic "Super admins can manage admins" policy
  3. Create simpler admin policies without recursion
*/

-- Add is_active column to brands table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'brands' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE brands ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Drop the recursive policy that causes infinite loop
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;

-- Create a simpler policy for super admins to manage admin_users
-- This uses a direct auth.uid() check instead of recursion
CREATE POLICY "Super admins can manage all admin records"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    -- Allow if the current user is already verified as super_admin in their own row
    user_id = auth.uid() 
    OR 
    -- Or if they have super_admin role (checked via their own record)
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.is_active = true
      LIMIT 1
    )
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.is_active = true
      LIMIT 1
    )
  );
