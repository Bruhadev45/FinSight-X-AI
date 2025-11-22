# 🔑 Step-by-Step Guide: Get All 5 Priority API Keys

**Time Required:** 15-20 minutes total
**Cost:** $0 (All FREE, no credit card needed!)

---

## 📋 Quick Checklist

- [ ] Alpha Vantage (stocks & portfolio)
- [ ] CoinGecko (crypto tracking)
- [ ] Reddit API (social sentiment)
- [ ] NewsAPI (company news)
- [ ] FRED (economic data)

---

## 1️⃣ Alpha Vantage (2 minutes)

**What you get:** Stock prices, technical indicators, portfolio tracking
**Free tier:** 500 requests/day, 5 requests/minute

### Steps:
1. Go to: https://www.alphavantage.co/support/#api-key
2. Scroll to "Get your free API key today"
3. Enter your email address
4. Click "GET FREE API KEY"
5. Copy the key that appears on the screen

**Your key looks like:** `ABCDEFGHIJK12345`

✅ **Paste here when done:**
```
ALPHA_VANTAGE_API_KEY=_________________
```

---

## 2️⃣ CoinGecko (1 minute - OPTIONAL)

**What you get:** 13,000+ cryptocurrencies, real-time prices, market data
**Free tier:** Works without API key! (50 calls/min with demo, 10-30/min without)

### Steps:
**Option A: No API key needed!**
- CoinGecko API works without authentication
- Just use: `https://api.coingecko.com/api/v3/...`
- We'll implement this first

**Option B: Get API key for higher limits (optional):**
1. Go to: https://www.coingecko.com/en/api
2. Click "Get Started" (free plan)
3. Sign up with email
4. Verify email
5. Get API key from dashboard

✅ **Status:**
```
COINGECKO_API_KEY=demo (or your key)
```

---

## 3️⃣ Reddit API (5 minutes)

**What you get:** r/wallstreetbets sentiment, trending stocks, social data
**Free tier:** 60 requests/minute, unlimited

### Steps:
1. Go to: https://www.reddit.com/prefs/apps
2. Log in to Reddit (or create free account)
3. Scroll to bottom, click "create another app..."
4. Fill in:
   - **Name:** FinSight AI
   - **App type:** Select "script"
   - **Description:** Financial sentiment analysis
   - **About URL:** http://localhost:3001
   - **Redirect URI:** http://localhost:3001/auth/callback
5. Click "create app"
6. Copy these values:

```
CLIENT ID: (under your app name - 14 characters)
SECRET: (longer key - ~27 characters)
```

✅ **Paste here:**
```
REDDIT_CLIENT_ID=_________________
REDDIT_CLIENT_SECRET=_________________
REDDIT_USER_AGENT=FinSightAI/1.0
```

**Important:** Reddit requires a User-Agent header!

---

## 4️⃣ NewsAPI (2 minutes)

**What you get:** 80,000+ news sources, business & finance category
**Free tier:** 100 requests/day, 1 request/second

### Steps:
1. Go to: https://newsapi.org/register
2. Fill in:
   - First Name
   - Email
   - Password
3. Click "Submit"
4. Check your email for confirmation
5. Confirm email
6. Log in to: https://newsapi.org/account
7. Copy your API key (shown at top)

**Your key looks like:** `1234abcd5678efgh9012ijkl3456mnop`

✅ **Paste here:**
```
NEWSAPI_KEY=_________________
```

---

## 5️⃣ FRED (Federal Reserve Economic Data) (3 minutes)

**What you get:** 820,000+ economic time series, GDP, inflation, rates
**Free tier:** Unlimited requests

### Steps:
1. Go to: https://fred.stlouisfed.org/docs/api/api_key.html
2. Click "Request API Key"
3. Log in or create free account:
   - Email
   - Password
4. Fill in API Key Request form:
   - **Name:** FinSight AI
   - **Organization:** (your name or company)
   - **Email:** (your email)
   - **Purpose:** Financial analysis and research
5. Click "Request API key"
6. You'll see your key immediately
7. Also check email for confirmation

**Your key looks like:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

✅ **Paste here:**
```
FRED_API_KEY=_________________
```

