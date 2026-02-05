-- Table des frais de scolarité par niveau
CREATE TABLE IF NOT EXISTS public.tuition_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL,
  registration_fee NUMERIC NOT NULL DEFAULT 0,
  tuition_fee NUMERIC NOT NULL DEFAULT 0,
  other_fees NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (registration_fee + tuition_fee + other_fees) STORED,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, school_year)
);

-- Table des paiements des élèves
CREATE TABLE IF NOT EXISTS public.student_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tuition_fee_id UUID NOT NULL REFERENCES public.tuition_fees(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  receipt_number TEXT UNIQUE,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des dépenses de l'école
CREATE TABLE IF NOT EXISTS public.school_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tuition_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tuition_fees
CREATE POLICY "Admins can manage tuition fees" ON public.tuition_fees
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Everyone can view tuition fees" ON public.tuition_fees
  FOR SELECT USING (true);

-- RLS Policies for student_payments
CREATE POLICY "Admins can manage payments" ON public.student_payments
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Students can view their own payments" ON public.student_payments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view their children payments" ON public.student_payments
  FOR SELECT USING (has_role(auth.uid(), 'parent') AND is_parent_of_student(auth.uid(), student_id));

-- RLS Policies for school_expenses
CREATE POLICY "Admins can manage expenses" ON public.school_expenses
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Founders can view expenses" ON public.school_expenses
  FOR SELECT USING (has_role(auth.uid(), 'founder'));