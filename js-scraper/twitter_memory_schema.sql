-- =====================================================
-- TWITTER MEMORY SYSTEM SCHEMA
-- =====================================================
-- This schema supports intelligent Twitter automation with memory and context

-- Twitter memory table for storing agent memories
CREATE TABLE IF NOT EXISTS twitter_memory (
    id SERIAL PRIMARY KEY,
    memory_key TEXT UNIQUE NOT NULL,
    memory_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Twitter posts table for tracking posted content
CREATE TABLE IF NOT EXISTS twitter_posts (
    id SERIAL PRIMARY KEY,
    tweet_id TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Twitter analytics table for performance tracking
CREATE TABLE IF NOT EXISTS twitter_analytics (
    id SERIAL PRIMARY KEY,
    analysis_type TEXT NOT NULL,
    time_range TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Twitter engagement table for tracking engagement metrics
CREATE TABLE IF NOT EXISTS twitter_engagement (
    id SERIAL PRIMARY KEY,
    tweet_id TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Twitter strategy table for storing posting strategies
CREATE TABLE IF NOT EXISTS twitter_strategy (
    id SERIAL PRIMARY KEY,
    strategy_name TEXT UNIQUE NOT NULL,
    strategy_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_twitter_memory_key ON twitter_memory(memory_key);
CREATE INDEX IF NOT EXISTS idx_twitter_memory_created_at ON twitter_memory(created_at);
CREATE INDEX IF NOT EXISTS idx_twitter_memory_metadata ON twitter_memory USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_twitter_posts_tweet_id ON twitter_posts(tweet_id);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_type ON twitter_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_created_at ON twitter_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_metadata ON twitter_posts USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_twitter_analytics_type ON twitter_analytics(analysis_type);
CREATE INDEX IF NOT EXISTS idx_twitter_analytics_time_range ON twitter_analytics(time_range);
CREATE INDEX IF NOT EXISTS idx_twitter_analytics_created_at ON twitter_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_twitter_analytics_data ON twitter_analytics USING GIN(data);

CREATE INDEX IF NOT EXISTS idx_twitter_engagement_tweet_id ON twitter_engagement(tweet_id);
CREATE INDEX IF NOT EXISTS idx_twitter_engagement_recorded_at ON twitter_engagement(recorded_at);

CREATE INDEX IF NOT EXISTS idx_twitter_strategy_name ON twitter_strategy(strategy_name);
CREATE INDEX IF NOT EXISTS idx_twitter_strategy_active ON twitter_strategy(is_active);

-- Create views for common queries
CREATE OR REPLACE VIEW twitter_memory_summary AS
SELECT 
    memory_key,
    jsonb_extract_path_text(memory_data, 'type') as memory_type,
    jsonb_extract_path_text(metadata, 'context') as context,
    CASE 
        WHEN metadata ? 'tags' THEN metadata->'tags'
        ELSE '[]'::jsonb
    END as tags,
    created_at,
    updated_at
FROM twitter_memory
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW twitter_posts_summary AS
SELECT 
    post_type,
    COUNT(*) as total_posts,
    AVG(LENGTH(content)) as avg_content_length,
    MIN(created_at) as first_post,
    MAX(created_at) as last_post
FROM twitter_posts
GROUP BY post_type
ORDER BY total_posts DESC;

CREATE OR REPLACE VIEW twitter_engagement_summary AS
SELECT 
    tp.post_type,
    COUNT(te.tweet_id) as posts_with_engagement,
    AVG(te.likes) as avg_likes,
    AVG(te.retweets) as avg_retweets,
    AVG(te.replies) as avg_replies,
    AVG(te.engagement_rate) as avg_engagement_rate
FROM twitter_posts tp
LEFT JOIN twitter_engagement te ON tp.tweet_id = te.tweet_id
GROUP BY tp.post_type
ORDER BY avg_engagement_rate DESC;

-- Create functions for memory management
CREATE OR REPLACE FUNCTION cleanup_old_memories(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM twitter_memory 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_memory_by_context(context_name TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    memory_key TEXT,
    memory_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.memory_key,
        tm.memory_data,
        tm.created_at
    FROM twitter_memory tm
    WHERE tm.metadata->>'context' = context_name
    ORDER BY tm.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_posting_stats(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    post_type TEXT,
    post_count BIGINT,
    avg_length NUMERIC,
    latest_post TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.post_type,
        COUNT(*) as post_count,
        AVG(LENGTH(tp.content)) as avg_length,
        MAX(tp.created_at) as latest_post
    FROM twitter_posts tp
    WHERE tp.created_at >= NOW() - INTERVAL '1 hour' * hours_back
    GROUP BY tp.post_type
    ORDER BY post_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert default strategy
INSERT INTO twitter_strategy (strategy_name, strategy_data) VALUES (
    'default_posting_strategy',
    '{
        "volume_alerts": {"enabled": true, "maxPerHour": 3, "minInterval": 15},
        "trending_discoveries": {"enabled": true, "maxPerHour": 2, "minInterval": 30},
        "market_analysis": {"enabled": true, "maxPerHour": 1, "minInterval": 240},
        "sentiment_analysis": {"enabled": true, "maxPerHour": 2, "minInterval": 30},
        "risk_warnings": {"enabled": true, "maxPerHour": 1, "minInterval": 60},
        "general_content": {"enabled": true, "maxPerHour": 1, "minInterval": 120}
    }'::jsonb
) ON CONFLICT (strategy_name) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE twitter_memory IS 'Stores agent memories and context for intelligent Twitter automation';
COMMENT ON TABLE twitter_posts IS 'Tracks all posted tweets with metadata';
COMMENT ON TABLE twitter_analytics IS 'Stores analytics and performance data';
COMMENT ON TABLE twitter_engagement IS 'Tracks engagement metrics for posted tweets';
COMMENT ON TABLE twitter_strategy IS 'Stores posting strategies and rules';

COMMENT ON COLUMN twitter_memory.memory_key IS 'Unique key for memory lookup';
COMMENT ON COLUMN twitter_memory.memory_data IS 'JSON data stored in memory';
COMMENT ON COLUMN twitter_memory.metadata IS 'Additional metadata including context and tags';

COMMENT ON COLUMN twitter_posts.tweet_id IS 'Twitter API tweet ID';
COMMENT ON COLUMN twitter_posts.post_type IS 'Type of content (volume_alert, trending_discovery, etc.)';
COMMENT ON COLUMN twitter_posts.metadata IS 'Additional metadata about the post';

COMMENT ON COLUMN twitter_analytics.analysis_type IS 'Type of analysis performed';
COMMENT ON COLUMN twitter_analytics.time_range IS 'Time range for the analysis';
COMMENT ON COLUMN twitter_analytics.data IS 'Analysis results in JSON format';

COMMENT ON COLUMN twitter_engagement.tweet_id IS 'Reference to twitter_posts.tweet_id';
COMMENT ON COLUMN twitter_engagement.engagement_rate IS 'Calculated engagement rate percentage';
