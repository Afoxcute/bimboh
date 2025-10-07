import RealtimeDecisionAgent from './realtime_decision_agent.mjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test script for the Real-Time Decision Making Agent
 */
async function testDecisionAgent() {
  console.log('🧪 Testing Real-Time Decision Making Agent...');

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

    // Test 1: Process real-time data
    console.log('\n📊 Test 1: Processing real-time data...');
    const processResult = await decisionAgent.processRealtimeData();
    console.log('Process Result:', processResult);

    // Test 2: Get decision statistics
    console.log('\n📈 Test 2: Getting decision statistics...');
    const stats = await decisionAgent.getDecisionStats();
    console.log('Decision Stats:', stats);

    // Test 3: Test individual components
    console.log('\n🔍 Test 3: Testing individual components...');
    
    // Test opportunity detection
    console.log('  - Testing opportunity detection...');
    const opportunities = await decisionAgent.detectOpportunities();
    console.log(`  - Found ${opportunities.length} opportunities`);

    // Test risk assessment
    if (opportunities.length > 0) {
      console.log('  - Testing risk assessment...');
      const riskAssessments = await decisionAgent.assessRisks(opportunities.slice(0, 3));
      console.log(`  - Assessed risk for ${riskAssessments.length} opportunities`);
    }

    // Test 4: Test decision making
    console.log('\n🎯 Test 4: Testing decision making...');
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
      },
      {
        tokenSymbol: 'TEST2',
        tokenUri: 'test-uri-2',
        score: 0.4,
        volumeGrowth: 1.2,
        sentimentScore: 0.3,
        trendScore: 0.4,
        priceMomentum: -0.05,
        marketData: {
          latestPrice: { price_usd: 0.002, volume_24h: 50000 },
          priceHistory: [
            { price_usd: 0.002, volume_24h: 50000 },
            { price_usd: 0.0021, volume_24h: 60000 }
          ]
        }
      }
    ];

    const mockRiskAssessments = [
      {
        ...mockOpportunities[0],
        riskAssessment: {
          riskScore: 0.3,
          riskLevel: 'low',
          riskFactors: {
            liquidityRisk: 0.2,
            volatilityRisk: 0.3,
            sentimentRisk: 0.2,
            technicalRisk: 0.3,
            marketRisk: 0.4
          }
        }
      },
      {
        ...mockOpportunities[1],
        riskAssessment: {
          riskScore: 0.7,
          riskLevel: 'high',
          riskFactors: {
            liquidityRisk: 0.8,
            volatilityRisk: 0.6,
            sentimentRisk: 0.7,
            technicalRisk: 0.8,
            marketRisk: 0.5
          }
        }
      }
    ];

    const decisions = await decisionAgent.makeDecisions(mockOpportunities, mockRiskAssessments);
    console.log(`  - Made ${decisions.length} decisions`);
    decisions.forEach((decision, index) => {
      console.log(`    Decision ${index + 1}: ${decision.decision.action} for ${decision.tokenSymbol} (${decision.decision.reason})`);
    });

    // Test 5: Test execution
    console.log('\n⚡ Test 5: Testing decision execution...');
    const executionResults = await decisionAgent.executeDecisions(decisions);
    console.log(`  - Executed ${executionResults.length} decisions`);
    const successfulExecutions = executionResults.filter(r => r.executed).length;
    console.log(`  - ${successfulExecutions} successful executions`);

    // Test 6: Test performance monitoring
    console.log('\n📊 Test 6: Testing performance monitoring...');
    const performanceResult = await decisionAgent.monitorPerformance(executionResults);
    console.log('Performance Result:', performanceResult);

    console.log('\n✅ All decision agent tests completed successfully!');

  } catch (error) {
    console.error('❌ Decision agent test failed:', error);
    throw error;
  }
}

/**
 * Test specific decision scenarios
 */
