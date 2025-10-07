-- Quick fix for prices upsert constraint
-- Copy and paste this into your Supabase SQL Editor

DROP INDEX IF EXISTS idx_prices_unique_token_timestamp;
CREATE UNIQUE INDEX idx_prices_unique_token_timestamp ON prices(token_uri, timestamp);
