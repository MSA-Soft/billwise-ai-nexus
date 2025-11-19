CREATE TABLE IF NOT EXISTS claim_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_claim_status_history_claim_id ON claim_status_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_status_history_status ON claim_status_history(status);
CREATE INDEX IF NOT EXISTS idx_claim_status_history_created_at ON claim_status_history(created_at);

-- Enable Row Level Security
ALTER TABLE claim_status_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read status history
CREATE POLICY "Allow authenticated users to read claim status history"
    ON claim_status_history
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert status history
CREATE POLICY "Allow authenticated users to insert claim status history"
    ON claim_status_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Verify the table was created
SELECT 'Claim status history table created successfully!' AS status;

