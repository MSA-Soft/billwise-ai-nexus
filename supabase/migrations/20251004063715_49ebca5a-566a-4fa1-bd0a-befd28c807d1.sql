-- Create enums for collections management
CREATE TYPE public.collection_status AS ENUM ('active', 'payment_plan', 'settled', 'attorney_referral', 'closed', 'dispute');
CREATE TYPE public.collection_stage AS ENUM ('early_collection', 'mid_collection', 'late_collection', 'pre_legal');
CREATE TYPE public.collection_activity_type AS ENUM ('phone_call', 'email_sent', 'letter_sent', 'dispute_received', 'promise_to_pay', 'partial_payment', 'settlement_offer', 'note_added');
CREATE TYPE public.contact_method AS ENUM ('phone', 'email', 'mail', 'sms', 'in_person');
CREATE TYPE public.letter_type AS ENUM ('initial_notice', 'second_notice', 'final_notice', 'pre_legal_notice', 'cease_communication', 'settlement_agreement');
CREATE TYPE public.settlement_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'completed');
CREATE TYPE public.attorney_referral_status AS ENUM ('pending', 'accepted', 'in_progress', 'judgment_obtained', 'collecting', 'closed', 'returned');
CREATE TYPE public.dispute_status AS ENUM ('open', 'investigating', 'resolved_patient_favor', 'resolved_practice_favor', 'closed');

-- Collections accounts table
CREATE TABLE public.collections_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  original_balance DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  collection_stage collection_stage NOT NULL DEFAULT 'early_collection',
  collection_status collection_status NOT NULL DEFAULT 'active',
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_contact_date TIMESTAMPTZ,
  next_action_date TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT positive_balance CHECK (current_balance >= 0)
);

ALTER TABLE public.collections_accounts ENABLE ROW LEVEL SECURITY;

-- Collection activities table
CREATE TABLE public.collection_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_account_id UUID NOT NULL REFERENCES public.collections_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type collection_activity_type NOT NULL,
  contact_method contact_method,
  notes TEXT,
  outcome TEXT,
  promise_to_pay_date DATE,
  amount_discussed DECIMAL(10,2),
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collection_activities ENABLE ROW LEVEL SECURITY;

-- Collection letters table
CREATE TABLE public.collection_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_account_id UUID NOT NULL REFERENCES public.collections_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  letter_type letter_type NOT NULL,
  template_name TEXT NOT NULL,
  sent_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collection_letters ENABLE ROW LEVEL SECURITY;

-- Settlement offers table
CREATE TABLE public.settlement_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_account_id UUID NOT NULL REFERENCES public.collections_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  offer_amount DECIMAL(10,2) NOT NULL,
  offer_percentage INTEGER NOT NULL,
  settlement_status settlement_status NOT NULL DEFAULT 'pending',
  expiration_date DATE NOT NULL,
  accepted_date TIMESTAMPTZ,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settlement_offers ENABLE ROW LEVEL SECURITY;

-- Attorney referrals table
CREATE TABLE public.attorney_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_account_id UUID NOT NULL REFERENCES public.collections_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  attorney_firm TEXT NOT NULL,
  attorney_contact TEXT,
  attorney_email TEXT,
  attorney_phone TEXT,
  referral_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  referral_amount DECIMAL(10,2) NOT NULL,
  account_balance_at_referral DECIMAL(10,2) NOT NULL,
  referral_status attorney_referral_status NOT NULL DEFAULT 'pending',
  case_number TEXT,
  expected_action TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.attorney_referrals ENABLE ROW LEVEL SECURITY;

-- Dispute claims table
CREATE TABLE public.dispute_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_account_id UUID NOT NULL REFERENCES public.collections_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  dispute_reason TEXT NOT NULL,
  dispute_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispute_status dispute_status NOT NULL DEFAULT 'open',
  resolution_date TIMESTAMPTZ,
  resolution_notes TEXT,
  supporting_documents TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dispute_claims ENABLE ROW LEVEL SECURITY;