async function testDecisionScenarios() {
  console.log('\n🎭 Testing specific decision scenarios...');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const decisionAgent = new RealtimeDecisionAgent(supabase);
    await decisionAgent.initialize();

    // Scenario 1: High opportunity, low risk
    console.log('\n📈 Scenario 1: High opportunity, low risk');
    const highOppLowRisk = {
      tokenSymbol: 'HIGH_OPP',
      tokenUri: 'high-opp-uri',
      score: 0.9,
      volumeGrowth: 3.0,
      sentimentScore: 0.8,
      trendScore: 0.9,
      priceMomentum: 0.25,
      marketData: {
        latestPrice: { price_usd: 0.001, volume_24h: 500000 },
        priceHistory: [
          { price_usd: 0.001, volume_24h: 500000 },
          { price_usd: 0.0008, volume_24h: 200000 }
        ]
      }
    };

    const riskAssessment1 = {
      riskScore: 0.2,
      riskLevel: 'low',
      riskFactors: {
        liquidityRisk: 0.1,
        volatilityRisk: 0.2,
        sentimentRisk: 0.1,
        technicalRisk: 0.2,
        marketRisk: 0.3
      }
    };

    const decisions1 = await decisionAgent.makeDecisions([highOppLowRisk], [riskAssessment1]);
    console.log('Decision:', decisions1[0].decision);

    // Scenario 2: Low opportunity, high risk
    console.log('\n📉 Scenario 2: Low opportunity, high risk');
    const lowOppHighRisk = {
      tokenSymbol: 'LOW_OPP',
      tokenUri: 'low-opp-uri',
      score: 0.3,
      volumeGrowth: 1.1,
      sentimentScore: 0.2,
      trendScore: 0.3,
      priceMomentum: -0.1,
      marketData: {
        latestPrice: { price_usd: 0.002, volume_24h: 10000 },
        priceHistory: [
          { price_usd: 0.002, volume_24h: 10000 },
          { price_usd: 0.0022, volume_24h: 15000 }
        ]
      }
    };

    const riskAssessment2 = {
      riskScore: 0.8,
      riskLevel: 'high',
      riskFactors: {
        liquidityRisk: 0.9,
        volatilityRisk: 0.8,
        sentimentRisk: 0.7,
        technicalRisk: 0.9,
        marketRisk: 0.6
      }
    };

    const decisions2 = await decisionAgent.makeDecisions([lowOppHighRisk], [riskAssessment2]);
    console.log('Decision:', decisions2[0].decision);

    // Scenario 3: Medium opportunity, medium risk
    console.log('\n📊 Scenario 3: Medium opportunity, medium risk');
    const medOppMedRisk = {
      tokenSymbol: 'MED_OPP',
      tokenUri: 'med-opp-uri',
      score: 0.6,
      volumeGrowth: 1.8,
      sentimentScore: 0.6,
      trendScore: 0.5,
      priceMomentum: 0.05,
      marketData: {
        latestPrice: { price_usd: 0.0015, volume_24h: 100000 },
        priceHistory: [
          { price_usd: 0.0015, volume_24h: 100000 },
          { price_usd: 0.0014, volume_24h: 80000 }
        ]
      }
    };

    const riskAssessment3 = {
      riskScore: 0.5,
      riskLevel: 'medium',
      riskFactors: {
        liquidityRisk: 0.4,
        volatilityRisk: 0.5,
        sentimentRisk: 0.6,
        technicalRisk: 0.4,
        marketRisk: 0.5
      }
    };

    const decisions3 = await decisionAgent.makeDecisions([medOppMedRisk], [riskAssessment3]);
    console.log('Decision:', decisions3[0].decision);

    console.log('\n✅ All decision scenarios tested successfully!');

  } catch (error) {
    console.error('❌ Decision scenario test failed:', error);
    throw error;
  }
}

/**
 * Main test function
 */
async function main() {
  try {
    console.log('🚀 Starting Decision Agent Tests...\n');
    
    await testDecisionAgent();
    await testDecisionScenarios();
    
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testDecisionAgent, testDecisionScenarios };
