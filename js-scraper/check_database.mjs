import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for any price data...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    // Get any price data (no time filter)
    const { data: allPrices, error: allError } = await supabase
      .from('prices')
      .select(`
        *,
        tokens!fk_prices_token_uri (
          name,
          symbol,
          uri
        )
      `)
      .order('trade_at', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Supabase error:', allError);
      return;
    }
    
    if (!allPrices || allPrices.length === 0) {
      console.log('❌ No price data found in database at all');
      return;
    }

    console.log(`✅ Found ${allPrices.length} price records in database`);
    
    // Show sample data
    allPrices.forEach((price, index) => {
      console.log(`\n📊 Record ${index + 1}:`);
      console.log(`  Token: ${price.tokens?.symbol} (${price.tokens?.name})`);
      console.log(`  URI: ${price.tokens?.uri}`);
      console.log(`  Volume 24h: $${price.volume_24h || 0}`);
      console.log(`  Price SOL: ${price.price_sol || 0}`);
      console.log(`  Trade At: ${price.trade_at}`);
    });
    
    // Check for recent data (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentPrices, error: recentError } = await supabase
      .from('prices')
      .select('*')
      .gte('trade_at', oneDayAgo.toISOString())
      .order('trade_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('❌ Recent data error:', recentError);
    } else {
      console.log(`\n📅 Recent data (last 24h): ${recentPrices?.length || 0} records`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabase();
