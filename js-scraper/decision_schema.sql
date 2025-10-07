-- =====================================================
-- REAL-TIME DECISION MAKING SCHEMA
-- =====================================================
-- This schema supports intelligent decision-making agents
-- that process all data streams and make automated decisions

-- =====================================================
-- DECISION TRACKING TABLES
-- =====================================================

-- Decision history - tracks all decisions made by the system
CREATE TABLE IF NOT EXISTS decision_history (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    opportunity_score DECIMAL(5,4), -- 0.0000 to 1.0000
    risk_score DECIMAL(5,4), -- 0.0000 to 1.0000
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    decision_action TEXT NOT NULL CHECK (decision_action IN ('ALERT', 'BUY', 'SELL', 'HOLD', 'AVOID')),
    decision_reason TEXT,
    decision_confidence DECIMAL(5,4), -- 0.0000 to 1.0000
    execution_success BOOLEAN DEFAULT false,
    execution_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity analysis - stores opportunity detection results
CREATE TABLE IF NOT EXISTS opportunity_analysis (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    opportunity_score DECIMAL(5,4) NOT NULL,
    volume_growth DECIMAL(10,4), -- e.g., 1.5000 = 150% growth
    sentiment_score DECIMAL(5,4), -- 0.0000 to 1.0000
    trend_score DECIMAL(5,4), -- 0.0000 to 1.0000
    price_momentum DECIMAL(10,6), -- e.g., 0.1500 = 15% momentum
    analysis_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk assessments - stores detailed risk analysis
CREATE TABLE IF NOT EXISTS risk_assessments_detailed (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    overall_risk_score DECIMAL(5,4) NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    liquidity_risk DECIMAL(5,4),
    volatility_risk DECIMAL(5,4),
    sentiment_risk DECIMAL(5,4),
    technical_risk DECIMAL(5,4),
    market_risk DECIMAL(5,4),
    mitigation_strategies TEXT[],
    risk_factors JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action executions - tracks execution of decisions
CREATE TABLE IF NOT EXISTS action_executions (
    id SERIAL PRIMARY KEY,
    decision_id INTEGER REFERENCES decision_history(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('ALERT', 'BUY', 'SELL', 'HOLD', 'AVOID')),
    execution_status TEXT NOT NULL CHECK (execution_status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
    execution_parameters JSONB DEFAULT '{}'::jsonb,
    execution_result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PORTFOLIO MANAGEMENT TABLES
-- =====================================================

-- Portfolio snapshots - tracks portfolio state over time
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id SERIAL PRIMARY KEY,
    total_value DECIMAL(20,8) NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    positions_count INTEGER DEFAULT 0,
    cash_balance DECIMAL(20,8) DEFAULT 0,
    portfolio_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio positions - individual token positions
CREATE TABLE IF NOT EXISTS portfolio_positions (
    id SERIAL PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_uri TEXT,
    quantity DECIMAL(20,8) NOT NULL,
    average_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    current_value DECIMAL(20,8),
    unrealized_pnl DECIMAL(20,8),
    realized_pnl DECIMAL(20,8) DEFAULT 0,
    position_size_percent DECIMAL(5,4), -- Percentage of total portfolio
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    position_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MARKET CONDITIONS TABLES
-- =====================================================

-- Market conditions - overall market state
CREATE TABLE IF NOT EXISTS market_conditions (
    id SERIAL PRIMARY KEY,
    volatility TEXT NOT NULL CHECK (volatility IN ('low', 'medium', 'high')),
    trend TEXT NOT NULL CHECK (trend IN ('bullish', 'bearish', 'neutral')),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    liquidity TEXT NOT NULL CHECK (liquidity IN ('low', 'medium', 'high')),
    fear_greed_index DECIMAL(5,2), -- 0.00 to 100.00
    market_cap_total DECIMAL(20,2),
    volume_24h_total DECIMAL(20,2),
    conditions_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERFORMANCE TRACKING TABLES
-- =====================================================

-- Decision performance - tracks success of decisions
CREATE TABLE IF NOT EXISTS decision_performance (
    id SERIAL PRIMARY KEY,
    decision_id INTEGER REFERENCES decision_history(id) ON DELETE CASCADE,
    performance_period TEXT NOT NULL CHECK (performance_period IN ('1h', '24h', '7d', '30d')),
    return_percentage DECIMAL(10,6),
    max_drawdown DECIMAL(10,6),
    sharpe_ratio DECIMAL(10,6),
    success_metric DECIMAL(5,4), -- 0.0000 to 1.0000
    performance_data JSONB DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategy performance - tracks overall strategy performance
CREATE TABLE IF NOT EXISTS strategy_performance (
    id SERIAL PRIMARY KEY,
    strategy_name TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_decisions INTEGER DEFAULT 0,
    successful_decisions INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4), -- 0.0000 to 1.0000
    total_return DECIMAL(10,6),
    max_drawdown DECIMAL(10,6),
    sharpe_ratio DECIMAL(10,6),
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEARNING AND OPTIMIZATION TABLES
-- =====================================================

-- Decision parameters - stores optimized parameters
CREATE TABLE IF NOT EXISTS decision_parameters (
    id SERIAL PRIMARY KEY,
    parameter_name TEXT NOT NULL UNIQUE,
    parameter_value JSONB NOT NULL,
    parameter_type TEXT NOT NULL CHECK (parameter_type IN ('threshold', 'weight', 'strategy', 'rule')),
    description TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT DEFAULT 'system'
);

-- Learning insights - stores insights from performance analysis
CREATE TABLE IF NOT EXISTS learning_insights (
    id SERIAL PRIMARY KEY,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'optimization', 'warning', 'recommendation')),
    insight_title TEXT NOT NULL,
    insight_description TEXT NOT NULL,
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    impact_score DECIMAL(5,4), -- 0.0000 to 1.0000
    insight_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Decision history indexes
CREATE INDEX IF NOT EXISTS idx_decision_history_token_symbol ON decision_history(token_symbol);
CREATE INDEX IF NOT EXISTS idx_decision_history_created_at ON decision_history(created_at);
CREATE INDEX IF NOT EXISTS idx_decision_history_action ON decision_history(decision_action);
CREATE INDEX IF NOT EXISTS idx_decision_history_risk_level ON decision_history(risk_level);
CREATE INDEX IF NOT EXISTS idx_decision_history_opportunity_score ON decision_history(opportunity_score);

-- Opportunity analysis indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_analysis_token_symbol ON opportunity_analysis(token_symbol);
CREATE INDEX IF NOT EXISTS idx_opportunity_analysis_created_at ON opportunity_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunity_analysis_score ON opportunity_analysis(opportunity_score);

-- Risk assessments indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_token_symbol ON risk_assessments_detailed(token_symbol);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created_at ON risk_assessments_detailed(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON risk_assessments_detailed(risk_level);

-- Action executions indexes
CREATE INDEX IF NOT EXISTS idx_action_executions_decision_id ON action_executions(decision_id);
CREATE INDEX IF NOT EXISTS idx_action_executions_status ON action_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_action_executions_created_at ON action_executions(created_at);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_created_at ON portfolio_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_token_symbol ON portfolio_positions(token_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_updated_at ON portfolio_positions(updated_at);

-- Market conditions indexes
CREATE INDEX IF NOT EXISTS idx_market_conditions_timestamp ON market_conditions(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_conditions_volatility ON market_conditions(volatility);
CREATE INDEX IF NOT EXISTS idx_market_conditions_sentiment ON market_conditions(sentiment);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_decision_performance_decision_id ON decision_performance(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_performance_period ON decision_performance(performance_period);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_strategy_name ON strategy_performance(strategy_name);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_period ON strategy_performance(period_start, period_end);

-- Learning indexes
CREATE INDEX IF NOT EXISTS idx_decision_parameters_name ON decision_parameters(parameter_name);
CREATE INDEX IF NOT EXISTS idx_learning_insights_type ON learning_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_learning_insights_created_at ON learning_insights(created_at);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Decision summary view
CREATE OR REPLACE VIEW decision_summary AS
SELECT 
    DATE(created_at) as decision_date,
    decision_action,
    risk_level,
    COUNT(*) as decision_count,
    AVG(opportunity_score) as avg_opportunity_score,
    AVG(risk_score) as avg_risk_score,
    AVG(decision_confidence) as avg_confidence,
    COUNT(CASE WHEN execution_success = true THEN 1 END) as successful_executions,
    ROUND(
        COUNT(CASE WHEN execution_success = true THEN 1 END)::DECIMAL / COUNT(*) * 100, 2
    ) as success_rate
FROM decision_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), decision_action, risk_level
ORDER BY decision_date DESC, decision_count DESC;

-- Opportunity trends view
CREATE OR REPLACE VIEW opportunity_trends AS
SELECT 
    token_symbol,
    COUNT(*) as analysis_count,
    AVG(opportunity_score) as avg_opportunity_score,
    AVG(volume_growth) as avg_volume_growth,
    AVG(sentiment_score) as avg_sentiment_score,
    AVG(trend_score) as avg_trend_score,
    MAX(opportunity_score) as max_opportunity_score,
    MIN(opportunity_score) as min_opportunity_score,
    MAX(created_at) as last_analyzed
FROM opportunity_analysis
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY token_symbol
HAVING COUNT(*) >= 3
ORDER BY avg_opportunity_score DESC;

-- Risk distribution view
CREATE OR REPLACE VIEW risk_distribution AS
SELECT 
    risk_level,
    COUNT(*) as assessment_count,
    AVG(overall_risk_score) as avg_risk_score,
    AVG(liquidity_risk) as avg_liquidity_risk,
    AVG(volatility_risk) as avg_volatility_risk,
    AVG(sentiment_risk) as avg_sentiment_risk,
    AVG(technical_risk) as avg_technical_risk,
    AVG(market_risk) as avg_market_risk
FROM risk_assessments_detailed
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY risk_level
ORDER BY avg_risk_score DESC;

-- Performance metrics view
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    strategy_name,
    period_start,
    period_end,
    total_decisions,
    successful_decisions,
    success_rate,
    total_return,
    max_drawdown,
    sharpe_ratio,
    ROUND(
        (period_end - period_start)::DECIMAL / INTERVAL '1 day', 2
    ) as period_days
FROM strategy_performance
WHERE period_end >= NOW() - INTERVAL '30 days'
ORDER BY period_start DESC;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate decision success rate
CREATE OR REPLACE FUNCTION calculate_decision_success_rate(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    total_decisions BIGINT,
    successful_decisions BIGINT,
    success_rate DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_decisions,
        COUNT(CASE WHEN execution_success = true THEN 1 END)::BIGINT as successful_decisions,
        ROUND(
            COUNT(CASE WHEN execution_success = true THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 4
        ) / 100 as success_rate
    FROM decision_history
    WHERE created_at >= start_date 
    AND created_at <= end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing tokens
CREATE OR REPLACE FUNCTION get_top_performing_tokens(
    days_back INTEGER DEFAULT 7,
    min_decisions INTEGER DEFAULT 3
)
RETURNS TABLE (
    token_symbol TEXT,
    decision_count BIGINT,
    avg_opportunity_score DECIMAL(5,4),
    success_rate DECIMAL(5,4),
    avg_confidence DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dh.token_symbol,
        COUNT(*)::BIGINT as decision_count,
        AVG(dh.opportunity_score) as avg_opportunity_score,
        ROUND(
            COUNT(CASE WHEN dh.execution_success = true THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 4
        ) / 100 as success_rate,
        AVG(dh.decision_confidence) as avg_confidence
    FROM decision_history dh
    WHERE dh.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY dh.token_symbol
    HAVING COUNT(*) >= min_decisions
    ORDER BY success_rate DESC, avg_opportunity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get risk-adjusted opportunities
CREATE OR REPLACE FUNCTION get_risk_adjusted_opportunities(
    min_opportunity_score DECIMAL DEFAULT 0.6,
    max_risk_score DECIMAL DEFAULT 0.4
)
RETURNS TABLE (
    token_symbol TEXT,
    opportunity_score DECIMAL(5,4),
    risk_score DECIMAL(5,4),
    risk_adjusted_score DECIMAL(5,4),
    decision_action TEXT,
    decision_confidence DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dh.token_symbol,
        dh.opportunity_score,
        dh.risk_score,
        ROUND(
            dh.opportunity_score * (1 - dh.risk_score), 4
        ) as risk_adjusted_score,
        dh.decision_action,
        dh.decision_confidence
    FROM decision_history dh
    WHERE dh.opportunity_score >= min_opportunity_score
    AND dh.risk_score <= max_risk_score
    AND dh.created_at >= NOW() - INTERVAL '24 hours'
    ORDER BY risk_adjusted_score DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default decision parameters
INSERT INTO decision_parameters (parameter_name, parameter_value, parameter_type, description) VALUES
('opportunity_thresholds', '{"minVolumeGrowth": 1.5, "minSentimentScore": 0.7, "minTrendScore": 0.6, "maxRiskScore": 0.4}', 'threshold', 'Thresholds for opportunity detection'),
('risk_thresholds', '{"low": 0.3, "medium": 0.6, "high": 0.8}', 'threshold', 'Risk level thresholds'),
('decision_weights', '{"opportunity": 0.4, "risk": 0.3, "portfolio": 0.2, "market": 0.1}', 'weight', 'Weights for decision factors'),
('alert_parameters', '{"minConfidence": 0.8, "maxRiskLevel": "medium", "minOpportunityScore": 0.7}', 'strategy', 'Parameters for alert generation')
ON CONFLICT (parameter_name) DO NOTHING;

-- Insert sample market conditions
INSERT INTO market_conditions (volatility, trend, sentiment, liquidity, fear_greed_index, market_cap_total, volume_24h_total) VALUES
('medium', 'neutral', 'neutral', 'medium', 50.0, 1000000000.00, 50000000.00)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE decision_history IS 'Tracks all decisions made by the AI decision-making system';
COMMENT ON TABLE opportunity_analysis IS 'Stores opportunity detection and analysis results';
COMMENT ON TABLE risk_assessments_detailed IS 'Detailed risk assessments for tokens and opportunities';
COMMENT ON TABLE action_executions IS 'Tracks execution of decisions and their outcomes';
COMMENT ON TABLE portfolio_snapshots IS 'Portfolio state snapshots over time';
COMMENT ON TABLE portfolio_positions IS 'Individual token positions in the portfolio';
COMMENT ON TABLE market_conditions IS 'Overall market conditions and sentiment';
COMMENT ON TABLE decision_performance IS 'Performance tracking for individual decisions';
COMMENT ON TABLE strategy_performance IS 'Overall strategy performance metrics';
COMMENT ON TABLE decision_parameters IS 'Optimized parameters for decision-making';
COMMENT ON TABLE learning_insights IS 'Insights and learnings from performance analysis';
