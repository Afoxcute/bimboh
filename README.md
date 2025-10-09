# 🚀 Bimboh - The Ultimate Memecoin Hunter

<div align="center">
  <img src="frontend/public/bomboh.png" alt="Bimboh Logo" width="120" height="120" style="border-radius: 50%;">
  
  **An autonomous AI-powered agent that hunts for trending memecoins on TikTok and provides real-time analytics**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
  [![Solana](https://img.shields.io/badge/Solana-Blockchain-purple?style=flat-square&logo=solana)](https://solana.com/)
</div>

## 🎯 Overview

Bimboh is a comprehensive memecoin hunting platform that combines social media intelligence, blockchain data analysis, and AI-powered insights to identify the next viral memecoins before they explode. The platform monitors TikTok trends, Telegram channels, and Solana blockchain activity to provide real-time alerts and market analysis.

## ✨ Features

### 🔍 **Multi-Platform Data Collection**
- **TikTok Scraping**: Python (Selenium) and Node.js (Puppeteer) scrapers
- **Telegram Monitoring**: Real-time channel monitoring and message analysis
- **Outlight Integration**: Automated discovery of new Telegram channels
- **Blockchain Data**: Solana token prices, volume, and market data via Bitquery

### 🤖 **AI-Powered Analysis**
- **Content Analysis**: Sentiment analysis, trend detection, and classification
- **Pattern Recognition**: Advanced AI algorithms to identify market patterns
- **Risk Assessment**: Intelligent risk evaluation for trading opportunities
- **Real-time Decision Making**: Automated decision agents for market opportunities

### 📊 **Real-time Dashboard**
- **Live TikTok Feed**: Real-time TikTok video monitoring
- **Telegram Channels**: Channel activity and message tracking
- **Market Analytics**: Price charts, volume analysis, and trend indicators
- **Pattern Insights**: AI-generated market pattern analysis

### 🐦 **Social Media Integration**
- **Twitter Bot**: Automated posting of alerts and market analysis
- **Memory System**: Context-aware tweet generation
- **Performance Tracking**: Social media engagement analytics

## 🏗️ Architecture

```
bimboh/
├── frontend/          # Next.js React application
├── js-scraper/        # Node.js scrapers and ADK agents
├── bitquery/          # Solana blockchain data collection
├── scraper/           # Python TikTok scraper
├── twitter/           # Twitter bot and automation
└── database/          # Supabase database schemas
```

### **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, ShadCN/UI | User interface and dashboard |
| **Backend** | Node.js, ADK-TS, Supabase | API, data processing, AI agents |
| **Database** | Supabase (PostgreSQL) | Data storage and real-time updates |
| **Blockchain** | Solana Web3.js, Bitquery API | Token data and market information |
| **Scraping** | Python Selenium, Node.js Puppeteer | Social media data collection |
| **AI/ML** | OpenAI GPT-3.5-turbo, ADK-TS | Content analysis and pattern recognition |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.8+
- Supabase account
- Solana RPC endpoint
- TikTok/Telegram API access (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bimboh.git
   cd bimboh
   ```

2. **Install dependencies**
   ```bash
   yarn install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp frontend/env-template.txt frontend/.env.local
   cp js-scraper/env-template.txt js-scraper/.env
   cp bitquery/env-template.txt bitquery/.env
   ```

4. **Configure Supabase**
   - Create a new Supabase project
   - Run the database setup scripts
   ```bash
   cd frontend
   yarn setup-db
   ```

5. **Start the development server**
   ```bash
   yarn dev
   ```

6. **Start the scrapers** (in separate terminals)
   ```bash
   # TikTok scraper
   cd scraper
   python main.py

   # Node.js scrapers
   cd js-scraper
   node adk_workflow_orchestrator.mjs

   # Blockchain data
   cd bitquery
   node scripts/prices.mjs
   ```

## 📖 Usage

### **Dashboard Features**

1. **Home Page**: Overview of trending memecoins and market activity
2. **TikTok Feed**: Real-time TikTok video monitoring with engagement metrics
3. **Telegram Channels**: Channel activity and message analysis
4. **Trending Coins**: Market analysis with price charts and volume data
5. **Pattern Recognition**: AI-powered market pattern analysis
6. **Analytics**: Comprehensive market insights and predictions

### **AI Agents**

The platform includes several specialized AI agents:

- **Content Analysis Agent**: Analyzes TikTok content for memecoin mentions
- **Trend Detection Agent**: Identifies emerging trends and patterns
- **Risk Assessment Agent**: Evaluates trading opportunities and risks
- **Pattern Recognition Agent**: Detects complex market patterns
- **Decision Making Agent**: Makes real-time trading decisions
- **Twitter Automation Agent**: Manages social media posting

### **Data Sources**

- **TikTok**: Video content, engagement metrics, hashtags
- **Telegram**: Channel messages, member counts, activity levels
- **Solana Blockchain**: Token prices, volume, market cap, trading data
- **Outlight**: New channel discovery and trending topics

## 🔧 Configuration

### **Environment Variables**

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
BITQUERY_API_KEY=your_bitquery_api_key
SOLANA_RPC_URL=your_solana_rpc_url
```

### **Database Setup**

The platform uses Supabase with the following main tables:
- `tokens` - Token information and metadata
- `prices` - Price and volume data
- `tiktoks` - TikTok video data
- `telegram_channels` - Telegram channel information
- `telegram_messages` - Telegram message data
- `pattern_analysis` - AI pattern recognition results
- `risk_assessments` - Risk analysis data

## 📊 API Endpoints

### **Frontend API Routes**
- `GET /api/tiktoks` - TikTok data
- `GET /api/telegram-channels` - Telegram channel data
- `GET /api/trending-coins` - Trending token data
- `GET /api/pattern-analysis` - Pattern recognition results
- `GET /api/market-data` - Market analytics

### **Real-time Updates**
- WebSocket connections for live data updates
- Server-sent events for real-time notifications
- Supabase real-time subscriptions

## 🤖 AI Integration

### **ADK-TS Framework**
The platform uses the Agent Development Kit for TypeScript to orchestrate AI agents:

- **Multi-Agent Workflows**: Coordinated AI agent execution
- **Custom Tools**: Specialized tools for data analysis
- **Memory Management**: Context-aware agent interactions
- **Error Handling**: Robust error recovery and retry logic

### **Pattern Recognition**
Advanced AI algorithms identify:
- Volume patterns
- Sentiment trends
- Price movements
- Social media correlation
- Market anomalies
- Momentum indicators

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
cd frontend
yarn build
# Deploy to Vercel
```

### **Backend (Railway/Render)**
```bash
# Deploy Node.js scrapers
# Deploy Python scrapers
# Configure environment variables
```

### **Database (Supabase)**
- Production Supabase instance
- Configure RLS policies
- Set up real-time subscriptions
- Monitor performance

## 📈 Monitoring

### **Health Checks**
- Scraper status monitoring
- Database connection health
- API endpoint availability
- Real-time data flow

### **Analytics**
- User engagement metrics
- Scraper performance data
- AI agent accuracy tracking
- Market prediction success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Document new features
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ADK-TS** - Agent Development Kit for TypeScript
- **Supabase** - Backend-as-a-Service platform
- **Next.js** - React framework
- **TailwindCSS** - Utility-first CSS framework
- **Solana** - High-performance blockchain
- **OpenAI** - AI language models

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discord**: Join our community for discussions
- **Twitter**: Follow [@bimboh_app](https://x.com/bimboh_app) for updates

---

<div align="center">
  <p><strong>Built with ❤️ by the Bimboh Team</strong></p>
  <p>Hunt the next moonshot 🚀</p>
</div>
