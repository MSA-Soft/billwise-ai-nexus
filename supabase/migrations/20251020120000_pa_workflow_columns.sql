-- Add PA workflow columns to authorization_requests (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='authorization_requests' AND column_name='pa_required'
  ) THEN
    ALTER TABLE public.authorization_requests ADD COLUMN pa_required boolean;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='authorization_requests' AND column_name='submission_ref'
  ) THEN
    ALTER TABLE public.authorization_requests ADD COLUMN submission_ref text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='authorization_requests' AND column_name='ack_status'
  ) THEN
    ALTER TABLE public.authorization_requests ADD COLUMN ack_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='authorization_requests' AND column_name='review_status'
  ) THEN
    ALTER TABLE public.authorization_requests ADD COLUMN review_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='authorization_requests' AND column_name='auth_number'
  ) THEN
    ALTER TABLE public.authorization_requests ADD COLUMN auth_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='authorization_requests' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.authorization_requests ADD COLUMN updated_at timestamptz;
  END IF;
END $$;

-- Create simple events table
CREATE TABLE IF NOT EXISTS public.authorization_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  authorization_request_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Basic FK (no cascade for audit safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'authorization_events_request_fkey'
  ) THEN
    ALTER TABLE public.authorization_events
      ADD CONSTRAINT authorization_events_request_fkey
      FOREIGN KEY (authorization_request_id)
      REFERENCES public.authorization_requests (id);
  END IF;
END $$;


