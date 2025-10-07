import { IntelligentTwitterAutomation } from './intelligent_twitter_agents.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../../.env' });

async function testIntelligentTwitter() {
  console.log('🧠 Testing Intelligent Twitter Automation...');
  
  try {
    // Initialize the automation system
    const twitter = new IntelligentTwitterAutomation();
    const initialized = await twitter.initialize();
    
    if (!initialized) {
      console.error('❌ Failed to initialize Twitter automation');
      return;
    }
    
    console.log('✅ Twitter automation initialized successfully');
    
    // Test 1: Generate and post market analysis content
    console.log('\n📊 Test 1: Market Analysis Content Generation');
    const marketResult = await twitter.generateAndPostContent('market_analysis', {
      marketData: {
        totalTokens: 150,
        avgVolumeChange: 25.5,
        topPerformer: 'BONK',
        marketMood: 'bullish'
      },
      sentimentData: {
        sentimentScore: 0.75,
        trends: ['AI', 'meme', 'pump']
      }
    }, 'market_analysis');
    
    console.log('Market Analysis Result:', marketResult);
    
    // Test 2: Generate volume alert content
    console.log('\n🚀 Test 2: Volume Alert Content Generation');
    const volumeResult = await twitter.generateAndPostContent('volume_alert', {
      token: {
        symbol: 'PEPE',
        name: 'Pepe Coin',
        uri: 'https://example.com/pepe'
      },
      volumeGrowth: 50000,
      currentVolume: 100000,
      previousVolume: 50000
    }, 'volume_alert');
    
    console.log('Volume Alert Result:', volumeResult);
    
    // Test 3: Generate trending discovery content
    console.log('\n🎯 Test 3: Trending Discovery Content Generation');
    const discoveryResult = await twitter.generateAndPostContent('trending_discovery', {
      analysisResult: {
        platform: 'tiktok',
        id: 'analysis_123'
      },
      correlation: {
        token_symbol: 'DOGE',
        keyword: 'moon',
        correlation_score: 0.85,
        risk_level: 'medium'
      }
    }, 'trending_discovery');
    
    console.log('Trending Discovery Result:', discoveryResult);
    
    // Test 4: Generate sentiment analysis content
    console.log('\n😊 Test 4: Sentiment Analysis Content Generation');
    const sentimentResult = await twitter.generateAndPostContent('sentiment_analysis', {
      sentiment: {
        overall: 'positive',
        confidence: 85,
        themes: ['bullish', 'excitement', 'fomo'],
        riskIndicators: ['high_volume', 'rapid_growth']
      },
      token: {
        symbol: 'SHIB',
        name: 'Shiba Inu'
      },
      platform: 'telegram'
    }, 'sentiment_analysis');
    
    console.log('Sentiment Analysis Result:', sentimentResult);
    
    // Test 5: Generate risk warning content
    console.log('\n⚠️ Test 5: Risk Warning Content Generation');
    const riskResult = await twitter.generateAndPostContent('risk_warning', {
      riskAssessment: {
        riskLevel: 'high',
        riskScore: 8.5,
        riskFactors: ['anonymous_team', 'no_utility', 'pump_and_dump'],
        redFlags: ['guaranteed_returns', 'urgent_action', 'telegram_only'],
        confidence: 90
      },
      token: {
        symbol: 'SCAM',
        name: 'Scam Token'
      }
    }, 'risk_warning');
    
    console.log('Risk Warning Result:', riskResult);
    
    // Test 6: Analyze performance
    console.log('\n📈 Test 6: Performance Analysis');
    const performanceResult = await twitter.analyzePerformance('24h');
    console.log('Performance Analysis Result:', performanceResult);
    
    // Test 7: Optimize strategy
    console.log('\n🔧 Test 7: Strategy Optimization');
    const strategyResult = await twitter.optimizeStrategy();
    console.log('Strategy Optimization Result:', strategyResult);
    
    // Test 8: Get memory insights
    console.log('\n🧠 Test 8: Memory Insights');
    const memoryResult = await twitter.getMemoryInsights();
    console.log('Memory Insights Result:', memoryResult);
    
    // Test 9: Execute full workflow
    console.log('\n🔄 Test 9: Full Workflow Execution');
    const workflowResult = await twitter.executeWorkflow({
      type: 'comprehensive_analysis',
      data: {
        marketData: {
          totalTokens: 200,
          avgVolumeChange: 15.2,
          topPerformer: 'WIF',
          marketMood: 'neutral'
        },
        sentimentData: {
          sentimentScore: 0.6,
          trends: ['ai', 'gaming', 'meme']
        }
      }
    });
    
    console.log('Workflow Execution Result:', workflowResult);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testIntelligentTwitter().catch(console.error);
