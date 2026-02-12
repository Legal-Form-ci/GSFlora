
-- =====================================================
-- PHASE 1: Multi-tenant architecture for SchoolHub Pro
-- =====================================================

-- 1. Create schools table (tenants)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  custom_domain TEXT UNIQUE,
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  subscription_plan TEXT DEFAULT 'free',
  max_students INTEGER DEFAULT 100,
  max_teachers INTEGER DEFAULT 20,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create school_members to link users to schools with roles
CREATE TABLE public.school_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- 3. Add school_id to all existing tables
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.student_classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.student_parent_relationships ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.tuition_fees ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.student_payments ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.school_expenses ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.generated_schedules ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.schedule_generation_config ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.teacher_subjects ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

-- 4. Create platform_admins table for super platform admins
CREATE TABLE public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Security definer functions for multi-tenant access
CREATE OR REPLACE FUNCTION public.is_school_member(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE user_id = _user_id AND school_id = _school_id AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE user_id = _user_id AND school_id = _school_id AND is_active = true
    AND role IN ('super_admin', 'admin', 'founder', 'director')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.school_members
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- 6. RLS for schools table
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schools" ON public.schools
  FOR SELECT USING (is_active = true OR is_platform_admin(auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Platform admins can manage schools" ON public.schools
  FOR ALL USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Users can create schools" ON public.schools
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "School admins can update their school" ON public.schools
  FOR UPDATE USING (is_school_admin(auth.uid(), id));

-- 7. RLS for school_members table
ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view their school members" ON public.school_members
  FOR SELECT USING (is_school_member(auth.uid(), school_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "School admins can manage members" ON public.school_members
  FOR ALL USING (is_school_admin(auth.uid(), school_id) OR is_platform_admin(auth.uid()))
  WITH CHECK (is_school_admin(auth.uid(), school_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Users can join schools" ON public.school_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. RLS for platform_admins
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view" ON public.platform_admins
  FOR SELECT USING (is_platform_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Only platform admins can manage" ON public.platform_admins
  FOR ALL USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

-- 9. Enable realtime for schools and school_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_members;

-- 10. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_members_user ON public.school_members(user_id);
CREATE INDEX IF NOT EXISTS idx_school_members_school ON public.school_members(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_custom_domain ON public.schools(custom_domain);
CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_school ON public.courses(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_school ON public.grades(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_school ON public.attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school ON public.announcements(school_id);

-- 11. Update trigger for schools
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
