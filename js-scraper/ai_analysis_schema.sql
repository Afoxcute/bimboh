-- =====================================================
-- AI CONTENT ANALYSIS DATABASE SCHEMA
-- =====================================================
-- 
-- This schema supports the enhanced AI-powered content analysis system
-- with specialized agents for different analysis tasks
-- =====================================================

-- =====================================================
-- SENTIMENT ANALYSIS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sentiment_analysis (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    content TEXT,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    emotions JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sentiment analysis
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_content_id ON sentiment_analysis(content_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_platform ON sentiment_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_sentiment ON sentiment_analysis(sentiment);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_confidence ON sentiment_analysis(confidence);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_created_at ON sentiment_analysis(created_at);

-- =====================================================
-- TREND ANALYSIS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS trend_analysis (
    id SERIAL PRIMARY KEY,
    analysis_type TEXT NOT NULL DEFAULT 'trend_detection',
    platform TEXT NOT NULL,
    trends JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for trend analysis
CREATE INDEX IF NOT EXISTS idx_trend_analysis_platform ON trend_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_type ON trend_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_analyzed_at ON trend_analysis(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_confidence ON trend_analysis(confidence);

-- =====================================================
-- CONTENT CLASSIFICATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS content_classification (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    content TEXT,
    classification TEXT NOT NULL,
    subcategories TEXT[] DEFAULT '{}',
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for content classification
CREATE INDEX IF NOT EXISTS idx_content_classification_content_id ON content_classification(content_id);
CREATE INDEX IF NOT EXISTS idx_content_classification_platform ON content_classification(platform);
CREATE INDEX IF NOT EXISTS idx_content_classification_classification ON content_classification(classification);
CREATE INDEX IF NOT EXISTS idx_content_classification_confidence ON content_classification(confidence);
CREATE INDEX IF NOT EXISTS idx_content_classification_tags ON content_classification USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_classification_created_at ON content_classification(created_at);

-- =====================================================
-- RISK ASSESSMENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS risk_assessments (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    token_symbol TEXT,
    content TEXT,
    risk_score DECIMAL(3,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_factors TEXT[] DEFAULT '{}',
    red_flags TEXT[] DEFAULT '{}',
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    recommendations TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for risk assessments
CREATE INDEX IF NOT EXISTS idx_risk_assessments_content_id ON risk_assessments(content_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_platform ON risk_assessments(platform);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_token_symbol ON risk_assessments(token_symbol);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_score ON risk_assessments(risk_score);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created_at ON risk_assessments(created_at);

-- =====================================================
-- MEMECOIN ANALYSIS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS memecoin_analysis (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    token_symbol TEXT,
    content TEXT,
    analysis_type TEXT NOT NULL DEFAULT 'memecoin_analysis',
    viral_potential DECIMAL(3,2) NOT NULL CHECK (viral_potential >= 0 AND viral_potential <= 1),
    community_strength DECIMAL(3,2) NOT NULL CHECK (community_strength >= 0 AND community_strength <= 1),
    meme_quality DECIMAL(3,2) NOT NULL CHECK (meme_quality >= 0 AND meme_quality <= 1),
    market_sentiment TEXT NOT NULL CHECK (market_sentiment IN ('bullish', 'bearish', 'neutral')),
    insights TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for memecoin analysis
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_content_id ON memecoin_analysis(content_id);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_platform ON memecoin_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_token_symbol ON memecoin_analysis(token_symbol);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_viral_potential ON memecoin_analysis(viral_potential);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_community_strength ON memecoin_analysis(community_strength);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_meme_quality ON memecoin_analysis(meme_quality);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_market_sentiment ON memecoin_analysis(market_sentiment);
CREATE INDEX IF NOT EXISTS idx_memecoin_analysis_created_at ON memecoin_analysis(created_at);

-- =====================================================
-- INTELLIGENCE ANALYSIS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS intelligence_analysis (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    token_symbol TEXT,
    content TEXT,
    analysis_type TEXT NOT NULL DEFAULT 'comprehensive_intelligence',
    intelligence_score DECIMAL(3,2) NOT NULL CHECK (intelligence_score >= 0 AND intelligence_score <= 1),
    insights TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for intelligence analysis
CREATE INDEX IF NOT EXISTS idx_intelligence_analysis_content_id ON intelligence_analysis(content_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_analysis_platform ON intelligence_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_intelligence_analysis_token_symbol ON intelligence_analysis(token_symbol);
CREATE INDEX IF NOT EXISTS idx_intelligence_analysis_intelligence_score ON intelligence_analysis(intelligence_score);
CREATE INDEX IF NOT EXISTS idx_intelligence_analysis_created_at ON intelligence_analysis(created_at);

-- =====================================================
-- ANALYSIS AGGREGATION VIEWS
-- =====================================================

-- Daily sentiment summary
CREATE OR REPLACE VIEW daily_sentiment_summary AS
SELECT 
    DATE(created_at) as analysis_date,
    platform,
    sentiment,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence,
    MAX(confidence) as max_confidence,
    MIN(confidence) as min_confidence
FROM sentiment_analysis
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), platform, sentiment
ORDER BY analysis_date DESC, platform, sentiment;

-- Top trending tokens
CREATE OR REPLACE VIEW top_trending_tokens AS
SELECT 
    token_symbol,
    platform,
    COUNT(*) as analysis_count,
    AVG(viral_potential) as avg_viral_potential,
    AVG(community_strength) as avg_community_strength,
    AVG(meme_quality) as avg_meme_quality,
    MAX(created_at) as last_analyzed
FROM memecoin_analysis
WHERE token_symbol IS NOT NULL 
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY token_symbol, platform
HAVING COUNT(*) >= 3
ORDER BY avg_viral_potential DESC, analysis_count DESC;

-- Risk assessment summary (simplified)
CREATE OR REPLACE VIEW risk_assessment_summary AS
SELECT 
    token_symbol,
    platform,
    risk_level,
    COUNT(*) as assessment_count,
    AVG(risk_score) as avg_risk_score,
    MAX(risk_score) as max_risk_score,
    MIN(risk_score) as min_risk_score,
    COUNT(CASE WHEN array_length(risk_factors, 1) > 0 THEN 1 END) as assessments_with_risk_factors,
    COUNT(CASE WHEN array_length(red_flags, 1) > 0 THEN 1 END) as assessments_with_red_flags
FROM risk_assessments
WHERE token_symbol IS NOT NULL 
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY token_symbol, platform, risk_level
ORDER BY avg_risk_score DESC;

-- Content classification summary (simplified)
CREATE OR REPLACE VIEW content_classification_summary AS
SELECT 
    platform,
    classification,
    COUNT(*) as content_count,
    AVG(confidence) as avg_confidence,
    MAX(confidence) as max_confidence,
    MIN(confidence) as min_confidence,
    COUNT(CASE WHEN array_length(tags, 1) > 0 THEN 1 END) as content_with_tags
FROM content_classification
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY platform, classification
ORDER BY content_count DESC;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get analysis summary for a token
CREATE OR REPLACE FUNCTION get_token_analysis_summary(token_sym TEXT, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    analysis_type TEXT,
    count BIGINT,
    avg_score DECIMAL,
    latest_analysis TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'sentiment'::TEXT,
        COUNT(*)::BIGINT,
        AVG(confidence)::DECIMAL,
        MAX(created_at)
    FROM sentiment_analysis
    WHERE token_symbol = token_sym 
        AND created_at >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
        'memecoin'::TEXT,
        COUNT(*)::BIGINT,
        AVG((viral_potential + community_strength + meme_quality) / 3)::DECIMAL,
        MAX(created_at)
    FROM memecoin_analysis
    WHERE token_symbol = token_sym 
        AND created_at >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
        'risk'::TEXT,
        COUNT(*)::BIGINT,
        AVG(1 - risk_score)::DECIMAL, -- Invert risk score for positive scoring
        MAX(created_at)
    FROM risk_assessments
    WHERE token_symbol = token_sym 
        AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform analysis summary
CREATE OR REPLACE FUNCTION get_platform_analysis_summary(platform_name TEXT, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    analysis_type TEXT,
    count BIGINT,
    avg_score DECIMAL,
    latest_analysis TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'sentiment'::TEXT,
        COUNT(*)::BIGINT,
        AVG(confidence)::DECIMAL,
        MAX(created_at)
    FROM sentiment_analysis
    WHERE platform = platform_name 
        AND created_at >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
        'classification'::TEXT,
        COUNT(*)::BIGINT,
        AVG(confidence)::DECIMAL,
        MAX(created_at)
    FROM content_classification
    WHERE platform = platform_name 
        AND created_at >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
        'intelligence'::TEXT,
        COUNT(*)::BIGINT,
        AVG(intelligence_score)::DECIMAL,
        MAX(created_at)
    FROM intelligence_analysis
    WHERE platform = platform_name 
        AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to get all risk factors for a token
CREATE OR REPLACE FUNCTION get_token_risk_factors(token_sym TEXT, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    risk_factor TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(ra.risk_factors) as risk_factor,
        COUNT(*)::BIGINT
    FROM risk_assessments ra
    WHERE ra.token_symbol = token_sym 
        AND ra.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY unnest(ra.risk_factors)
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all red flags for a token
CREATE OR REPLACE FUNCTION get_token_red_flags(token_sym TEXT, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    red_flag TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(ra.red_flags) as red_flag,
        COUNT(*)::BIGINT
    FROM risk_assessments ra
    WHERE ra.token_symbol = token_sym 
        AND ra.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY unnest(ra.red_flags)
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tags for a platform
CREATE OR REPLACE FUNCTION get_platform_tags(platform_name TEXT, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    tag TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(cc.tags) as tag,
        COUNT(*)::BIGINT
    FROM content_classification cc
    WHERE cc.platform = platform_name 
        AND cc.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY unnest(cc.tags)
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE sentiment_analysis IS 'Stores AI-powered sentiment analysis results for social media content';
COMMENT ON TABLE trend_analysis IS 'Stores trend detection and analysis results across platforms';
COMMENT ON TABLE content_classification IS 'Stores AI-powered content classification and categorization results';
COMMENT ON TABLE risk_assessments IS 'Stores AI-powered risk assessment and red flag detection results';
COMMENT ON TABLE memecoin_analysis IS 'Stores specialized memecoin analysis including viral potential and community strength';
COMMENT ON TABLE intelligence_analysis IS 'Stores comprehensive intelligence analysis combining all analysis types';

COMMENT ON VIEW daily_sentiment_summary IS 'Daily summary of sentiment analysis across platforms';
COMMENT ON VIEW top_trending_tokens IS 'Top trending tokens based on memecoin analysis metrics';
COMMENT ON VIEW risk_assessment_summary IS 'Summary of risk assessments by token and platform';
COMMENT ON VIEW content_classification_summary IS 'Summary of content classification by platform and category';

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample sentiment analysis
INSERT INTO sentiment_analysis (content_id, platform, content, sentiment, confidence, emotions) VALUES
('sample_1', 'tiktok', 'This new token is going to the moon! 🚀', 'positive', 0.85, '{"joy": 0.8, "excitement": 0.9}'),
('sample_2', 'telegram', 'Be careful with this project, looks like a scam', 'negative', 0.75, '{"fear": 0.6, "anger": 0.4}'),
('sample_3', 'twitter', 'Just bought some BONK tokens', 'neutral', 0.65, '{"neutral": 0.7}');

-- Insert sample content classification
INSERT INTO content_classification (content_id, platform, content, classification, subcategories, confidence, tags) VALUES
('sample_1', 'tiktok', 'New BONK token launch! Join our community!', 'memecoin_announcement', '{"launch", "community"}', 0.9, '{"BONK", "moon", "launch"}'),
('sample_2', 'telegram', 'BONK price analysis: support at $0.00001', 'price_discussion', '{"technical_analysis"}', 0.8, '{"BONK", "price", "analysis"}'),
('sample_3', 'twitter', 'Learn about DeFi with our new tutorial', 'educational', '{"tutorial"}', 0.7, '{"DeFi", "learn", "tutorial"}');

-- Insert sample risk assessment
INSERT INTO risk_assessments (content_id, platform, token_symbol, content, risk_score, risk_level, risk_factors, red_flags, confidence, recommendations) VALUES
('sample_1', 'telegram', 'BONK', 'Guaranteed 100x returns! Buy now!', 0.8, 'high', '{"guaranteed_returns", "urgency_pressure"}', '{"guaranteed_returns", "urgency_pressure"}', 0.9, '{"HIGH RISK: Avoid this investment"}'),
('sample_2', 'tiktok', 'PEPE', 'New Pepe token with strong community', 0.3, 'low', '{"new_token"}', '{}', 0.7, '{"LOW RISK: Standard due diligence recommended"}');

-- Insert sample memecoin analysis
INSERT INTO memecoin_analysis (content_id, platform, token_symbol, content, viral_potential, community_strength, meme_quality, market_sentiment, insights) VALUES
('sample_1', 'tiktok', 'BONK', 'Diamond hands to the moon! 🚀💎', 0.9, 0.8, 0.85, 'bullish', '{"High viral potential detected", "Strong community engagement"}'),
('sample_2', 'telegram', 'PEPE', 'Pepe is the new king of memes', 0.7, 0.6, 0.75, 'bullish', '{"High viral potential detected"}');

-- Insert sample intelligence analysis
INSERT INTO intelligence_analysis (content_id, platform, token_symbol, content, intelligence_score, insights, recommendations) VALUES
('sample_1', 'tiktok', 'BONK', 'BONK token launch with strong community support', 0.85, '{"Positive sentiment detected", "Memecoin announcement identified", "High viral potential"}', '{"HIGH VIRAL POTENTIAL: Monitor closely"}'),
('sample_2', 'telegram', 'SCAM', 'Guaranteed returns scam token', 0.2, '{"FUD DETECTED: Verify information", "HIGH RISK: Avoid this investment"}', '{"HIGH RISK: Avoid this investment", "FUD DETECTED: Verify information"}');

-- =====================================================
-- SCHEMA COMPLETION
-- =====================================================

-- Log schema creation
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metadata) 
VALUES ('ai_analysis_schema_created', 1, 'version', jsonb_build_object('version', '1.0.0', 'created_at', NOW()));

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AI CONTENT ANALYSIS SCHEMA CREATED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ sentiment_analysis table created';
    RAISE NOTICE '✅ trend_analysis table created';
    RAISE NOTICE '✅ content_classification table created';
    RAISE NOTICE '✅ risk_assessments table created';
    RAISE NOTICE '✅ memecoin_analysis table created';
    RAISE NOTICE '✅ intelligence_analysis table created';
    RAISE NOTICE '✅ Analysis aggregation views created';
    RAISE NOTICE '✅ Helper functions created';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE 'Your AI content analysis system is ready!';
    RAISE NOTICE '========================================';
END $$;
