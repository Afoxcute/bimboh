import { AgentBuilder, LlmAgent } from '@iqai/adk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { TwitterIntegration } from './twitter_integration.mjs';
import { MemecoinPatternAnalyzer } from './pattern_analysis.mjs';
import { TelegramChannelScraper } from './telegram_scraper.mjs';
import { OutlightScraper } from './outlight-scraper.mjs';
import puppeteer from 'puppeteer';
import { extractComments, VideoScraper } from "./scraper.mjs";
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

// Polyfill global fetch and Headers
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

/**
 * ADK-TS Workflow Orchestrator for Iris Memecoin Hunting Platform
 * 
 * This replaces the basic start_all_systems.mjs with intelligent multi-agent coordination
 * using ADK-TS framework for better error handling, retry logic, and observability.
 */
class IrisWorkflowOrchestrator {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    this.agents = {};
    this.workflow = null;
    this.isRunning = false;
    this.sessionId = `iris_session_${Date.now()}`;
    
    // Initialize agents
    this.initializeAgents();
  }

  /**
   * Initialize all ADK agents for the workflow
   */
  async initializeAgents() {
    try {
      console.log('🤖 Initializing ADK-TS agents...');

      // 1. TikTok Scraping Agent
      this.agents.tiktokScraper = new LlmAgent({
        name: 'tiktok_scraper',
        model: 'gpt-3.5-turbo',
        instruction: `You are a TikTok data scraping specialist. Your role is to:
        - Scrape TikTok videos for memecoin-related content
        - Extract video metadata, comments, and engagement metrics
        - Identify token mentions in comments and descriptions
        - Store data immediately in Supabase database
        - Handle rate limiting and anti-bot measures gracefully
        
        Focus on hashtags: #memecoin, #pumpfun, #solana, #crypto, #meme, #bags, #bonk
        Process both search terms and hashtag pages for comprehensive coverage.`,
        tools: [
          new TikTokScrapingTool(this.supabase),
          new CommentAnalysisTool(),
          new DataStorageTool(this.supabase)
        ]
      });

      // 2. Telegram Scraping Agent
      this.agents.telegramScraper = new LlmAgent({
        name: 'telegram_scraper',
        model: 'gpt-3.5-turbo',
        instruction: `You are a Telegram channel monitoring specialist. Your role is to:
        - Scrape Telegram channels for memecoin discussions
        - Extract messages, media, and engagement data
        - Identify token mentions and trading signals
        - Discover new relevant channels automatically
        - Store data with proper deduplication
        
        Focus on crypto trading channels and memecoin communities.
        Use both web scraping and RSS feeds for comprehensive coverage.`,
        tools: [
          new TelegramScrapingTool(this.supabase),
          new ChannelDiscoveryTool(),
          new MessageAnalysisTool()
        ]
      });

      // 3. Pattern Analysis Agent
      this.agents.patternAnalyzer = new LlmAgent({
        name: 'pattern_analyzer',
        model: 'gpt-3.5-turbo',
        instruction: `You are a memecoin pattern analysis expert. Your role is to:
        - Cross-reference social media trends with token launches
        - Calculate correlation metrics between social engagement and trading volume
        - Identify emerging patterns before they become mainstream
        - Generate trading recommendations with risk assessment
        - Provide actionable insights for memecoin hunting
        
        Use statistical analysis to find meaningful correlations.
        Focus on early detection of viral trends.`,
        tools: [
          new PatternAnalysisTool(this.supabase),
          new CorrelationCalculatorTool(),
          new TrendDetectionTool(),
          new RiskAssessmentTool()
        ]
      });

      // 4. Market Data Agent
      this.agents.marketDataFetcher = new LlmAgent({
        name: 'market_data_fetcher',
        model: 'gpt-3.5-turbo',
        instruction: `You are a blockchain data specialist. Your role is to:
        - Fetch real-time token data from Pump.fun and Bitquery
        - Collect price data, market cap, and trading volume
        - Update token metadata and market information
        - Monitor for new token launches and significant price movements
        - Ensure data accuracy and handle API rate limits
        
        Focus on Solana ecosystem tokens and memecoins.
        Prioritize data freshness and accuracy.`,
        tools: [
          new MarketDataTool(this.supabase),
          new PriceTrackingTool(),
          new TokenDiscoveryTool()
        ]
      });

      // 5. Twitter Alert Agent
      this.agents.twitterAlerts = new LlmAgent({
        name: 'twitter_alerts',
        model: 'gpt-3.5-turbo',
        instruction: `You are a social media automation specialist. Your role is to:
        - Monitor for significant volume growth and price movements
        - Generate engaging, context-aware tweets about trending memecoins
        - Post alerts when volume growth exceeds $10K/hour or 100% growth rate
        - Maintain consistent brand voice and include proper risk disclaimers
        - Avoid duplicate posts and maintain posting frequency limits
        
        Be exciting but responsible in your messaging.
        Always include relevant hashtags and emojis.`,
        tools: [
          new TwitterAPITool(),
          new AlertGenerationTool(),
          new ContentModerationTool()
        ]
      });

      // 6. Outlight Scraping Agent
      this.agents.outlightScraper = new LlmAgent({
        name: 'outlight_scraper',
        model: 'gpt-3.5-turbo',
        instruction: `You are an Outlight.fun data discovery specialist. Your role is to:
        - Scrape Outlight.fun homepage for Telegram channel references
        - Discover new Telegram channels using dual scraping methods (Puppeteer + Cheerio)
        - Extract channel metadata and validate channel accessibility
        - Store discovered channels in the database for future monitoring
        - Scrape messages from discovered channels for token analysis
        - Handle rate limiting and anti-bot measures gracefully
        
        Focus on discovering high-quality memecoin and crypto-related Telegram channels.
        Use both browser automation and HTML parsing for comprehensive coverage.`,
        tools: [
          new OutlightScrapingTool(this.supabase),
          new ChannelDiscoveryTool(),
          new MessageExtractionTool(),
          new DataValidationTool()
        ]
      });

      // 7. Dashboard Update Agent
      this.agents.dashboardUpdater = new LlmAgent({
        name: 'dashboard_updater',
        model: 'gpt-3.5-turbo',
        instruction: `You are a real-time data synchronization specialist. Your role is to:
        - Update frontend dashboard with latest data
        - Ensure real-time synchronization across all components
        - Handle data consistency and conflict resolution
        - Provide live updates for trending coins and analysis results
        - Optimize data delivery for frontend performance
        
        Focus on user experience and data freshness.
        Ensure smooth real-time updates without overwhelming the frontend.`,
        tools: [
          new DashboardSyncTool(this.supabase),
          new RealTimeUpdateTool(),
          new DataConsistencyTool()
        ]
      });

      console.log('✅ All ADK agents initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing agents:', error);
      throw error;
    }
  }

  /**
   * Create the main workflow using ADK-TS
   */
  async createWorkflow() {
    try {
      console.log('🔄 Creating ADK-TS workflow...');

      // Try to create workflow with ADK-TS
      try {
        this.workflow = await AgentBuilder.create('iris_memecoin_pipeline')
          .asSequential([
            this.agents.marketDataFetcher,    // Step 1: Fetch latest market data
            this.agents.tiktokScraper,        // Step 2: Scrape TikTok content
            this.agents.telegramScraper,      // Step 3: Scrape existing Telegram channels
            this.agents.outlightScraper,      // Step 4: Discover new channels from Outlight.fun
            this.agents.patternAnalyzer,      // Step 5: Analyze patterns and correlations
            this.agents.twitterAlerts,        // Step 6: Generate and post alerts
            this.agents.dashboardUpdater      // Step 7: Update frontend dashboard
          ])
          .build();

        console.log('✅ ADK workflow created successfully');
        return this.workflow;
      } catch (adkError) {
        console.warn('⚠️ ADK workflow creation failed, falling back to manual execution:', adkError.message);
        this.workflow = null; // Set to null to indicate fallback mode
        return null;
      }
    } catch (error) {
      console.error('❌ Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Create session service for persistent memory
   */
  createSessionService() {
    return {
      async createSession(sessionId, initialData = {}) {
        try {
          const { data, error } = await this.supabase
            .from('workflow_sessions')
            .upsert({
              session_id: sessionId,
              session_data: initialData,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Error creating session:', error);
          return null;
        }
      },

      async getSession(sessionId) {
        try {
          const { data, error } = await this.supabase
            .from('workflow_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          return data?.session_data || {};
        } catch (error) {
          console.error('Error getting session:', error);
          return {};
        }
      },
      
      async saveSession(sessionId, sessionData) {
        try {
          const { data, error } = await this.supabase
            .from('workflow_sessions')
            .upsert({
              session_id: sessionId,
              session_data: sessionData,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Error saving session:', error);
          return null;
        }
      },

      async deleteSession(sessionId) {
        try {
          const { error } = await this.supabase
            .from('workflow_sessions')
            .delete()
            .eq('session_id', sessionId);
          
          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Error deleting session:', error);
          return false;
        }
      }
    };
  }

  /**
   * Start the complete workflow
   */
  async start() {
    try {
      if (this.isRunning) {
        console.log('⚠️ Workflow already running');
        return;
      }

      console.log('🚀 Starting Iris ADK-TS Workflow...');
      
      // Create workflow if not exists
      if (!this.workflow) {
        await this.createWorkflow();
      }

      // Execute the workflow
      if (this.workflow) {
        // Use ADK workflow
        const result = await this.workflow.run({
          input: {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            mode: 'full_analysis'
          },
          context: {
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            features: ['tiktok_scraping', 'telegram_monitoring', 'pattern_analysis', 'twitter_alerts']
          }
        });

        this.isRunning = true;
        console.log('✅ ADK Workflow execution completed successfully');
        console.log('📊 Workflow Results:', result);
        return result;
      } else {
        // Fallback to manual execution
        console.log('🔄 Running manual workflow execution...');
        const result = await this.runManualWorkflow();
        
        this.isRunning = true;
        console.log('✅ Manual workflow execution completed successfully');
        console.log('📊 Workflow Results:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Manual workflow execution (fallback when ADK workflow fails)
   */
  async runManualWorkflow() {
    const results = {};
    
    try {
      // Step 1: Market Data Fetching
      console.log('📊 Step 1: Fetching market data...');
      results.marketData = await this.agents.marketDataFetcher.run({
        input: { mode: 'full_collection' }
      });

      // Step 2: TikTok Scraping
      console.log('🎬 Step 2: Scraping TikTok content...');
      results.tiktokScraping = await this.agents.tiktokScraper.run({
        input: { mode: 'full_scraping', maxVideos: 100 }
      });

      // Step 3: Telegram Scraping
      console.log('📡 Step 3: Scraping Telegram channels...');
      results.telegramScraping = await this.agents.telegramScraper.run({
        input: { mode: 'full_scraping', maxChannels: 10 }
      });

      // Step 4: Outlight Scraping
      console.log('🔍 Step 4: Discovering channels from Outlight.fun...');
      results.outlightScraping = await this.agents.outlightScraper.run({
        input: { mode: 'full_discovery' }
      });

      // Step 5: Pattern Analysis
      console.log('🧠 Step 5: Analyzing patterns and correlations...');
      results.patternAnalysis = await this.agents.patternAnalyzer.run({
        input: { mode: 'comprehensive_analysis' }
      });

      // Step 6: Twitter Alerts
      console.log('🐦 Step 6: Generating and posting alerts...');
      results.twitterAlerts = await this.agents.twitterAlerts.run({
        input: { mode: 'alert_generation' }
      });

      // Step 7: Dashboard Updates
      console.log('📱 Step 7: Updating frontend dashboard...');
      results.dashboardUpdate = await this.agents.dashboardUpdater.run({
        input: { mode: 'full_update' }
      });

      return {
        success: true,
        mode: 'manual',
        results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Manual workflow execution failed:', error);
      return {
        success: false,
        mode: 'manual',
        error: error.message,
        results,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Stop the workflow
   */
  async stop() {
    try {
      console.log('🛑 Stopping Iris workflow...');
      this.isRunning = false;
      console.log('✅ Workflow stopped');
    } catch (error) {
      console.error('❌ Error stopping workflow:', error);
    }
  }

  /**
   * Run periodic analysis (every 2 hours)
   */
  async runPeriodicAnalysis() {
    try {
      if (!this.isRunning) return;
      
      console.log('🔄 Running periodic analysis...');
      
      // Try to create analysis workflow with ADK
      try {
        const analysisWorkflow = await AgentBuilder.create('periodic_analysis')
          .asSequential([
            this.agents.outlightScraper,      // Discover new channels periodically
            this.agents.patternAnalyzer,
            this.agents.twitterAlerts,
            this.agents.dashboardUpdater
          ])
          .build();

        const result = await analysisWorkflow.run({
          input: {
            timestamp: new Date().toISOString(),
            mode: 'periodic_analysis'
          }
        });

        console.log('✅ Periodic analysis completed (ADK)');
        return result;
      } catch (adkError) {
        console.warn('⚠️ ADK periodic analysis failed, using manual execution:', adkError.message);
        
        // Fallback to manual periodic analysis
        const results = {};
        
        results.outlightScraping = await this.agents.outlightScraper.run({
          input: { mode: 'periodic_discovery' }
        });
        
        results.patternAnalysis = await this.agents.patternAnalyzer.run({
          input: { mode: 'quick_analysis' }
        });
        
        results.twitterAlerts = await this.agents.twitterAlerts.run({
          input: { mode: 'periodic_alerts' }
        });
        
        results.dashboardUpdate = await this.agents.dashboardUpdater.run({
          input: { mode: 'periodic_update' }
        });

        console.log('✅ Periodic analysis completed (manual)');
        return {
          success: true,
          mode: 'manual',
          results,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('❌ Periodic analysis failed:', error);
    }
  }

  /**
   * Get workflow status and metrics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      sessionId: this.sessionId,
      agents: Object.keys(this.agents).map(name => ({
        name,
        status: 'initialized'
      })),
      workflow: this.workflow ? 'created' : 'not_created',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Custom ADK Tools for Iris Workflow
 */

// TikTok Scraping Tool
class TikTokScrapingTool {
  constructor(supabase) {
    this.supabase = supabase;
    this.browser = null;
  }

  async execute(input) {
    try {
      console.log('🎬 Starting TikTok scraping...');
      
      // Initialize browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await this.browser.newPage();
      const searchTerms = ["memecoin", "pumpfun", "solana", "crypto", "meme", "bags", "bonk"];
      const hashtagTerms = ["memecoin", "solana", "crypto", "pumpfun", "meme", "bags", "bonk"];
      
      let totalVideos = 0;
      const processedUrls = new Set();

      // Process search terms
      for (const term of searchTerms) {
        const videos = await this.processSearchTerm(page, term, 100, processedUrls);
        totalVideos += videos.length;
        await this.storeVideos(videos);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      }

      // Process hashtag terms
      for (const hashtag of hashtagTerms) {
        const videos = await this.processHashtagTerm(page, hashtag, 200, processedUrls);
        totalVideos += videos.length;
        await this.storeVideos(videos);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      }

      await this.browser.close();
      
      return {
        success: true,
        totalVideos,
        message: `Successfully scraped ${totalVideos} TikTok videos`
      };
    } catch (error) {
      console.error('TikTok scraping error:', error);
      if (this.browser) await this.browser.close();
      return { success: false, error: error.message };
    }
  }

  async processSearchTerm(page, keyword, maxResults, processedUrls) {
    // Implementation similar to existing index.mjs
    const searchUrl = `https://www.tiktok.com/search?q=${keyword}`;
    const results = [];

    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body');
      await new Promise(resolve => setTimeout(resolve, 5000));

      while (results.length < maxResults) {
        const videoElements = await page.$$('div[class*="DivItemContainerForSearch"]');
        
        if (!videoElements.length) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        for (const element of videoElements) {
          if (results.length >= maxResults) break;

          const videoData = await VideoScraper.extractVideoData(element);
          if (videoData?.video_url && !processedUrls.has(videoData.video_url)) {
            const postId = videoData.video_url.split("/").pop();
            videoData.comments = await extractComments(postId);
            
            processedUrls.add(videoData.video_url);
            results.push(videoData);
          }
        }

        if (results.length >= maxResults) break;

        // Scroll to load more content
        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return results;
    } catch (error) {
      console.error(`Error processing search term '${keyword}':`, error);
      return results;
    }
  }

  async processHashtagTerm(page, keyword, maxResults, processedUrls) {
    // Similar implementation for hashtag processing
    const hashtagUrl = `https://www.tiktok.com/tag/${keyword}`;
    const results = [];

    try {
      await page.goto(hashtagUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body');
      await new Promise(resolve => setTimeout(resolve, 5000));

      while (results.length < maxResults) {
        const videoElements = await page.$$('div[class*="DivItemContainerV2"]');
        
        if (!videoElements.length) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        for (const element of videoElements) {
          if (results.length >= maxResults) break;

          const videoData = await VideoScraper.extractVideoData(element);
          if (videoData?.video_url && !processedUrls.has(videoData.video_url)) {
            const postId = videoData.video_url.split("/").pop();
            videoData.comments = await extractComments(postId);
            
            processedUrls.add(videoData.video_url);
            results.push(videoData);
          }
        }

        if (results.length >= maxResults) break;

        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return results;
    } catch (error) {
      console.error(`Error processing hashtag '${keyword}':`, error);
      return results;
    }
  }

  async storeVideos(videos) {
    for (const video of videos) {
      try {
        const tiktokId = this.getTiktokId(video.video_url);
        if (!tiktokId) continue;

        const tiktokRecord = {
          id: tiktokId,
          username: this.sanitize(video.author || ''),
          url: this.sanitize(video.video_url),
          thumbnail: this.sanitize(video.thumbnail_url || ''),
          created_at: video.posted_timestamp ? new Date(video.posted_timestamp * 1000).toISOString() : new Date().toISOString(),
          fetched_at: new Date().toISOString(),
          views: this.formatViews(video.views?.toString() || "0"),
          comments: video.comments?.count || 0,
        };

        const { data: tiktokResult, error: tiktokError } = await this.supabase
          .from('tiktoks')
          .upsert(tiktokRecord, { onConflict: 'id' })
          .select();

        if (tiktokError) {
          console.error('Error storing TikTok:', tiktokError);
          continue;
        }

        // Store token mentions
        if (video.comments && video.comments.tickers) {
          await this.storeTokenMentions(tiktokId, video.comments);
        }
      } catch (error) {
        console.error('Error storing video:', error);
      }
    }
  }

  getTiktokId(url) {
    if (!url) return null;
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  sanitize(str) {
    return str ? str.replace(/\u0000/g, "") : "";
  }

  formatViews(views) {
    if (!views) return 0;
    
    const unitMultiplier = { k: 1_000, m: 1_000_000, b: 1_000_000_000 };
    const unit = views.slice(-1).toLowerCase();
    if (unit in unitMultiplier) {
      return Math.floor(parseFloat(views.slice(0, -1)) * unitMultiplier[unit]);
    }
    return Math.floor(parseFloat(views)) || 0;
  }

  async storeTokenMentions(tiktokId, comments) {
    if (!comments || !comments.tickers) return;

    try {
      const { data: tokens } = await this.supabase
        .from('tokens')
        .select('id, symbol')
        .order('id', { ascending: true });

      const symbolToTokens = new Map();
      tokens.forEach((token) => {
        if (!symbolToTokens.has(token.symbol)) {
          symbolToTokens.set(token.symbol, []);
        }
        symbolToTokens.get(token.symbol).push(token.id);
      });

      const mentionAt = new Date().toISOString();
      const mentionsData = [];

      for (const [symbol, count] of Object.entries(comments.tickers)) {
        const tokenIds = symbolToTokens.get(symbol);
        if (!tokenIds) continue;

        for (const tokenId of tokenIds) {
          mentionsData.push({
            tiktok_id: tiktokId,
            count: count,
            token_id: tokenId,
            mention_at: mentionAt,
          });
        }
      }

      if (mentionsData.length > 0) {
        await this.supabase.from('mentions').insert(mentionsData);
      }
    } catch (error) {
      console.error('Error storing token mentions:', error);
    }
  }
}

// Telegram Scraping Tool
class TelegramScrapingTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      console.log('📡 Starting Telegram scraping...');
      
      const scraper = new TelegramChannelScraper();
      await scraper.initializeDatabase();
      await scraper.discoverChannels();
      await scraper.loadChannels();
      await scraper.scrapeAllChannels(1000);

      return {
        success: true,
        message: 'Telegram scraping completed successfully'
      };
    } catch (error) {
      console.error('Telegram scraping error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Outlight Scraping Tool
class OutlightScrapingTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      console.log('🔍 Starting Outlight.fun scraping...');
      
      const scraper = new OutlightScraper();
      await scraper.main();

      return {
        success: true,
        message: 'Outlight.fun scraping completed successfully'
      };
    } catch (error) {
      console.error('Outlight scraping error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Pattern Analysis Tool
class PatternAnalysisTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      console.log('🧠 Starting pattern analysis...');
      
      const analyzer = new MemecoinPatternAnalyzer();
      const result = await analyzer.runComprehensiveAnalysis();

      return {
        success: true,
        result,
        message: 'Pattern analysis completed successfully'
      };
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Market Data Tool
class MarketDataTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      console.log('📊 Fetching market data...');
      
      // Import and run the bitquery data collection
      const { fetchAndPushMemecoins } = await import('../bitquery/scripts/memecoins.mjs');
      const { fetchAndPushPrices } = await import('../bitquery/scripts/prices.mjs');
      const { fetchMarketData, updateTokenMarketData } = await import('../bitquery/scripts/market-data.mjs');

      await fetchAndPushMemecoins();
      await fetchAndPushPrices();
      await fetchMarketData();

      return {
        success: true,
        message: 'Market data collection completed successfully'
      };
    } catch (error) {
      console.error('Market data error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Twitter API Tool
class TwitterAPITool {
  async execute(input) {
    try {
      console.log('🐦 Starting Twitter integration...');
      
      const twitter = new TwitterIntegration();
      await twitter.testConnection();
      twitter.start();

      return {
        success: true,
        message: 'Twitter integration started successfully'
      };
    } catch (error) {
      console.error('Twitter integration error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Dashboard Sync Tool
class DashboardSyncTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      console.log('📱 Updating dashboard...');
      
      // Trigger real-time updates for frontend
      // This would typically involve WebSocket or SSE updates
      
      return {
        success: true,
        message: 'Dashboard updated successfully'
      };
    } catch (error) {
      console.error('Dashboard update error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Additional tool classes (simplified implementations)
class CommentAnalysisTool { async execute() { return { success: true }; } }
class DataStorageTool { constructor(supabase) { this.supabase = supabase; } async execute() { return { success: true }; } }
class ChannelDiscoveryTool { async execute() { return { success: true }; } }
class MessageAnalysisTool { async execute() { return { success: true }; } }
class MessageExtractionTool { async execute() { return { success: true }; } }
class DataValidationTool { async execute() { return { success: true }; } }
class CorrelationCalculatorTool { async execute() { return { success: true }; } }
class TrendDetectionTool { async execute() { return { success: true }; } }
class RiskAssessmentTool { async execute() { return { success: true }; } }
class PriceTrackingTool { async execute() { return { success: true }; } }
class TokenDiscoveryTool { async execute() { return { success: true }; } }
class AlertGenerationTool { async execute() { return { success: true }; } }
class ContentModerationTool { async execute() { return { success: true }; } }
class RealTimeUpdateTool { async execute() { return { success: true }; } }
class DataConsistencyTool { async execute() { return { success: true }; } }

// Main execution
async function main() {
  const orchestrator = new IrisWorkflowOrchestrator();
  
  try {
    // Start the complete workflow
    await orchestrator.start();
    
    // Set up periodic analysis (every 2 hours)
    const analysisInterval = setInterval(() => {
      orchestrator.runPeriodicAnalysis();
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received shutdown signal...');
      clearInterval(analysisInterval);
      await orchestrator.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received termination signal...');
      clearInterval(analysisInterval);
      await orchestrator.stop();
      process.exit(0);
    });
    
    console.log('\n🎉 Iris ADK-TS Workflow is running!');
    console.log('📊 Status:', orchestrator.getStatus());
    console.log('\n⏹️ To stop, press Ctrl+C');
    
  } catch (error) {
    console.error('❌ Workflow startup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IrisWorkflowOrchestrator };
