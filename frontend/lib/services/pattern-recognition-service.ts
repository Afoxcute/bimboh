import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export interface PatternDetection {
  id: number;
  pattern_type: string;
  token_symbol: string;
  token_uri?: string;
  pattern_name: string;
  pattern_strength: number;
  pattern_confidence: number;
  pattern_data: any;
  detected_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface PatternInsight {
  id: number;
  insight_type: string;
  token_symbol: string;
  insight_title: string;
  insight_description: string;
  confidence_score: number;
  impact_score: number;
  recommendation?: string;
  insight_data: any;
  created_at: string;
  expires_at?: string;
}

export interface PatternPrediction {
  id: number;
  token_symbol: string;
  prediction_type: string;
  prediction_value?: number;
  confidence_score: number;
  time_horizon: string;
  prediction_data: any;
  created_at: string;
  target_date?: string;
  is_fulfilled: boolean;
  actual_value?: number;
  accuracy_score?: number;
}

export interface PatternSummary {
  pattern_type: string;
  detection_count: number;
  avg_strength: number;
  avg_confidence: number;
  active_patterns: number;
  last_detected: string;
}

export class PatternRecognitionService {
  /**
   * Get pattern summary statistics
   */
  static async getPatternSummary(): Promise<PatternSummary[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const { data, error } = await supabase
        .from('pattern_summary')
        .select('*')
        .order('detection_count', { ascending: false });

      if (error) {
        console.log('⚠️ Pattern summary table not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pattern summary:', error);
      return [];
    }
  }

  /**
   * Get pattern detections with filters
   */
  static async getPatternDetections(filters: {
    limit?: number;
    patternType?: string;
    tokenSymbol?: string;
    hours?: number;
  } = {}): Promise<PatternDetection[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const {
        limit = 50,
        patternType,
        tokenSymbol,
        hours = 24
      } = filters;

      let query = supabase
        .from('pattern_detections')
        .select('*')
        .gte('detected_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (patternType) {
        query = query.eq('pattern_type', patternType);
      }

      if (tokenSymbol) {
        query = query.eq('token_symbol', tokenSymbol);
      }

      const { data, error } = await query;

      if (error) {
        console.log('⚠️ Pattern detections table not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pattern detections:', error);
      return [];
    }
  }

  /**
   * Get pattern insights with filters
   */
  static async getPatternInsights(filters: {
    limit?: number;
    insightType?: string;
    tokenSymbol?: string;
    hours?: number;
  } = {}): Promise<PatternInsight[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const {
        limit = 50,
        insightType,
        tokenSymbol,
        hours = 24
      } = filters;

      let query = supabase
        .from('pattern_insights')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (insightType) {
        query = query.eq('insight_type', insightType);
      }

      if (tokenSymbol) {
        query = query.eq('token_symbol', tokenSymbol);
      }

      const { data, error } = await query;

      if (error) {
        console.log('⚠️ Pattern insights table not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pattern insights:', error);
      return [];
    }
  }

  /**
   * Get pattern predictions with filters
   */
  static async getPatternPredictions(filters: {
    limit?: number;
    predictionType?: string;
    tokenSymbol?: string;
    hours?: number;
  } = {}): Promise<PatternPrediction[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const {
        limit = 50,
        predictionType,
        tokenSymbol,
        hours = 24
      } = filters;

      let query = supabase
        .from('pattern_predictions')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (predictionType) {
        query = query.eq('prediction_type', predictionType);
      }

      if (tokenSymbol) {
        query = query.eq('token_symbol', tokenSymbol);
      }

      const { data, error } = await query;

      if (error) {
        console.log('⚠️ Pattern predictions table not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pattern predictions:', error);
      return [];
    }
  }

  /**
   * Get top pattern tokens
   */
  static async getTopPatternTokens(limit: number = 10): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const { data, error } = await supabase
        .from('top_pattern_tokens')
        .select('*')
        .order('pattern_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.log('⚠️ Top pattern tokens view not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch top pattern tokens:', error);
      return [];
    }
  }

  /**
   * Get pattern accuracy statistics
   */
  static async getPatternAccuracy(patternType: string, daysBack: number = 7): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const { data, error } = await supabase
        .rpc('calculate_pattern_accuracy', {
          input_pattern_type: patternType,
          days_back: daysBack
        });

      if (error) {
        console.log('⚠️ Pattern accuracy function not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pattern accuracy:', error);
      return [];
    }
  }

  /**
   * Get top performing patterns
   */
  static async getTopPerformingPatterns(
    daysBack: number = 7,
    minDetections: number = 3
  ): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const { data, error } = await supabase
        .rpc('get_top_performing_patterns', {
          days_back: daysBack,
          min_detections: minDetections
        });

      if (error) {
        console.log('⚠️ Top performing patterns function not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch top performing patterns:', error);
      return [];
    }
  }

  /**
   * Get pattern correlations for a token
   */
  static async getPatternCorrelations(
    tokenSymbol: string,
    daysBack: number = 7
  ): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log('⚠️ Supabase configuration not available');
        return [];
      }

      const { data, error } = await supabase
        .rpc('get_pattern_correlations', {
          token_symbol: tokenSymbol,
          days_back: daysBack
        });

      if (error) {
        console.log('⚠️ Pattern correlations function not found');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pattern correlations:', error);
      return [];
    }
  }
}
