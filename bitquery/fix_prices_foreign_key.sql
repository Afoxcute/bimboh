-- =====================================================
-- FIX PRICES TABLE FOREIGN KEY CONSTRAINT
-- =====================================================
-- This script adds the missing foreign key constraint with explicit name

-- Step 1: Check if the constraint already exists
SELECT 
    conname,
    contype,
    confrelid::regclass as referenced_table,
    confkey
FROM pg_constraint 
WHERE conrelid = 'prices'::regclass 
AND conname = 'fk_prices_token_uri';

-- Step 2: Drop existing foreign key if it exists (without name)
DO $$
BEGIN
    -- Check if there's an unnamed foreign key constraint
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'prices'::regclass 
        AND contype = 'f' 
        AND conname LIKE '%token_uri%'
    ) THEN
        -- Find and drop the unnamed constraint
        EXECUTE (
            SELECT 'ALTER TABLE prices DROP CONSTRAINT ' || conname
            FROM pg_constraint 
            WHERE conrelid = 'prices'::regclass 
            AND contype = 'f' 
            AND conname LIKE '%token_uri%'
            LIMIT 1
        );
    END IF;
END $$;

-- Step 3: Add the foreign key constraint with explicit name
ALTER TABLE prices ADD CONSTRAINT fk_prices_token_uri 
FOREIGN KEY (token_uri) REFERENCES tokens(uri) ON DELETE CASCADE;

-- Step 4: Verify the constraint was created
SELECT 
    conname,
    contype,
    confrelid::regclass as referenced_table,
    confkey
FROM pg_constraint 
WHERE conrelid = 'prices'::regclass 
AND conname = 'fk_prices_token_uri';

-- Step 5: Test the relationship (should work now)
-- This query should work without errors:
-- SELECT p.*, t.name, t.symbol 
-- FROM prices p
-- LEFT JOIN tokens t ON p.token_uri = t.uri
-- LIMIT 5;
