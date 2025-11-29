-- Add RLS policy to allow users to insert their own role during signup
CREATE POLICY "Users can insert own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);