-- Add missing columns to collection_activities table
ALTER TABLE collection_activities 
ADD COLUMN IF NOT EXISTS amount_discussed DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS promise_to_pay_date DATE,
ADD COLUMN IF NOT EXISTS performed_by TEXT,
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS outcome TEXT;

-- Update the activity_type enum if needed
DO $$ 
BEGIN
    -- Check if the enum values exist, if not add them
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'promise_to_pay' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'activity_type')) THEN
        ALTER TYPE activity_type ADD VALUE 'promise_to_pay';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partial_payment' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'activity_type')) THEN
        ALTER TYPE activity_type ADD VALUE 'partial_payment';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'note_added' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'activity_type')) THEN
        ALTER TYPE activity_type ADD VALUE 'note_added';
    END IF;
END $$;

-- Create contact_method enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_method') THEN
        CREATE TYPE contact_method AS ENUM ('phone', 'email', 'mail', 'sms', 'in_person');
    END IF;
END $$;

-- Update the contact_method column to use the enum
ALTER TABLE collection_activities 
ALTER COLUMN contact_method TYPE contact_method USING contact_method::contact_method;

