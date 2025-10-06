#!/usr/bin/env node

/**
 * Test script to verify AI analysis fix
 * Tests that risk assessment properly stores risk_level
 */

import { RiskAssessmentTool } from './ai_content_analysis_agents.mjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testRiskAssessment() {
  try {
    console.log('🧪 Testing Risk Assessment Fix...');
    
    const riskTool = new RiskAssessmentTool(supabase);
    
    // Test with different content types
    const testCases = [
      {
        content: 'This is a guaranteed 100x return investment!',
        platform: 'tiktok',
        tokenSymbol: 'SCAM',
        expectedRiskLevel: 'high'
      },
      {
        content: 'New token launch with strong community support',
        platform: 'tiktok',
        tokenSymbol: 'NEW',
        expectedRiskLevel: 'low'
      },
      {
        content: 'Presale token with anonymous team',
        platform: 'tiktok',
        tokenSymbol: 'PRESALE',
        expectedRiskLevel: 'medium'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: "${testCase.content}"`);
      
      const result = await riskTool.execute({
        content: testCase.content,
        platform: testCase.platform,
        tokenSymbol: testCase.tokenSymbol,
        contentId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      if (result.success) {
        console.log(`✅ Risk Level: ${result.riskLevel}`);
        console.log(`✅ Risk Score: ${result.riskScore}`);
        console.log(`✅ Risk Factors: ${result.riskFactors.join(', ') || 'None'}`);
        console.log(`✅ Red Flags: ${result.redFlags.join(', ') || 'None'}`);
        
        if (result.riskLevel === testCase.expectedRiskLevel) {
          console.log(`✅ Expected risk level: ${testCase.expectedRiskLevel}`);
        } else {
          console.log(`⚠️ Expected ${testCase.expectedRiskLevel}, got ${result.riskLevel}`);
        }
      } else {
        console.error(`❌ Test failed: ${result.error}`);
      }
    }
    
    console.log('\n🎉 Risk Assessment Fix Test Completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testRiskAssessment();
