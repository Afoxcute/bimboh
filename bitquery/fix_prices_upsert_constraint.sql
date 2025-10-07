-- =====================================================
-- FIX PRICES TABLE UPSERT CONSTRAINT
-- =====================================================
-- This script fixes the missing unique constraint for upsert operations

-- Drop the existing partial unique index if it exists
DROP INDEX IF EXISTS idx_prices_unique_token_timestamp;

-- Create a proper unique constraint for upsert operations
CREATE UNIQUE INDEX idx_prices_unique_token_timestamp 
ON prices(token_uri, timestamp);

-- Verify the constraint was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'prices' 
AND indexname = 'idx_prices_unique_token_timestamp';

-- Test the constraint by checking for duplicates
SELECT 
    token_uri, 
    timestamp, 
    COUNT(*) as duplicate_count
FROM prices 
WHERE token_uri IS NOT NULL 
AND timestamp IS NOT NULL
GROUP BY token_uri, timestamp 
HAVING COUNT(*) > 1
LIMIT 10;
