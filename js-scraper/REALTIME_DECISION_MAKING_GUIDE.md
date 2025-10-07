# 🧠 Real-Time Decision Making System

## Overview

The Real-Time Decision Making System is an intelligent AI-powered agent that processes all data streams from the Iris platform and makes automated decisions about market opportunities, risk management, and strategic actions.

## 🎯 Key Features

### **1. Intelligent Opportunity Detection**
- **Volume Analysis**: Detects volume spikes and trading patterns
- **Sentiment Analysis**: Analyzes social media sentiment and engagement
- **Trend Detection**: Identifies emerging trends and momentum
- **Price Analysis**: Tracks price movements and technical indicators
- **Multi-Factor Scoring**: Combines all factors into opportunity scores

### **2. Comprehensive Risk Assessment**
- **Liquidity Risk**: Evaluates trading volume and market depth
- **Volatility Risk**: Assesses price stability and market volatility
- **Sentiment Risk**: Analyzes sentiment consistency and manipulation signals
- **Technical Risk**: Reviews chart patterns and technical indicators
- **Market Risk**: Considers overall market conditions and sentiment

### **3. Smart Action Decisions**
- **ALERT**: Send alerts for high-potential opportunities
- **BUY**: Recommend buying with specific parameters
- **SELL**: Recommend selling with specific parameters
- **HOLD**: Continue monitoring without action
- **AVOID**: Avoid due to high risk or low opportunity

### **4. Performance Monitoring**
- **Decision Tracking**: Monitors success of all decisions
- **Performance Analysis**: Calculates returns and success rates
- **Strategy Optimization**: Adjusts parameters based on results
- **Learning System**: Improves decision-making over time

## 🏗️ Architecture

### **Core Components**

1. **RealtimeDecisionAgent** - Main orchestrator
2. **MarketOpportunityTool** - Detects opportunities
3. **RiskAssessmentTool** - Assesses risks
4. **ActionDecisionTool** - Makes action decisions
5. **PerformanceMonitor** - Tracks performance

### **Data Flow**

```
Data Collection → Opportunity Detection → Risk Assessment → Action Decision → Execution → Performance Monitoring
```

## 📊 Database Schema

### **Core Tables**

- **`decision_history`** - All decisions made by the system
- **`opportunity_analysis`** - Opportunity detection results
- **`risk_assessments_detailed`** - Detailed risk analysis
- **`action_executions`** - Execution tracking
- **`portfolio_snapshots`** - Portfolio state over time
- **`market_conditions`** - Overall market state
- **`decision_performance`** - Performance tracking
- **`strategy_performance`** - Strategy-level metrics

### **Analytics Views**

- **`decision_summary`** - Daily decision summaries
- **`opportunity_trends`** - Token opportunity trends
- **`risk_distribution`** - Risk level distribution
- **`performance_metrics`** - Performance metrics

## 🚀 Setup Instructions

### **1. Database Setup**

Run the decision schema in your Supabase SQL Editor:

```bash
yarn setup-decision-schema
```

Then copy and paste the contents of `decision_schema.sql` into Supabase.

### **2. Test the System**

```bash
# Test the decision agent
yarn test-decision-agent

# Run the full workflow with decisions
yarn adk-workflow
```

### **3. Monitor Performance**

```sql
-- View decision summary
SELECT * FROM decision_summary ORDER BY decision_date DESC LIMIT 10;

-- View opportunity trends
SELECT * FROM opportunity_trends ORDER BY avg_opportunity_score DESC LIMIT 10;

-- View performance metrics
SELECT * FROM performance_metrics ORDER BY period_start DESC LIMIT 5;
```

## 🎛️ Configuration

### **Opportunity Thresholds**

```javascript
const opportunityThresholds = {
  minVolumeGrowth: 1.5,      // 150% volume growth
  minSentimentScore: 0.7,    // 70% positive sentiment
  minTrendScore: 0.6,        // 60% trend confidence
  maxRiskScore: 0.4          // 40% max risk
};
```

### **Risk Thresholds**

```javascript
const riskThresholds = {
  low: 0.3,    // 0-30% risk
  medium: 0.6, // 30-60% risk
  high: 0.8    // 60-80% risk
};
```

### **Decision Weights**

```javascript
const decisionWeights = {
  opportunity: 0.4,  // 40% weight on opportunity
  risk: 0.3,         // 30% weight on risk
  portfolio: 0.2,    // 20% weight on portfolio balance
  market: 0.1        // 10% weight on market conditions
};
```

## 📈 Decision Logic

### **Opportunity Detection**

1. **Volume Growth**: Calculate recent vs historical volume
2. **Sentiment Score**: Analyze social media sentiment
3. **Trend Score**: Evaluate trend strength and momentum
4. **Price Momentum**: Track price movement patterns
5. **Combined Score**: Weighted combination of all factors

### **Risk Assessment**

1. **Liquidity Risk**: Based on trading volume and depth
2. **Volatility Risk**: Calculated from price variance
3. **Sentiment Risk**: Consistency and manipulation signals
4. **Technical Risk**: Chart patterns and technical indicators
5. **Market Risk**: Overall market conditions

### **Action Decision Matrix**

| Opportunity Score | Risk Level | Action | Confidence |
|------------------|------------|--------|------------|
| High (≥0.7) | Low | ALERT | High |
| High (≥0.7) | Medium | BUY | Medium |
| High (≥0.7) | High | HOLD | Low |
| Medium (0.4-0.7) | Low | BUY | Medium |
| Medium (0.4-0.7) | Medium | HOLD | Medium |
| Medium (0.4-0.7) | High | AVOID | High |
| Low (<0.4) | Any | AVOID | High |

## 🔧 API Usage

### **Process Real-Time Data**

