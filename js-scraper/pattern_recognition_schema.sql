-- =====================================================
-- ADVANCED PATTERN RECOGNITION SCHEMA
-- =====================================================
-- This schema supports AI-powered pattern recognition and analysis

-- =====================================================
-- PATTERN DETECTION TABLES
-- =====================================================

-- Pattern detections - stores all detected patterns
CREATE TABLE IF NOT EXISTS pattern_detections (
    id SERIAL PRIMARY KEY,
    pattern_type TEXT NOT NULL, -- 'volume_spike', 'sentiment_spike', 'price_breakout', etc.
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    pattern_name TEXT NOT NULL,
    pattern_strength DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    pattern_confidence DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    pattern_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Pattern insights - AI-generated insights from patterns
CREATE TABLE IF NOT EXISTS pattern_insights (
    id SERIAL PRIMARY KEY,
    insight_type TEXT NOT NULL, -- 'opportunity', 'warning', 'trend', 'anomaly'
    token_symbol TEXT NOT NULL,
    insight_title TEXT NOT NULL,
    insight_description TEXT NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    impact_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    recommendation TEXT,
    insight_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Pattern predictions - AI-generated predictions based on patterns
CREATE TABLE IF NOT EXISTS pattern_predictions (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    prediction_type TEXT NOT NULL, -- 'price', 'volume', 'sentiment', 'trend'
    prediction_value DECIMAL(20,8),
    confidence_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    time_horizon TEXT NOT NULL, -- '1h', '24h', '7d', '30d'
    prediction_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_date TIMESTAMP WITH TIME ZONE,
    is_fulfilled BOOLEAN DEFAULT false,
    actual_value DECIMAL(20,8),
    accuracy_score DECIMAL(5,4)
);

-- =====================================================
-- PATTERN ANALYSIS TABLES
-- =====================================================

-- Volume patterns - detailed volume analysis
CREATE TABLE IF NOT EXISTS volume_patterns (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    pattern_name TEXT NOT NULL,
    volume_spike DECIMAL(10,4), -- e.g., 2.5000 = 250% spike
    volume_trend TEXT CHECK (volume_trend IN ('increasing', 'decreasing', 'stable')),
    volume_volatility DECIMAL(10,4),
    volume_momentum DECIMAL(10,4),
    pattern_strength DECIMAL(5,4) NOT NULL,
    pattern_confidence DECIMAL(5,4) NOT NULL,
    pattern_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sentiment patterns - detailed sentiment analysis
CREATE TABLE IF NOT EXISTS sentiment_patterns (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    pattern_name TEXT NOT NULL,
    sentiment_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    sentiment_trend TEXT CHECK (sentiment_trend IN ('improving', 'declining', 'stable')),
    sentiment_volatility DECIMAL(5,4),
    sentiment_momentum DECIMAL(5,4),
    pattern_strength DECIMAL(5,4) NOT NULL,
    pattern_confidence DECIMAL(5,4) NOT NULL,
    pattern_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price patterns - detailed price analysis
CREATE TABLE IF NOT EXISTS price_patterns (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    pattern_name TEXT NOT NULL,
    price_change DECIMAL(10,6), -- e.g., 0.1500 = 15% change
    price_trend TEXT CHECK (price_trend IN ('bullish', 'bearish', 'sideways')),
    price_volatility DECIMAL(10,6),
    price_momentum DECIMAL(10,6),
    support_level DECIMAL(20,8),
    resistance_level DECIMAL(20,8),
    pattern_strength DECIMAL(5,4) NOT NULL,
    pattern_confidence DECIMAL(5,4) NOT NULL,
    pattern_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social patterns - detailed social media analysis
CREATE TABLE IF NOT EXISTS social_patterns (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    pattern_name TEXT NOT NULL,
    engagement_spike DECIMAL(10,4), -- e.g., 3.0000 = 300% spike
    engagement_trend TEXT CHECK (engagement_trend IN ('increasing', 'decreasing', 'stable')),
    social_momentum DECIMAL(10,4),
    viral_potential DECIMAL(5,4), -- 0.0000 to 1.0000
    pattern_strength DECIMAL(5,4) NOT NULL,
    pattern_confidence DECIMAL(5,4) NOT NULL,
    pattern_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Correlation patterns - cross-asset correlation analysis
CREATE TABLE IF NOT EXISTS correlation_patterns (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    correlated_token TEXT NOT NULL,
    correlation_strength DECIMAL(5,4) NOT NULL, -- -1.0000 to 1.0000
    correlation_type TEXT CHECK (correlation_type IN ('positive', 'negative', 'neutral')),
    correlation_confidence DECIMAL(5,4) NOT NULL,
    correlation_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATTERN PERFORMANCE TABLES
-- =====================================================

-- Pattern accuracy - tracks accuracy of pattern predictions
CREATE TABLE IF NOT EXISTS pattern_accuracy (
    id SERIAL PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    prediction_id INTEGER REFERENCES pattern_predictions(id) ON DELETE CASCADE,
    predicted_value DECIMAL(20,8),
    actual_value DECIMAL(20,8),
    accuracy_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    time_horizon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern performance - tracks overall pattern performance
CREATE TABLE IF NOT EXISTS pattern_performance (
    id SERIAL PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_detections INTEGER DEFAULT 0,
    successful_predictions INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,4), -- 0.0000 to 1.0000
    average_confidence DECIMAL(5,4),
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATTERN LEARNING TABLES
-- =====================================================

-- Pattern models - stores learned pattern models
CREATE TABLE IF NOT EXISTS pattern_models (
    id SERIAL PRIMARY KEY,
    model_name TEXT NOT NULL UNIQUE,
    model_type TEXT NOT NULL, -- 'volume', 'sentiment', 'price', 'social'
    model_version TEXT NOT NULL,
    model_data JSONB NOT NULL,
    accuracy_score DECIMAL(5,4),
    training_data_size INTEGER,
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern features - stores feature importance and weights
CREATE TABLE IF NOT EXISTS pattern_features (
    id SERIAL PRIMARY KEY,
    feature_name TEXT NOT NULL,
    feature_type TEXT NOT NULL, -- 'volume', 'sentiment', 'price', 'social'
    importance_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    weight DECIMAL(10,6),
    feature_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Pattern detections indexes
CREATE INDEX IF NOT EXISTS idx_pattern_detections_type ON pattern_detections(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_token ON pattern_detections(token_symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_detected_at ON pattern_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_strength ON pattern_detections(pattern_strength);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_confidence ON pattern_detections(pattern_confidence);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_active ON pattern_detections(is_active);

-- Pattern insights indexes
CREATE INDEX IF NOT EXISTS idx_pattern_insights_type ON pattern_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_token ON pattern_insights(token_symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_created_at ON pattern_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_confidence ON pattern_insights(confidence_score);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_impact ON pattern_insights(impact_score);

-- Pattern predictions indexes
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_token ON pattern_predictions(token_symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_type ON pattern_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_created_at ON pattern_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_confidence ON pattern_predictions(confidence_score);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_horizon ON pattern_predictions(time_horizon);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_fulfilled ON pattern_predictions(is_fulfilled);

-- Volume patterns indexes
CREATE INDEX IF NOT EXISTS idx_volume_patterns_token ON volume_patterns(token_symbol);
CREATE INDEX IF NOT EXISTS idx_volume_patterns_detected_at ON volume_patterns(detected_at);
CREATE INDEX IF NOT EXISTS idx_volume_patterns_spike ON volume_patterns(volume_spike);
CREATE INDEX IF NOT EXISTS idx_volume_patterns_trend ON volume_patterns(volume_trend);

-- Sentiment patterns indexes
CREATE INDEX IF NOT EXISTS idx_sentiment_patterns_token ON sentiment_patterns(token_symbol);
CREATE INDEX IF NOT EXISTS idx_sentiment_patterns_detected_at ON sentiment_patterns(detected_at);
CREATE INDEX IF NOT EXISTS idx_sentiment_patterns_score ON sentiment_patterns(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_sentiment_patterns_trend ON sentiment_patterns(sentiment_trend);

-- Price patterns indexes
CREATE INDEX IF NOT EXISTS idx_price_patterns_token ON price_patterns(token_symbol);
CREATE INDEX IF NOT EXISTS idx_price_patterns_detected_at ON price_patterns(detected_at);
CREATE INDEX IF NOT EXISTS idx_price_patterns_change ON price_patterns(price_change);
CREATE INDEX IF NOT EXISTS idx_price_patterns_trend ON price_patterns(price_trend);

-- Social patterns indexes
CREATE INDEX IF NOT EXISTS idx_social_patterns_token ON social_patterns(token_symbol);
CREATE INDEX IF NOT EXISTS idx_social_patterns_detected_at ON social_patterns(detected_at);
CREATE INDEX IF NOT EXISTS idx_social_patterns_spike ON social_patterns(engagement_spike);
CREATE INDEX IF NOT EXISTS idx_social_patterns_trend ON social_patterns(engagement_trend);

-- Correlation patterns indexes
CREATE INDEX IF NOT EXISTS idx_correlation_patterns_token ON correlation_patterns(token_symbol);
CREATE INDEX IF NOT EXISTS idx_correlation_patterns_correlated ON correlation_patterns(correlated_token);
CREATE INDEX IF NOT EXISTS idx_correlation_patterns_detected_at ON correlation_patterns(detected_at);
CREATE INDEX IF NOT EXISTS idx_correlation_patterns_strength ON correlation_patterns(correlation_strength);

-- Pattern accuracy indexes
CREATE INDEX IF NOT EXISTS idx_pattern_accuracy_type ON pattern_accuracy(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_accuracy_token ON pattern_accuracy(token_symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_accuracy_evaluated_at ON pattern_accuracy(evaluated_at);
CREATE INDEX IF NOT EXISTS idx_pattern_accuracy_score ON pattern_accuracy(accuracy_score);

-- Pattern performance indexes
CREATE INDEX IF NOT EXISTS idx_pattern_performance_type ON pattern_performance(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_performance_period ON pattern_performance(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_pattern_performance_accuracy ON pattern_performance(accuracy_rate);

-- Pattern models indexes
CREATE INDEX IF NOT EXISTS idx_pattern_models_name ON pattern_models(model_name);
CREATE INDEX IF NOT EXISTS idx_pattern_models_type ON pattern_models(model_type);
CREATE INDEX IF NOT EXISTS idx_pattern_models_active ON pattern_models(is_active);
CREATE INDEX IF NOT EXISTS idx_pattern_models_accuracy ON pattern_models(accuracy_score);

-- Pattern features indexes
CREATE INDEX IF NOT EXISTS idx_pattern_features_name ON pattern_features(feature_name);
CREATE INDEX IF NOT EXISTS idx_pattern_features_type ON pattern_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_pattern_features_importance ON pattern_features(importance_score);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Pattern summary view
CREATE OR REPLACE VIEW pattern_summary AS
SELECT 
    pattern_type,
    COUNT(*) as detection_count,
    AVG(pattern_strength) as avg_strength,
    AVG(pattern_confidence) as avg_confidence,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_patterns,
    MAX(detected_at) as last_detected
FROM pattern_detections
WHERE detected_at >= NOW() - INTERVAL '7 days'
GROUP BY pattern_type
ORDER BY detection_count DESC;

-- Top pattern tokens view
CREATE OR REPLACE VIEW top_pattern_tokens AS
SELECT 
    token_symbol,
    COUNT(*) as pattern_count,
    COUNT(DISTINCT pattern_type) as pattern_types,
    AVG(pattern_strength) as avg_strength,
    AVG(pattern_confidence) as avg_confidence,
    MAX(detected_at) as last_detected
FROM pattern_detections
WHERE detected_at >= NOW() - INTERVAL '7 days'
GROUP BY token_symbol
ORDER BY pattern_count DESC;

-- Pattern insights summary view
CREATE OR REPLACE VIEW pattern_insights_summary AS
SELECT 
    insight_type,
    COUNT(*) as insight_count,
    AVG(confidence_score) as avg_confidence,
    AVG(impact_score) as avg_impact,
    COUNT(CASE WHEN recommendation IS NOT NULL THEN 1 END) as insights_with_recommendations
FROM pattern_insights
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY insight_type
ORDER BY insight_count DESC;

-- Pattern predictions summary view
CREATE OR REPLACE VIEW pattern_predictions_summary AS
SELECT 
    prediction_type,
    time_horizon,
    COUNT(*) as prediction_count,
    AVG(confidence_score) as avg_confidence,
    COUNT(CASE WHEN is_fulfilled = true THEN 1 END) as fulfilled_predictions,
    AVG(accuracy_score) as avg_accuracy
FROM pattern_predictions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY prediction_type, time_horizon
ORDER BY prediction_count DESC;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate pattern accuracy
CREATE OR REPLACE FUNCTION calculate_pattern_accuracy(
    input_pattern_type TEXT,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    pattern_type TEXT,
    total_predictions BIGINT,
    fulfilled_predictions BIGINT,
    accuracy_rate DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.prediction_type,
        COUNT(*)::BIGINT as total_predictions,
        COUNT(CASE WHEN pp.is_fulfilled = true THEN 1 END)::BIGINT as fulfilled_predictions,
        ROUND(
            COUNT(CASE WHEN pp.is_fulfilled = true THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 4
        ) / 100 as accuracy_rate
    FROM pattern_predictions pp
    WHERE pp.prediction_type = input_pattern_type
    AND pp.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY pp.prediction_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing patterns
CREATE OR REPLACE FUNCTION get_top_performing_patterns(
    days_back INTEGER DEFAULT 7,
    min_detections INTEGER DEFAULT 3
)
RETURNS TABLE (
    pattern_type TEXT,
    detection_count BIGINT,
    avg_strength DECIMAL(5,4),
    avg_confidence DECIMAL(5,4),
    success_rate DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pd.pattern_type,
        COUNT(*)::BIGINT as detection_count,
        AVG(pd.pattern_strength) as avg_strength,
        AVG(pd.pattern_confidence) as avg_confidence,
        ROUND(
            COUNT(CASE WHEN pd.pattern_confidence > 0.7 THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 4
        ) / 100 as success_rate
    FROM pattern_detections pd
    WHERE pd.detected_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY pd.pattern_type
    HAVING COUNT(*) >= min_detections
    ORDER BY success_rate DESC, detection_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get pattern correlations
CREATE OR REPLACE FUNCTION get_pattern_correlations(
    token_symbol TEXT,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    correlated_token TEXT,
    correlation_strength DECIMAL(5,4),
    correlation_type TEXT,
    detection_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.correlated_token,
        AVG(cp.correlation_strength) as correlation_strength,
        cp.correlation_type,
        COUNT(*)::BIGINT as detection_count
    FROM correlation_patterns cp
    WHERE cp.token_symbol = token_symbol
    AND cp.detected_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY cp.correlated_token, cp.correlation_type
    ORDER BY AVG(cp.correlation_strength) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert sample pattern features
INSERT INTO pattern_features (feature_name, feature_type, importance_score, weight) VALUES
('volume_spike', 'volume', 0.9, 1.0),
('volume_trend', 'volume', 0.7, 0.8),
('sentiment_score', 'sentiment', 0.8, 0.9),
('sentiment_trend', 'sentiment', 0.6, 0.7),
('price_change', 'price', 0.9, 1.0),
('price_momentum', 'price', 0.8, 0.9),
('social_engagement', 'social', 0.7, 0.8),
('viral_potential', 'social', 0.6, 0.7)
ON CONFLICT (feature_name) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE pattern_detections IS 'Stores all detected patterns across different data sources';
COMMENT ON TABLE pattern_insights IS 'AI-generated insights and recommendations from patterns';
COMMENT ON TABLE pattern_predictions IS 'AI-generated predictions based on pattern analysis';
COMMENT ON TABLE volume_patterns IS 'Detailed volume pattern analysis and detection';
COMMENT ON TABLE sentiment_patterns IS 'Detailed sentiment pattern analysis and detection';
COMMENT ON TABLE price_patterns IS 'Detailed price pattern analysis and detection';
COMMENT ON TABLE social_patterns IS 'Detailed social media pattern analysis and detection';
COMMENT ON TABLE correlation_patterns IS 'Cross-asset correlation pattern analysis';
COMMENT ON TABLE pattern_accuracy IS 'Tracks accuracy of pattern predictions over time';
COMMENT ON TABLE pattern_performance IS 'Overall pattern detection and prediction performance';
COMMENT ON TABLE pattern_models IS 'Stores learned pattern recognition models';
COMMENT ON TABLE pattern_features IS 'Feature importance and weights for pattern recognition';
