# 🚀 Quick Guide: Get Your 4 Remaining API Keys

**Status:** ✅ Alpha Vantage DONE | ⏳ 4 more to go

---

## 📋 What You Still Need

| API | Use Case | Time | Required? |
|-----|----------|------|-----------|
| CoinGecko | Crypto tracking | 0 min | ❌ Optional |
| Reddit | Social sentiment | 5 min | ✅ Recommended |
| NewsAPI | Financial news | 2 min | ✅ Recommended |
| FRED | Economic data | 3 min | ✅ Recommended |

---

## 1️⃣ CoinGecko (SKIP FOR NOW - Works Without Key!)

**Good news:** CoinGecko works WITHOUT an API key!

```bash
# Already set in your .env:
COINGECKO_API_KEY=demo
```

✅ **You're done! No action needed.**

---

## 2️⃣ Reddit API (5 minutes) - **DO THIS**

### Quick Steps:

**Step 1:** Open this link: https://www.reddit.com/prefs/apps
- Log in to your Reddit account (or create one - it's free)

**Step 2:** Scroll to bottom, click **"create another app..."**

**Step 3:** Fill in the form:
```
Name: FinSight AI
App type: ● script (select this radio button)
Description: Social sentiment analysis
About URL: http://localhost:3001
Redirect URI: http://localhost:3001/callback
```

**Step 4:** Click **"create app"**

**Step 5:** Copy these 2 values:

```
📋 CLIENT ID: (14 characters, under your app name)
Example: Xy7_a4B9mN2pQr

📋 SECRET: (27 characters, next to "secret:")
Example: AbC123dEf456GhI789jKl012MnO
```

✅ **Paste your values:**
```
REDDIT_CLIENT_ID=_________________
REDDIT_CLIENT_SECRET=_________________
```

**Screenshot help:**
- Client ID is right under "FinSight AI" in small text
- Secret is on the line that says "secret: [your secret]"

---

## 3️⃣ NewsAPI (2 minutes) - **DO THIS**

### Quick Steps:

**Step 1:** Open: https://newsapi.org/register

**Step 2:** Fill in:
```
First Name: [Your name]
Email: [Your email]
Password: [Create a password]
```

**Step 3:** Click **"Submit"**

**Step 4:** Check your email for confirmation link

**Step 5:** Click confirmation link

**Step 6:** Go to: https://newsapi.org/account
- Your API key is shown at the top of the page

✅ **Paste your key:**
```
NEWSAPI_KEY=_________________
```

**Key looks like:** `abcd1234efgh5678ijkl9012mnop3456`

---

## 4️⃣ FRED API (3 minutes) - **DO THIS**

### Quick Steps:

**Step 1:** Open: https://fred.stlouisfed.org/docs/api/api_key.html

**Step 2:** Click **"Request API Key"** button

**Step 3:** Log in or create account:
```
Email: [Your email]
Password: [Create password]
```

**Step 4:** Fill in API Key Request:
```
Name: FinSight AI
Organization: [Your name or company]
Email: [Your email]
Purpose: Financial research and analysis
```

**Step 5:** Click **"Request API key"**

**Step 6:** Copy your key from the confirmation page
- Also check email for the key

✅ **Paste your key:**
```
FRED_API_KEY=_________________
```

**Key looks like:** `a1b2c3d4e5f6789012345678901234ab`

---

## ✅ Once You Have All Keys

**Update your .env file:**

```bash
# Option B: Differentiation APIs
ALPHA_VANTAGE_API_KEY=2N9E4PF6HJ9NOSZR ✅ DONE
COINGECKO_API_KEY=demo ✅ DONE
NEWSAPI_KEY=your_newsapi_key_here ⏳ WAITING
REDDIT_CLIENT_ID=your_reddit_id_here ⏳ WAITING
REDDIT_CLIENT_SECRET=your_reddit_secret_here ⏳ WAITING
REDDIT_USER_AGENT=FinSightAI/1.0 ✅ DONE
FRED_API_KEY=your_fred_key_here ⏳ WAITING
```

---

## 🎯 Priority Order

**If you only have time for 2 more:**
1. ✅ **NewsAPI** - Get company news (2 min)
2. ✅ **FRED** - Economic indicators (3 min)

**Can skip for now:**
- Reddit (nice to have, not critical)
- CoinGecko (already works)

---

## 🧪 Test All Keys

Once added, I'll test all APIs:

```bash
bun run test:apis
```

This will verify:
- ✅ Alpha Vantage: Stock data working
- ✅ CoinGecko: Crypto prices working
- ✅ NewsAPI: News fetching working
- ✅ Reddit: Social data working
- ✅ FRED: Economic data working

---

## 📞 Reply With Your Keys

**Option 1: Send them one by one**
```
NEWSAPI_KEY=abc123...
REDDIT_CLIENT_ID=xyz789...
REDDIT_CLIENT_SECRET=secret123...
FRED_API_KEY=fred456...
```

**Option 2: Say "DONE" after updating .env yourself**

Then I'll build all the features! 🚀

---

## ⏱️ Total Time

- ✅ Alpha Vantage: DONE
- ⏳ CoinGecko: SKIP (works without key)
- ⏳ NewsAPI: 2 minutes
- ⏳ Reddit: 5 minutes (optional)
- ⏳ FRED: 3 minutes

**Total remaining: 10 minutes**

---

*Need help? Just ask which specific API you're stuck on!*
