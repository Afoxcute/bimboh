-- Quick fix for foreign key relationship
-- Copy and paste this into your Supabase SQL Editor

-- Drop any existing constraint on token_uri
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'prices'::regclass 
    AND contype = 'f' 
    AND confkey::text LIKE '%token_uri%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE prices DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE prices ADD CONSTRAINT fk_prices_token_uri 
FOREIGN KEY (token_uri) REFERENCES tokens(uri) ON DELETE CASCADE;
