-- URGENT: Fix collection_activities table schema
-- Run this in your Supabase SQL Editor to fix the missing columns error

-- Add missing columns to collection_activities table
ALTER TABLE collection_activities 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS amount_discussed DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS promise_to_pay_date DATE,
ADD COLUMN IF NOT EXISTS performed_by TEXT,
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS outcome TEXT;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS collection_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL,
    user_id UUID,
    activity_type TEXT NOT NULL,
    contact_method TEXT,
    outcome TEXT,
    notes TEXT NOT NULL,
    promise_to_pay_date DATE,
    amount_discussed DECIMAL(10,2),
    performed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS collections_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    patient_id TEXT,
    current_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    collection_stage TEXT NOT NULL DEFAULT 'early_collection',
    collection_status TEXT NOT NULL DEFAULT 'active',
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'collection_activities_collection_account_id_fkey') THEN
        ALTER TABLE collection_activities 
        ADD CONSTRAINT collection_activities_collection_account_id_fkey 
        FOREIGN KEY (collection_account_id) REFERENCES collections_accounts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE collection_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own collection activities" ON collection_activities;
DROP POLICY IF EXISTS "Users can insert their own collection activities" ON collection_activities;
DROP POLICY IF EXISTS "Users can update their own collection activities" ON collection_activities;
DROP POLICY IF EXISTS "Users can delete their own collection activities" ON collection_activities;

DROP POLICY IF EXISTS "Users can view all collection accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can insert collection accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can update collection accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can delete collection accounts" ON collections_accounts;

CREATE POLICY "Users can view their own collection activities" ON collection_activities
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own collection activities" ON collection_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own collection activities" ON collection_activities
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own collection activities" ON collection_activities
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view all collection accounts" ON collections_accounts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert collection accounts" ON collections_accounts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update collection accounts" ON collections_accounts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete collection accounts" ON collections_accounts
    FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_activities_account_id ON collection_activities(collection_account_id);
CREATE INDEX IF NOT EXISTS idx_collection_activities_user_id ON collection_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_activities_created_at ON collection_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_collections_accounts_patient_name ON collections_accounts(patient_name);
CREATE INDEX IF NOT EXISTS idx_collections_accounts_collection_stage ON collections_accounts(collection_stage);

-- Insert some sample data if tables are empty
INSERT INTO collections_accounts (patient_name, patient_id, current_balance, original_balance, collection_stage, collection_status)
SELECT 'Muhammad Wasay', gen_random_uuid(), 1800.00, 1800.00, 'early_collection', 'active'
WHERE NOT EXISTS (SELECT 1 FROM collections_accounts WHERE patient_name = 'Muhammad Wasay');

-- Success message
SELECT 'Database schema fixed successfully! All missing columns have been added.' as status;
