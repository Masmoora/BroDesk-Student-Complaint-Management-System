-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create a PERMISSIVE policy that allows authenticated users to insert notifications
CREATE POLICY "System can create notifications" ON notifications
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
FOR DELETE TO authenticated
USING (auth.uid() = user_id);