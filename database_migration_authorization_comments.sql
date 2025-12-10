-- Migration: Add Comments and Remaining Fields to Authorization Requests
-- Date: December 2024

-- Add comments table for authorization requests
CREATE TABLE IF NOT EXISTS public.authorization_request_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  authorization_request_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  is_internal boolean DEFAULT false,
  comment_type character varying DEFAULT 'general', -- general, status_update, payer_communication, clinical_note, appeal_note
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  company_id uuid,
  CONSTRAINT authorization_request_comments_pkey PRIMARY KEY (id),
  CONSTRAINT authorization_request_comments_authorization_request_id_fkey FOREIGN KEY (authorization_request_id) REFERENCES public.authorization_requests(id) ON DELETE CASCADE,
  CONSTRAINT authorization_request_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT authorization_request_comments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_authorization_request_comments_auth_id ON public.authorization_request_comments(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_authorization_request_comments_user_id ON public.authorization_request_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_authorization_request_comments_company_id ON public.authorization_request_comments(company_id);

-- Add remaining fields to authorization_requests table if they don't exist
DO $$ 
BEGIN
  -- Subscriber Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_is_patient') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_is_patient boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_first_name') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_first_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_last_name') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_last_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_dob') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_dob date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_relationship') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_relationship text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_address') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_address text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_city') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_state') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_state text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'subscriber_zip') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN subscriber_zip text;
  END IF;

  -- Referring Provider
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'referring_provider_id') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN referring_provider_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'referring_provider_npi') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN referring_provider_npi text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'referring_provider_name') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN referring_provider_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'referral_number') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN referral_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'referral_date') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN referral_date date;
  END IF;

  -- Insurance Plan Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'group_number') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN group_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'policy_number') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN policy_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'effective_date') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN effective_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'termination_date') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN termination_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'plan_type') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN plan_type text;
  END IF;

  -- Secondary Insurance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'secondary_payer_id') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN secondary_payer_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'secondary_payer_name') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN secondary_payer_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'secondary_member_id') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN secondary_member_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'secondary_group_number') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN secondary_group_number text;
  END IF;

  -- Facility Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'facility_id') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN facility_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'facility_name') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN facility_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'place_of_service') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN place_of_service text;
  END IF;

  -- Authorization Workflow
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'authorization_type') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN authorization_type text DEFAULT 'prior';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'submission_method') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN submission_method text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'expected_response_date') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN expected_response_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'payer_confirmation_number') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN payer_confirmation_number text;
  END IF;

  -- Task Management
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'assigned_to') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN assigned_to uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'priority') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN priority text DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'due_date') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN due_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'internal_notes') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN internal_notes text;
  END IF;

  -- Provider ID (if missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorization_requests' AND column_name = 'provider_id') THEN
    ALTER TABLE public.authorization_requests ADD COLUMN provider_id uuid;
  END IF;

END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Referring Provider
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'authorization_requests_referring_provider_id_fkey') THEN
    ALTER TABLE public.authorization_requests ADD CONSTRAINT authorization_requests_referring_provider_id_fkey 
      FOREIGN KEY (referring_provider_id) REFERENCES public.providers(id);
  END IF;

  -- Secondary Payer
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'authorization_requests_secondary_payer_id_fkey') THEN
    ALTER TABLE public.authorization_requests ADD CONSTRAINT authorization_requests_secondary_payer_id_fkey 
      FOREIGN KEY (secondary_payer_id) REFERENCES public.insurance_payers(id);
  END IF;

  -- Facility
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'authorization_requests_facility_id_fkey') THEN
    ALTER TABLE public.authorization_requests ADD CONSTRAINT authorization_requests_facility_id_fkey 
      FOREIGN KEY (facility_id) REFERENCES public.facilities(id);
  END IF;

  -- Provider
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'authorization_requests_provider_id_fkey') THEN
    ALTER TABLE public.authorization_requests ADD CONSTRAINT authorization_requests_provider_id_fkey 
      FOREIGN KEY (provider_id) REFERENCES public.providers(id);
  END IF;

  -- Assigned To
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'authorization_requests_assigned_to_fkey') THEN
    ALTER TABLE public.authorization_requests ADD CONSTRAINT authorization_requests_assigned_to_fkey 
      FOREIGN KEY (assigned_to) REFERENCES auth.users(id);
  END IF;
END $$;

-- Add RLS policies for comments table
ALTER TABLE public.authorization_request_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view comments for authorizations in their company
CREATE POLICY "Users can view authorization comments in their company"
  ON public.authorization_request_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE company_users.user_id = auth.uid() 
      AND company_users.company_id = authorization_request_comments.company_id
      AND company_users.is_active = true
    )
    OR company_id IS NULL
  );

-- Policy: Users can insert comments for authorizations in their company
CREATE POLICY "Users can insert authorization comments in their company"
  ON public.authorization_request_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE company_users.user_id = auth.uid() 
      AND company_users.company_id = authorization_request_comments.company_id
      AND company_users.is_active = true
    )
    OR company_id IS NULL
  );

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own authorization comments"
  ON public.authorization_request_comments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own comments or admins can delete any
CREATE POLICY "Users can delete their own authorization comments"
  ON public.authorization_request_comments
  FOR DELETE
  USING (user_id = auth.uid());

