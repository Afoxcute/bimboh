-- =====================================================
-- IRIS MEMECOIN HUNTING PLATFORM - SUPABASE SCHEMA
-- =====================================================
-- This schema supports:
-- - TikTok Scraper
-- - Telegram Scraper  
-- - Outlight Scraper
-- - ADK Workflow System
-- - Pattern Analysis
-- - Twitter Integration
-- - Market Data Collection
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE TOKEN TABLES
-- =====================================================

-- Tokens table - stores all discovered memecoins
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    uri TEXT UNIQUE NOT NULL,
    name TEXT,
    symbol TEXT,
    description TEXT,
    image_url TEXT,
    market_cap DECIMAL(20,2),
    total_supply BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for tokens
CREATE INDEX IF NOT EXISTS idx_tokens_uri ON tokens(uri);
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at);
CREATE INDEX IF NOT EXISTS idx_tokens_market_cap ON tokens(market_cap);

-- =====================================================
-- TIKTOK SCRAPER TABLES
-- =====================================================

-- TikTok videos table
CREATE TABLE IF NOT EXISTS tiktoks (
    id TEXT PRIMARY KEY,
    username TEXT,
    url TEXT UNIQUE NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    views INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    description TEXT,
    hashtags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for tiktoks
CREATE INDEX IF NOT EXISTS idx_tiktoks_username ON tiktoks(username);
CREATE INDEX IF NOT EXISTS idx_tiktoks_created_at ON tiktoks(created_at);
CREATE INDEX IF NOT EXISTS idx_tiktoks_fetched_at ON tiktoks(fetched_at);
CREATE INDEX IF NOT EXISTS idx_tiktoks_views ON tiktoks(views);
CREATE INDEX IF NOT EXISTS idx_tiktoks_hashtags ON tiktoks USING GIN(hashtags);

-- =====================================================
-- TELEGRAM SCRAPER TABLES
-- =====================================================

-- Telegram channels table
CREATE TABLE IF NOT EXISTS telegram_channels (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    last_message_id BIGINT DEFAULT 0,
    scrape_media BOOLEAN DEFAULT false,
    scrape_interval_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Telegram messages table
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    message_id BIGINT NOT NULL,
    text TEXT,
    date TIMESTAMP WITH TIME ZONE,
    author_signature TEXT,
    forward_from_chat_id TEXT,
    forward_from_chat_title TEXT,
    forward_from_message_id BIGINT,
    forward_date TIMESTAMP WITH TIME ZONE,
    reply_to_message_id BIGINT,
    edit_date TIMESTAMP WITH TIME ZONE,
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

-- Create indexes for telegram tables
CREATE INDEX IF NOT EXISTS idx_telegram_channels_username ON telegram_channels(username);
CREATE INDEX IF NOT EXISTS idx_telegram_channels_enabled ON telegram_channels(enabled);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_channel_id ON telegram_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_message_id ON telegram_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_scraped_at ON telegram_messages(scraped_at);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_text ON telegram_messages USING GIN(to_tsvector('english', text));

-- =====================================================
-- MENTIONS TABLE (Cross-platform)
-- =====================================================

-- Mentions table - links social media content to tokens
CREATE TABLE IF NOT EXISTS mentions (
    id SERIAL PRIMARY KEY,
    tiktok_id TEXT REFERENCES tiktoks(id) ON DELETE CASCADE,
    token_id INTEGER REFERENCES tokens(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 1,
    mention_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'tiktok', -- 'tiktok', 'telegram', 'outlight'
    channel_id TEXT, -- For telegram messages
    message_id BIGINT, -- For telegram messages
    context TEXT, -- Additional context about the mention
    sentiment TEXT, -- 'positive', 'negative', 'neutral'
    confidence DECIMAL(3,2), -- Confidence score 0-1
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for mentions
CREATE INDEX IF NOT EXISTS idx_mentions_tiktok_id ON mentions(tiktok_id);
CREATE INDEX IF NOT EXISTS idx_mentions_token_id ON mentions(token_id);
CREATE INDEX IF NOT EXISTS idx_mentions_mention_at ON mentions(mention_at);
CREATE INDEX IF NOT EXISTS idx_mentions_source ON mentions(source);
CREATE INDEX IF NOT EXISTS idx_mentions_channel_id ON mentions(channel_id);
CREATE INDEX IF NOT EXISTS idx_mentions_sentiment ON mentions(sentiment);

-- =====================================================
-- MARKET DATA TABLES
-- =====================================================

-- Prices table - stores token price data
CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    token_uri TEXT REFERENCES tokens(uri) ON DELETE CASCADE,
    price_usd DECIMAL(20,8),
    price_sol DECIMAL(20,8),
    trade_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    volume_24h DECIMAL(20,2),
    market_cap DECIMAL(20,2),
    price_change_24h DECIMAL(10,4),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for prices
CREATE INDEX IF NOT EXISTS idx_prices_token_uri ON prices(token_uri);
CREATE INDEX IF NOT EXISTS idx_prices_trade_at ON prices(trade_at);
CREATE INDEX IF NOT EXISTS idx_prices_price_usd ON prices(price_usd);

-- =====================================================
-- PATTERN ANALYSIS TABLES
-- =====================================================

-- Pattern analysis results table
CREATE TABLE IF NOT EXISTS pattern_analysis_results (
    id SERIAL PRIMARY KEY,
    analysis_type TEXT NOT NULL, -- 'tiktok', 'telegram', 'comprehensive'
    platform TEXT NOT NULL, -- 'tiktok', 'telegram', 'combined'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    summary JSONB DEFAULT '{}'::jsonb,
    trending_keywords JSONB DEFAULT '[]'::jsonb,
    correlations JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Pattern correlations table
CREATE TABLE IF NOT EXISTS pattern_correlations (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES pattern_analysis_results(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    token_name TEXT,
    token_symbol TEXT,
    token_uri TEXT,
    correlation_score DECIMAL(5,4), -- -1 to 1
    social_metrics JSONB DEFAULT '{}'::jsonb,
    trading_metrics JSONB DEFAULT '{}'::jsonb,
    risk_level TEXT, -- 'Low', 'Medium', 'High', 'Very High'
    recommendation_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending keywords table
CREATE TABLE IF NOT EXISTS trending_keywords (
    id SERIAL PRIMARY KEY,
    keyword TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'tiktok', 'telegram', 'combined'
    frequency INTEGER DEFAULT 1,
    total_mentions INTEGER DEFAULT 1,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trend_score DECIMAL(5,2), -- Calculated trend score
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(keyword, platform)
);

-- Create indexes for pattern analysis
CREATE INDEX IF NOT EXISTS idx_pattern_analysis_type ON pattern_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_pattern_analysis_platform ON pattern_analysis_results(platform);
CREATE INDEX IF NOT EXISTS idx_pattern_analysis_timestamp ON pattern_analysis_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_pattern_correlations_analysis_id ON pattern_correlations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_pattern_correlations_keyword ON pattern_correlations(keyword);
CREATE INDEX IF NOT EXISTS idx_pattern_correlations_correlation_score ON pattern_correlations(correlation_score);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_keyword ON trending_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_platform ON trending_keywords(platform);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_frequency ON trending_keywords(frequency);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_trend_score ON trending_keywords(trend_score);

-- =====================================================
-- TWITTER INTEGRATION TABLES
-- =====================================================

-- Twitter alerts table
CREATE TABLE IF NOT EXISTS twitter_alerts (
    id SERIAL PRIMARY KEY,
    tweet_id TEXT UNIQUE,
    tweet_text TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'volume_growth', 'trending_discovery', 'market_analysis'
    token_symbol TEXT,
    token_name TEXT,
    volume_growth DECIMAL(10,2),
    growth_rate DECIMAL(10,2),
    correlation_score DECIMAL(5,4),
    risk_level TEXT,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    engagement_metrics JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for twitter alerts
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_tweet_id ON twitter_alerts(tweet_id);
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_alert_type ON twitter_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_token_symbol ON twitter_alerts(token_symbol);
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_posted_at ON twitter_alerts(posted_at);

-- =====================================================
-- ADK WORKFLOW TABLES
-- =====================================================

-- Workflow sessions table
CREATE TABLE IF NOT EXISTS workflow_sessions (
    id SERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    session_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' -- 'active', 'completed', 'failed', 'expired'
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    session_id TEXT REFERENCES workflow_sessions(session_id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    execution_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    agent_results JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Agent performance metrics table
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    execution_id TEXT REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd DECIMAL(10,6),
    error_message TEXT,
    metrics JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for ADK workflow tables
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_session_id ON workflow_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_status ON workflow_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_id ON workflow_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_name ON workflow_executions(workflow_name);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_agent_performance_execution_id ON agent_performance(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_name ON agent_performance(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_performance_status ON agent_performance(status);

-- =====================================================
-- USER AND SUBSCRIPTION TABLES
-- =====================================================

-- Users table (for premium features)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Subscriptions table (BONK token payments)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL, -- 'premium_7day', 'premium_30day'
    bonk_amount DECIMAL(20,0) NOT NULL,
    transaction_hash TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'expired'
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for user tables
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- =====================================================
-- ANALYTICS AND REPORTING TABLES
-- =====================================================

-- Daily analytics table
CREATE TABLE IF NOT EXISTS daily_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    platform TEXT NOT NULL, -- 'tiktok', 'telegram', 'combined'
    total_videos INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_mentions INTEGER DEFAULT 0,
    unique_tokens INTEGER DEFAULT 0,
    trending_keywords INTEGER DEFAULT 0,
    correlation_analyses INTEGER DEFAULT 0,
    twitter_alerts INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(date, platform)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_platform ON daily_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_channels_updated_at BEFORE UPDATE ON telegram_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_sessions_updated_at BEFORE UPDATE ON workflow_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM workflow_sessions 
    WHERE expires_at < NOW() AND status = 'expired';
END;
$$ language 'plpgsql';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for trending tokens with social metrics
CREATE OR REPLACE VIEW trending_tokens AS
SELECT 
    t.id,
    t.symbol,
    t.name,
    t.market_cap,
    COUNT(m.id) as mention_count,
    COUNT(DISTINCT m.tiktok_id) as tiktok_mentions,
    COUNT(DISTINCT m.channel_id) as telegram_mentions,
    MAX(m.mention_at) as last_mentioned,
    AVG(pc.correlation_score) as avg_correlation
FROM tokens t
LEFT JOIN mentions m ON t.id = m.token_id
LEFT JOIN pattern_correlations pc ON t.symbol = pc.token_symbol
WHERE t.created_at >= NOW() - INTERVAL '7 days'
GROUP BY t.id, t.symbol, t.name, t.market_cap
ORDER BY mention_count DESC, avg_correlation DESC;

-- View for daily platform statistics
CREATE OR REPLACE VIEW daily_platform_stats AS
SELECT 
    DATE(fetched_at) as date,
    'tiktok' as platform,
    COUNT(*) as total_videos,
    SUM(views) as total_views,
    SUM(comments) as total_comments
FROM tiktoks
WHERE fetched_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(fetched_at)

UNION ALL

SELECT 
    DATE(scraped_at) as date,
    'telegram' as platform,
    COUNT(*) as total_messages,
    SUM(views) as total_views,
    COUNT(*) as total_comments -- Telegram doesn't have separate comment count
FROM telegram_messages
WHERE scraped_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(scraped_at)
ORDER BY date DESC, platform;

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample tokens for testing
INSERT INTO tokens (uri, name, symbol, description, market_cap) VALUES
('https://example.com/bonk', 'Bonk', 'BONK', 'The first dog coin for the people, by the people', 1000000.00),
('https://example.com/pepe', 'Pepe', 'PEPE', 'The most memeable memecoin in existence', 500000.00),
('https://example.com/doge', 'Dogecoin', 'DOGE', 'The original memecoin', 2000000.00)
ON CONFLICT (uri) DO NOTHING;

-- Insert sample telegram channels
INSERT INTO telegram_channels (username, display_name, description, enabled) VALUES
('memecoin_hunters', 'Memecoin Hunters', 'All about the latest memecoins on Solana', true),
('solana_memes', 'Solana Meme Coins', 'Tracking the hottest meme coins in the Solana ecosystem', true),
('crypto_bags', 'Crypto Bags', 'Community for crypto and memecoin enthusiasts', true)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE tokens IS 'Stores all discovered memecoins and their metadata';
COMMENT ON TABLE tiktoks IS 'Stores scraped TikTok videos and their engagement metrics';
COMMENT ON TABLE telegram_channels IS 'Stores discovered Telegram channels for monitoring';
COMMENT ON TABLE telegram_messages IS 'Stores scraped Telegram messages and their content';
COMMENT ON TABLE mentions IS 'Links social media content to token symbols across platforms';
COMMENT ON TABLE pattern_analysis_results IS 'Stores results from pattern analysis and correlation studies';
COMMENT ON TABLE twitter_alerts IS 'Stores automated Twitter alerts and their engagement metrics';
COMMENT ON TABLE workflow_sessions IS 'Stores ADK workflow session data for persistence';
COMMENT ON TABLE workflow_executions IS 'Tracks individual workflow execution runs and their results';
COMMENT ON TABLE agent_performance IS 'Stores performance metrics for individual ADK agents';

-- =====================================================
-- SCHEMA COMPLETION
-- =====================================================

-- Create a function to get schema version
CREATE OR REPLACE FUNCTION get_schema_version()
RETURNS TEXT AS $$
BEGIN
    RETURN '1.0.0';
END;
$$ language 'plpgsql';

-- Log schema creation
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metadata) 
VALUES ('schema_created', 1, 'version', jsonb_build_object('version', '1.0.0', 'created_at', NOW()));

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Schema creation completed successfully!
-- This schema supports the complete Iris memecoin hunting platform including:
-- ✅ TikTok Scraper
-- ✅ Telegram Scraper  
-- ✅ Outlight Scraper
-- ✅ ADK Workflow System
-- ✅ Pattern Analysis
-- ✅ Twitter Integration
-- ✅ Market Data Collection
-- ✅ User Management
-- ✅ Analytics and Reporting