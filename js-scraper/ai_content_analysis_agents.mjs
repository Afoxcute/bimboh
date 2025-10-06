#!/usr/bin/env node

/**
 * Enhanced AI-Powered Content Analysis Agents
 * 
 * This module implements specialized ADK-TS agents for advanced content analysis:
 * - Sentiment Analysis Agent
 * - Trend Detection Agent  
 * - Content Classification Agent
 * - Risk Assessment Agent
 * - Memecoin Analysis Agent
 * - Social Media Intelligence Agent
 */

import { LlmAgent } from '@iqai/adk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Sentiment Analysis Agent
 * Analyzes emotional tone and sentiment of social media content
 */
class SentimentAnalysisTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { content, platform, contentType = 'text' } = input;
      
      console.log(`🧠 Analyzing sentiment for ${platform} content...`);
      
      // Analyze sentiment using AI
      const sentimentAnalysis = await this.analyzeSentiment(content, contentType);
      
      // Store analysis results
      await this.storeSentimentAnalysis({
        content_id: input.contentId || `temp_${Date.now()}`,
        platform,
        content,
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        emotions: sentimentAnalysis.emotions,
        metadata: sentimentAnalysis.metadata
      });

      return {
        success: true,
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        emotions: sentimentAnalysis.emotions,
        analysis: sentimentAnalysis.analysis
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeSentiment(content, contentType) {
    // This would integrate with OpenAI's sentiment analysis
    // For now, we'll simulate the analysis
    const sentimentScores = {
      positive: Math.random() * 0.4 + 0.3,
      negative: Math.random() * 0.3,
      neutral: Math.random() * 0.3
    };

    const dominantSentiment = Object.keys(sentimentScores).reduce((a, b) => 
      sentimentScores[a] > sentimentScores[b] ? a : b
    );

    return {
      sentiment: dominantSentiment,
      confidence: Math.max(...Object.values(sentimentScores)),
      emotions: {
        joy: Math.random() * 0.8,
        anger: Math.random() * 0.6,
        fear: Math.random() * 0.4,
        surprise: Math.random() * 0.7,
        sadness: Math.random() * 0.3
      },
      analysis: `Content shows ${dominantSentiment} sentiment with ${Math.round(sentimentScores[dominantSentiment] * 100)}% confidence`,
      metadata: {
        contentLength: content.length,
        contentType,
        analyzedAt: new Date().toISOString()
      }
    };
  }

  async storeSentimentAnalysis(data) {
    try {
      const { error } = await this.supabase
        .from('sentiment_analysis')
        .insert(data);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing sentiment analysis:', error);
    }
  }
}

/**
 * Trend Detection Agent
 * Identifies emerging trends and patterns in memecoin content
 */
class TrendDetectionTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { platform, timeRange = '24h', minMentions = 5 } = input;
      
      console.log(`📈 Detecting trends for ${platform} in last ${timeRange}...`);
      
      // Get recent content for analysis
      const recentContent = await this.getRecentContent(platform, timeRange);
      
      // Analyze trends
      const trendAnalysis = await this.analyzeTrends(recentContent, minMentions);
      
      // Store trend data
      await this.storeTrendAnalysis(trendAnalysis);

      return {
        success: true,
        trends: trendAnalysis.trends,
        topTokens: trendAnalysis.topTokens,
        emergingPatterns: trendAnalysis.emergingPatterns,
        confidence: trendAnalysis.confidence
      };
    } catch (error) {
      console.error('Trend detection error:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecentContent(platform, timeRange) {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
    
    const { data, error } = await this.supabase
      .from(`${platform}_content`)
      .select('*')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .limit(1000);

    if (error) throw error;
    return data || [];
  }

  async analyzeTrends(content, minMentions) {
    // Analyze token mentions, hashtags, and engagement patterns
    const tokenMentions = {};
    const hashtagMentions = {};
    const engagementPatterns = {};

    content.forEach(item => {
      // Count token mentions
      const tokens = this.extractTokens(item.text || '');
      tokens.forEach(token => {
        tokenMentions[token] = (tokenMentions[token] || 0) + 1;
      });

      // Count hashtags
      const hashtags = this.extractHashtags(item.text || '');
      hashtags.forEach(hashtag => {
        hashtagMentions[hashtag] = (hashtagMentions[hashtag] || 0) + 1;
      });

      // Track engagement patterns
      const engagement = (item.views || 0) + (item.likes || 0) + (item.comments || 0);
      engagementPatterns[item.id] = engagement;
    });

    // Identify trending tokens
    const trendingTokens = Object.entries(tokenMentions)
      .filter(([token, count]) => count >= minMentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([token, count]) => ({ token, mentions: count }));

    // Identify trending hashtags
    const trendingHashtags = Object.entries(hashtagMentions)
      .filter(([hashtag, count]) => count >= minMentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([hashtag, count]) => ({ hashtag, mentions: count }));

    return {
      trends: {
        tokens: trendingTokens,
        hashtags: trendingHashtags,
        totalContent: content.length
      },
      topTokens: trendingTokens.slice(0, 5),
      emergingPatterns: this.identifyEmergingPatterns(content),
      confidence: Math.min(0.9, trendingTokens.length / 10)
    };
  }

  extractTokens(text) {
    // Extract potential token symbols (uppercase 3-6 letter words)
    const tokenRegex = /\b[A-Z]{3,6}\b/g;
    return text.match(tokenRegex) || [];
  }

  extractHashtags(text) {
    // Extract hashtags
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex) || [];
  }

  identifyEmergingPatterns(content) {
    // Identify patterns like viral content, coordinated posting, etc.
    const patterns = [];
    
    // Check for viral content (high engagement)
    const viralContent = content.filter(item => 
      (item.views || 0) > 10000 || (item.likes || 0) > 1000
    );
    
    if (viralContent.length > 0) {
      patterns.push({
        type: 'viral_content',
        count: viralContent.length,
        description: `${viralContent.length} pieces of viral content detected`
      });
    }

    return patterns;
  }

  async storeTrendAnalysis(data) {
    try {
      const { error } = await this.supabase
        .from('trend_analysis')
        .insert({
          analysis_type: 'trend_detection',
          platform: data.platform || 'multi',
          trends: data.trends,
          confidence: data.confidence,
          analyzed_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing trend analysis:', error);
    }
  }
}

/**
 * Content Classification Agent
 * Categorizes and classifies social media content
 */
class ContentClassificationTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { content, platform, contentType = 'text' } = input;
      
      console.log(`🏷️ Classifying content for ${platform}...`);
      
      // Classify content
      const classification = await this.classifyContent(content, contentType);
      
      // Store classification
      await this.storeClassification({
        content_id: input.contentId || `temp_${Date.now()}`,
        platform,
        content,
        classification: classification.category,
        subcategories: classification.subcategories,
        confidence: classification.confidence,
        metadata: classification.metadata
      });

      return {
        success: true,
        category: classification.category,
        subcategories: classification.subcategories,
        confidence: classification.confidence,
        tags: classification.tags
      };
    } catch (error) {
      console.error('Content classification error:', error);
      return { success: false, error: error.message };
    }
  }

  async classifyContent(content, contentType) {
    // Classify content into categories
    const categories = {
      'memecoin_announcement': 0,
      'price_discussion': 0,
      'technical_analysis': 0,
      'community_building': 0,
      'partnership_news': 0,
      'market_sentiment': 0,
      'educational': 0,
      'promotional': 0,
      'fud': 0,
      'other': 0
    };

    // Analyze content for category indicators
    const text = content.toLowerCase();
    
    if (text.includes('launch') || text.includes('announcement')) {
      categories.memecoin_announcement += 0.3;
    }
    if (text.includes('price') || text.includes('$') || text.includes('pump')) {
      categories.price_discussion += 0.4;
    }
    if (text.includes('chart') || text.includes('analysis') || text.includes('technical')) {
      categories.technical_analysis += 0.3;
    }
    if (text.includes('community') || text.includes('join') || text.includes('discord')) {
      categories.community_building += 0.2;
    }
    if (text.includes('partnership') || text.includes('collab')) {
      categories.partnership_news += 0.3;
    }
    if (text.includes('bullish') || text.includes('bearish') || text.includes('moon')) {
      categories.market_sentiment += 0.3;
    }
    if (text.includes('learn') || text.includes('tutorial') || text.includes('guide')) {
      categories.educational += 0.2;
    }
    if (text.includes('buy') || text.includes('sell') || text.includes('trade')) {
      categories.promotional += 0.2;
    }
    if (text.includes('scam') || text.includes('rug') || text.includes('warning')) {
      categories.fud += 0.4;
    }

    // Find dominant category
    const dominantCategory = Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b
    );

    const confidence = categories[dominantCategory];
    
    // Generate subcategories and tags
    const subcategories = this.generateSubcategories(content, dominantCategory);
    const tags = this.generateTags(content);

    return {
      category: dominantCategory,
      subcategories,
      confidence: Math.min(0.9, confidence),
      tags,
      metadata: {
        contentLength: content.length,
        contentType,
        classifiedAt: new Date().toISOString()
      }
    };
  }

  generateSubcategories(content, category) {
    const subcategories = [];
    const text = content.toLowerCase();

    switch (category) {
      case 'memecoin_announcement':
        if (text.includes('presale')) subcategories.push('presale');
        if (text.includes('launch')) subcategories.push('launch');
        if (text.includes('airdrop')) subcategories.push('airdrop');
        break;
      case 'price_discussion':
        if (text.includes('pump')) subcategories.push('pump_prediction');
        if (text.includes('dip')) subcategories.push('dip_analysis');
        if (text.includes('support')) subcategories.push('support_levels');
        break;
      case 'technical_analysis':
        if (text.includes('chart')) subcategories.push('chart_analysis');
        if (text.includes('pattern')) subcategories.push('pattern_recognition');
        if (text.includes('indicator')) subcategories.push('technical_indicators');
        break;
    }

    return subcategories;
  }

  generateTags(content) {
    const tags = [];
    const text = content.toLowerCase();

    // Extract common memecoin terms
    const memecoinTerms = ['moon', 'diamond', 'hands', 'hodl', 'pump', 'dip', 'bull', 'bear'];
    memecoinTerms.forEach(term => {
      if (text.includes(term)) tags.push(term);
    });

    // Extract token symbols
    const tokenRegex = /\b[A-Z]{3,6}\b/g;
    const tokens = content.match(tokenRegex) || [];
    tags.push(...tokens.slice(0, 3));

    return [...new Set(tags)]; // Remove duplicates
  }

  async storeClassification(data) {
    try {
      const { error } = await this.supabase
        .from('content_classification')
        .insert(data);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing classification:', error);
    }
  }
}

