-- =====================================================
-- ESSENTIAL DECISION SCHEMA - MINIMAL VERSION
-- =====================================================
-- This schema includes only the essential tables needed for the decision agent to work

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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Decision history indexes
CREATE INDEX IF NOT EXISTS idx_decision_history_token_symbol ON decision_history(token_symbol);
CREATE INDEX IF NOT EXISTS idx_decision_history_created_at ON decision_history(created_at);
CREATE INDEX IF NOT EXISTS idx_decision_history_action ON decision_history(decision_action);
CREATE INDEX IF NOT EXISTS idx_decision_history_risk_level ON decision_history(risk_level);

-- Opportunity analysis indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_analysis_token_symbol ON opportunity_analysis(token_symbol);
CREATE INDEX IF NOT EXISTS idx_opportunity_analysis_created_at ON opportunity_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunity_analysis_score ON opportunity_analysis(opportunity_score);

-- Risk assessments indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_token_symbol ON risk_assessments_detailed(token_symbol);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created_at ON risk_assessments_detailed(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON risk_assessments_detailed(risk_level);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_created_at ON portfolio_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_token_symbol ON portfolio_positions(token_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_updated_at ON portfolio_positions(updated_at);

-- Market conditions indexes
CREATE INDEX IF NOT EXISTS idx_market_conditions_timestamp ON market_conditions(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_conditions_volatility ON market_conditions(volatility);
CREATE INDEX IF NOT EXISTS idx_market_conditions_sentiment ON market_conditions(sentiment);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert sample market conditions
INSERT INTO market_conditions (volatility, trend, sentiment, liquidity, fear_greed_index, market_cap_total, volume_24h_total) VALUES
('medium', 'neutral', 'neutral', 'medium', 50.0, 1000000000.00, 50000000.00)
ON CONFLICT DO NOTHING;

-- Insert sample portfolio snapshot
INSERT INTO portfolio_snapshots (total_value, risk_level, positions_count, cash_balance) VALUES
(10000.00, 'medium', 0, 10000.00)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE decision_history IS 'Tracks all decisions made by the AI decision-making system';
COMMENT ON TABLE opportunity_analysis IS 'Stores opportunity detection and analysis results';
COMMENT ON TABLE risk_assessments_detailed IS 'Detailed risk assessments for tokens and opportunities';
COMMENT ON TABLE portfolio_snapshots IS 'Portfolio state snapshots over time';
COMMENT ON TABLE portfolio_positions IS 'Individual token positions in the portfolio';
COMMENT ON TABLE market_conditions IS 'Overall market conditions and sentiment';
