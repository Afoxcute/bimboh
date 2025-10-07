-- =====================================================
-- URGENT FIX: Prices Table Upsert Constraint
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the upsert errors

-- Step 1: Check if the constraint already exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'prices' 
AND indexname LIKE '%unique%';

-- Step 2: Drop any existing problematic indexes
DROP INDEX IF EXISTS idx_prices_unique_token_timestamp;

-- Step 3: Create the proper unique constraint
CREATE UNIQUE INDEX idx_prices_unique_token_timestamp 
ON prices(token_uri, timestamp);

-- Step 4: Verify the constraint was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'prices' 
AND indexname = 'idx_prices_unique_token_timestamp';

-- Step 5: Test for duplicates (should return no rows)
SELECT 
    token_uri, 
    timestamp, 
    COUNT(*) as duplicate_count
FROM prices 
WHERE token_uri IS NOT NULL 
AND timestamp IS NOT NULL
GROUP BY token_uri, timestamp 
HAVING COUNT(*) > 1
LIMIT 5;

-- If you see duplicates above, clean them up with:
-- DELETE FROM prices WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY token_uri, timestamp ORDER BY id) as rn
--     FROM prices 
--     WHERE token_uri IS NOT NULL AND timestamp IS NOT NULL
--   ) t WHERE rn > 1
-- );