```javascript
import RealtimeDecisionAgent from './realtime_decision_agent.mjs';

const decisionAgent = new RealtimeDecisionAgent(supabase);
await decisionAgent.initialize();

// Process all data streams and make decisions
const result = await decisionAgent.processRealtimeData();
console.log('Decisions made:', result.decisions);
```

### **Get Decision Statistics**

```javascript
const stats = await decisionAgent.getDecisionStats();
console.log('Success rate:', stats.successfulExecutions / stats.totalDecisions);
```

### **Custom Decision Processing**

```javascript
// Detect opportunities
const opportunities = await decisionAgent.detectOpportunities();

// Assess risks
const riskAssessments = await decisionAgent.assessRisks(opportunities);

// Make decisions
const decisions = await decisionAgent.makeDecisions(opportunities, riskAssessments);

// Execute decisions
const results = await decisionAgent.executeDecisions(decisions);
```

## 📊 Monitoring and Analytics

### **Key Metrics**

- **Decision Success Rate**: Percentage of successful decisions
- **Opportunity Detection Rate**: Number of opportunities found per hour
- **Risk Assessment Accuracy**: How well risk predictions match outcomes
- **Portfolio Performance**: Returns generated by decisions
- **Alert Effectiveness**: User engagement with alerts

### **Performance Tracking**

```sql
-- Get decision performance for last 24 hours
SELECT 
  decision_action,
  COUNT(*) as count,
  AVG(decision_confidence) as avg_confidence,
  COUNT(CASE WHEN execution_success = true THEN 1 END) as successful
FROM decision_history
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY decision_action;
```

### **Risk Analysis**

```sql
-- Get risk distribution
SELECT 
  risk_level,
  COUNT(*) as count,
  AVG(overall_risk_score) as avg_risk_score
FROM risk_assessments_detailed
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY risk_level;
```

## 🔄 Integration with ADK Workflow

The decision agent is integrated into the main ADK workflow:

1. **Data Collection**: All agents collect data (TikTok, Telegram, Market, etc.)
2. **AI Analysis**: Specialized AI agents analyze the data
3. **Decision Processing**: Decision agent processes all data and makes decisions
4. **Execution**: Decisions are executed and results tracked
5. **Learning**: Performance is monitored and parameters optimized

## 🎯 Use Cases

### **1. Automated Trading Signals**
- Detect high-potential opportunities
- Assess risk levels
- Generate buy/sell signals
- Execute trades automatically

### **2. Risk Management**
- Monitor portfolio risk
- Identify high-risk positions
- Suggest risk mitigation strategies
- Implement stop-loss orders

### **3. Market Intelligence**
- Track market sentiment
- Identify emerging trends
- Monitor competitor activity
- Generate market reports

### **4. User Alerts**
- Send high-confidence alerts
- Prioritize by opportunity score
- Include risk assessment
- Provide actionable insights

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Graceful Degradation**: Continues working if individual components fail
- **Retry Logic**: Automatically retries failed operations
- **Fallback Strategies**: Uses alternative approaches when primary methods fail
- **Error Logging**: Detailed logging for debugging and monitoring

## 🔧 Troubleshooting

### **Common Issues**

1. **No Opportunities Detected**
   - Check data quality and completeness
   - Verify threshold settings
   - Review market conditions

2. **High Risk Scores**
   - Analyze risk factors
   - Check market volatility
   - Review token fundamentals

3. **Low Decision Confidence**
   - Ensure sufficient data
   - Check model performance
   - Review decision parameters

### **Debug Commands**

```bash
# Test decision agent
yarn test-decision-agent

# Check database schema
yarn setup-decision-schema

# Run full workflow
yarn adk-workflow
```

## 📚 Advanced Configuration

### **Custom Decision Rules**

```javascript
// Add custom decision logic
class CustomDecisionTool {
  async execute(input) {
    // Custom decision logic here
    return {
      action: 'CUSTOM_ACTION',
      reason: 'Custom reasoning',
      confidence: 0.8
    };
  }
}
```

### **Performance Optimization**

```javascript
// Adjust parameters based on performance
const recommendations = await decisionAgent.monitorPerformance(results);
if (recommendations.opportunityThresholds) {
  decisionAgent.opportunityThresholds = {
    ...decisionAgent.opportunityThresholds,
    ...recommendations.opportunityThresholds
  };
}
```

## 🎉 Benefits

### **For Users**
- **Automated Decision Making**: No need to manually analyze every opportunity
- **Risk Management**: Automatic risk assessment and mitigation
- **Better Performance**: Data-driven decisions with higher success rates
- **Time Savings**: Focus on high-value activities while system handles routine decisions

### **For Platform**
- **Scalability**: Handle thousands of opportunities automatically
- **Consistency**: Apply same decision criteria across all opportunities
- **Learning**: Continuously improve decision-making capabilities
- **Transparency**: Full audit trail of all decisions and reasoning

## 🚀 Future Enhancements

### **Planned Features**
- **Machine Learning Models**: Train custom models on historical data
- **Advanced Analytics**: More sophisticated performance metrics
- **Portfolio Optimization**: Dynamic portfolio rebalancing
- **Market Prediction**: Predictive models for market movements
- **Social Sentiment**: Advanced social media sentiment analysis
- **Regulatory Compliance**: Built-in compliance checking

### **Integration Opportunities**
- **Trading APIs**: Direct integration with trading platforms
- **Notification Systems**: Advanced alert and notification systems
- **Dashboard Integration**: Real-time decision dashboard
- **Mobile Apps**: Mobile decision monitoring and control

---

**The Real-Time Decision Making System transforms the Iris platform from a data collection tool into an intelligent, autonomous decision-making system that can identify opportunities, assess risks, and take action automatically.** 🚀
