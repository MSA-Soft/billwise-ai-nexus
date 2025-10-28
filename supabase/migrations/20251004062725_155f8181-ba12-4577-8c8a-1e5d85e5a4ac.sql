-- Drop existing policies on payment_installments if any
DROP POLICY IF EXISTS "Users can view their own installments" ON public.payment_installments;
DROP POLICY IF EXISTS "Users can update their own installments" ON public.payment_installments;
DROP POLICY IF EXISTS "Users can insert their own installments" ON public.payment_installments;
DROP POLICY IF EXISTS "Users can delete their own installments" ON public.payment_installments;

-- Create security definer function to check payment plan ownership
CREATE OR REPLACE FUNCTION public.owns_payment_plan(_plan_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.payment_plans
    WHERE id = _plan_id
      AND user_id = _user_id
  )
$$;

-- Create RLS policies using the security definer function
CREATE POLICY "Users can view installments for their payment plans"
ON public.payment_installments
FOR SELECT
TO authenticated
USING (public.owns_payment_plan(payment_plan_id, auth.uid()));

CREATE POLICY "Users can update installments for their payment plans"
ON public.payment_installments
FOR UPDATE
TO authenticated
USING (public.owns_payment_plan(payment_plan_id, auth.uid()));

CREATE POLICY "Users can insert installments for their payment plans"
ON public.payment_installments
FOR INSERT
TO authenticated
WITH CHECK (public.owns_payment_plan(payment_plan_id, auth.uid()));

CREATE POLICY "Users can delete installments for their payment plans"
ON public.payment_installments
FOR DELETE
TO authenticated
USING (public.owns_payment_plan(payment_plan_id, auth.uid()));