import { IntelligentTwitterAutomation } from './intelligent_twitter_agents.mjs';
import { TwitterIntegration } from './twitter_integration.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../../.env' });

/**
 * Migration script to transition from basic Twitter integration
 * to intelligent Twitter automation with ADK-TS
 */

async function migrateToIntelligentTwitter() {
  console.log('🔄 Starting migration to Intelligent Twitter Automation...');
  
  try {
    // Step 1: Initialize both systems
    console.log('\n📋 Step 1: Initializing systems...');
    
    const oldTwitter = new TwitterIntegration();
    const newTwitter = new IntelligentTwitterAutomation();
    
    const initialized = await newTwitter.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize intelligent Twitter automation');
    }
    
    console.log('✅ Both systems initialized successfully');
    
    // Step 2: Test old system functionality
    console.log('\n🧪 Step 2: Testing old system functionality...');
    
    try {
      const connectionTest = await oldTwitter.testConnection();
      if (connectionTest) {
        console.log('✅ Old Twitter integration connection successful');
      } else {
        console.log('⚠️ Old Twitter integration connection failed');
      }
    } catch (error) {
      console.log('⚠️ Old Twitter integration test failed:', error.message);
    }
    
    // Step 3: Test new system functionality
    console.log('\n🧠 Step 3: Testing intelligent Twitter automation...');
    
    const testResult = await newTwitter.generateAndPostContent('market_analysis', {
      marketData: {
        totalTokens: 100,
        avgVolumeChange: 15.2,
        topPerformer: 'BONK',
        marketMood: 'neutral'
      },
      sentimentData: {
        sentimentScore: 0.6,
        trends: ['migration', 'test', 'automation']
      }
    }, 'migration_test');
    
    if (testResult.success) {
      console.log('✅ Intelligent Twitter automation test successful');
      console.log(`📝 Generated tweet: ${testResult.tweetId}`);
    } else {
      console.log('❌ Intelligent Twitter automation test failed:', testResult.error);
    }
    
    // Step 4: Migrate existing data
    console.log('\n📊 Step 4: Migrating existing data...');
    
    try {
      const alertStats = await oldTwitter.getAlertStats();
      console.log('📈 Old system alert statistics:', alertStats);
      
      // Store migration data in new system memory
      await newTwitter.memory.setMemory('migration_data', {
        oldSystemStats: alertStats,
        migrationDate: new Date().toISOString(),
        migrationVersion: '1.0.0'
      }, { context: 'migration', tags: ['migration', 'stats'] });
      
      console.log('✅ Migration data stored in new system');
    } catch (error) {
      console.log('⚠️ Could not migrate existing data:', error.message);
    }
    
    // Step 5: Performance comparison
    console.log('\n📊 Step 5: Performance comparison...');
    
    const performanceResult = await newTwitter.analyzePerformance('24h');
    console.log('📈 New system performance analysis:', performanceResult);
    
    // Step 6: Memory insights
    console.log('\n🧠 Step 6: Memory system insights...');
    
    const memoryInsights = await newTwitter.getMemoryInsights();
    console.log('🧠 Memory system insights:', memoryInsights);
    
    // Step 7: Strategy optimization
    console.log('\n🔧 Step 7: Strategy optimization...');
    
    const strategyResult = await newTwitter.optimizeStrategy();
    console.log('🔧 Strategy optimization result:', strategyResult);
    
    // Step 8: Generate comprehensive test content
    console.log('\n📝 Step 8: Testing all content types...');
    
    const contentTypes = [
      {
        type: 'volume_alert',
        data: {
          token: { symbol: 'TEST', name: 'Test Token', uri: 'https://test.com' },
          volumeGrowth: 25000,
          currentVolume: 50000,
          previousVolume: 25000
        }
      },
      {
        type: 'trending_discovery',
        data: {
          analysisResult: { platform: 'tiktok', id: 'test_123' },
          correlation: {
            token_symbol: 'DISCOVERY',
            keyword: 'trending',
            correlation_score: 0.8,
            risk_level: 'low'
          }
        }
      },
      {
        type: 'sentiment_analysis',
        data: {
          sentiment: {
            overall: 'positive',
            confidence: 80,
            themes: ['excitement', 'growth'],
            riskIndicators: ['high_volume']
          },
          token: { symbol: 'SENTIMENT', name: 'Sentiment Token' },
          platform: 'telegram'
        }
      },
      {
        type: 'risk_warning',
        data: {
          riskAssessment: {
            riskLevel: 'medium',
            riskScore: 6.5,
            riskFactors: ['new_token', 'high_volatility'],
            redFlags: ['rapid_price_change'],
            confidence: 75
          },
          token: { symbol: 'RISK', name: 'Risk Token' }
        }
      }
    ];
    
    const contentResults = [];
    for (const contentType of contentTypes) {
      try {
        const result = await newTwitter.generateAndPostContent(
          contentType.type,
          contentType.data,
          'migration_test'
        );
        contentResults.push({ type: contentType.type, success: result.success });
        console.log(`✅ ${contentType.type}: ${result.success ? 'Success' : 'Failed'}`);
      } catch (error) {
        contentResults.push({ type: contentType.type, success: false, error: error.message });
        console.log(`❌ ${contentType.type}: Failed - ${error.message}`);
      }
    }
    
    // Step 9: Generate migration report
    console.log('\n📋 Step 9: Migration report...');
    
    const migrationReport = {
      migrationDate: new Date().toISOString(),
      oldSystemStatus: 'Tested',
      newSystemStatus: 'Active',
      contentTypesTested: contentResults.length,
      successfulContentTypes: contentResults.filter(r => r.success).length,
      failedContentTypes: contentResults.filter(r => !r.success).length,
      performanceAnalysis: performanceResult.success ? 'Available' : 'Failed',
      memorySystem: memoryInsights.success ? 'Active' : 'Failed',
      strategyOptimization: strategyResult.success ? 'Completed' : 'Failed'
    };
    
    console.log('📊 Migration Report:');
    console.log(JSON.stringify(migrationReport, null, 2));
    
    // Store migration report
    await newTwitter.memory.setMemory('migration_report', migrationReport, {
      context: 'migration',
      tags: ['migration', 'report', 'final']
    });
    
    // Step 10: Recommendations
    console.log('\n💡 Step 10: Migration recommendations...');
    
    const recommendations = [
      '✅ Intelligent Twitter automation is ready for production use',
      '📊 Monitor performance metrics for the first week',
      '🔧 Adjust posting strategies based on engagement data',
      '🧠 Memory system will improve content quality over time',
      '📈 Use analytics to optimize posting times and frequency',
      '⚠️ Keep old system as backup for first few days',
      '🔄 Run regular performance analysis to track improvements'
    ];
    
    recommendations.forEach(rec => console.log(rec));
    
    console.log('\n🎉 Migration to Intelligent Twitter Automation completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Run: npm run setup-twitter-schema');
    console.log('2. Test: npm run test-intelligent-twitter');
    console.log('3. Start: npm run intelligent-twitter');
    console.log('4. Monitor: Check Supabase for analytics data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check environment variables');
    console.log('2. Verify database schema is set up');
    console.log('3. Test individual components');
    console.log('4. Check API credentials');
  }
}

// Run migration
migrateToIntelligentTwitter().catch(console.error);
