-- =====================================================
-- IMMEDIATE FIX: Foreign Key Relationship
-- =====================================================
-- Copy and paste this into your Supabase SQL Editor to fix the relationship error

-- Step 1: Check if the constraint already exists
SELECT 
    conname,
    contype,
    confrelid::regclass as referenced_table,
    confkey
FROM pg_constraint 
WHERE conrelid = 'prices'::regclass 
AND conname = 'fk_prices_token_uri';

-- Step 2: Drop any existing foreign key constraints on token_uri
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find existing foreign key constraint on token_uri
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'prices'::regclass 
    AND contype = 'f' 
    AND confkey::text LIKE '%token_uri%';
    
    -- Drop it if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE prices DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped existing constraint: %', constraint_name;
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

-- Step 5: Test the relationship (this should work now)
SELECT 
    p.id,
    p.token_uri,
    t.name,
    t.symbol
FROM prices p
LEFT JOIN tokens t ON p.token_uri = t.uri
LIMIT 5;
