-- =====================================================
-- QUICK PATTERN RECOGNITION SETUP
-- =====================================================
-- Run this in your Supabase SQL Editor to quickly set up pattern recognition

-- Pattern detections table
CREATE TABLE IF NOT EXISTS pattern_detections (
    id SERIAL PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    pattern_name TEXT NOT NULL,
    pattern_strength DECIMAL(5,4) NOT NULL,
    pattern_confidence DECIMAL(5,4) NOT NULL,
    pattern_data JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Pattern insights table
CREATE TABLE IF NOT EXISTS pattern_insights (
    id SERIAL PRIMARY KEY,
    insight_type TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    insight_title TEXT NOT NULL,
    insight_description TEXT NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    impact_score DECIMAL(5,4) NOT NULL,
    recommendation TEXT,
    insight_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Pattern predictions table
CREATE TABLE IF NOT EXISTS pattern_predictions (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    prediction_type TEXT NOT NULL,
    prediction_value DECIMAL(20,8),
    confidence_score DECIMAL(5,4) NOT NULL,
    time_horizon TEXT NOT NULL,
    prediction_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_date TIMESTAMP WITH TIME ZONE,
    is_fulfilled BOOLEAN DEFAULT false,
    actual_value DECIMAL(20,8),
    fulfillment_date TIMESTAMP WITH TIME ZONE
);

-- Pattern summary view (this is what was missing)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pattern_detections_type ON pattern_detections(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_token ON pattern_detections(token_symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_detected_at ON pattern_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_type ON pattern_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_token ON pattern_insights(token_symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_type ON pattern_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_pattern_predictions_token ON pattern_predictions(token_symbol);

-- Insert some sample data for testing
INSERT INTO pattern_detections (pattern_type, token_symbol, pattern_name, pattern_strength, pattern_confidence, pattern_data) VALUES
('volume_spike', 'BONK', 'Volume Spike Detected', 0.85, 0.92, '{"volume_increase": 250, "timeframe": "1h"}'),
('sentiment_spike', 'PEPE', 'Positive Sentiment Surge', 0.78, 0.88, '{"sentiment_score": 0.85, "mentions": 150}'),
('price_breakout', 'DOGE', 'Price Breakout Pattern', 0.92, 0.95, '{"price_change": 0.15, "resistance_break": true}'),
('social_trend', 'SHIB', 'Social Media Trend', 0.73, 0.81, '{"social_score": 0.79, "platforms": ["tiktok", "telegram"]}')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Pattern recognition database setup completed successfully!' as status;