/**
 * Risk Assessment Agent
 * Evaluates investment risks and red flags in memecoin content
 */
class RiskAssessmentTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { content, platform, tokenSymbol } = input;
      
      console.log(`⚠️ Assessing risk for ${tokenSymbol || 'content'}...`);
      
      // Assess risks
      const riskAssessment = await this.assessRisks(content, platform, tokenSymbol);
      
      // Store risk assessment
      await this.storeRiskAssessment({
        content_id: input.contentId || `temp_${Date.now()}`,
        platform,
        token_symbol: tokenSymbol,
        content,
        risk_score: riskAssessment.riskScore,
        risk_level: riskAssessment.riskLevel,
        risk_factors: riskAssessment.riskFactors,
        red_flags: riskAssessment.redFlags,
        confidence: riskAssessment.confidence
      });

      return {
        success: true,
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        riskFactors: riskAssessment.riskFactors,
        redFlags: riskAssessment.redFlags,
        recommendations: riskAssessment.recommendations
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      return { success: false, error: error.message };
    }
  }

  async assessRisks(content, platform, tokenSymbol) {
    const riskFactors = [];
    const redFlags = [];
    let riskScore = 0;

    const text = content.toLowerCase();

    // Check for red flags
    const redFlagPatterns = {
      'guaranteed_returns': /guaranteed|guarantee|100%|sure thing/i,
      'urgency_pressure': /urgent|hurry|limited time|act now/i,
      'pump_scheme': /pump|dump|manipulate|artificial/i,
      'scam_indicators': /scam|rug|honeypot|exit scam/i,
      'unrealistic_promises': /moon|lambo|rich|wealthy/i,
      'lack_of_info': /trust me|believe|no questions/i
    };

    Object.entries(redFlagPatterns).forEach(([flag, pattern]) => {
      if (pattern.test(text)) {
        redFlags.push(flag);
        riskScore += 0.2;
      }
    });

    // Check for risk factors
    if (text.includes('new') && text.includes('token')) {
      riskFactors.push('new_token');
      riskScore += 0.1;
    }

    if (text.includes('presale') || text.includes('ico')) {
      riskFactors.push('presale_phase');
      riskScore += 0.15;
    }

    if (text.includes('anonymous') || text.includes('unknown')) {
      riskFactors.push('anonymous_team');
      riskScore += 0.2;
    }

    if (text.includes('no audit') || text.includes('unaudited')) {
      riskFactors.push('no_audit');
      riskScore += 0.25;
    }

    if (text.includes('low liquidity') || text.includes('thin orderbook')) {
      riskFactors.push('low_liquidity');
      riskScore += 0.2;
    }

    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= 0.7) riskLevel = 'high';
    else if (riskScore >= 0.4) riskLevel = 'medium';

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskLevel, riskFactors, redFlags);

    return {
      riskScore: Math.min(1.0, riskScore),
      riskLevel,
      riskFactors,
      redFlags,
      recommendations,
      confidence: Math.min(0.9, redFlags.length * 0.1 + riskFactors.length * 0.05)
    };
  }

  generateRecommendations(riskLevel, riskFactors, redFlags) {
    const recommendations = [];

    if (riskLevel === 'high') {
      recommendations.push('⚠️ HIGH RISK: Avoid this investment');
      recommendations.push('🔍 Conduct thorough due diligence');
    } else if (riskLevel === 'medium') {
      recommendations.push('⚠️ MEDIUM RISK: Proceed with caution');
      recommendations.push('📊 Research the project thoroughly');
    } else {
      recommendations.push('✅ LOW RISK: Standard due diligence recommended');
    }

    if (redFlags.includes('scam_indicators')) {
      recommendations.push('🚨 RED FLAG: Potential scam detected');
    }

    if (riskFactors.includes('new_token')) {
      recommendations.push('🆕 New token: Verify legitimacy');
    }

    if (riskFactors.includes('no_audit')) {
      recommendations.push('🔍 No audit: Request security audit');
    }

    return recommendations;
  }

  async storeRiskAssessment(data) {
    try {
      const { error } = await this.supabase
        .from('risk_assessments')
        .insert(data);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing risk assessment:', error);
    }
  }
}

