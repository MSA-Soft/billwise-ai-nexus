-- ============================================================================
-- FIX INSURANCE PAYERS TABLE - ADD MISSING ADDRESS COLUMN
-- ============================================================================
-- Run this in Supabase SQL Editor if you get "column address does not exist" error
-- ============================================================================

-- Add missing address-related columns if they don't exist
DO $$ 
BEGIN
    -- Ensure address column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'address') THEN
        ALTER TABLE insurance_payers ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column';
    ELSE
        RAISE NOTICE 'Address column already exists';
    END IF;
    
    -- Ensure city column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'city') THEN
        ALTER TABLE insurance_payers ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Added city column';
    ELSE
        RAISE NOTICE 'City column already exists';
    END IF;
    
    -- Ensure state column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'state') THEN
        ALTER TABLE insurance_payers ADD COLUMN state VARCHAR(50);
        RAISE NOTICE 'Added state column';
    ELSE
        RAISE NOTICE 'State column already exists';
    END IF;
    
    -- Ensure phone column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'phone') THEN
        ALTER TABLE insurance_payers ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Added phone column';
    ELSE
        RAISE NOTICE 'Phone column already exists';
    END IF;
END $$;

-- Verify columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'insurance_payers'
    AND column_name IN ('address', 'city', 'state', 'phone', 'zip_code')
ORDER BY column_name;

SELECT '✅ Insurance payers address columns fixed!' AS status;

