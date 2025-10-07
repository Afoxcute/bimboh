import AdvancedPatternRecognition from './advanced_pattern_recognition.mjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test script for the Advanced Pattern Recognition System
 */
async function testPatternRecognition() {
  console.log('🔍 Testing Advanced Pattern Recognition System...');

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Create pattern recognition system
    const patternRecognition = new AdvancedPatternRecognition(supabase);

    // Initialize the system
    console.log('🔧 Initializing pattern recognition system...');
    await patternRecognition.initialize();
    console.log('✅ Pattern recognition system initialized');

    // Test 1: Analyze all patterns
    console.log('\n📊 Test 1: Analyzing all patterns...');
    const analysisResult = await patternRecognition.analyzeAllPatterns();
    console.log('Analysis Result:', analysisResult);

    // Test 2: Get pattern statistics
    console.log('\n📈 Test 2: Getting pattern statistics...');
    const stats = await patternRecognition.getPatternStats();
    console.log('Pattern Stats:', stats);

    // Test 3: Test individual pattern detection
    console.log('\n🔍 Test 3: Testing individual pattern detection...');
    
    // Test volume patterns
    console.log('  - Testing volume pattern detection...');
    const volumePatterns = await patternRecognition.detectVolumePatterns();
    console.log(`  - Found ${volumePatterns.length} volume patterns`);

    // Test sentiment patterns
    console.log('  - Testing sentiment pattern detection...');
    const sentimentPatterns = await patternRecognition.detectSentimentPatterns();
    console.log(`  - Found ${sentimentPatterns.length} sentiment patterns`);

    // Test price patterns
    console.log('  - Testing price pattern detection...');
    const pricePatterns = await patternRecognition.detectPricePatterns();
    console.log(`  - Found ${pricePatterns.length} price patterns`);

    // Test social patterns
    console.log('  - Testing social pattern detection...');
    const socialPatterns = await patternRecognition.detectSocialPatterns();
    console.log(`  - Found ${socialPatterns.length} social patterns`);

    // Test correlation patterns
    console.log('  - Testing correlation pattern detection...');
    const correlationPatterns = await patternRecognition.detectCorrelationPatterns();
    console.log(`  - Found ${correlationPatterns.length} correlation patterns`);

    // Test trend patterns
    console.log('  - Testing trend pattern detection...');
    const trendPatterns = await patternRecognition.detectTrendPatterns();
    console.log(`  - Found ${trendPatterns.length} trend patterns`);

    // Test anomaly patterns
    console.log('  - Testing anomaly pattern detection...');
    const anomalyPatterns = await patternRecognition.detectAnomalyPatterns();
    console.log(`  - Found ${anomalyPatterns.length} anomaly patterns`);

    // Test momentum patterns
    console.log('  - Testing momentum pattern detection...');
    const momentumPatterns = await patternRecognition.detectMomentumPatterns();
    console.log(`  - Found ${momentumPatterns.length} momentum patterns`);

    // Test reversal patterns
    console.log('  - Testing reversal pattern detection...');
    const reversalPatterns = await patternRecognition.detectReversalPatterns();
    console.log(`  - Found ${reversalPatterns.length} reversal patterns`);

    // Test breakout patterns
    console.log('  - Testing breakout pattern detection...');
    const breakoutPatterns = await patternRecognition.detectBreakoutPatterns();
    console.log(`  - Found ${breakoutPatterns.length} breakout patterns`);

    console.log('\n✅ All pattern recognition tests completed successfully!');

  } catch (error) {
    console.error('❌ Pattern recognition test failed:', error);
    throw error;
  }
}

/**
 * Test specific pattern scenarios
 */
async function testPatternScenarios() {
  console.log('\n🎭 Testing specific pattern scenarios...');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const patternRecognition = new AdvancedPatternRecognition(supabase);
    await patternRecognition.initialize();

    // Scenario 1: Volume spike pattern
    console.log('\n📊 Scenario 1: Volume spike pattern');
    const volumePatterns = await patternRecognition.detectVolumePatterns();
    console.log(`Found ${volumePatterns.length} volume patterns`);

    // Scenario 2: Sentiment spike pattern
    console.log('\n💭 Scenario 2: Sentiment spike pattern');
    const sentimentPatterns = await patternRecognition.detectSentimentPatterns();
    console.log(`Found ${sentimentPatterns.length} sentiment patterns`);

    // Scenario 3: Price breakout pattern
    console.log('\n💰 Scenario 3: Price breakout pattern');
    const pricePatterns = await patternRecognition.detectPricePatterns();
    console.log(`Found ${pricePatterns.length} price patterns`);

    // Scenario 4: Social viral pattern
    console.log('\n📱 Scenario 4: Social viral pattern');
    const socialPatterns = await patternRecognition.detectSocialPatterns();
    console.log(`Found ${socialPatterns.length} social patterns`);

    // Scenario 5: Correlation pattern
    console.log('\n🔗 Scenario 5: Correlation pattern');
    const correlationPatterns = await patternRecognition.detectCorrelationPatterns();
    console.log(`Found ${correlationPatterns.length} correlation patterns`);

    console.log('\n✅ All pattern scenarios tested successfully!');

  } catch (error) {
    console.error('❌ Pattern scenario test failed:', error);
    throw error;
  }
}

/**
 * Test pattern insights and predictions
 */
async function testPatternInsights() {
  console.log('\n🧠 Testing pattern insights and predictions...');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const patternRecognition = new AdvancedPatternRecognition(supabase);
    await patternRecognition.initialize();

    // Test pattern insights generation
    console.log('🔍 Testing pattern insights generation...');
    const mockPatterns = {
      volumePatterns: [
        {
          tokenSymbol: 'TEST1',
          tokenUri: 'test-uri-1',
          name: 'Volume Spike - 2.5x',
          type: 'volume_spike',
          strength: 0.8,
          confidence: 0.9,
          data: { volumeSpike: 2.5, currentVolume: 500000 }
        }
      ],
      sentimentPatterns: [
        {
          tokenSymbol: 'TEST1',
          tokenUri: 'test-uri-1',
          name: 'Sentiment Spike - 0.85',
          type: 'sentiment_spike',
          strength: 0.7,
          confidence: 0.8,
          data: { sentimentScore: 0.85, sentimentChange: 0.3 }
        }
      ],
      pricePatterns: [],
      socialPatterns: [],
      correlationPatterns: [],
      trendPatterns: [],
      anomalyPatterns: [],
      momentumPatterns: [],
      reversalPatterns: [],
      breakoutPatterns: []
    };

    const insights = await patternRecognition.generatePatternInsights(mockPatterns);
    console.log(`Generated ${insights.length} pattern insights`);

    // Test pattern predictions generation
    console.log('🔮 Testing pattern predictions generation...');
    const predictions = await patternRecognition.generatePatternPredictions(mockPatterns);
    console.log(`Generated ${predictions.length} pattern predictions`);

    console.log('\n✅ Pattern insights and predictions tests completed successfully!');

  } catch (error) {
    console.error('❌ Pattern insights test failed:', error);
    throw error;
  }
}

/**
 * Main test function
 */
async function main() {
  try {
    console.log('🚀 Starting Advanced Pattern Recognition Tests...\n');
    
    await testPatternRecognition();
    await testPatternScenarios();
    await testPatternInsights();
    
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

export { testPatternRecognition, testPatternScenarios, testPatternInsights };
