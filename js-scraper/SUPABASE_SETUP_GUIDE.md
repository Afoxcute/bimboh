# 🗄️ Supabase Database Setup Guide

## Overview

This guide will help you set up your new Supabase database with the complete schema for the Iris memecoin hunting platform.

## 🚀 Quick Setup

### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### **Step 2: Run the Schema**

1. Copy the entire contents of `supabase_schema.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the schema

### **Step 3: Verify Installation**

Run this query to verify the schema was created successfully:

```sql
SELECT get_schema_version();
```

Expected result: `1.0.0`

## 📊 What Gets Created

### **Core Tables (15 tables)**

1. **`tokens`** - All discovered memecoins
2. **`tiktoks`** - TikTok videos and engagement data
3. **`telegram_channels`** - Discovered Telegram channels
4. **`telegram_messages`** - Scraped Telegram messages
5. **`mentions`** - Cross-platform token mentions
6. **`prices`** - Token price data
7. **`pattern_analysis_results`** - Pattern analysis results
8. **`pattern_correlations`** - Correlation data
9. **`trending_keywords`** - Trending keyword tracking
10. **`twitter_alerts`** - Twitter automation data
11. **`workflow_sessions`** - ADK workflow sessions
12. **`workflow_executions`** - Workflow execution tracking
13. **`agent_performance`** - ADK agent performance metrics
14. **`users`** - User management
15. **`subscriptions`** - BONK token subscriptions

### **Supporting Tables (3 tables)**

16. **`daily_analytics`** - Daily platform statistics
17. **`performance_metrics`** - System performance tracking
18. **Sample data** - Initial test data

### **Views (2 views)**

- **`trending_tokens`** - Trending tokens with social metrics
- **`daily_platform_stats`** - Daily platform statistics

## 🔧 Environment Variables

After setting up the database, update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration (for ADK agents)
OPENAI_API_KEY=your-openai-api-key

# Twitter Configuration (optional)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_SECRET=your-twitter-access-secret
```

## 🧪 Testing the Setup

### **Test Database Connection**

```bash
cd js-scraper
npm run test-connection
```

### **Test ADK Workflow**

```bash
npm run adk-test
```

### **Run Complete Workflow**

```bash
npm run adk-workflow
```

## 📈 Sample Queries

### **Check Trending Tokens**

```sql
SELECT * FROM trending_tokens LIMIT 10;
```

### **View Daily Statistics**

```sql
SELECT * FROM daily_platform_stats ORDER BY date DESC LIMIT 7;
```

### **Check Workflow Sessions**

```sql
SELECT * FROM workflow_sessions ORDER BY created_at DESC LIMIT 5;
```

### **View Recent Mentions**

```sql
SELECT 
    t.symbol,
    t.name,
    m.source,
    m.mention_at,
    m.count
FROM mentions m
JOIN tokens t ON m.token_id = t.id
ORDER BY m.mention_at DESC
LIMIT 20;
```

## 🔍 Database Features

### **Indexes**
- **Performance optimized** with 40+ indexes
- **Full-text search** on message content
- **GIN indexes** for JSONB and array fields
- **Composite indexes** for common query patterns

### **Triggers**
- **Automatic timestamps** on `updated_at` fields
- **Session cleanup** for expired workflows
- **Data validation** and consistency checks

### **Security**
- **Row Level Security (RLS)** enabled on user tables
- **Proper foreign key constraints**
- **Data validation** and integrity checks

### **Analytics**
- **Pre-built views** for common queries
- **Performance metrics** tracking
- **Daily analytics** aggregation
- **Trend analysis** capabilities

## 🚨 Important Notes

### **Database Size**
- The schema is designed for **high-volume data**
- **Partitioning** may be needed for very large datasets
- **Archiving** old data is recommended for production

### **Performance**
- **Indexes** are optimized for common query patterns
- **JSONB fields** provide flexibility for metadata
- **Views** simplify complex queries

### **Backup**
- **Enable automatic backups** in Supabase
- **Export data** regularly for important datasets
- **Test restore procedures** periodically

## 🔄 Maintenance

### **Regular Tasks**

1. **Monitor performance metrics**
2. **Clean up expired sessions**
3. **Archive old data**
4. **Update statistics**

### **Performance Monitoring**

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Session Cleanup**

```sql
-- Clean up expired sessions
SELECT cleanup_expired_sessions();
```

## 🎉 Success Verification

After running the schema, you should see:

- ✅ **15 main tables** created
- ✅ **40+ indexes** created
- ✅ **2 views** created
- ✅ **Sample data** inserted
- ✅ **Functions and triggers** working
- ✅ **Schema version** returns `1.0.0`

## 🆘 Troubleshooting

### **Common Issues**

1. **Permission Errors**: Ensure you're using the service role key
2. **Timeout Errors**: Run the schema in smaller chunks
3. **Index Errors**: Some indexes may take time to create

### **Reset Database**

If you need to start over:

```sql
-- Drop all tables (CAUTION: This deletes all data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then re-run the schema.

## 📚 Next Steps

1. **Run the schema** in Supabase SQL Editor
2. **Update environment variables** in your `.env` file
3. **Test the connection** with `npm run test-connection`
4. **Run the ADK workflow** with `npm run adk-workflow`
5. **Monitor the dashboard** for data collection

Your Supabase database is now ready to support the complete Iris memecoin hunting platform! 🚀
