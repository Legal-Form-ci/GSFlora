-- =============================================
-- GS FLORA DIGITAL - Complete Database Schema
-- =============================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'teacher', 'student', 'parent');

-- 2. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'
    cycle TEXT NOT NULL, -- '1er cycle', '2nd cycle'
    year TEXT NOT NULL, -- '2024-2025'
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create subjects (matières) table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT,
    coefficient DECIMAL(3,1) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create student_classes junction table
CREATE TABLE public.student_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    school_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_id, school_year)
);

-- 7. Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chapter TEXT,
    difficulty TEXT CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
    duration_minutes INTEGER,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Create assignments (devoirs) table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 20.00,
    coefficient DECIMAL(3,1) DEFAULT 1.0,
    assignment_type TEXT CHECK (assignment_type IN ('devoir', 'controle', 'interrogation', 'participation')),
    allow_late_submission BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    score DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.profiles(id),
    status TEXT CHECK (status IN ('draft', 'submitted', 'graded', 'returned')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (assignment_id, student_id)
);

-- 10. Create quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    duration_minutes INTEGER,
    max_attempts INTEGER DEFAULT 1,
    passing_score DECIMAL(5,2),
    max_score DECIMAL(5,2) DEFAULT 20.00,
    is_published BOOLEAN DEFAULT false,
    opens_at TIMESTAMP WITH TIME ZONE,
    closes_at TIMESTAMP WITH TIME ZONE,
    randomize_questions BOOLEAN DEFAULT false,
    show_answers_after BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Create quiz_questions table
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('qcm', 'vrai_faux', 'reponse_courte', 'correspondance', 'ordre')) NOT NULL,
    options JSONB, -- For QCM: [{text: "Option A", is_correct: true}, ...]
    correct_answer TEXT,
    points DECIMAL(5,2) DEFAULT 1.00,
    explanation TEXT,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    answers JSONB, -- {question_id: answer, ...}
    score DECIMAL(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. Create grades (notes) table
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 20.00,
    coefficient DECIMAL(3,1) DEFAULT 1.0,
    grade_type TEXT CHECK (grade_type IN ('devoir', 'quiz', 'controle', 'interrogation', 'participation')),
    comments TEXT,
    graded_by UUID REFERENCES public.profiles(id),
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    trimester INTEGER CHECK (trimester IN (1, 2, 3)),
    school_year TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Create attendance (présences) table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
    arrival_time TIME,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_id, date, course_id)
);

-- 15. Create schedules (emploi du temps) table
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7) NOT NULL, -- 1=Monday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 16. Create student_parent_relationships table
CREATE TABLE public.student_parent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    relationship TEXT CHECK (relationship IN ('pere', 'mere', 'tuteur', 'autre')) DEFAULT 'tuteur',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (student_id, parent_id)
);

-- 17. Create announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_type TEXT CHECK (target_type IN ('all', 'class', 'teachers', 'students', 'parents')) DEFAULT 'all',
    target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    is_urgent BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY 
        CASE role 
            WHEN 'super_admin' THEN 1 
            WHEN 'admin' THEN 2 
            WHEN 'teacher' THEN 3 
            WHEN 'parent' THEN 4 
            WHEN 'student' THEN 5 
        END
    LIMIT 1
$$;

-- Function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('super_admin', 'admin')
    )
$$;

-- Function to check if teacher teaches a specific course
CREATE OR REPLACE FUNCTION public.is_teacher_of_course(_user_id UUID, _course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.courses
        WHERE id = _course_id
          AND teacher_id = _user_id
    )
$$;

-- Function to check if student is in a class
CREATE OR REPLACE FUNCTION public.is_student_in_class(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.student_classes
        WHERE student_id = _user_id
          AND class_id = _class_id
    )
$$;

-- Function to check if parent is linked to student
CREATE OR REPLACE FUNCTION public.is_parent_of_student(_parent_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.student_parent_relationships
        WHERE parent_id = _parent_id
          AND student_id = _student_id
    )
$$;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- USER_ROLES policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- PROFILES policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Teachers can view student profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
        SELECT 1 FROM public.student_classes sc
        JOIN public.courses c ON c.class_id = sc.class_id
        WHERE sc.student_id = profiles.id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Parents can view their children profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'parent') AND
    public.is_parent_of_student(auth.uid(), profiles.id)
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- CLASSES policies
CREATE POLICY "Everyone can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage classes"
ON public.classes FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- SUBJECTS policies
CREATE POLICY "Everyone can view subjects"
ON public.subjects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage subjects"
ON public.subjects FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- STUDENT_CLASSES policies
CREATE POLICY "Users can view their own class assignments"
ON public.student_classes FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can view their students"
ON public.student_classes FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.class_id = student_classes.class_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage student classes"
ON public.student_classes FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- COURSES policies
CREATE POLICY "Students can view published courses for their class"
ON public.courses FOR SELECT
TO authenticated
USING (
    is_published = true AND
    public.is_student_in_class(auth.uid(), class_id)
);

