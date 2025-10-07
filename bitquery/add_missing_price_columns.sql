-- =====================================================
-- ADD MISSING PRICE COLUMNS FOR BITQUERY INTEGRATION
-- =====================================================
-- This script adds the missing columns to the prices table
-- to support Bitquery price data collection.

-- Add missing columns to prices table
ALTER TABLE prices 
ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES tokens(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT false;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_prices_token_id ON prices(token_id);
CREATE INDEX IF NOT EXISTS idx_prices_timestamp ON prices(timestamp);
CREATE INDEX IF NOT EXISTS idx_prices_is_latest ON prices(is_latest);

-- Create unique constraint for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_unique_token_timestamp 
ON prices(token_uri, timestamp) 
WHERE token_uri IS NOT NULL AND timestamp IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN prices.token_id IS 'Reference to tokens table ID';
COMMENT ON COLUMN prices.timestamp IS 'Block timestamp from blockchain';
COMMENT ON COLUMN prices.is_latest IS 'Flag to mark the latest price for each token';

-- Create a function to update is_latest flags
CREATE OR REPLACE FUNCTION update_latest_prices()
RETURNS void AS $$
BEGIN
    -- Reset all is_latest flags to false
    UPDATE prices SET is_latest = false;
    
    -- Set is_latest to true for the most recent price of each token
    UPDATE prices 
    SET is_latest = true
    WHERE id IN (
        SELECT DISTINCT ON (token_uri) id
        FROM prices
        WHERE token_uri IS NOT NULL
        ORDER BY token_uri, timestamp DESC NULLS LAST, trade_at DESC
    );
END;
$$ LANGUAGE plpgsql;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prices' 
AND column_name IN ('token_id', 'timestamp', 'is_latest')
ORDER BY column_name;
