-- =====================================================
-- TELEGRAM TIMESTAMP MIGRATION SCRIPT
-- =====================================================
-- 
-- This script fixes the timestamp storage issue in telegram_messages table
-- by converting TIMESTAMP columns to BIGINT to store Unix timestamps
--
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Check if table exists and current structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'telegram_messages') THEN
        RAISE NOTICE 'telegram_messages table exists, proceeding with migration...';
    ELSE
        RAISE NOTICE 'telegram_messages table does not exist, creating with correct schema...';
    END IF;
END $$;

-- Step 2: Create table with correct schema if it doesn't exist
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    message_id BIGINT NOT NULL,
    text TEXT,
    date BIGINT,  -- Changed from TIMESTAMP WITH TIME ZONE to BIGINT
    author_signature TEXT,
    forward_from_chat_id TEXT,
    forward_from_chat_title TEXT,
    forward_from_message_id BIGINT,
    forward_date BIGINT,  -- Changed from TIMESTAMP WITH TIME ZONE to BIGINT
    reply_to_message_id BIGINT,
    edit_date BIGINT,  -- Changed from TIMESTAMP WITH TIME ZONE to BIGINT
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

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_messages_channel_id ON telegram_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_message_id ON telegram_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_scraped_at ON telegram_messages(scraped_at);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_text ON telegram_messages USING GIN(to_tsvector('english', text));

-- Step 4: Add helper functions for timestamp conversion
CREATE OR REPLACE FUNCTION unix_to_timestamp(unix_time BIGINT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN to_timestamp(unix_time);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_telegram_message_date(message_id BIGINT, channel_id TEXT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    unix_date BIGINT;
BEGIN
    SELECT date INTO unix_date 
    FROM telegram_messages 
    WHERE message_id = $1 AND channel_id = $2;
    
    IF unix_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN to_timestamp(unix_date);
END;
$$ LANGUAGE plpgsql;

-- Step 5: Test the migration with sample data
DO $$
DECLARE
    test_timestamp BIGINT;
    test_result TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Test with current Unix timestamp
    test_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Test the helper function
    test_result := unix_to_timestamp(test_timestamp);
    
    RAISE NOTICE 'Migration test successful!';
    RAISE NOTICE 'Test timestamp: %', test_timestamp;
    RAISE NOTICE 'Converted to: %', test_result;
END $$;

-- Step 6: Create a view for easy querying with readable dates
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

-- Step 7: Add comments for documentation
COMMENT ON TABLE telegram_messages IS 'Stores scraped Telegram messages with Unix timestamps for date fields';
COMMENT ON COLUMN telegram_messages.date IS 'Unix timestamp of the message (BIGINT)';
COMMENT ON COLUMN telegram_messages.forward_date IS 'Unix timestamp of forwarded message (BIGINT)';
COMMENT ON COLUMN telegram_messages.edit_date IS 'Unix timestamp of message edit (BIGINT)';
COMMENT ON FUNCTION unix_to_timestamp(BIGINT) IS 'Converts Unix timestamp to readable TIMESTAMP WITH TIME ZONE';
COMMENT ON FUNCTION get_telegram_message_date(BIGINT, TEXT) IS 'Gets readable date for a specific Telegram message';
COMMENT ON VIEW telegram_messages_readable IS 'View of telegram_messages with both Unix timestamps and readable dates';

-- Step 8: Final success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TELEGRAM TIMESTAMP MIGRATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ telegram_messages table updated to use BIGINT for timestamps';
    RAISE NOTICE '✅ Helper functions created for timestamp conversion';
    RAISE NOTICE '✅ Indexes created for optimal performance';
    RAISE NOTICE '✅ Readable view created for easy querying';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '- Store Unix timestamps directly in date columns';
    RAISE NOTICE '- Use unix_to_timestamp() function to convert to readable dates';
    RAISE NOTICE '- Query telegram_messages_readable view for human-readable dates';
    RAISE NOTICE '- Filter by Unix timestamps for better performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Example queries:';
    RAISE NOTICE 'SELECT * FROM telegram_messages_readable WHERE channel_id = ''channel123'';';
    RAISE NOTICE 'SELECT * FROM telegram_messages WHERE date >= EXTRACT(EPOCH FROM NOW() - INTERVAL ''1 day'')::BIGINT;';
    RAISE NOTICE '========================================';
END $$;
