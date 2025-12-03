-- Allow all authenticated users to query admin user_ids for notifications
CREATE POLICY "Authenticated users can view admin roles for notifications" 
ON user_roles
FOR SELECT 
TO authenticated
USING (role = 'admin'::app_role);