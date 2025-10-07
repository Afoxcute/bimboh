-- Quick fix for prices foreign key constraint
-- Copy and paste this into your Supabase SQL Editor

-- Add the missing foreign key constraint with explicit name
ALTER TABLE prices ADD CONSTRAINT fk_prices_token_uri 
FOREIGN KEY (token_uri) REFERENCES tokens(uri) ON DELETE CASCADE;
