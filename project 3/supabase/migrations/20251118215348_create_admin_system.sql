/*
  # Create Admin System

  ## Overview
  This migration creates a comprehensive admin system with role-based access control.
  Only specific email addresses can be designated as admins with full platform access.

  ## New Tables

  ### 1. `admin_users`
  Stores admin user permissions and roles.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Links to Supabase Auth user
  - `email` (text) - Admin email address
  - `role` (text) - Admin role (super_admin, admin)
  - `is_active` (boolean) - Admin account status
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on admin_users table
  - Only admins can view admin_users table
  - Super admins can manage other admins

  ## Notes
  - Admin access is verified by checking email in admin_users table
  - Admins have read access to all platform data
  - This table must be manually populated with admin emails
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'admin' NOT NULL CHECK (role IN ('super_admin', 'admin')),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin policies - only admins can view admin data
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Super admins can manage other admins
CREATE POLICY "Super admins can manage admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- NOTE: To add an admin, you need to manually insert into this table:
-- INSERT INTO admin_users (user_id, email, role, is_active)
-- SELECT id, email, 'super_admin', true
-- FROM auth.users
-- WHERE email = 'your-admin-email@example.com';
