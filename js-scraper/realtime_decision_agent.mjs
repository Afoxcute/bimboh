import { LlmAgent, AgentBuilder } from '@iqai/adk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Real-Time Decision Making Agent
 * 
 * This agent processes all data streams and makes intelligent decisions
 * about market opportunities, risk management, and automated actions.
 */
export class RealtimeDecisionAgent {
  constructor(supabase) {
    this.supabase = supabase;
    this.agents = {};
    this.decisionHistory = [];
    this.riskThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8
    };
    this.opportunityThresholds = {
      minVolumeGrowth: 1.5,      // 150% volume growth
      minSentimentScore: 0.7,    // 70% positive sentiment
      minTrendScore: 0.6,        // 60% trend confidence
      maxRiskScore: 0.4          // 40% max risk
    };
  }

  /**
   * Initialize all decision-making agents
   */
  async initialize() {
    console.log('🧠 Initializing Real-Time Decision Making Agents...');

    // 1. Market Opportunity Detector
    this.agents.opportunityDetector = new LlmAgent({
      name: 'opportunity_detector',
      model: 'gpt-3.5-turbo',
      instruction: `You are an AI-powered market opportunity detector. Your role is to:
      
      - Analyze market data, social sentiment, and trend patterns
      - Identify high-potential memecoin opportunities
      - Calculate opportunity scores based on multiple factors
      - Consider volume growth, sentiment, trends, and risk factors
      - Provide clear reasoning for opportunity assessments
      
      Focus on:
      - Volume spikes and trading patterns
      - Social media sentiment and engagement
      - Technical indicators and price movements
      - Risk-reward ratios
      - Market timing and momentum
      
      Always provide confidence scores and detailed reasoning.`,
      tools: [
        new MarketOpportunityTool(this.supabase),
        new VolumeAnalysisTool(this.supabase),
        new SentimentAnalysisTool(this.supabase),
        new TrendAnalysisTool(this.supabase)
      ]
    });

    // 2. Risk Assessment Agent
    this.agents.riskAssessor = new LlmAgent({
      name: 'risk_assessor',
      model: 'gpt-3.5-turbo',
      instruction: `You are an AI-powered risk assessment specialist. Your role is to:
      
      - Evaluate potential risks in market opportunities
      - Analyze token fundamentals and market conditions
      - Assess liquidity, volatility, and market manipulation risks
      - Consider regulatory and compliance factors
      - Provide risk mitigation strategies
      
      Focus on:
      - Token liquidity and trading volume
      - Price volatility and market stability
      - Social media manipulation signals
      - Regulatory compliance and legal risks
      - Technical analysis and chart patterns
      
      Always provide risk scores and mitigation recommendations.`,
      tools: [
        new RiskAssessmentTool(this.supabase),
        new LiquidityAnalysisTool(this.supabase),
        new VolatilityAnalysisTool(this.supabase),
        new ComplianceCheckTool(this.supabase)
      ]
    });

    // 3. Action Decision Agent
    this.agents.actionDecider = new LlmAgent({
      name: 'action_decider',
      model: 'gpt-3.5-turbo',
      instruction: `You are an AI-powered action decision maker. Your role is to:
      
      - Decide on specific actions based on opportunity and risk analysis
      - Choose between different strategies (buy, sell, hold, alert)
      - Determine optimal timing and execution parameters
      - Consider portfolio balance and risk management
      - Provide clear action recommendations with reasoning
      
      Available actions:
      - ALERT: Send alert to users about opportunity
      - BUY: Recommend buying with specific parameters
      - SELL: Recommend selling with specific parameters
      - HOLD: Continue monitoring without action
      - AVOID: Avoid due to high risk or low opportunity
      
      Always provide clear reasoning and confidence levels.`,
      tools: [
        new ActionDecisionTool(this.supabase),
        new PortfolioAnalysisTool(this.supabase),
        new TimingAnalysisTool(this.supabase),
        new ExecutionTool(this.supabase)
      ]
    });

    // 4. Performance Monitor Agent
    this.agents.performanceMonitor = new LlmAgent({
      name: 'performance_monitor',
      model: 'gpt-3.5-turbo',
      instruction: `You are an AI-powered performance monitoring specialist. Your role is to:
      
      - Track the performance of previous decisions
      - Analyze success and failure patterns
      - Identify areas for improvement
      - Adjust decision parameters based on results
      - Provide performance insights and recommendations
      
      Focus on:
      - Decision accuracy and success rates
      - Risk-adjusted returns
      - Market timing effectiveness
      - Pattern recognition improvements
      - Strategy optimization
      
      Always provide actionable insights for improvement.`,
      tools: [
        new PerformanceAnalysisTool(this.supabase),
        new DecisionTrackingTool(this.supabase),
        new StrategyOptimizationTool(this.supabase),
        new LearningTool(this.supabase)
      ]
    });

    console.log('✅ Real-Time Decision Making Agents initialized');
  }

  /**
   * Process real-time data and make decisions
   */
  async processRealtimeData() {
    try {
      console.log('🔄 Processing real-time data for decision making...');

      // Step 1: Detect opportunities
      const opportunities = await this.detectOpportunities();
      
      // Step 2: Assess risks for each opportunity
      const riskAssessments = await this.assessRisks(opportunities);
      
      // Step 3: Make action decisions
      const decisions = await this.makeDecisions(opportunities, riskAssessments);
      
      // Step 4: Execute actions
      const results = await this.executeDecisions(decisions);
      
      // Step 5: Monitor performance
      await this.monitorPerformance(results);

      return {
        success: true,
        opportunities: opportunities.length,
        decisions: decisions.length,
        executed: results.filter(r => r.executed).length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Real-time decision processing failed:', error);
      throw error;
    }
  }

  /**
   * Detect market opportunities
   */
  async detectOpportunities() {
    console.log('🔍 Detecting market opportunities...');
    
    try {
      const result = await this.agents.opportunityDetector.execute({
        mode: 'realtime',
        timeRange: '1h',
        minVolumeGrowth: this.opportunityThresholds.minVolumeGrowth,
        minSentimentScore: this.opportunityThresholds.minSentimentScore
      });

      return result.opportunities || [];
    } catch (error) {
      console.error('Opportunity detection failed:', error);
      return [];
    }
  }

  /**
   * Assess risks for opportunities
   */
  async assessRisks(opportunities) {
    console.log('⚠️ Assessing risks for opportunities...');
    
    const riskAssessments = [];
    
    for (const opportunity of opportunities) {
      try {
        const result = await this.agents.riskAssessor.execute({
          tokenSymbol: opportunity.tokenSymbol,
          tokenUri: opportunity.tokenUri,
          opportunityScore: opportunity.score,
          marketData: opportunity.marketData
        });

        riskAssessments.push({
          ...opportunity,
          riskAssessment: result
        });
      } catch (error) {
        console.error(`Risk assessment failed for ${opportunity.tokenSymbol}:`, error);
        riskAssessments.push({
          ...opportunity,
          riskAssessment: { riskScore: 1.0, riskLevel: 'high', error: error.message }
        });
      }
    }

    return riskAssessments;
  }

  /**
   * Make action decisions based on opportunities and risks
   */
  async makeDecisions(opportunities, riskAssessments) {
    console.log('🎯 Making action decisions...');
    
    const decisions = [];
    
    for (const assessment of riskAssessments) {
      try {
        const result = await this.agents.actionDecider.execute({
          opportunity: assessment,
          riskAssessment: assessment.riskAssessment,
          currentPortfolio: await this.getCurrentPortfolio(),
          marketConditions: await this.getMarketConditions()
        });

        decisions.push({
          ...assessment,
          decision: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Decision making failed for ${assessment.tokenSymbol}:`, error);
        decisions.push({
          ...assessment,
          decision: { action: 'HOLD', reason: 'Decision failed', error: error.message },
          timestamp: new Date().toISOString()
        });
      }
    }

    return decisions;
  }

  /**
   * Execute decisions
   */
  async executeDecisions(decisions) {
    console.log('⚡ Executing decisions...');
    
    const results = [];
    
    for (const decision of decisions) {
      try {
        const result = await this.agents.actionDecider.execute({
          action: decision.decision.action,
          parameters: decision.decision.parameters,
          tokenSymbol: decision.tokenSymbol,
          tokenUri: decision.tokenUri
        });

        results.push({
          ...decision,
          execution: result,
          executed: result.success || false,
          executedAt: new Date().toISOString()
        });

        // Store decision in database
        await this.storeDecision(decision, result);

      } catch (error) {
        console.error(`Execution failed for ${decision.tokenSymbol}:`, error);
        results.push({
          ...decision,
          execution: { success: false, error: error.message },
          executed: false,
          executedAt: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Monitor performance of decisions
   */
  async monitorPerformance(results) {
    console.log('📊 Monitoring decision performance...');
    
    try {
      const result = await this.agents.performanceMonitor.execute({
        decisions: results,
        timeRange: '24h',
        includeLearning: true
      });

      // Update decision parameters based on performance
      if (result.recommendations) {
        await this.updateDecisionParameters(result.recommendations);
      }

      return result;
    } catch (error) {
      console.error('Performance monitoring failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current portfolio state
   */
  async getCurrentPortfolio() {
    try {
      const { data, error } = await this.supabase
        .from('portfolio')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || { positions: [], totalValue: 0, riskLevel: 'medium' };
    } catch (error) {
      console.error('Failed to get portfolio:', error);
      return { positions: [], totalValue: 0, riskLevel: 'medium' };
    }
  }

  /**
   * Get current market conditions
   */
  async getMarketConditions() {
    try {
      const { data, error } = await this.supabase
        .from('market_conditions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || { 
        volatility: 'medium', 
        trend: 'neutral', 
        sentiment: 'neutral',
        liquidity: 'medium'
      };
    } catch (error) {
      console.error('Failed to get market conditions:', error);
      return { 
        volatility: 'medium', 
        trend: 'neutral', 
        sentiment: 'neutral',
        liquidity: 'medium'
      };
    }
  }

  /**
   * Store decision in database
   */
  async storeDecision(decision, execution) {
    try {
      const { error } = await this.supabase
        .from('decision_history')
        .insert({
          token_symbol: decision.tokenSymbol,
          token_uri: decision.tokenUri,
          opportunity_score: decision.opportunityScore,
          risk_score: decision.riskAssessment?.riskScore,
          risk_level: decision.riskAssessment?.riskLevel,
          decision_action: decision.decision.action,
          decision_reason: decision.decision.reason,
          decision_confidence: decision.decision.confidence,
          execution_success: execution.success,
          execution_details: execution,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store decision:', error);
    }
  }

  /**
   * Update decision parameters based on performance
   */
  async updateDecisionParameters(recommendations) {
    try {
      // Update opportunity thresholds
      if (recommendations.opportunityThresholds) {
        this.opportunityThresholds = {
          ...this.opportunityThresholds,
          ...recommendations.opportunityThresholds
        };
      }

      // Update risk thresholds
      if (recommendations.riskThresholds) {
        this.riskThresholds = {
          ...this.riskThresholds,
          ...recommendations.riskThresholds
        };
      }

      console.log('📈 Updated decision parameters based on performance');
    } catch (error) {
      console.error('Failed to update parameters:', error);
    }
  }

  /**
   * Get decision statistics
   */
  async getDecisionStats() {
    try {
      const { data, error } = await this.supabase
        .from('decision_history')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        totalDecisions: data.length,
        successfulExecutions: data.filter(d => d.execution_success).length,
        averageConfidence: data.reduce((sum, d) => sum + (d.decision_confidence || 0), 0) / data.length,
        actionBreakdown: {},
        riskLevelBreakdown: {}
      };

      // Calculate action breakdown
      data.forEach(decision => {
        const action = decision.decision_action || 'UNKNOWN';
        stats.actionBreakdown[action] = (stats.actionBreakdown[action] || 0) + 1;
      });

      // Calculate risk level breakdown
      data.forEach(decision => {
        const riskLevel = decision.risk_level || 'UNKNOWN';
        stats.riskLevelBreakdown[riskLevel] = (stats.riskLevelBreakdown[riskLevel] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get decision stats:', error);
      return null;
    }
  }
}

// =====================================================
// DECISION-MAKING TOOLS
// =====================================================

class MarketOpportunityTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { mode = 'realtime', timeRange = '1h', minVolumeGrowth = 1.5, minSentimentScore = 0.7 } = input;
      
      console.log(`🔍 Detecting market opportunities (${mode}, ${timeRange})...`);
      
      // Get recent market data
      const marketData = await this.getRecentMarketData(timeRange);
      
      // Analyze opportunities
      const opportunities = await this.analyzeOpportunities(marketData, {
        minVolumeGrowth,
        minSentimentScore
      });

      // Store opportunity analysis
      await this.storeOpportunityAnalysis(opportunities);

      return {
        success: true,
        opportunities: opportunities,
        count: opportunities.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market opportunity detection failed:', error);
      throw error;
    }
  }

  async getRecentMarketData(timeRange) {
    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 1;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    try {
      // Get price data with volume analysis
      const { data: prices, error: priceError } = await this.supabase
        .from('prices')
        .select(`
          *,
          tokens!fk_prices_token_uri (
            name,
            symbol,
            uri
          )
        `)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false });

      if (priceError) throw priceError;

      // Get sentiment data
      const { data: sentiment, error: sentimentError } = await this.supabase
        .from('sentiment_analysis')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (sentimentError) throw sentimentError;

      // Get trend data
      const { data: trends, error: trendError } = await this.supabase
        .from('trend_analysis')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (trendError) throw trendError;

      return { prices: prices || [], sentiment: sentiment || [], trends: trends || [] };
    } catch (error) {
      console.error('Failed to get market data:', error);
      return { prices: [], sentiment: [], trends: [] };
    }
  }

  async analyzeOpportunities(marketData, thresholds) {
    const opportunities = [];
    const tokenMap = new Map();

    // Group data by token
    marketData.prices.forEach(price => {
      if (price.tokens) {
        const tokenSymbol = price.tokens.symbol;
        if (!tokenMap.has(tokenSymbol)) {
          tokenMap.set(tokenSymbol, {
            tokenSymbol,
            tokenUri: price.tokens.uri,
            prices: [],
            sentiment: [],
            trends: []
          });
        }
        tokenMap.get(tokenSymbol).prices.push(price);
      }
    });

    // Add sentiment data
    marketData.sentiment.forEach(sentiment => {
      if (sentiment.token_symbol && tokenMap.has(sentiment.token_symbol)) {
        tokenMap.get(sentiment.token_symbol).sentiment.push(sentiment);
      }
    });

    // Add trend data
    marketData.trends.forEach(trend => {
      if (trend.token_symbol && tokenMap.has(trend.token_symbol)) {
        tokenMap.get(trend.token_symbol).trends.push(trend);
      }
    });

    // Analyze each token
    for (const [tokenSymbol, data] of tokenMap) {
      const opportunity = await this.analyzeTokenOpportunity(data, thresholds);
      if (opportunity) {
        opportunities.push(opportunity);
      }
    }

    // Sort by opportunity score
    return opportunities.sort((a, b) => b.score - a.score);
  }

  async analyzeTokenOpportunity(data, thresholds) {
    try {
      const { tokenSymbol, tokenUri, prices, sentiment, trends } = data;

      // Calculate volume growth
      const volumeGrowth = this.calculateVolumeGrowth(prices);
      
      // Calculate sentiment score
      const sentimentScore = this.calculateSentimentScore(sentiment);
      
      // Calculate trend score
      const trendScore = this.calculateTrendScore(trends);
      
      // Calculate price momentum
      const priceMomentum = this.calculatePriceMomentum(prices);

      // Calculate overall opportunity score
      const score = this.calculateOpportunityScore({
        volumeGrowth,
        sentimentScore,
        trendScore,
        priceMomentum
      });

      // Check if meets thresholds
      if (volumeGrowth >= thresholds.minVolumeGrowth && 
          sentimentScore >= thresholds.minSentimentScore) {
        
        return {
          tokenSymbol,
          tokenUri,
          score,
          volumeGrowth,
          sentimentScore,
          trendScore,
          priceMomentum,
          marketData: {
            latestPrice: prices[0],
            priceHistory: prices.slice(0, 10),
            sentimentHistory: sentiment.slice(0, 5),
            trendHistory: trends.slice(0, 5)
          },
          timestamp: new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to analyze opportunity for ${data.tokenSymbol}:`, error);
      return null;
    }
  }

  calculateVolumeGrowth(prices) {
    if (prices.length < 2) return 0;
    
    const recent = prices.slice(0, 5);
    const older = prices.slice(5, 10);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, p) => sum + (p.volume_24h || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + (p.volume_24h || 0), 0) / older.length;
    
    return olderAvg > 0 ? recentAvg / olderAvg : 0;
  }

  calculateSentimentScore(sentiment) {
    if (sentiment.length === 0) return 0;
    
    const avgScore = sentiment.reduce((sum, s) => sum + (s.sentiment_score || 0), 0) / sentiment.length;
    return Math.max(0, Math.min(1, avgScore));
  }

  calculateTrendScore(trends) {
    if (trends.length === 0) return 0;
    
    const avgScore = trends.reduce((sum, t) => sum + (t.trend_score || 0), 0) / trends.length;
    return Math.max(0, Math.min(1, avgScore));
  }

  calculatePriceMomentum(prices) {
    if (prices.length < 2) return 0;
    
    const recent = prices[0];
    const older = prices[Math.min(5, prices.length - 1)];
    
    if (!recent.price_usd || !older.price_usd) return 0;
    
    return (recent.price_usd - older.price_usd) / older.price_usd;
  }

  calculateOpportunityScore(factors) {
    const weights = {
      volumeGrowth: 0.3,
      sentimentScore: 0.25,
      trendScore: 0.25,
      priceMomentum: 0.2
    };

    let score = 0;
    score += Math.min(factors.volumeGrowth / 2, 1) * weights.volumeGrowth; // Cap at 2x growth
    score += factors.sentimentScore * weights.sentimentScore;
    score += factors.trendScore * weights.trendScore;
    score += Math.max(0, Math.min(factors.priceMomentum + 0.5, 1)) * weights.priceMomentum; // Normalize momentum

    return Math.max(0, Math.min(1, score));
  }

  async storeOpportunityAnalysis(opportunities) {
    try {
      const analysisData = opportunities.map(opp => ({
        token_symbol: opp.tokenSymbol,
        token_uri: opp.tokenUri,
        opportunity_score: opp.score,
        volume_growth: opp.volumeGrowth,
        sentiment_score: opp.sentimentScore,
        trend_score: opp.trendScore,
        price_momentum: opp.priceMomentum,
        analysis_data: opp.marketData,
        created_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('opportunity_analysis')
        .insert(analysisData);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store opportunity analysis:', error);
    }
  }
}

class RiskAssessmentTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { tokenSymbol, tokenUri, opportunityScore, marketData } = input;
      
      console.log(`⚠️ Assessing risk for ${tokenSymbol}...`);
      
      // Analyze various risk factors
      const riskFactors = await this.analyzeRiskFactors(tokenSymbol, tokenUri, marketData);
      
      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(riskFactors);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);
      
      // Generate risk mitigation strategies
      const mitigationStrategies = this.generateMitigationStrategies(riskFactors, riskLevel);

      return {
        success: true,
        riskScore,
        riskLevel,
        riskFactors,
        mitigationStrategies,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    }
  }

  async analyzeRiskFactors(tokenSymbol, tokenUri, marketData) {
    const factors = {
      liquidityRisk: await this.assessLiquidityRisk(marketData),
      volatilityRisk: await this.assessVolatilityRisk(marketData),
      sentimentRisk: await this.assessSentimentRisk(tokenSymbol),
      technicalRisk: await this.assessTechnicalRisk(marketData),
      marketRisk: await this.assessMarketRisk()
    };

    return factors;
  }

  async assessLiquidityRisk(marketData) {
    if (!marketData?.latestPrice?.volume_24h) return 0.5;
    
    const volume = marketData.latestPrice.volume_24h;
    
    // Low volume = high risk
    if (volume < 10000) return 0.9;
    if (volume < 50000) return 0.7;
    if (volume < 100000) return 0.5;
    if (volume < 500000) return 0.3;
    return 0.1;
  }

  async assessVolatilityRisk(marketData) {
    if (!marketData?.priceHistory || marketData.priceHistory.length < 2) return 0.5;
    
    const prices = marketData.priceHistory.map(p => p.price_usd).filter(p => p);
    if (prices.length < 2) return 0.5;
    
    // Calculate price volatility
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    // High volatility = high risk
    if (volatility > 0.5) return 0.9;
    if (volatility > 0.3) return 0.7;
    if (volatility > 0.1) return 0.5;
    if (volatility > 0.05) return 0.3;
    return 0.1;
  }

  async assessSentimentRisk(tokenSymbol) {
    try {
      const { data, error } = await this.supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('token_symbol', tokenSymbol)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) return 0.5;

      // Analyze sentiment consistency
      const scores = data.map(s => s.sentiment_score || 0);
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
      
      // High variance = high risk (inconsistent sentiment)
      if (variance > 0.1) return 0.8;
      if (variance > 0.05) return 0.6;
      if (avgScore < 0.3) return 0.7; // Very negative sentiment
      return 0.3;
    } catch (error) {
      console.error('Failed to assess sentiment risk:', error);
      return 0.5;
    }
  }

  async assessTechnicalRisk(marketData) {
    if (!marketData?.priceHistory || marketData.priceHistory.length < 5) return 0.5;
    
    const prices = marketData.priceHistory.map(p => p.price_usd).filter(p => p);
    if (prices.length < 5) return 0.5;
    
    // Simple technical analysis
    const recent = prices.slice(0, 3);
    const older = prices.slice(3, 6);
    
    if (older.length === 0) return 0.5;
    
    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p, 0) / older.length;
    
    // Declining prices = higher risk
    const decline = (olderAvg - recentAvg) / olderAvg;
    if (decline > 0.3) return 0.8;
    if (decline > 0.1) return 0.6;
    return 0.3;
  }

  async assessMarketRisk() {
    try {
      // Get overall market sentiment
      const { data, error } = await this.supabase
        .from('market_conditions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) return 0.5;

      const conditions = data[0];
      let risk = 0.5;

      // Adjust based on market conditions
      if (conditions.volatility === 'high') risk += 0.3;
      if (conditions.volatility === 'low') risk -= 0.2;
      if (conditions.sentiment === 'negative') risk += 0.2;
      if (conditions.sentiment === 'positive') risk -= 0.1;
      if (conditions.liquidity === 'low') risk += 0.2;
      if (conditions.liquidity === 'high') risk -= 0.1;

      return Math.max(0, Math.min(1, risk));
    } catch (error) {
      console.error('Failed to assess market risk:', error);
      return 0.5;
    }
  }

  calculateRiskScore(factors) {
    const weights = {
      liquidityRisk: 0.25,
      volatilityRisk: 0.25,
      sentimentRisk: 0.2,
      technicalRisk: 0.15,
      marketRisk: 0.15
    };

    let score = 0;
    Object.keys(factors).forEach(factor => {
      score += factors[factor] * weights[factor];
    });

    return Math.max(0, Math.min(1, score));
  }

  determineRiskLevel(riskScore) {
    if (riskScore >= 0.8) return 'high';
    if (riskScore >= 0.6) return 'medium';
    return 'low';
  }

  generateMitigationStrategies(factors, riskLevel) {
    const strategies = [];

    if (factors.liquidityRisk > 0.7) {
      strategies.push('Consider smaller position size due to low liquidity');
    }

    if (factors.volatilityRisk > 0.7) {
      strategies.push('Use stop-loss orders to limit downside risk');
    }

    if (factors.sentimentRisk > 0.7) {
      strategies.push('Monitor sentiment closely and be ready to exit');
    }

    if (factors.technicalRisk > 0.7) {
      strategies.push('Wait for better technical setup before entering');
    }

    if (riskLevel === 'high') {
      strategies.push('Consider avoiding this opportunity or use very small position');
    }

    return strategies;
  }
}

