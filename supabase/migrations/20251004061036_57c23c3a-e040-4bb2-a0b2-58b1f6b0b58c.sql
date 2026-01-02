-- Phase 1 & 2: Emergency Database Lockdown + Role-Based Access Control

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('patient', 'billing_staff', 'admin');

-- 2. Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Add user_id columns to tables that need them
ALTER TABLE public.billing_statements ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.patient_communication_preferences ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Drop all existing dangerous RLS policies
DROP POLICY IF EXISTS "Anyone can read billing statements" ON public.billing_statements;
DROP POLICY IF EXISTS "Anyone can create billing statements" ON public.billing_statements;
DROP POLICY IF EXISTS "Anyone can update billing statements" ON public.billing_statements;
DROP POLICY IF EXISTS "Anyone can delete billing statements" ON public.billing_statements;

DROP POLICY IF EXISTS "Anyone can read billing cycles" ON public.billing_cycles;
DROP POLICY IF EXISTS "Anyone can create billing cycles" ON public.billing_cycles;
DROP POLICY IF EXISTS "Anyone can update billing cycles" ON public.billing_cycles;
DROP POLICY IF EXISTS "Anyone can delete billing cycles" ON public.billing_cycles;

DROP POLICY IF EXISTS "Anyone can read payment reminders" ON public.payment_reminders;
DROP POLICY IF EXISTS "Anyone can create payment reminders" ON public.payment_reminders;
DROP POLICY IF EXISTS "Anyone can update payment reminders" ON public.payment_reminders;
DROP POLICY IF EXISTS "Anyone can delete payment reminders" ON public.payment_reminders;

DROP POLICY IF EXISTS "Anyone can read communication preferences" ON public.patient_communication_preferences;
DROP POLICY IF EXISTS "Anyone can create communication preferences" ON public.patient_communication_preferences;
DROP POLICY IF EXISTS "Anyone can update communication preferences" ON public.patient_communication_preferences;
DROP POLICY IF EXISTS "Anyone can delete communication preferences" ON public.patient_communication_preferences;

DROP POLICY IF EXISTS "Anyone can read chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can create chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can delete chat conversations" ON public.chat_conversations;

DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can delete chat messages" ON public.chat_messages;

-- 7. Create SECURE RLS policies

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- User roles: Only admins can manage roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Billing statements: Patients see own, staff/admin see all
CREATE POLICY "Patients can view own billing statements" ON public.billing_statements
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can create billing statements" ON public.billing_statements
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can update billing statements" ON public.billing_statements
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Billing cycles: Admin only
CREATE POLICY "Admins can view billing cycles" ON public.billing_cycles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create billing cycles" ON public.billing_cycles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update billing cycles" ON public.billing_cycles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete billing cycles" ON public.billing_cycles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payment reminders: Patients see own, staff/admin see all
CREATE POLICY "Patients can view own reminders" ON public.payment_reminders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.billing_statements bs
      WHERE bs.id = statement_id AND bs.user_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Communication preferences: Patients manage own, staff/admin view all
CREATE POLICY "Patients can view own preferences" ON public.patient_communication_preferences
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patients can update own preferences" ON public.patient_communication_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert own preferences" ON public.patient_communication_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Chat conversations: Users see own conversations
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON public.chat_conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Chat messages: Users see messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations cc
      WHERE cc.id = conversation_id AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations cc
      WHERE cc.id = conversation_id AND cc.user_id = auth.uid()
    )
  );

-- 8. Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Give new users the 'patient' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();