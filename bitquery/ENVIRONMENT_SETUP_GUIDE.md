# 🔧 Bitquery Environment Setup Guide

## Problem

The Bitquery data collection is failing with:
```
Missing SUPABASE_URL or SUPABASE_KEY in environment variables
```

## ✅ Solution

### **Option 1: Create Local .env File (Recommended)**

1. **Copy the template**:
   ```bash
   cd bitquery
   copy env-template.txt .env
   ```

2. **Edit the .env file** with your actual credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_SECRET=your_actual_anon_key_here
   
   # Bitquery API Configuration
   BITQUERY_API_KEY=your_actual_bitquery_api_key
   ACCESS_TOKEN=your_actual_access_token
   
   # Environment
   NODE_ENV=development
   ```

### **Option 2: Use Parent Directory .env**

The scripts have been updated to automatically look for `.env` files in:
- `bitquery/.env` (current directory)
- `../.env` (parent directory)
- `../../.env` (grandparent directory)

So you can also create a `.env` file in the root directory (`xorox/.env`) with the same content.

## 🚀 How to Get Your Credentials

### **Supabase Credentials**

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy the following**:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public key** → Use as `SUPABASE_ANON_SECRET`

### **Bitquery API Credentials**

1. **Go to [Bitquery.io](https://bitquery.io)**
2. **Sign up/Login to your account**
3. **Navigate to API Keys section**
4. **Copy the following**:
   - **API Key** → Use as `BITQUERY_API_KEY`
   - **Access Token** → Use as `ACCESS_TOKEN`

## 🧪 Test the Setup

### **1. Test Environment Variables**
```bash
cd bitquery
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'); console.log('SUPABASE_ANON_SECRET:', process.env.SUPABASE_ANON_SECRET ? '✅ Set' : '❌ Missing');"
```

### **2. Test Bitquery Connection**
```bash
cd bitquery
node test-api-connection.mjs
```

### **3. Run Data Collection**
```bash
cd bitquery
node index.mjs
```

## 📊 Expected Output

After setting up the environment variables, you should see:

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
[Market data collection...]

✅ All data collection completed successfully!
```

## 🔧 Troubleshooting

### **Still Getting "Missing SUPABASE_URL" Error?**

1. **Check file location**: Make sure `.env` is in the `bitquery/` directory
2. **Check file format**: Ensure no extra spaces or quotes around values
3. **Restart terminal**: Close and reopen your terminal/command prompt
4. **Check permissions**: Make sure the `.env` file is readable

### **Bitquery API Errors?**

1. **Check API key format**: Should be a long string without quotes
2. **Check access token**: Should be a valid JWT token
3. **Check API limits**: Ensure you haven't exceeded your API quota
4. **Test connection**: Run `node test-api-connection.mjs` first

### **Supabase Connection Errors?**

1. **Check URL format**: Should be `https://your-project.supabase.co`
2. **Check anon key**: Should be the public anon key, not the service role key
3. **Check project status**: Ensure your Supabase project is active
4. **Check database schema**: Ensure the `tokens` table exists

## 🎯 Next Steps

Once the environment is set up:

1. **Run data collection**: `node index.mjs`
2. **Check results**: Look in `results/memecoins/` for JSON files
3. **Verify Supabase**: Check your Supabase dashboard for new tokens
4. **Set up automation**: Consider running this as a scheduled task

## 📝 Environment File Template

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bitquery API Configuration
BITQUERY_API_KEY=your_bitquery_api_key_here
ACCESS_TOKEN=your_access_token_here

# Environment
NODE_ENV=development
```

**Your Bitquery data collection should now work perfectly!** 🚀
