-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  patient_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  ssn TEXT,
  phone TEXT,
  phone_primary TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  marital_status TEXT,
  race TEXT,
  ethnicity TEXT,
  language TEXT DEFAULT 'English',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_relation TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  npi TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  patient_id UUID REFERENCES public.patients(id),
  provider_id UUID REFERENCES public.providers(id),
  appointment_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create authorization_requests table
CREATE TABLE IF NOT EXISTS public.authorization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  patient_dob TEXT,
  patient_member_id TEXT,
  patient_gender TEXT,
  payer_name TEXT,
  payer_id TEXT,
  service_type TEXT,
  diagnosis_codes TEXT[],
  procedure_codes TEXT[],
  requested_date DATE DEFAULT CURRENT_DATE,
  service_start_date DATE,
  service_end_date DATE,
  units_requested INTEGER,
  pa_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  auth_number TEXT,
  ack_status TEXT,
  clinical_indication TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorization_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Authenticated users can view all patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete patients" ON public.patients FOR DELETE TO authenticated USING (true);

-- RLS Policies for providers
CREATE POLICY "Authenticated users can view all providers" ON public.providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create providers" ON public.providers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update providers" ON public.providers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete providers" ON public.providers FOR DELETE TO authenticated USING (true);

-- RLS Policies for appointments
CREATE POLICY "Authenticated users can view all appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);

-- RLS Policies for authorization_requests
CREATE POLICY "Users can view their own authorization requests" ON public.authorization_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own authorization requests" ON public.authorization_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own authorization requests" ON public.authorization_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own authorization requests" ON public.authorization_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_npi ON public.providers(npi);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON public.appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_authorization_requests_user_id ON public.authorization_requests(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_authorization_requests_updated_at BEFORE UPDATE ON public.authorization_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();