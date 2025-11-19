-- ============================================================================
-- FIX FOR STATEMENT_ID ERROR
-- ============================================================================
-- This script fixes the "column statement_id does not exist" error
-- Run this AFTER running COMPLETE_SUPABASE_SCHEMA.sql if you encounter the error
-- ============================================================================

-- First, ensure billing_statements table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_statements') THEN
        CREATE TABLE billing_statements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            patient_id VARCHAR(255) NOT NULL,
            patient_name VARCHAR(255) NOT NULL,
            statement_date DATE NOT NULL,
            amount_due NUMERIC(10, 2) NOT NULL,
            due_date DATE,
            status statement_status DEFAULT 'pending',
            channel communication_channel,
            sent_at TIMESTAMP WITH TIME ZONE,
            delivered_at TIMESTAMP WITH TIME ZONE,
            viewed_at TIMESTAMP WITH TIME ZONE,
            paid_at TIMESTAMP WITH TIME ZONE,
            pdf_url TEXT,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created billing_statements table';
    END IF;
END $$;

-- Ensure payment_plans table has statement_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_plans' AND column_name = 'statement_id'
    ) THEN
        ALTER TABLE payment_plans ADD COLUMN statement_id UUID;
        RAISE NOTICE 'Added statement_id column to payment_plans';
    END IF;
END $$;

-- Ensure payment_reminders table has statement_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_reminders' AND column_name = 'statement_id'
    ) THEN
        ALTER TABLE payment_reminders ADD COLUMN statement_id UUID;
        RAISE NOTICE 'Added statement_id column to payment_reminders';
    END IF;
END $$;

-- Now add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_plans_statement_id_fkey'
    ) THEN
        ALTER TABLE payment_plans 
        ADD CONSTRAINT payment_plans_statement_id_fkey 
        FOREIGN KEY (statement_id) 
        REFERENCES billing_statements(id) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key for payment_plans.statement_id';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_reminders_statement_id_fkey'
    ) THEN
        ALTER TABLE payment_reminders 
        ADD CONSTRAINT payment_reminders_statement_id_fkey 
        FOREIGN KEY (statement_id) 
        REFERENCES billing_statements(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key for payment_reminders.statement_id';
    END IF;
END $$;

-- Create indexes
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_plans' AND column_name = 'statement_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_payment_plans_statement_id ON payment_plans(statement_id);
        RAISE NOTICE 'Created index on payment_plans.statement_id';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_reminders' AND column_name = 'statement_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_payment_reminders_statement_id ON payment_reminders(statement_id);
        RAISE NOTICE 'Created index on payment_reminders.statement_id';
    END IF;
    
    RAISE NOTICE '✅ All statement_id fixes applied successfully!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating indexes: %', SQLERRM;
END $$;