---

## 🎉 All Done! Now Add to .env File

Once you have all keys, update your `.env` file:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/finsight_db

# Authentication
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# AI & Vector Database
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX_NAME=finsight-documents
OPENAI_API_KEY=your-openai-api-key-here

# Twilio (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890

# Financial APIs
FMP_API_KEY=your-fmp-api-key-here
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key-here
POLYGON_API_KEY=your-polygon-api-key-here
NEWSAPI_KEY=your-newsapi-key-here
FRED_API_KEY=your-fred-api-key-here

# Optional APIs for differentiation
COINGECKO_API_KEY=demo
REDDIT_CLIENT_ID=your-reddit-client-id-here
REDDIT_CLIENT_SECRET=your-reddit-secret-here
REDDIT_USER_AGENT=FinSightAI/1.0
FRED_API_KEY=your_fred_key_here
```

---

## 🧪 Test Your API Keys

I'll create a test script to validate all connections:

```bash
bun run test:apis
```

This will check:
- ✅ All API keys are valid
- ✅ Rate limits are working
- ✅ Sample data can be fetched
- ✅ Error handling works

---

## 📊 What We'll Build With These APIs

### 1. Alpha Vantage → Portfolio Tracker
```
✓ Track unlimited stocks
✓ Real-time prices
✓ Gain/loss calculations
✓ Technical indicators (RSI, MACD)
✓ Performance charts
```

### 2. CoinGecko → Crypto Portfolio
```
✓ Bitcoin, Ethereum, 13,000+ coins
✓ Real-time crypto prices
✓ Market cap tracking
✓ Portfolio diversification
✓ DeFi protocol tracking
```

### 3. Reddit → Social Sentiment
```
✓ r/wallstreetbets trending stocks
✓ Meme stock detector
✓ Community sentiment scores
✓ Most mentioned tickers
✓ Retail investor mood
```

### 4. NewsAPI → News Intelligence
```
✓ Company-specific news
✓ Sector news tracking
✓ Breaking financial alerts
✓ Multi-source aggregation
✓ News sentiment analysis
```

### 5. FRED → Economic Dashboard
```
✓ GDP growth tracker
✓ Inflation indicators
✓ Interest rate monitor
✓ Unemployment trends
✓ Recession probability
```

---

## 🚨 Troubleshooting

### Alpha Vantage
**Problem:** "Invalid API key"
**Solution:** Check for typos, no spaces before/after

**Problem:** "API call frequency exceeded"
**Solution:** You're limited to 5 calls/minute, 500/day

### Reddit API
**Problem:** "401 Unauthorized"
**Solution:** Check client ID and secret are correct

**Problem:** "429 Too Many Requests"
**Solution:** You're limited to 60 requests/minute

### NewsAPI
**Problem:** "426 Upgrade Required"
**Solution:** You're on developer plan (100 requests/day limit)

**Problem:** "News too old"
**Solution:** Free tier limited to last 1 month of news

### FRED
**Problem:** "Invalid API key"
**Solution:** Make sure you confirmed email and key is active

---

## 🎯 Next Steps

**After getting all keys:**

1. ✅ Update .env file with all keys
2. ✅ Restart dev server: `bun run dev`
3. ✅ I'll create API wrapper services
4. ✅ I'll build test validation script
5. ✅ I'll implement all 5 features
6. ✅ You'll have a unique platform vs Hebbia!

---

## 📞 Ready?

**Once you have the keys, reply with:**

```
✅ ALPHA_VANTAGE_API_KEY=ABC123...
✅ COINGECKO_API_KEY=demo
✅ REDDIT_CLIENT_ID=xyz789...
✅ REDDIT_CLIENT_SECRET=secret123...
✅ NEWSAPI_KEY=news456...
✅ FRED_API_KEY=fred789...
```

**Or just say "KEYS ADDED" after updating .env**

Then I'll:
1. Create API services for each
2. Build test validation
3. Implement all 5 features
4. Show you the working features

**Estimated implementation time:** 3-4 hours for all features! 🚀

---

*Created: November 14, 2025*
*Strategy: Option B Differentiation - All FREE APIs*
