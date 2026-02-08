-- Create educator role function without director (not yet in enum)
CREATE OR REPLACE FUNCTION public.has_educator_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('educator', 'super_admin', 'admin', 'censor', 'founder')
  )
$$;

-- Drop and recreate educator attendance policy 
DROP POLICY IF EXISTS "Educators can manage attendance" ON public.attendance;
CREATE POLICY "Educators can manage attendance" 
ON public.attendance 
FOR ALL 
USING (has_educator_role(auth.uid()))
WITH CHECK (has_educator_role(auth.uid()));