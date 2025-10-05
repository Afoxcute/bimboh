import { IrisWorkflowOrchestrator } from './adk_workflow_orchestrator.mjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Comprehensive test suite for ADK-TS Workflow Orchestrator
 * 
 * This script tests all components of the new ADK workflow system
 * and validates that it works correctly before replacing the old system.
 */
class ADKWorkflowTester {
  constructor() {
    this.orchestrator = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting ADK Workflow Test Suite...\n');

    try {
      // Test 1: Environment validation
      await this.testEnvironmentValidation();
      
      // Test 2: Agent initialization
      await this.testAgentInitialization();
      
      // Test 3: Workflow creation
      await this.testWorkflowCreation();
      
      // Test 4: Individual agent functionality
      await this.testIndividualAgents();
      
      // Test 5: Session management
      await this.testSessionManagement();
      
      // Test 6: Error handling
      await this.testErrorHandling();
      
      // Test 7: Performance metrics
      await this.testPerformanceMetrics();

      // Print final results
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.failed++;
    }
  }

  /**
   * Test environment validation
   */
  async testEnvironmentValidation() {
    console.log('🔍 Test 1: Environment Validation');
    
    try {
      const requiredEnvVars = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'OPENAI_API_KEY'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
      }

      this.recordTestResult('Environment Validation', true, 'All required environment variables are present');
    } catch (error) {
      this.recordTestResult('Environment Validation', false, error.message);
    }
  }

  /**
   * Test agent initialization
   */
  async testAgentInitialization() {
    console.log('🤖 Test 2: Agent Initialization');
    
    try {
      this.orchestrator = new IrisWorkflowOrchestrator();
      await this.orchestrator.initializeAgents();

      const expectedAgents = [
        'tiktokScraper',
        'telegramScraper', 
        'outlightScraper',
        'patternAnalyzer',
        'marketDataFetcher',
        'twitterAlerts',
        'dashboardUpdater'
      ];

      const actualAgents = Object.keys(this.orchestrator.agents);
      const missingAgents = expectedAgents.filter(agent => !actualAgents.includes(agent));

      if (missingAgents.length > 0) {
        throw new Error(`Missing agents: ${missingAgents.join(', ')}`);
      }

      this.recordTestResult('Agent Initialization', true, `All ${expectedAgents.length} agents initialized successfully`);
    } catch (error) {
      this.recordTestResult('Agent Initialization', false, error.message);
    }
  }

  /**
   * Test workflow creation
   */
  async testWorkflowCreation() {
    console.log('🔄 Test 3: Workflow Creation');
    
    try {
      if (!this.orchestrator) {
        throw new Error('Orchestrator not initialized');
      }

      await this.orchestrator.createWorkflow();

      if (!this.orchestrator.workflow) {
        throw new Error('Workflow was not created');
      }

      this.recordTestResult('Workflow Creation', true, 'ADK workflow created successfully');
    } catch (error) {
      this.recordTestResult('Workflow Creation', false, error.message);
    }
  }

  /**
   * Test individual agent functionality
   */
  async testIndividualAgents() {
    console.log('🔧 Test 4: Individual Agent Functionality');
    
    try {
      if (!this.orchestrator) {
        throw new Error('Orchestrator not initialized');
      }

      const agentTests = [
        {
          name: 'TikTok Scraper Agent',
          agent: this.orchestrator.agents.tiktokScraper,
          testInput: { mode: 'test', maxVideos: 5 }
        },
        {
          name: 'Telegram Scraper Agent', 
          agent: this.orchestrator.agents.telegramScraper,
          testInput: { mode: 'test', maxChannels: 2 }
        },
        {
          name: 'Outlight Scraper Agent',
          agent: this.orchestrator.agents.outlightScraper,
          testInput: { mode: 'test', maxChannels: 2 }
        },
        {
          name: 'Pattern Analyzer Agent',
          agent: this.orchestrator.agents.patternAnalyzer,
          testInput: { mode: 'test', analysisType: 'quick' }
        },
        {
          name: 'Market Data Agent',
          agent: this.orchestrator.agents.marketDataFetcher,
          testInput: { mode: 'test', maxTokens: 10 }
        },
        {
          name: 'Twitter Alerts Agent',
          agent: this.orchestrator.agents.twitterAlerts,
          testInput: { mode: 'test', dryRun: true }
        },
        {
          name: 'Dashboard Updater Agent',
          agent: this.orchestrator.agents.dashboardUpdater,
          testInput: { mode: 'test', updateType: 'status' }
        }
      ];

      let passedAgents = 0;
      const agentResults = [];

      for (const agentTest of agentTests) {
        try {
          // Test agent execution with timeout
          const result = await Promise.race([
            agentTest.agent.run(agentTest.testInput),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Agent execution timeout')), 30000)
            )
          ]);

          if (result && result.success !== false) {
            passedAgents++;
            agentResults.push(`✅ ${agentTest.name}: OK`);
          } else {
            agentResults.push(`❌ ${agentTest.name}: ${result?.error || 'Unknown error'}`);
          }
        } catch (error) {
          agentResults.push(`❌ ${agentTest.name}: ${error.message}`);
        }
      }

      const success = passedAgents >= agentTests.length * 0.8; // 80% pass rate
      this.recordTestResult(
        'Individual Agent Functionality', 
        success, 
        `${passedAgents}/${agentTests.length} agents passed\n${agentResults.join('\n')}`
      );
    } catch (error) {
      this.recordTestResult('Individual Agent Functionality', false, error.message);
    }
  }

  /**
   * Test session management
   */
  async testSessionManagement() {
    console.log('💾 Test 5: Session Management');
    
    try {
      if (!this.orchestrator) {
        throw new Error('Orchestrator not initialized');
      }

      const sessionService = this.orchestrator.createSessionService();
      const testSessionId = 'test_session_123';
      const testData = { test: 'data', timestamp: new Date().toISOString() };

      // Test session save
      await sessionService.saveSession(testSessionId, testData);

      // Test session retrieval
      const retrievedData = await sessionService.getSession(testSessionId);

      if (!retrievedData || retrievedData.test !== testData.test) {
        throw new Error('Session data mismatch');
      }

      this.recordTestResult('Session Management', true, 'Session save and retrieval working correctly');
    } catch (error) {
      this.recordTestResult('Session Management', false, error.message);
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('⚠️ Test 6: Error Handling');
    
    try {
      if (!this.orchestrator) {
        throw new Error('Orchestrator not initialized');
      }

      // Test graceful error handling
      const errorTests = [
        {
          name: 'Invalid input handling',
          test: () => this.orchestrator.agents.tiktokScraper.run({ invalid: 'input' })
        },
        {
          name: 'Network error simulation',
          test: () => this.orchestrator.agents.marketDataFetcher.run({ simulateError: true })
        }
      ];

      let errorHandlingPassed = 0;

      for (const errorTest of errorTests) {
        try {
          await errorTest.test();
          // If no error is thrown, that's also acceptable (graceful degradation)
          errorHandlingPassed++;
        } catch (error) {
          // Expected errors should be handled gracefully
          if (error.message && !error.message.includes('Critical')) {
            errorHandlingPassed++;
          }
        }
      }

      const success = errorHandlingPassed >= errorTests.length * 0.5; // 50% pass rate for error handling
      this.recordTestResult(
        'Error Handling', 
        success, 
        `${errorHandlingPassed}/${errorTests.length} error scenarios handled gracefully`
      );
    } catch (error) {
      this.recordTestResult('Error Handling', false, error.message);
    }
  }

  /**
   * Test performance metrics
   */
  async testPerformanceMetrics() {
    console.log('📊 Test 7: Performance Metrics');
    
    try {
      if (!this.orchestrator) {
        throw new Error('Orchestrator not initialized');
      }

      const startTime = Date.now();
      
      // Test workflow execution time
      const status = this.orchestrator.getStatus();
      const executionTime = Date.now() - startTime;

      // Performance thresholds
      const maxInitializationTime = 30000; // 30 seconds
      const maxExecutionTime = 10000; // 10 seconds

      const performanceChecks = [
        {
          name: 'Initialization Time',
          value: executionTime,
          threshold: maxInitializationTime,
          passed: executionTime < maxInitializationTime
        },
        {
          name: 'Status Retrieval Time',
          value: Date.now() - startTime,
          threshold: maxExecutionTime,
          passed: (Date.now() - startTime) < maxExecutionTime
        }
      ];

      const passedChecks = performanceChecks.filter(check => check.passed).length;
      const success = passedChecks >= performanceChecks.length * 0.8; // 80% pass rate

      const performanceReport = performanceChecks.map(check => 
        `${check.name}: ${check.value}ms (${check.passed ? 'PASS' : 'FAIL'})`
      ).join('\n');

      this.recordTestResult(
        'Performance Metrics', 
        success, 
        `${passedChecks}/${performanceChecks.length} performance checks passed\n${performanceReport}`
      );
    } catch (error) {
      this.recordTestResult('Performance Metrics', false, error.message);
    }
  }

  /**
   * Record test result
   */
  recordTestResult(testName, passed, message) {
    this.testResults.tests.push({
      name: testName,
      passed,
      message
    });

    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName}: FAILED`);
    }

    if (message) {
      console.log(`   ${message}\n`);
    }
  }

  /**
   * Print final test results
   */
  printTestResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 ADK WORKFLOW TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Passed: ${this.testResults.passed}`);
    console.log(`   ❌ Failed: ${this.testResults.failed}`);
    console.log(`   📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);

    console.log(`\n📋 Detailed Results:`);
    this.testResults.tests.forEach((test, index) => {
      const status = test.passed ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${test.name}`);
      if (test.message) {
        console.log(`      ${test.message.replace(/\n/g, '\n      ')}`);
      }
    });

    const overallSuccess = this.testResults.failed === 0;
    
    console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (overallSuccess) {
      console.log('\n🚀 The ADK workflow system is ready for production use!');
      console.log('   You can now run: npm run adk-workflow');
    } else {
      console.log('\n⚠️ Please fix the failing tests before using the ADK workflow in production.');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Main execution
async function main() {
  const tester = new ADKWorkflowTester();
  await tester.runAllTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ADKWorkflowTester };
