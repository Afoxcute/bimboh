-- =====================================================
-- SIMPLE TELEGRAM TIMESTAMP FIX
-- =====================================================
-- 
-- This script directly fixes the timestamp issue by:
-- 1. Dropping and recreating the table with correct schema
-- 2. Adding helper functions
-- 
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the existing table (this will delete all data!)
-- WARNING: This will delete all existing telegram_messages data
-- Uncomment the next line only if you want to start fresh
-- DROP TABLE IF EXISTS telegram_messages CASCADE;

-- Step 2: Create the table with correct BIGINT timestamp columns
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    message_id BIGINT NOT NULL,
    text TEXT,
    date BIGINT,  -- Unix timestamp as BIGINT
    author_signature TEXT,
    forward_from_chat_id TEXT,
    forward_from_chat_title TEXT,
    forward_from_message_id BIGINT,
    forward_date BIGINT,  -- Unix timestamp as BIGINT
    reply_to_message_id BIGINT,
    edit_date BIGINT,  -- Unix timestamp as BIGINT
    media_group_id TEXT,
    has_photo BOOLEAN DEFAULT false,
    has_video BOOLEAN DEFAULT false,
    has_document BOOLEAN DEFAULT false,
    has_audio BOOLEAN DEFAULT false,
    has_voice BOOLEAN DEFAULT false,
    has_video_note BOOLEAN DEFAULT false,
    has_sticker BOOLEAN DEFAULT false,
    has_animation BOOLEAN DEFAULT false,
    has_contact BOOLEAN DEFAULT false,
    has_location BOOLEAN DEFAULT false,
    has_venue BOOLEAN DEFAULT false,
    has_poll BOOLEAN DEFAULT false,
    photo_urls TEXT[],
    video_url TEXT,
    document_url TEXT,
    audio_url TEXT,
    voice_url TEXT,
    views INTEGER,
    reactions_count INTEGER,
    entities JSONB,
    caption TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_data JSONB DEFAULT '{}'::jsonb,
    UNIQUE(channel_id, message_id)
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_messages_channel_id ON telegram_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_message_id ON telegram_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_scraped_at ON telegram_messages(scraped_at);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_text ON telegram_messages USING GIN(to_tsvector('english', text));

-- Step 4: Create helper function for Unix timestamp conversion
CREATE OR REPLACE FUNCTION unix_to_timestamp(unix_time BIGINT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN to_timestamp(unix_time);
END;
$$ LANGUAGE plpgsql;

-- Step 5: Test the function with a sample Unix timestamp
DO $$
DECLARE
    test_timestamp BIGINT := 1753952654;  -- The timestamp that was causing the error
    result TIMESTAMP WITH TIME ZONE;
BEGIN
    result := unix_to_timestamp(test_timestamp);
    RAISE NOTICE 'Test successful! Unix timestamp % converts to %', test_timestamp, result;
END $$;

-- Step 6: Test inserting a sample message
DO $$
DECLARE
    test_message_id BIGINT := 999999;
    test_channel_id TEXT := 'test_migration';
BEGIN
    -- Insert test message
    INSERT INTO telegram_messages (
        channel_id, 
        message_id, 
        text, 
        date
    ) VALUES (
        test_channel_id,
        test_message_id,
        'Test message for migration',
        1753952654  -- The problematic timestamp
    );
    
    RAISE NOTICE 'Test insert successful!';
    
    -- Clean up test data
    DELETE FROM telegram_messages 
    WHERE channel_id = test_channel_id AND message_id = test_message_id;
    
    RAISE NOTICE 'Test data cleaned up';
END $$;

-- Step 7: Create a view for easy querying with readable dates
CREATE OR REPLACE VIEW telegram_messages_readable AS
SELECT 
    id,
    channel_id,
    channel_title,
    message_id,
    text,
    unix_to_timestamp(date) as message_date,
    date as unix_timestamp,
    author_signature,
    forward_from_chat_id,
    forward_from_chat_title,
    forward_from_message_id,
    unix_to_timestamp(forward_date) as forward_date_readable,
    forward_date as forward_date_unix,
    reply_to_message_id,
    unix_to_timestamp(edit_date) as edit_date_readable,
    edit_date as edit_date_unix,
    media_group_id,
    has_photo,
    has_video,
    has_document,
    has_audio,
    has_voice,
    has_video_note,
    has_sticker,
    has_animation,
    has_contact,
    has_location,
    has_venue,
    has_poll,
    photo_urls,
    video_url,
    document_url,
    audio_url,
    voice_url,
    views,
    reactions_count,
    entities,
    caption,
    scraped_at,
    raw_data
FROM telegram_messages;

-- Step 8: Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TELEGRAM TIMESTAMP FIX COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ telegram_messages table created with BIGINT timestamps';
    RAISE NOTICE '✅ unix_to_timestamp() function created and tested';
    RAISE NOTICE '✅ Test insert with problematic timestamp (1753952654) successful';
    RAISE NOTICE '✅ telegram_messages_readable view created';
    RAISE NOTICE '';
    RAISE NOTICE 'Your Telegram scrapers should now work without timestamp errors!';
    RAISE NOTICE '========================================';
END $$;
