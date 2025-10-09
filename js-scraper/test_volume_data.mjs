import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testVolumeData() {
  try {
    console.log('🔍 Testing volume data from Supabase...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    // Get recent price data from last 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    
    const { data: recentPrices, error } = await supabase
      .from('prices')
      .select(`
        *,
        tokens!fk_prices_token_uri (
          name,
          symbol,
          uri
        )
      `)
      .gte('trade_at', threeHoursAgo.toISOString())
      .order('trade_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    
    if (!recentPrices || recentPrices.length === 0) {
      console.log('❌ No recent price data found');
      return;
    }

    console.log(`✅ Found ${recentPrices.length} recent price records`);
    
    // Show sample data
    recentPrices.forEach((price, index) => {
      console.log(`\n📊 Record ${index + 1}:`);
      console.log(`  Token: ${price.tokens?.symbol} (${price.tokens?.name})`);
      console.log(`  URI: ${price.tokens?.uri}`);
      console.log(`  Volume 24h: $${price.volume_24h || 0}`);
      console.log(`  Price SOL: ${price.price_sol || 0}`);
      console.log(`  Trade At: ${price.trade_at}`);
    });
    
    // Group by token and analyze
    const tokenPrices = {};
    recentPrices.forEach(price => {
      if (price.tokens?.uri) {
        if (!tokenPrices[price.tokens.uri]) {
          tokenPrices[price.tokens.uri] = [];
        }
        tokenPrices[price.tokens.uri].push(price);
      }
    });
    
    console.log(`\n🔍 Analyzing ${Object.keys(tokenPrices).length} tokens...`);
    
    for (const [tokenUri, prices] of Object.entries(tokenPrices)) {
      if (prices.length < 2) continue;
      
      // Sort by timestamp (newest first)
      prices.sort((a, b) => new Date(b.trade_at) - new Date(a.trade_at));
      
      const currentVolume = parseFloat(prices[0].volume_24h || 0);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const olderPrices = prices.filter(p => new Date(p.trade_at) <= twoHoursAgo);
      
      if (olderPrices.length === 0) continue;
      
      const previousVolume = parseFloat(olderPrices[0].volume_24h || 0);
      const volumeGrowth = currentVolume - previousVolume;
      const growthRate = previousVolume > 0 ? 
        ((currentVolume - previousVolume) / previousVolume) * 100 : 0;
      
      console.log(`\n📈 ${prices[0].tokens?.symbol}:`);
      console.log(`  Current Volume: $${currentVolume.toFixed(2)}`);
      console.log(`  Previous Volume: $${previousVolume.toFixed(2)}`);
      console.log(`  Volume Growth: $${volumeGrowth.toFixed(2)}`);
      console.log(`  Growth Rate: ${growthRate.toFixed(1)}%`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testVolumeData();
