-- Table pour gérer le changement de mot de passe obligatoire
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    must_change_password BOOLEAN DEFAULT true,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'fr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all user settings"
ON public.user_settings FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Table pour les professeurs avec leurs matières
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(teacher_id, subject_id)
);

-- Enable RLS
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

-- RLS policies for teacher_subjects
CREATE POLICY "Everyone can view teacher subjects"
ON public.teacher_subjects FOR SELECT
USING (true);

CREATE POLICY "Admins can manage teacher subjects"
ON public.teacher_subjects FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Table pour les paramètres de génération d'emploi du temps
CREATE TABLE IF NOT EXISTS public.schedule_generation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_year VARCHAR(20) NOT NULL,
    start_time_weekdays TIME NOT NULL DEFAULT '07:00',
    end_time_weekdays TIME NOT NULL DEFAULT '18:00',
    start_time_wednesday TIME NOT NULL DEFAULT '07:00',
    end_time_wednesday TIME NOT NULL DEFAULT '12:00',
    course_duration_minutes INTEGER NOT NULL DEFAULT 55,
    break_duration_minutes INTEGER NOT NULL DEFAULT 10,
    lunch_start TIME NOT NULL DEFAULT '12:00',
    lunch_end TIME NOT NULL DEFAULT '14:00',
    total_rooms INTEGER NOT NULL DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE,
    generated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_generation_config ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Everyone can view schedule config"
ON public.schedule_generation_config FOR SELECT
USING (true);

CREATE POLICY "Directors and admins can manage schedule config"
ON public.schedule_generation_config FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Table pour stocker les emplois du temps générés
CREATE TABLE IF NOT EXISTS public.generated_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.schedule_generation_config(id) ON DELETE CASCADE,
    school_year VARCHAR(20) NOT NULL,
    schedule_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Everyone can view published schedules"
ON public.generated_schedules FOR SELECT
USING (status = 'published' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage generated schedules"
ON public.generated_schedules FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_schedule_config_updated_at
BEFORE UPDATE ON public.schedule_generation_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();