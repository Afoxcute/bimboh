import { LlmAgent, AgentBuilder } from '@iqai/adk';
import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from multiple locations
dotenv.config();
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../../.env' });

/**
 * Intelligent Twitter Automation System using ADK-TS
 * Features:
 * - Memory and context awareness
 * - Multiple specialized agents
 * - Intelligent content generation
 * - Adaptive posting strategies
 * - Performance tracking
 */

class TwitterMemorySystem {
  constructor(supabase) {
    this.supabase = supabase;
    this.memoryCache = new Map();
    this.contextWindow = 24 * 60 * 60 * 1000; // 24 hours
  }

  async getMemory(key) {
    try {
      // Check cache first
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        if (Date.now() - cached.timestamp < this.contextWindow) {
          return cached.data;
        }
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('twitter_memory')
        .select('*')
        .eq('memory_key', key)
        .gte('created_at', new Date(Date.now() - this.contextWindow).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        this.memoryCache.set(key, { data: data.memory_data, timestamp: Date.now() });
        return data.memory_data;
      }

      return null;
    } catch (error) {
      console.error('Error getting memory:', error);
      return null;
    }
  }

  async setMemory(key, data, metadata = {}) {
    try {
      const memoryData = {
        memory_key: key,
        memory_data: data,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const { error } = await this.supabase
        .from('twitter_memory')
        .upsert(memoryData, { onConflict: 'memory_key' });

      if (error) throw error;

      // Update cache
      this.memoryCache.set(key, { data, timestamp: Date.now() });
      
      return true;
    } catch (error) {
      console.error('Error setting memory:', error);
      return false;
    }
  }

  async getContextualMemory(context) {
    try {
      const { data, error } = await this.supabase
        .from('twitter_memory')
        .select('*')
        .gte('created_at', new Date(Date.now() - this.contextWindow).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter memories relevant to context
      const relevantMemories = data.filter(memory => {
        const metadata = memory.metadata || {};
        return metadata.context === context || 
               metadata.tags?.includes(context) ||
               memory.memory_key.includes(context);
      });

      return relevantMemories.map(m => m.memory_data);
    } catch (error) {
      console.error('Error getting contextual memory:', error);
      return [];
    }
  }
}

class TwitterContentTool {
  constructor(supabase, memorySystem) {
    this.supabase = supabase;
    this.memory = memorySystem;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async execute(input) {
    try {
      const { type, data, context } = input;
      
      // Get relevant memory for context
      const memories = await this.memory.getContextualMemory(context || 'general');
      
      // Generate content based on type
      switch (type) {
        case 'volume_alert':
          return await this.generateVolumeAlert(data, memories);
        case 'trending_discovery':
          return await this.generateTrendingDiscovery(data, memories);
        case 'market_analysis':
          return await this.generateMarketAnalysis(data, memories);
        case 'sentiment_analysis':
          return await this.generateSentimentAnalysis(data, memories);
        case 'risk_warning':
          return await this.generateRiskWarning(data, memories);
        default:
          return await this.generateGenericContent(data, memories);
      }
    } catch (error) {
      console.error('Error in TwitterContentTool:', error);
      return { success: false, error: error.message };
    }
  }

  async generateVolumeAlert(data, memories) {
    try {
      const { token, volumeGrowth, currentVolume, previousVolume } = data;
      
      // Get historical performance for context
      const historicalData = await this.getTokenHistoricalData(token.uri);
      
      const prompt = `Generate an engaging tweet about a memecoin volume surge.

Context:
- Token: ${token.symbol} (${token.name})
- Volume growth: +${this.formatCurrency(volumeGrowth)}/hour
- Current volume: ${this.formatCurrency(currentVolume)}
- Previous volume: ${this.formatCurrency(previousVolume)}
- Historical performance: ${historicalData.performance}
- Recent trends: ${historicalData.trends}

Previous successful tweets (for style reference):
${memories.slice(0, 3).map(m => m.content).join('\n')}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it exciting and engaging
- Include key metrics
- Use relevant crypto hashtags
- Keep it professional but fun
- Reference historical context if relevant

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about memecoin volume surges. Be exciting, informative, and use relevant hashtags. Learn from previous successful tweets." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      // Store in memory for future reference
      await this.memory.setMemory(`volume_alert_${token.symbol}_${Date.now()}`, {
        content,
        token: token.symbol,
        volumeGrowth,
        type: 'volume_alert'
      }, { context: 'volume_alert', tags: [token.symbol, 'volume'] });

      return { success: true, content };
    } catch (error) {
      console.error('Error generating volume alert:', error);
      return { success: false, error: error.message };
    }
  }

  async generateTrendingDiscovery(data, memories) {
    try {
      const { analysisResult, correlation } = data;
      
      const prompt = `Generate an engaging tweet about a trending memecoin discovery.

Context:
- Token: ${correlation.token_symbol}
- Keyword: ${correlation.keyword}
- Correlation: ${(correlation.correlation_score * 100).toFixed(1)}%
- Risk Level: ${correlation.risk_level}
- Platform: ${analysisResult.platform}

Previous successful discovery tweets:
${memories.filter(m => m.type === 'trending_discovery').slice(0, 3).map(m => m.content).join('\n')}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it exciting and engaging
- Emphasize the discovery aspect
- Include correlation and risk level
- Use relevant crypto hashtags
- Keep it professional but fun

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about trending memecoin discoveries. Be exciting, informative, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      // Store in memory
      await this.memory.setMemory(`discovery_${correlation.token_symbol}_${Date.now()}`, {
        content,
        token: correlation.token_symbol,
        keyword: correlation.keyword,
        correlation: correlation.correlation_score,
        type: 'trending_discovery'
      }, { context: 'trending_discovery', tags: [correlation.token_symbol, correlation.keyword] });

      return { success: true, content };
    } catch (error) {
      console.error('Error generating trending discovery:', error);
      return { success: false, error: error.message };
    }
  }

  async generateMarketAnalysis(data, memories) {
    try {
      const { marketData, sentimentData } = data;
      
      const prompt = `Generate an engaging tweet about current memecoin market sentiment.

Context:
- Total tokens traded: ${marketData.totalTokens}
- Average volume change: ${marketData.avgVolumeChange}%
- Top performing token: ${marketData.topPerformer}
- Market mood: ${marketData.marketMood}
- Sentiment score: ${sentimentData.sentimentScore}
- Key trends: ${sentimentData.trends.join(', ')}

Previous market analysis tweets:
${memories.filter(m => m.type === 'market_analysis').slice(0, 3).map(m => m.content).join('\n')}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it engaging and informative
- Provide market insights
- Use relevant crypto hashtags
- Keep it professional but exciting
- Reference trends and sentiment

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about memecoin market sentiment. Be insightful, exciting, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      // Store in memory
      await this.memory.setMemory(`market_analysis_${Date.now()}`, {
        content,
        marketData,
        sentimentData,
        type: 'market_analysis'
      }, { context: 'market_analysis', tags: ['market', 'analysis'] });

      return { success: true, content };
    } catch (error) {
      console.error('Error generating market analysis:', error);
      return { success: false, error: error.message };
    }
  }

  async generateSentimentAnalysis(data, memories) {
    try {
      const { sentiment, token, platform } = data;
      
      const prompt = `Generate an engaging tweet about social media sentiment for a memecoin.

Context:
- Token: ${token.symbol}
- Platform: ${platform}
- Sentiment: ${sentiment.overall}
- Confidence: ${sentiment.confidence}%
- Key themes: ${sentiment.themes.join(', ')}
- Risk indicators: ${sentiment.riskIndicators.join(', ')}

Previous sentiment tweets:
${memories.filter(m => m.type === 'sentiment_analysis').slice(0, 3).map(m => m.content).join('\n')}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it engaging and informative
- Highlight sentiment insights
- Use relevant crypto hashtags
- Keep it professional but exciting

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about social media sentiment. Be insightful, exciting, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      // Store in memory
      await this.memory.setMemory(`sentiment_${token.symbol}_${Date.now()}`, {
        content,
        token: token.symbol,
        sentiment,
        platform,
        type: 'sentiment_analysis'
      }, { context: 'sentiment_analysis', tags: [token.symbol, platform] });

      return { success: true, content };
    } catch (error) {
      console.error('Error generating sentiment analysis:', error);
      return { success: false, error: error.message };
    }
  }

  async generateRiskWarning(data, memories) {
    try {
      const { riskAssessment, token } = data;
      
      const prompt = `Generate an engaging tweet about risk assessment for a memecoin.

Context:
- Token: ${token.symbol}
- Risk Level: ${riskAssessment.riskLevel}
- Risk Score: ${riskAssessment.riskScore}/10
- Risk Factors: ${riskAssessment.riskFactors.join(', ')}
- Red Flags: ${riskAssessment.redFlags.join(', ')}
- Confidence: ${riskAssessment.confidence}%

Previous risk warning tweets:
${memories.filter(m => m.type === 'risk_warning').slice(0, 3).map(m => m.content).join('\n')}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it informative and cautionary
- Highlight key risk factors
- Use relevant crypto hashtags
- Keep it professional but urgent
- Include disclaimer about DYOR

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a crypto analyst creating informative tweets about memecoin risk assessments. Be cautionary, informative, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      // Store in memory
      await this.memory.setMemory(`risk_warning_${token.symbol}_${Date.now()}`, {
        content,
        token: token.symbol,
        riskAssessment,
        type: 'risk_warning'
      }, { context: 'risk_warning', tags: [token.symbol, 'risk'] });

      return { success: true, content };
    } catch (error) {
      console.error('Error generating risk warning:', error);
      return { success: false, error: error.message };
    }
  }

  async generateGenericContent(data, memories) {
    try {
      const prompt = `Generate an engaging tweet about memecoin trading.

Context:
- Data: ${JSON.stringify(data, null, 2)}

Previous successful tweets:
${memories.slice(0, 5).map(m => m.content).join('\n')}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it engaging and informative
- Use relevant crypto hashtags
- Keep it professional but fun

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about memecoin trading. Be exciting, informative, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      return { success: true, content };
    } catch (error) {
      console.error('Error generating generic content:', error);
      return { success: false, error: error.message };
    }
  }

  async getTokenHistoricalData(tokenUri) {
    try {
      const { data, error } = await this.supabase
        .from('prices')
        .select('price_usd, price_sol, trade_at')
        .eq('token_uri', tokenUri)
        .order('trade_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { performance: 'No historical data', trends: 'Unknown' };
      }

      const prices = data.map(p => parseFloat(p.price_usd || 0));
      const firstPrice = prices[prices.length - 1];
      const lastPrice = prices[0];
      
      const performance = firstPrice > 0 ? 
        `${(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1)}%` : 'Unknown';
      
      const trend = prices[0] > prices[1] ? 'Rising' : 'Falling';
      
      return { performance, trends: trend };
    } catch (error) {
      console.error('Error getting historical data:', error);
      return { performance: 'Unknown', trends: 'Unknown' };
    }
  }

  formatCurrency(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }
}

class TwitterPostingTool {
  constructor(supabase, memorySystem) {
    this.supabase = supabase;
    this.memory = memorySystem;
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
  }

  async execute(input) {
    try {
      const { content, type, metadata } = input;
      
      // Check if we should post based on posting strategy
      const shouldPost = await this.shouldPost(type, metadata);
      if (!shouldPost) {
        return { success: false, reason: 'Posting strategy prevented posting' };
      }

      // Post the tweet
      const tweet = await this.twitterClient.v2.tweet(content);
      
      // Store the post in memory and database
      await this.storePost(tweet, type, metadata);
      
      // Update posting strategy based on performance
      await this.updatePostingStrategy(type, metadata);
      
      return { success: true, tweetId: tweet.data.id, content };
    } catch (error) {
      console.error('Error posting tweet:', error);
      return { success: false, error: error.message };
    }
  }

  async shouldPost(type, metadata) {
    try {
      // Get posting strategy from memory
      const strategy = await this.memory.getMemory('posting_strategy') || {
        volume_alerts: { enabled: true, maxPerHour: 3 },
        trending_discoveries: { enabled: true, maxPerHour: 2 },
        market_analysis: { enabled: true, maxPerHour: 1 },
        sentiment_analysis: { enabled: true, maxPerHour: 2 },
        risk_warnings: { enabled: true, maxPerHour: 1 }
      };

      const typeStrategy = strategy[type] || { enabled: true, maxPerHour: 1 };
      
      if (!typeStrategy.enabled) return false;

      // Check recent posts of this type
      const recentPosts = await this.getRecentPosts(type, 60); // Last hour
      
      return recentPosts.length < typeStrategy.maxPerHour;
    } catch (error) {
      console.error('Error checking posting strategy:', error);
      return true; // Default to allowing posts
    }
  }

  async getRecentPosts(type, minutesBack) {
    try {
      const { data, error } = await this.supabase
        .from('twitter_posts')
        .select('*')
        .eq('post_type', type)
        .gte('created_at', new Date(Date.now() - minutesBack * 60 * 1000).toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent posts:', error);
      return [];
    }
  }

  async storePost(tweet, type, metadata) {
    try {
      const postData = {
        tweet_id: tweet.data.id,
        content: tweet.data.text,
        post_type: type,
        metadata: {
          ...metadata,
          posted_at: new Date().toISOString(),
          version: '1.0.0'
        },
        created_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('twitter_posts')
        .insert(postData);

      if (error) throw error;

      // Store in memory
      await this.memory.setMemory(`post_${tweet.data.id}`, {
        tweetId: tweet.data.id,
        content: tweet.data.text,
        type,
        metadata
      }, { context: 'twitter_post', tags: [type] });

      return true;
    } catch (error) {
      console.error('Error storing post:', error);
      return false;
    }
  }

  async updatePostingStrategy(type, metadata) {
    try {
      // This would implement adaptive posting strategy based on engagement
      // For now, we'll just track the post
      const strategy = await this.memory.getMemory('posting_strategy') || {};
      
      // Update strategy based on performance (simplified)
      if (!strategy[type]) {
        strategy[type] = { enabled: true, maxPerHour: 1 };
      }
      
      await this.memory.setMemory('posting_strategy', strategy);
    } catch (error) {
      console.error('Error updating posting strategy:', error);
    }
  }
}

class TwitterAnalyticsTool {
  constructor(supabase, memorySystem) {
    this.supabase = supabase;
    this.memory = memorySystem;
  }

  async execute(input) {
    try {
      const { type, timeRange = '24h' } = input;
      
      switch (type) {
        case 'engagement_analysis':
          return await this.analyzeEngagement(timeRange);
        case 'content_performance':
          return await this.analyzeContentPerformance(timeRange);
        case 'optimal_posting_times':
          return await this.analyzeOptimalPostingTimes(timeRange);
        case 'audience_insights':
          return await this.analyzeAudienceInsights(timeRange);
        default:
          return await this.getGeneralAnalytics(timeRange);
      }
    } catch (error) {
      console.error('Error in TwitterAnalyticsTool:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeEngagement(timeRange) {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      
      const { data, error } = await this.supabase
        .from('twitter_posts')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const analytics = {
        totalPosts: data.length,
        postsByType: {},
        averageEngagement: 0,
        topPerformingPosts: [],
        engagementTrends: []
      };

      // Analyze by post type
      data.forEach(post => {
        const type = post.post_type;
        if (!analytics.postsByType[type]) {
          analytics.postsByType[type] = 0;
        }
        analytics.postsByType[type]++;
      });

      // Store analytics in memory
      await this.memory.setMemory(`engagement_analysis_${timeRange}`, analytics, {
        context: 'analytics',
        tags: ['engagement', timeRange]
      });

      return { success: true, analytics };
    } catch (error) {
      console.error('Error analyzing engagement:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeContentPerformance(timeRange) {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      
      const { data, error } = await this.supabase
        .from('twitter_posts')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const performance = {
        totalPosts: data.length,
        contentTypes: {},
        bestPerformingContent: [],
        contentTrends: []
      };

      // Analyze content performance
      data.forEach(post => {
        const type = post.post_type;
        if (!performance.contentTypes[type]) {
          performance.contentTypes[type] = {
            count: 0,
            avgLength: 0,
            totalLength: 0
          };
        }
        
        performance.contentTypes[type].count++;
        performance.contentTypes[type].totalLength += post.content.length;
        performance.contentTypes[type].avgLength = 
          performance.contentTypes[type].totalLength / performance.contentTypes[type].count;
      });

      // Store performance in memory
      await this.memory.setMemory(`content_performance_${timeRange}`, performance, {
        context: 'analytics',
        tags: ['content', 'performance', timeRange]
      });

      return { success: true, performance };
    } catch (error) {
      console.error('Error analyzing content performance:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeOptimalPostingTimes(timeRange) {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      
      const { data, error } = await this.supabase
        .from('twitter_posts')
        .select('created_at, post_type')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const postingTimes = {
        hourlyDistribution: {},
        dailyDistribution: {},
        optimalHours: [],
        optimalDays: []
      };

      // Analyze posting times
      data.forEach(post => {
        const date = new Date(post.created_at);
        const hour = date.getHours();
        const day = date.getDay();
        
        if (!postingTimes.hourlyDistribution[hour]) {
          postingTimes.hourlyDistribution[hour] = 0;
        }
        postingTimes.hourlyDistribution[hour]++;
        
        if (!postingTimes.dailyDistribution[day]) {
          postingTimes.dailyDistribution[day] = 0;
        }
        postingTimes.dailyDistribution[day]++;
      });

      // Find optimal times
      const sortedHours = Object.entries(postingTimes.hourlyDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      postingTimes.optimalHours = sortedHours.map(([hour]) => parseInt(hour));

      // Store posting times in memory
      await this.memory.setMemory(`posting_times_${timeRange}`, postingTimes, {
        context: 'analytics',
        tags: ['posting', 'times', timeRange]
      });

      return { success: true, postingTimes };
    } catch (error) {
      console.error('Error analyzing posting times:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeAudienceInsights(timeRange) {
    try {
      // This would integrate with Twitter API to get audience insights
      // For now, we'll return basic analytics
      const insights = {
        totalFollowers: 0, // Would come from Twitter API
        engagementRate: 0, // Would be calculated from Twitter API data
        audienceDemographics: {}, // Would come from Twitter API
        topHashtags: [],
        topMentions: []
      };

      // Store insights in memory
      await this.memory.setMemory(`audience_insights_${timeRange}`, insights, {
        context: 'analytics',
        tags: ['audience', 'insights', timeRange]
      });

      return { success: true, insights };
    } catch (error) {
      console.error('Error analyzing audience insights:', error);
      return { success: false, error: error.message };
    }
  }

  async getGeneralAnalytics(timeRange) {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      
      const { data, error } = await this.supabase
        .from('twitter_posts')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const analytics = {
        totalPosts: data.length,
        postsByType: {},
        averagePostLength: 0,
        totalCharacters: 0,
        timeRange
      };

      // Calculate basic metrics
      data.forEach(post => {
        const type = post.post_type;
        if (!analytics.postsByType[type]) {
          analytics.postsByType[type] = 0;
        }
        analytics.postsByType[type]++;
        analytics.totalCharacters += post.content.length;
      });

      analytics.averagePostLength = data.length > 0 ? 
        Math.round(analytics.totalCharacters / data.length) : 0;

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting general analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

class IntelligentTwitterAutomation {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_SECRET
    );
    
    this.memory = new TwitterMemorySystem(this.supabase);
    this.agents = {};
    this.workflow = null;
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Intelligent Twitter Automation...');
      
      // Initialize tools
      const contentTool = new TwitterContentTool(this.supabase, this.memory);
      const postingTool = new TwitterPostingTool(this.supabase, this.memory);
      const analyticsTool = new TwitterAnalyticsTool(this.supabase, this.memory);

      // Create specialized agents
      this.agents.contentGenerator = new LlmAgent({
        name: 'content_generator',
        model: 'gpt-3.5-turbo',
        instruction: `You are an intelligent content generator for Twitter automation. Your role is to:
        - Generate engaging, contextually relevant tweets
        - Learn from previous successful content
        - Adapt content style based on performance
        - Maintain brand consistency
        - Optimize for engagement and reach
        
        You have access to memory of previous tweets and their performance.
        Use this context to create better content that resonates with your audience.`,
        tools: [contentTool]
      });

      this.agents.postingManager = new LlmAgent({
        name: 'posting_manager',
        model: 'gpt-3.5-turbo',
        instruction: `You are a posting manager for Twitter automation. Your role is to:
        - Determine optimal posting times and frequency
        - Manage posting strategy based on performance
        - Avoid spam and maintain quality
        - Balance different types of content
        - Monitor posting limits and restrictions
        
        You have access to posting history and performance data.
        Use this to make intelligent decisions about when and what to post.`,
        tools: [postingTool]
      });

      this.agents.analyticsExpert = new LlmAgent({
        name: 'analytics_expert',
        model: 'gpt-3.5-turbo',
        instruction: `You are an analytics expert for Twitter automation. Your role is to:
        - Analyze engagement and performance metrics
        - Identify trends and patterns in content performance
        - Provide insights for content optimization
        - Track audience growth and engagement
        - Recommend strategy improvements
        
        You have access to comprehensive analytics data.
        Use this to provide actionable insights for improving Twitter performance.`,
        tools: [analyticsTool]
      });

      this.agents.strategyOptimizer = new LlmAgent({
        name: 'strategy_optimizer',
        model: 'gpt-3.5-turbo',
        instruction: `You are a strategy optimizer for Twitter automation. Your role is to:
        - Analyze overall performance and trends
        - Optimize posting strategies based on data
        - Balance different content types and frequencies
        - Adapt to changing audience preferences
        - Maintain long-term engagement growth
        
        You have access to all analytics and performance data.
        Use this to continuously improve the Twitter automation strategy.`,
        tools: [analyticsTool, contentTool]
      });

      // Create workflow
      this.workflow = await AgentBuilder.create('intelligent_twitter_automation')
        .asSequential([
          this.agents.analyticsExpert,    // Step 1: Analyze current performance
          this.agents.strategyOptimizer,  // Step 2: Optimize strategy
          this.agents.contentGenerator,   // Step 3: Generate content
          this.agents.postingManager      // Step 4: Manage posting
        ])
        .build();

      console.log('✅ Intelligent Twitter Automation initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Twitter automation:', error);
      return false;
    }
  }

  async executeWorkflow(input) {
    try {
      if (!this.workflow) {
        await this.initialize();
      }

      const result = await this.workflow.execute({
        input: {
          ...input,
          timestamp: new Date().toISOString(),
          sessionId: `twitter_${Date.now()}`
        },
        context: {
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0',
          features: ['memory', 'context', 'analytics', 'adaptive_posting']
        }
      });

      return result;
    } catch (error) {
      console.error('❌ Error executing Twitter workflow:', error);
      return { success: false, error: error.message };
    }
  }

  async generateAndPostContent(type, data, context = 'general') {
    try {
      console.log(`📝 Generating ${type} content...`);
      
      const contentResult = await this.agents.contentGenerator.execute({
        type,
        data,
        context
      });

      if (!contentResult.success) {
        throw new Error(contentResult.error);
      }

      console.log(`📤 Posting ${type} content...`);
      
      const postingResult = await this.agents.postingManager.execute({
        content: contentResult.content,
        type,
        metadata: { context, generatedAt: new Date().toISOString() }
      });

      if (!postingResult.success) {
        throw new Error(postingResult.error);
      }

      console.log(`✅ Successfully posted ${type} content: ${postingResult.tweetId}`);
      
      return {
        success: true,
        tweetId: postingResult.tweetId,
        content: contentResult.content,
        type
      };
    } catch (error) {
      console.error(`❌ Error generating and posting ${type} content:`, error);
      return { success: false, error: error.message };
    }
  }

  async analyzePerformance(timeRange = '24h') {
    try {
      console.log(`📊 Analyzing performance for ${timeRange}...`);
      
      const result = await this.agents.analyticsExpert.execute({
        type: 'engagement_analysis',
        timeRange
      });

      return result;
    } catch (error) {
      console.error('❌ Error analyzing performance:', error);
      return { success: false, error: error.message };
    }
  }

  async optimizeStrategy() {
    try {
      console.log('🔧 Optimizing strategy...');
      
      const result = await this.agents.strategyOptimizer.execute({
        type: 'strategy_optimization',
        data: { timestamp: new Date().toISOString() }
      });

      return result;
    } catch (error) {
      console.error('❌ Error optimizing strategy:', error);
      return { success: false, error: error.message };
    }
  }

  async getMemoryInsights() {
    try {
      const memories = await this.memory.getContextualMemory('general');
      return {
        success: true,
        totalMemories: memories.length,
        recentMemories: memories.slice(0, 10),
        memoryTypes: [...new Set(memories.map(m => m.type))]
      };
    } catch (error) {
      console.error('❌ Error getting memory insights:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export the main class and tools
export { 
  IntelligentTwitterAutomation,
  TwitterMemorySystem,
  TwitterContentTool,
  TwitterPostingTool,
  TwitterAnalyticsTool
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const twitter = new IntelligentTwitterAutomation();
  
  async function main() {
    await twitter.initialize();
    
    // Example usage
    const result = await twitter.generateAndPostContent('market_analysis', {
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
    });
    
    console.log('Result:', result);
  }
  
  main().catch(console.error);
}
