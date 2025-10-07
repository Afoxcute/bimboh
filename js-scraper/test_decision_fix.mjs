import RealtimeDecisionAgent from './realtime_decision_agent.mjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDecisionFix() {
  console.log('🧪 Testing Decision Agent Fix...');

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Create decision agent
    const decisionAgent = new RealtimeDecisionAgent(supabase);

    // Initialize the agent
    console.log('🔧 Initializing decision agent...');
    await decisionAgent.initialize();
    console.log('✅ Decision agent initialized');

    // Test opportunity detection
    console.log('🔍 Testing opportunity detection...');
    const opportunities = await decisionAgent.detectOpportunities();
    console.log(`✅ Found ${opportunities.length} opportunities`);

    // Test risk assessment
    if (opportunities.length > 0) {
      console.log('⚠️ Testing risk assessment...');
      const riskAssessments = await decisionAgent.assessRisks(opportunities.slice(0, 2));
      console.log(`✅ Assessed risk for ${riskAssessments.length} opportunities`);
    } else {
      console.log('📊 No opportunities found, testing with mock data...');
      
      // Test with mock data
      const mockOpportunities = [
        {
          tokenSymbol: 'TEST1',
          tokenUri: 'test-uri-1',
          score: 0.8,
          volumeGrowth: 2.5,
          sentimentScore: 0.7,
          trendScore: 0.6,
          priceMomentum: 0.15,
          marketData: {
            latestPrice: { price_usd: 0.001, volume_24h: 100000 },
            priceHistory: [
              { price_usd: 0.001, volume_24h: 100000 },
              { price_usd: 0.0009, volume_24h: 80000 }
            ]
          }
        }
      ];

      const riskAssessments = await decisionAgent.assessRisks(mockOpportunities);
      console.log(`✅ Assessed risk for ${riskAssessments.length} mock opportunities`);
    }

    console.log('✅ Decision agent fix test completed successfully!');

  } catch (error) {
    console.error('❌ Decision agent fix test failed:', error);
    throw error;
  }
}

// Run the test
testDecisionFix().catch(console.error);