/**
 * Memecoin Analysis Agent
 * Specialized analysis for memecoin-specific content
 */
class MemecoinAnalysisTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { content, platform, tokenSymbol } = input;
      
      console.log(`🪙 Analyzing memecoin content for ${tokenSymbol || 'unknown'}...`);
      
      // Analyze memecoin-specific aspects
      const analysis = await this.analyzeMemecoin(content, platform, tokenSymbol);
      
      // Store analysis
      await this.storeMemecoinAnalysis({
        content_id: input.contentId || `temp_${Date.now()}`,
        platform,
        token_symbol: tokenSymbol,
        content,
        analysis_type: 'memecoin_analysis',
        viral_potential: analysis.viralPotential,
        community_strength: analysis.communityStrength,
        meme_quality: analysis.memeQuality,
        market_sentiment: analysis.marketSentiment,
        metadata: analysis.metadata
      });

      return {
        success: true,
        viralPotential: analysis.viralPotential,
        communityStrength: analysis.communityStrength,
        memeQuality: analysis.memeQuality,
        marketSentiment: analysis.marketSentiment,
        insights: analysis.insights
      };
    } catch (error) {
      console.error('Memecoin analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeMemecoin(content, platform, tokenSymbol) {
    const text = content.toLowerCase();
    
    // Analyze viral potential
    const viralIndicators = {
      humor: this.analyzeHumor(text),
      relatability: this.analyzeRelatability(text),
      shareability: this.analyzeShareability(text),
      trendiness: this.analyzeTrendiness(text)
    };

    const viralPotential = Object.values(viralIndicators).reduce((a, b) => a + b, 0) / 4;

    // Analyze community strength
    const communityIndicators = {
      engagement: this.analyzeEngagement(content),
      community_mentions: this.analyzeCommunityMentions(text),
      social_proof: this.analyzeSocialProof(text)
    };

    const communityStrength = Object.values(communityIndicators).reduce((a, b) => a + b, 0) / 3;

    // Analyze meme quality
    const memeQuality = this.analyzeMemeQuality(content, text);

    // Analyze market sentiment
    const marketSentiment = this.analyzeMarketSentiment(text);

    // Generate insights
    const insights = this.generateInsights(viralPotential, communityStrength, memeQuality, marketSentiment);

    return {
      viralPotential,
      communityStrength,
      memeQuality,
      marketSentiment,
      insights,
      metadata: {
        platform,
        tokenSymbol,
        contentLength: content.length,
        analyzedAt: new Date().toISOString()
      }
    };
  }

  analyzeHumor(text) {
    const humorIndicators = ['lol', 'haha', 'funny', 'joke', 'meme', '😂', '🤣'];
    return humorIndicators.filter(indicator => text.includes(indicator)).length / humorIndicators.length;
  }

  analyzeRelatability(text) {
    const relatableTerms = ['we', 'us', 'our', 'community', 'together', 'everyone'];
    return relatableTerms.filter(term => text.includes(term)).length / relatableTerms.length;
  }

  analyzeShareability(text) {
    const shareableIndicators = ['share', 'retweet', 'repost', 'viral', 'spread'];
    return shareableIndicators.filter(indicator => text.includes(indicator)).length / shareableIndicators.length;
  }

  analyzeTrendiness(text) {
    const trendingTerms = ['trending', 'hot', 'popular', 'buzz', 'hype'];
    return trendingTerms.filter(term => text.includes(term)).length / trendingTerms.length;
  }

  analyzeEngagement(content) {
    const views = content.views || 0;
    const likes = content.likes || 0;
    const comments = content.comments || 0;
    const shares = content.shares || 0;
    
    return Math.min(1.0, (views + likes + comments + shares) / 10000);
  }

  analyzeCommunityMentions(text) {
    const communityTerms = ['community', 'holders', 'diamond hands', 'hodlers', 'team'];
    return communityTerms.filter(term => text.includes(term)).length / communityTerms.length;
  }

  analyzeSocialProof(text) {
    const socialProofTerms = ['verified', 'official', 'trusted', 'audited', 'partnership'];
    return socialProofTerms.filter(term => text.includes(term)).length / socialProofTerms.length;
  }

  analyzeMemeQuality(content, text) {
    let quality = 0;
    
    // Check for visual elements
    if (content.hasImage || content.hasVideo) quality += 0.3;
    
    // Check for meme language
    const memeLanguage = ['diamond hands', 'to the moon', 'hodl', 'wen', 'gm', 'wagmi'];
    const memeCount = memeLanguage.filter(term => text.includes(term)).length;
    quality += (memeCount / memeLanguage.length) * 0.4;
    
    // Check for creativity
    if (text.includes('!') || text.includes('?')) quality += 0.1;
    if (text.length > 50 && text.length < 200) quality += 0.2; // Optimal length
    
    return Math.min(1.0, quality);
  }

  analyzeMarketSentiment(text) {
    const bullishTerms = ['bull', 'moon', 'pump', 'up', 'rise', 'gain'];
    const bearishTerms = ['bear', 'dump', 'down', 'fall', 'drop', 'crash'];
    
    const bullishCount = bullishTerms.filter(term => text.includes(term)).length;
    const bearishCount = bearishTerms.filter(term => text.includes(term)).length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  generateInsights(viralPotential, communityStrength, memeQuality, marketSentiment) {
    const insights = [];
    
    if (viralPotential > 0.7) {
      insights.push('🔥 High viral potential detected');
    }
    
    if (communityStrength > 0.6) {
      insights.push('👥 Strong community engagement');
    }
    
    if (memeQuality > 0.7) {
      insights.push('🎭 High-quality meme content');
    }
    
    if (marketSentiment === 'bullish') {
      insights.push('📈 Bullish market sentiment');
    } else if (marketSentiment === 'bearish') {
      insights.push('📉 Bearish market sentiment');
    }
    
    return insights;
  }

  async storeMemecoinAnalysis(data) {
    try {
      const { error } = await this.supabase
        .from('memecoin_analysis')
        .insert(data);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing memecoin analysis:', error);
    }
  }
}

/**
 * Social Media Intelligence Agent
 * Comprehensive analysis combining all aspects
 */
class SocialMediaIntelligenceTool {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async execute(input) {
    try {
      const { content, platform, tokenSymbol } = input;
      
      console.log(`🔍 Running comprehensive social media intelligence analysis...`);
      
      // Run all analysis types
      const sentimentTool = new SentimentAnalysisTool(this.supabase);
      const classificationTool = new ContentClassificationTool(this.supabase);
      const riskTool = new RiskAssessmentTool(this.supabase);
      const memecoinTool = new MemecoinAnalysisTool(this.supabase);
      
      const [sentiment, classification, risk, memecoin] = await Promise.all([
        sentimentTool.execute({ ...input, content }),
        classificationTool.execute({ ...input, content }),
        riskTool.execute({ ...input, content, tokenSymbol }),
        memecoinTool.execute({ ...input, content, tokenSymbol })
      ]);

      // Combine insights
      const intelligence = this.combineIntelligence({
        sentiment,
        classification,
        risk,
        memecoin,
        platform,
        tokenSymbol
      });

      // Store comprehensive analysis
      await this.storeIntelligenceAnalysis({
        content_id: input.contentId || `temp_${Date.now()}`,
        platform,
        token_symbol: tokenSymbol,
        content,
        analysis_type: 'comprehensive_intelligence',
        intelligence_score: intelligence.score,
        insights: intelligence.insights,
        recommendations: intelligence.recommendations,
        metadata: intelligence.metadata
      });

      return {
        success: true,
        intelligence: intelligence,
        sentiment: sentiment,
        classification: classification,
        risk: risk,
        memecoin: memecoin
      };
    } catch (error) {
      console.error('Social media intelligence error:', error);
      return { success: false, error: error.message };
    }
  }

  combineIntelligence(analyses) {
    const { sentiment, classification, risk, memecoin, platform, tokenSymbol } = analyses;
    
    // Calculate overall intelligence score
    let score = 0;
    let factors = 0;
    
    if (sentiment.success) {
      score += sentiment.confidence * 0.2;
      factors++;
    }
    
    if (classification.success) {
      score += classification.confidence * 0.2;
      factors++;
    }
    
    if (risk.success) {
      score += (1 - risk.riskScore) * 0.3; // Lower risk = higher score
      factors++;
    }
    
    if (memecoin.success) {
      score += (memecoin.viralPotential + memecoin.communityStrength + memecoin.memeQuality) / 3 * 0.3;
      factors++;
    }
    
    const intelligenceScore = factors > 0 ? score / factors : 0;
    
    // Generate combined insights
    const insights = [];
    
    if (sentiment.success && sentiment.sentiment === 'positive') {
      insights.push('✅ Positive sentiment detected');
    }
    
    if (classification.success && classification.category === 'memecoin_announcement') {
      insights.push('🚀 Memecoin announcement identified');
    }
    
    if (risk.success && risk.riskLevel === 'low') {
      insights.push('🛡️ Low risk assessment');
    }
    
    if (memecoin.success && memecoin.viralPotential > 0.7) {
      insights.push('🔥 High viral potential');
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(analyses);
    
    return {
      score: intelligenceScore,
      insights,
      recommendations,
      metadata: {
        platform,
        tokenSymbol,
        analyzedAt: new Date().toISOString(),
        analysisCount: factors
      }
    };
  }

  generateRecommendations(analyses) {
    const recommendations = [];
    const { sentiment, classification, risk, memecoin } = analyses;
    
    if (risk.success && risk.riskLevel === 'high') {
      recommendations.push('⚠️ HIGH RISK: Avoid this investment');
    }
    
    if (memecoin.success && memecoin.viralPotential > 0.8) {
      recommendations.push('🚀 HIGH VIRAL POTENTIAL: Monitor closely');
    }
    
    if (classification.success && classification.category === 'fud') {
      recommendations.push('🚨 FUD DETECTED: Verify information');
    }
    
    if (sentiment.success && sentiment.sentiment === 'negative') {
      recommendations.push('📉 NEGATIVE SENTIMENT: Proceed with caution');
    }
    
    return recommendations;
  }

  async storeIntelligenceAnalysis(data) {
    try {
      const { error } = await this.supabase
        .from('intelligence_analysis')
        .insert(data);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing intelligence analysis:', error);
    }
  }
}

export {
  SentimentAnalysisTool,
  TrendDetectionTool,
  ContentClassificationTool,
  RiskAssessmentTool,
  MemecoinAnalysisTool,
  SocialMediaIntelligenceTool
};