CREATE POLICY "Teachers can view and manage their courses"
ON public.courses FOR ALL
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all courses"
ON public.courses FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ASSIGNMENTS policies
CREATE POLICY "Students can view published assignments"
ON public.assignments FOR SELECT
TO authenticated
USING (
    is_published = true AND
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = assignments.course_id
        AND public.is_student_in_class(auth.uid(), c.class_id)
    )
);

CREATE POLICY "Teachers can manage their assignments"
ON public.assignments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = assignments.course_id AND c.teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = assignments.course_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all assignments"
ON public.assignments FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ASSIGNMENT_SUBMISSIONS policies
CREATE POLICY "Students can manage their own submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view and grade submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.courses c ON c.id = a.course_id
        WHERE a.id = assignment_submissions.assignment_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- QUIZZES policies
CREATE POLICY "Students can view published quizzes"
ON public.quizzes FOR SELECT
TO authenticated
USING (
    is_published = true AND
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = quizzes.course_id
        AND public.is_student_in_class(auth.uid(), c.class_id)
    )
);

CREATE POLICY "Teachers can manage their quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = quizzes.course_id AND c.teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = quizzes.course_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- QUIZ_QUESTIONS policies
CREATE POLICY "Students can view questions for available quizzes"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quizzes q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quiz_questions.quiz_id
        AND q.is_published = true
        AND public.is_student_in_class(auth.uid(), c.class_id)
    )
);

CREATE POLICY "Teachers can manage their quiz questions"
ON public.quiz_questions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quizzes q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quiz_questions.quiz_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all quiz questions"
ON public.quiz_questions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- QUIZ_ATTEMPTS policies
CREATE POLICY "Students can manage their own quiz attempts"
ON public.quiz_attempts FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view quiz attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quizzes q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quiz_attempts.quiz_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all quiz attempts"
ON public.quiz_attempts FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- GRADES policies
CREATE POLICY "Students can view their own grades"
ON public.grades FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Parents can view their children grades"
ON public.grades FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'parent') AND
    public.is_parent_of_student(auth.uid(), grades.student_id)
);

CREATE POLICY "Teachers can manage grades for their courses"
ON public.grades FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = grades.course_id AND c.teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = grades.course_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all grades"
ON public.grades FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ATTENDANCE policies
CREATE POLICY "Students can view their own attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Parents can view their children attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'parent') AND
    public.is_parent_of_student(auth.uid(), attendance.student_id)
);

CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.class_id = attendance.class_id AND c.teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.class_id = attendance.class_id AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- SCHEDULES policies
CREATE POLICY "Everyone can view schedules"
ON public.schedules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage schedules"
ON public.schedules FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- STUDENT_PARENT_RELATIONSHIPS policies
CREATE POLICY "Users can view their relationships"
ON public.student_parent_relationships FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR parent_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage relationships"
ON public.student_parent_relationships FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ANNOUNCEMENTS policies
CREATE POLICY "Everyone can view announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers and admins can create announcements"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'teacher')
);

CREATE POLICY "Authors and admins can manage announcements"
ON public.announcements FOR UPDATE
TO authenticated
USING (author_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete announcements"
ON public.announcements FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default subjects
INSERT INTO public.subjects (name, code, coefficient) VALUES
('Français', 'FR', 4),
('Mathématiques', 'MATH', 4),
('Anglais', 'ANG', 3),
('Histoire-Géographie', 'HG', 3),
('Sciences de la Vie et de la Terre', 'SVT', 3),
('Physique-Chimie', 'PC', 3),
('Éducation Physique et Sportive', 'EPS', 2),
('Arts Plastiques', 'ART', 1),
('Musique', 'MUS', 1),
('Philosophie', 'PHILO', 4),
('Économie', 'ECO', 3),
('Informatique', 'INFO', 2);

-- Insert sample classes
INSERT INTO public.classes (name, level, cycle, year) VALUES
('6ème A', '6ème', '1er cycle', '2024-2025'),
('6ème B', '6ème', '1er cycle', '2024-2025'),
('5ème A', '5ème', '1er cycle', '2024-2025'),
('5ème B', '5ème', '1er cycle', '2024-2025'),
('4ème A', '4ème', '1er cycle', '2024-2025'),
('4ème B', '4ème', '1er cycle', '2024-2025'),
('3ème A', '3ème', '1er cycle', '2024-2025'),
('3ème B', '3ème', '1er cycle', '2024-2025'),
('2nde A', '2nde', '2nd cycle', '2024-2025'),
('2nde B', '2nde', '2nd cycle', '2024-2025'),
('1ère A', '1ère', '2nd cycle', '2024-2025'),
('1ère B', '1ère', '2nd cycle', '2024-2025'),
('Terminale A', 'Terminale', '2nd cycle', '2024-2025'),
('Terminale B', 'Terminale', '2nd cycle', '2024-2025');