# 🔧 Token Columns Fix for Bitquery Integration

## Problem

The Bitquery data collection is failing with:
```
Error fetching tokens for market data update: {
  code: '42703',
  details: null,
  hint: null,
  message: 'column tokens.address does not exist'
}
```

## Root Cause

The `tokens` table in Supabase is missing two essential columns that the Bitquery system expects:
- `address` - Solana token address
- `create_tx` - Transaction signature that created the token

## ✅ Solution Implemented

### **1. Updated Database Schema**

**Added missing columns to `tokens` table**:
```sql
ALTER TABLE tokens 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS create_tx TEXT;
```

**Added indexes for performance**:
```sql
CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address);
CREATE INDEX IF NOT EXISTS idx_tokens_create_tx ON tokens(create_tx);
```

### **2. Updated Schema File**

The `supabase_schema.sql` file has been updated to include these columns in the table definition:

```sql
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    uri TEXT UNIQUE NOT NULL,
    name TEXT,
    symbol TEXT,
    description TEXT,
    image_url TEXT,
    address TEXT, -- Solana token address
    create_tx TEXT, -- Transaction signature that created the token
    market_cap DECIMAL(20,2),
    total_supply BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);
```

## 🚀 How to Apply the Fix

### **Option 1: Run Migration Script (Recommended)**

1. **Go to your Supabase SQL Editor**
2. **Run the migration script**:
   ```sql
   -- Copy and paste the contents of add_missing_token_columns.sql
   ```

### **Option 2: Manual SQL Commands**

Run these commands in your Supabase SQL Editor:

```sql
-- Add missing columns
ALTER TABLE tokens 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS create_tx TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address);
CREATE INDEX IF NOT EXISTS idx_tokens_create_tx ON tokens(create_tx);
```

### **Option 3: Recreate Database (If No Important Data)**

If you don't have important data in the `tokens` table, you can:
1. Drop the table: `DROP TABLE tokens CASCADE;`
2. Run the updated `supabase_schema.sql` file

## 🧪 Test the Fix

### **1. Verify Columns Exist**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tokens' 
AND column_name IN ('address', 'create_tx')
ORDER BY column_name;
```

**Expected output**:
```
column_name | data_type | is_nullable
------------|-----------|------------
address     | text      | YES
create_tx   | text      | YES
```

### **2. Test Bitquery Data Collection**
```bash
cd bitquery
node index.mjs
```

**Expected output**:
```
🚀 Starting Bitquery data collection...

📈 Step 1: Fetching and pushing memecoins...
Starting memecoins fetch...
Making request to Bitquery...
Response received, processing data...
Results saved to: C:\Users\XPS\xorox\bitquery\results\memecoins\next-memecoins-1759792822678.json
NEW MEMECOINS METADATA
{
  sinceTimestamp: '2025-10-06T23:13:13.000Z',
  latestFetchTimestamp: '2025-10-06T23:17:16Z'
}
PUSHING TO SUPABASE
Number of instructions: 44
Data successfully pushed to Supabase! ✅

💰 Step 2: Fetching and pushing prices...
[Price data collection...]

📊 Step 3: Fetching and pushing market data...
📊 Found X tokens to update with market data
[Market data collection...]

✅ All data collection completed successfully!
```

## 📊 What This Fixes

### **1. Memecoin Data Collection**
- ✅ **Token addresses** - Now stored for blockchain queries
- ✅ **Creation transactions** - Track token creation history
- ✅ **Market data updates** - Can fetch price/supply data using addresses

### **2. Market Data Integration**
- ✅ **Price fetching** - Uses token addresses to get current prices
- ✅ **Supply tracking** - Monitors total supply changes
- ✅ **Market cap calculation** - Combines price and supply data

### **3. Database Consistency**
- ✅ **Schema alignment** - Bitquery code matches database structure
- ✅ **Index optimization** - Fast queries on address and transaction fields
- ✅ **Data integrity** - Proper column types and constraints

## 🎯 Next Steps

After applying the fix:

1. **Run data collection**: `node index.mjs`
2. **Check results**: Look in `results/memecoins/` for JSON files
3. **Verify Supabase**: Check your Supabase dashboard for new tokens with addresses
4. **Monitor market data**: Watch for price and supply updates

## 🔧 Troubleshooting

### **Still Getting Column Errors?**

1. **Check column names**: Ensure `address` and `create_tx` columns exist
2. **Check permissions**: Make sure your Supabase user can alter tables
3. **Check syntax**: Ensure SQL commands are properly formatted
4. **Check constraints**: Some databases might have naming restrictions

### **Data Collection Still Failing?**

1. **Check environment variables**: Ensure `.env` file is properly configured
2. **Check API keys**: Verify Bitquery credentials are correct
3. **Check network**: Ensure internet connection is stable
4. **Check logs**: Look for specific error messages in the console

**Your Bitquery integration should now work perfectly with the complete token data!** 🚀
