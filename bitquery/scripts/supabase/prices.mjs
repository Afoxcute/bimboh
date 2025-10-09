import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";

// Polyfill for Node.js compatibility
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

// Set global fetch and Headers for Supabase compatibility
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

export async function pushPrices(filePath, dataJson) {
  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing SUPABASE_URL or SUPABASE_KEY in environment variables"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const sanitize = (str) => (str ? str.replace(/\u0000/g, "") : str);
  try {
    // Read JSON file
    const tokens =
      filePath.length > 0
        ? JSON.parse(await fs.readFile(filePath, "utf8"))
        : dataJson;

    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    const priceDataArray = [];

    // Group trades by token URI to calculate volume
    const tradesByUri = {};
    
    for (const priceData of tokens.data.Solana.DEXTrades) {
      if (!priceData.Trade?.Buy?.Currency?.Uri) {
        console.warn("Skipping record with missing URI");
        continue;
      }

      const uri = priceData.Trade.Buy.Currency.Uri;
      if (!tradesByUri[uri]) {
        tradesByUri[uri] = {
          trades: [],
          totalVolumeUSD: 0,
          latestPrice: priceData.Trade.Buy.Price,
          latestPriceUSD: priceData.Trade.Buy.PriceInUSD,
          latestTime: priceData.Block.Time,
          mint_address: priceData.Trade.Buy.Currency.MintAddress,
          name: priceData.Trade.Buy.Currency.Name,
          symbol: priceData.Trade.Buy.Currency.Symbol
        };
      }
      
      // Add trade to the group
      tradesByUri[uri].trades.push(priceData);
      
      // Calculate volume (assuming PriceInUSD represents the trade value)
      const tradeValue = parseFloat(priceData.Trade.Buy.PriceInUSD || 0);
      tradesByUri[uri].totalVolumeUSD += tradeValue;
      
      // Keep track of the latest price and time
      if (new Date(priceData.Block.Time) > new Date(tradesByUri[uri].latestTime)) {
        tradesByUri[uri].latestPrice = priceData.Trade.Buy.Price;
        tradesByUri[uri].latestPriceUSD = priceData.Trade.Buy.PriceInUSD;
        tradesByUri[uri].latestTime = priceData.Block.Time;
      }
    }

    // Convert grouped data to price data array
    for (const [uri, tokenData] of Object.entries(tradesByUri)) {
      priceDataArray.push({
        price_sol: tokenData.latestPrice,
        price_usd: tokenData.latestPriceUSD,
        created_at: sanitize(tokenData.latestTime),
        uri: uri,
        mint_address: tokenData.mint_address,
        name: tokenData.name,
        symbol: tokenData.symbol,
        block_time: tokenData.latestTime,
        volume_24h: tokenData.totalVolumeUSD, // Add calculated volume
        trade_count: tokenData.trades.length // Add trade count for debugging
      });
    }

    console.log(
      `Processing ${priceDataArray.length} records in batches of ${batchSize}...`
    );
    
    // Debug: Show volume calculations
    priceDataArray.forEach((item, index) => {
      console.log(`📊 Token ${index + 1}: ${item.symbol} - Volume: $${item.volume_24h?.toFixed(2) || 0} (${item.trade_count || 0} trades)`);
    });

    // Process in batche

    for (let i = 0; i < priceDataArray.length; i += batchSize) {
      const batch = priceDataArray.slice(i, i + batchSize);
      const uris = batch.map((priceData) => priceData.uri);
      const { data: tokensData, error: tokensError } = await supabase
        .from("tokens")
        .select("id, uri")
        .in("uri", uris);

      if (tokensError) {
        console.error("Error fetching tokens:", tokensError);
        return;
      }

      const uriToTokenId = tokensData.reduce((map, token) => {
        map[token.uri] = token.id;
        return map;
      }, {});
      const updates = [];
      const missingUris = [];

      batch.forEach((item) => {
        const tokenId = uriToTokenId[item.uri];
        if (tokenId) {
          updates.push({
            token_id: tokenId,
            token_uri: item.uri,
            price_usd: item.price_usd,
            price_sol: item.price_sol,
            trade_at: item.created_at,
            timestamp: item.block_time,
            is_latest: true,
            volume_24h: item.volume_24h || 0, // Add volume_24h field
          });
        } else {
          missingUris.push(item.uri);
        }
      });
      
      // Update tokens table with market cap and last_updated if we have the data
      if (updates.length > 0) {
        for (const update of updates) {
          const item = batch.find(b => b.uri === update.token_uri);
          if (item && (item.name || item.symbol)) {
            const tokenUpdate = {};
            if (item.name) tokenUpdate.name = item.name;
            if (item.symbol) tokenUpdate.symbol = item.symbol;
            tokenUpdate.last_updated = item.block_time;
            
            // Update the token record
            supabase
              .from("tokens")
              .update(tokenUpdate)
              .eq("id", update.token_id)
              .then(({ error }) => {
                if (error) {
                  console.warn(`Warning: Could not update token ${update.token_id}:`, error);
                }
              });
          }
        }
      }
      const { data, error } = await supabase
        .from("prices")
        .upsert(updates, { 
          onConflict: 'token_uri,timestamp',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error updating batch starting at index ${i}:`, error);
      } else {
        console.log(`Batch starting at index ${i} updated successfully:`, data);
      }
    }
  } catch (error) {
    console.error("Error processing prices:", error);
    throw error;
  }
}

// pushPrices("./results/prices/prices-1734677849982.json")
//   .catch(console.error)
//   .finally(() => {
//     console.log("Update prices completed");
//   });
