# Pattern Recognition Database Setup Guide

## Issue
You're seeing the warning: `⚠️ Pattern summary table not found, using empty data`

This happens because the pattern recognition database tables haven't been created yet.

## Solution

### Step 1: Run the Pattern Recognition Schema

1. **Open your Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to the **SQL Editor**

2. **Create the Pattern Recognition Tables**
   - Copy the contents of `js-scraper/pattern_recognition_schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the schema

### Step 2: Verify the Setup

After running the schema, you should have these new tables and views:

**Tables:**
- `pattern_detections` - Stores detected patterns
- `pattern_insights` - AI-generated insights
- `pattern_predictions` - AI predictions
- `volume_patterns` - Volume-specific patterns
- `sentiment_patterns` - Sentiment-specific patterns
- `price_patterns` - Price-specific patterns
- `social_patterns` - Social media patterns
- `correlation_patterns` - Cross-platform correlations
- `pattern_accuracy` - Pattern accuracy tracking
- `pattern_performance` - Performance metrics
- `pattern_models` - AI model configurations
- `pattern_features` - Feature engineering data

**Views:**
- `pattern_summary` - Summary statistics (this is what was missing)
- `top_pattern_tokens` - Top tokens by pattern count
- `pattern_accuracy_summary` - Accuracy statistics
- `pattern_performance_summary` - Performance metrics

### Step 3: Test the Setup

1. **Restart your frontend development server:**
   ```bash
   cd frontend
   yarn dev
   ```

2. **Check the dashboard:**
   - Navigate to `/dashboard`
   - The pattern recognition section should now show data instead of the warning

### Step 4: Run Pattern Recognition

Once the database is set up, you can run the pattern recognition system:

```bash
cd js-scraper
yarn pattern-recognition
```

## Alternative: Quick Setup Script

If you prefer, you can also run this command to set up the database:

```bash
cd js-scraper
yarn setup-pattern-schema
```

This will display the SQL commands you need to run in Supabase.

## Expected Results

After setup, you should see:
- ✅ Pattern recognition data loading in the dashboard
- ✅ No more "table not found" warnings
- ✅ Pattern summary statistics displayed
- ✅ AI-powered insights and predictions available

## Troubleshooting

If you still see issues:

1. **Check Supabase Connection:**
   - Verify your environment variables are set correctly
   - Test the connection in the Supabase dashboard

2. **Verify Schema Execution:**
   - Check that all tables were created successfully
   - Look for any error messages in the SQL Editor

3. **Check Permissions:**
   - Ensure your Supabase user has the necessary permissions
   - Verify RLS (Row Level Security) policies if enabled

## Next Steps

Once the pattern recognition database is set up:

1. **Run the ADK Workflow** to start collecting data
2. **Enable Pattern Recognition** to begin AI analysis
3. **Monitor the Dashboard** for real-time insights
4. **Set up Decision Making** for automated actions

The pattern recognition system will then start analyzing your data and providing AI-powered insights about memecoin trends and opportunities.
