/*
  # Fix Admin Users RLS Circular Dependency

  ## Problem
  The current RLS policy for admin_users creates a circular dependency:
  - To read admin_users, you must already be in admin_users
  - But to know if you're in admin_users, you must read admin_users

  ## Solution
  Allow authenticated users to read their OWN row in admin_users without
  requiring them to already be verified as admin.

  ## Changes
  1. Drop the old circular policy
  2. Create new policy: Users can read their own admin record
  3. Keep super admin policy for managing other admins
*/

-- Drop the circular policy
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;

-- Allow users to read their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Note: The "Super admins can manage admins" policy remains unchanged
