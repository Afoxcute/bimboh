-- =====================================================
-- SIMPLE TELEGRAM TIMESTAMP FIX - MINIMAL VERSION
-- =====================================================
-- 
-- Just run these 3 commands in your Supabase SQL Editor
-- =====================================================

-- 1. Drop and recreate the table with correct schema
DROP TABLE IF EXISTS telegram_messages CASCADE;

CREATE TABLE telegram_messages (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    message_id BIGINT NOT NULL,
    text TEXT,
    date BIGINT,  -- Unix timestamp
    author_signature TEXT,
    forward_from_chat_id TEXT,
    forward_from_chat_title TEXT,
    forward_from_message_id BIGINT,
    forward_date BIGINT,  -- Unix timestamp
    reply_to_message_id BIGINT,
    edit_date BIGINT,  -- Unix timestamp
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

-- 2. Create helper function
CREATE OR REPLACE FUNCTION unix_to_timestamp(unix_time BIGINT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN to_timestamp(unix_time);
END;
$$ LANGUAGE plpgsql;

-- 3. Create indexes
CREATE INDEX idx_telegram_messages_channel_id ON telegram_messages(channel_id);
CREATE INDEX idx_telegram_messages_message_id ON telegram_messages(message_id);
CREATE INDEX idx_telegram_messages_date ON telegram_messages(date);
CREATE INDEX idx_telegram_messages_scraped_at ON telegram_messages(scraped_at);