-- Security definer function to check collections account ownership
CREATE OR REPLACE FUNCTION public.owns_collection_account(_account_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.collections_accounts
    WHERE id = _account_id
      AND user_id = _user_id
  )
$$;

-- RLS Policies for collections_accounts
CREATE POLICY "Users can view their own collections accounts"
ON public.collections_accounts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own collections accounts"
ON public.collections_accounts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collections accounts"
ON public.collections_accounts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own collections accounts"
ON public.collections_accounts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for collection_activities
CREATE POLICY "Users can view activities for their collections accounts"
ON public.collection_activities
FOR SELECT
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can create activities for their collections accounts"
ON public.collection_activities
FOR INSERT
TO authenticated
WITH CHECK (public.owns_collection_account(collection_account_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update activities for their collections accounts"
ON public.collection_activities
FOR UPDATE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can delete activities for their collections accounts"
ON public.collection_activities
FOR DELETE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

-- RLS Policies for collection_letters
CREATE POLICY "Users can view letters for their collections accounts"
ON public.collection_letters
FOR SELECT
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can create letters for their collections accounts"
ON public.collection_letters
FOR INSERT
TO authenticated
WITH CHECK (public.owns_collection_account(collection_account_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update letters for their collections accounts"
ON public.collection_letters
FOR UPDATE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can delete letters for their collections accounts"
ON public.collection_letters
FOR DELETE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

-- RLS Policies for settlement_offers
CREATE POLICY "Users can view settlement offers for their collections accounts"
ON public.settlement_offers
FOR SELECT
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can create settlement offers for their collections accounts"
ON public.settlement_offers
FOR INSERT
TO authenticated
WITH CHECK (public.owns_collection_account(collection_account_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update settlement offers for their collections accounts"
ON public.settlement_offers
FOR UPDATE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can delete settlement offers for their collections accounts"
ON public.settlement_offers
FOR DELETE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

-- RLS Policies for attorney_referrals
CREATE POLICY "Users can view attorney referrals for their collections accounts"
ON public.attorney_referrals
FOR SELECT
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can create attorney referrals for their collections accounts"
ON public.attorney_referrals
FOR INSERT
TO authenticated
WITH CHECK (public.owns_collection_account(collection_account_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update attorney referrals for their collections accounts"
ON public.attorney_referrals
FOR UPDATE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can delete attorney referrals for their collections accounts"
ON public.attorney_referrals
FOR DELETE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

-- RLS Policies for dispute_claims
CREATE POLICY "Users can view dispute claims for their collections accounts"
ON public.dispute_claims
FOR SELECT
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can create dispute claims for their collections accounts"
ON public.dispute_claims
FOR INSERT
TO authenticated
WITH CHECK (public.owns_collection_account(collection_account_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update dispute claims for their collections accounts"
ON public.dispute_claims
FOR UPDATE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

CREATE POLICY "Users can delete dispute claims for their collections accounts"
ON public.dispute_claims
FOR DELETE
TO authenticated
USING (public.owns_collection_account(collection_account_id, auth.uid()));

-- Create indexes for better query performance
CREATE INDEX idx_collections_accounts_user_id ON public.collections_accounts(user_id);
CREATE INDEX idx_collections_accounts_status ON public.collections_accounts(collection_status);
CREATE INDEX idx_collections_accounts_stage ON public.collections_accounts(collection_stage);
CREATE INDEX idx_collection_activities_account_id ON public.collection_activities(collection_account_id);
CREATE INDEX idx_collection_letters_account_id ON public.collection_letters(collection_account_id);
CREATE INDEX idx_settlement_offers_account_id ON public.settlement_offers(collection_account_id);
CREATE INDEX idx_attorney_referrals_account_id ON public.attorney_referrals(collection_account_id);
CREATE INDEX idx_dispute_claims_account_id ON public.dispute_claims(collection_account_id);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_settlement_offers_updated_at
  BEFORE UPDATE ON public.settlement_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attorney_referrals_updated_at
  BEFORE UPDATE ON public.attorney_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispute_claims_updated_at
  BEFORE UPDATE ON public.dispute_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();