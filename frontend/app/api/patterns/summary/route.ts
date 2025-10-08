export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest): Promise<Response> {
  try {
    console.log('📊 Fetching pattern summary...');

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Supabase configuration not available',
        data: {
          patternSummary: [],
          topTokens: [],
          insightsSummary: [],
          predictionsSummary: []
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get pattern summary from database
    const { data: patternSummary, error: patternError } = await supabase
      .from('pattern_summary')
      .select('*')
      .order('detection_count', { ascending: false });

    if (patternError) {
      console.log('⚠️ Pattern summary table not found, using empty data');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Pattern summary table not available',
        timestamp: new Date().toISOString()
      });
    }

    // Get top pattern tokens
    const { data: topTokens, error: tokensError } = await supabase
      .from('top_pattern_tokens')
      .select('*')
      .order('pattern_count', { ascending: false })
      .limit(10);

    // Get pattern insights summary
    const { data: insightsSummary, error: insightsError } = await supabase
      .from('pattern_insights_summary')
      .select('*')
      .order('insight_count', { ascending: false });

    // Get pattern predictions summary
    const { data: predictionsSummary, error: predictionsError } = await supabase
      .from('pattern_predictions_summary')
      .select('*')
      .order('prediction_count', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        patternSummary: patternSummary || [],
        topTokens: topTokens || [],
        insightsSummary: insightsSummary || [],
        predictionsSummary: predictionsSummary || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pattern summary API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pattern summary',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
