-- =====================================================
-- ADD MISSING TOKEN COLUMNS FOR BITQUERY INTEGRATION
-- =====================================================
-- This script adds the missing 'address' and 'create_tx' columns
-- to the tokens table to support Bitquery data collection.

-- Add missing columns to tokens table
ALTER TABLE tokens 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS create_tx TEXT;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address);
CREATE INDEX IF NOT EXISTS idx_tokens_create_tx ON tokens(create_tx);

-- Add comments for documentation
COMMENT ON COLUMN tokens.address IS 'Solana token address';
COMMENT ON COLUMN tokens.create_tx IS 'Transaction signature that created the token';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tokens' 
AND column_name IN ('address', 'create_tx')
ORDER BY column_name;
