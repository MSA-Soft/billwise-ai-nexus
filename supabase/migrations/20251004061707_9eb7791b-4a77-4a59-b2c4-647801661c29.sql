-- Create payment plans and installments tables

-- Payment plans table
CREATE TABLE public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  statement_id UUID REFERENCES public.billing_statements(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  down_payment DECIMAL(10,2) DEFAULT 0,
  remaining_balance DECIMAL(10,2) NOT NULL,
  monthly_payment DECIMAL(10,2) NOT NULL,
  number_of_payments INTEGER NOT NULL,
  payments_completed INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
  auto_pay BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

-- Payment installments table
CREATE TABLE public.payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  paid_date TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(payment_plan_id, installment_number)
);

ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_plans
CREATE POLICY "Patients can view own payment plans" ON public.payment_plans
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patients can insert own payment plans" ON public.payment_plans
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can create payment plans" ON public.payment_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can update payment plans" ON public.payment_plans
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patients can update own payment plans" ON public.payment_plans
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payment_installments
CREATE POLICY "Users can view installments of their plans" ON public.payment_installments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_plans pp
      WHERE pp.id = payment_plan_id AND pp.user_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can insert installments" ON public.payment_installments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can update installments" ON public.payment_installments
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patients can update their installments" ON public.payment_installments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_plans pp
      WHERE pp.id = payment_plan_id AND pp.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER set_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payment_installments_updated_at
  BEFORE UPDATE ON public.payment_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-update payment plan status
CREATE OR REPLACE FUNCTION public.update_payment_plan_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the payment plan's completed payments count
  UPDATE public.payment_plans
  SET 
    payments_completed = (
      SELECT COUNT(*) FROM public.payment_installments
      WHERE payment_plan_id = NEW.payment_plan_id AND status = 'paid'
    ),
    remaining_balance = total_amount - down_payment - (
      SELECT COALESCE(SUM(paid_amount), 0) FROM public.payment_installments
      WHERE payment_plan_id = NEW.payment_plan_id
    ),
    status = CASE
      WHEN (SELECT COUNT(*) FROM public.payment_installments
            WHERE payment_plan_id = NEW.payment_plan_id AND status = 'paid') = 
           (SELECT number_of_payments FROM public.payment_plans WHERE id = NEW.payment_plan_id)
      THEN 'completed'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.payment_plan_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update plan status when installment is paid
CREATE TRIGGER update_plan_on_installment_change
  AFTER UPDATE ON public.payment_installments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_payment_plan_status();