// Additional tool classes would be implemented here...
// (VolumeAnalysisTool, SentimentAnalysisTool, TrendAnalysisTool, etc.)

class ActionDecisionTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { opportunity, riskAssessment, currentPortfolio, marketConditions } = input;
      
      console.log(`🎯 Making action decision for ${opportunity.tokenSymbol}...`);
      
      // Analyze the opportunity and risk
      const analysis = this.analyzeOpportunityRisk(opportunity, riskAssessment);
      
      // Consider portfolio balance
      const portfolioConsiderations = this.analyzePortfolioBalance(currentPortfolio, opportunity);
      
      // Consider market conditions
      const marketConsiderations = this.analyzeMarketConditions(marketConditions);
      
      // Make final decision
      const decision = this.makeFinalDecision(analysis, portfolioConsiderations, marketConsiderations);
      
      return {
        success: true,
        action: decision.action,
        reason: decision.reason,
        confidence: decision.confidence,
        parameters: decision.parameters,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Action decision failed:', error);
      throw error;
    }
  }

  analyzeOpportunityRisk(opportunity, riskAssessment) {
    const opportunityScore = opportunity.score || 0;
    const riskScore = riskAssessment.riskScore || 1;
    
    // Calculate risk-adjusted opportunity score
    const riskAdjustedScore = opportunityScore * (1 - riskScore);
    
    return {
      opportunityScore,
      riskScore,
      riskAdjustedScore,
      riskLevel: riskAssessment.riskLevel || 'medium'
    };
  }

  analyzePortfolioBalance(portfolio, opportunity) {
    // Simple portfolio analysis
    const currentPositions = portfolio.positions || [];
    const totalValue = portfolio.totalValue || 0;
    
    // Check if we already have this token
    const existingPosition = currentPositions.find(p => p.tokenSymbol === opportunity.tokenSymbol);
    
    return {
      hasExistingPosition: !!existingPosition,
      existingPosition,
      totalValue,
      positionCount: currentPositions.length
    };
  }

  analyzeMarketConditions(conditions) {
    return {
      volatility: conditions.volatility || 'medium',
      trend: conditions.trend || 'neutral',
      sentiment: conditions.sentiment || 'neutral',
      liquidity: conditions.liquidity || 'medium'
    };
  }

  makeFinalDecision(analysis, portfolio, market) {
    const { riskAdjustedScore, riskLevel } = analysis;
    const { hasExistingPosition } = portfolio;
    
    // Decision logic
    if (riskLevel === 'high' || riskAdjustedScore < 0.3) {
      return {
        action: 'AVOID',
        reason: 'High risk or low opportunity score',
        confidence: 0.8,
        parameters: {}
      };
    }
    
    if (riskAdjustedScore >= 0.7 && !hasExistingPosition) {
      return {
        action: 'ALERT',
        reason: 'High opportunity, low risk - alert users',
        confidence: 0.9,
        parameters: {
          priority: 'high',
          message: `High-potential opportunity detected: ${analysis.opportunityScore} score, ${riskLevel} risk`
        }
      };
    }
    
    if (riskAdjustedScore >= 0.5 && riskLevel === 'low') {
      return {
        action: 'BUY',
        reason: 'Good opportunity with low risk',
        confidence: 0.7,
        parameters: {
          positionSize: 'small',
          stopLoss: 0.1,
          takeProfit: 0.3
        }
      };
    }
    
    if (hasExistingPosition && riskLevel === 'high') {
      return {
        action: 'SELL',
        reason: 'High risk detected for existing position',
        confidence: 0.8,
        parameters: {
          urgency: 'high'
        }
      };
    }
    
    return {
      action: 'HOLD',
      reason: 'Continue monitoring - moderate opportunity/risk',
      confidence: 0.6,
      parameters: {}
    };
  }
}

// Placeholder classes for other tools
class VolumeAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, volumeAnalysis: {} }; }
}

class SentimentAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, sentimentAnalysis: {} }; }
}

class TrendAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, trendAnalysis: {} }; }
}

class LiquidityAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, liquidityAnalysis: {} }; }
}

class VolatilityAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, volatilityAnalysis: {} }; }
}

class ComplianceCheckTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, complianceCheck: {} }; }
}

class PortfolioAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, portfolioAnalysis: {} }; }
}

class TimingAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, timingAnalysis: {} }; }
}

class ExecutionTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, execution: {} }; }
}

class PerformanceAnalysisTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, performanceAnalysis: {} }; }
}

class DecisionTrackingTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, decisionTracking: {} }; }
}

class StrategyOptimizationTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, strategyOptimization: {} }; }
}

class LearningTool {
  constructor(supabase) { this.supabase = supabase; }
  async execute(input) { return { success: true, learning: {} }; }
}

export default RealtimeDecisionAgent;
