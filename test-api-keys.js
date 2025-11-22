#!/usr/bin/env node

// Test all API keys before deployment
require('dotenv').config();

const tests = [];

// Test 1: OpenAI API
async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { service: 'OpenAI', status: '❌ MISSING', error: 'API key not found' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (response.ok) {
      return { service: 'OpenAI', status: '✅ WORKING', details: 'API key is valid' };
    } else {
      const error = await response.json();
      return { service: 'OpenAI', status: '❌ FAILED', error: error.error?.message || 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'OpenAI', status: '❌ ERROR', error: error.message };
  }
}

// Test 2: Pinecone API
async function testPinecone() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;

  if (!apiKey) {
    return { service: 'Pinecone', status: '❌ MISSING', error: 'API key not found' };
  }

  try {
    const response = await fetch('https://api.pinecone.io/indexes', {
      headers: { 'Api-Key': apiKey }
    });

    if (response.ok) {
      const data = await response.json();
      const hasIndex = data.indexes?.some(idx => idx.name === indexName);
      return {
        service: 'Pinecone',
        status: hasIndex ? '✅ WORKING' : '⚠️  WARNING',
        details: hasIndex ? `Index "${indexName}" found` : `Index "${indexName}" not found - you need to create it`
      };
    } else {
      return { service: 'Pinecone', status: '❌ FAILED', error: 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'Pinecone', status: '❌ ERROR', error: error.message };
  }
}

// Test 3: Alpha Vantage API
async function testAlphaVantage() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return { service: 'Alpha Vantage', status: '❌ MISSING', error: 'API key not found' };
  }

  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`);
    const data = await response.json();

    if (data['Global Quote']) {
      return { service: 'Alpha Vantage', status: '✅ WORKING', details: 'API key is valid' };
    } else if (data.Note) {
      return { service: 'Alpha Vantage', status: '⚠️  LIMIT', error: 'API call limit reached (5 calls/min)' };
    } else {
      return { service: 'Alpha Vantage', status: '❌ FAILED', error: data['Error Message'] || 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'Alpha Vantage', status: '❌ ERROR', error: error.message };
  }
}

// Test 4: Financial Modeling Prep (FMP) API
async function testFMP() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return { service: 'FMP', status: '⚠️  OPTIONAL', error: 'API key not found (optional)' };
  }

  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${apiKey}`);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return { service: 'FMP', status: '✅ WORKING', details: 'API key is valid' };
    } else if (data.Error) {
      return { service: 'FMP', status: '❌ FAILED', error: data.Error };
    } else {
      return { service: 'FMP', status: '❌ FAILED', error: 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'FMP', status: '❌ ERROR', error: error.message };
  }
}

// Test 5: Polygon API
async function testPolygon() {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return { service: 'Polygon', status: '⚠️  OPTIONAL', error: 'API key not found (optional)' };
  }

  try {
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey=${apiKey}`);
    const data = await response.json();

    if (data.status === 'OK') {
      return { service: 'Polygon', status: '✅ WORKING', details: 'API key is valid' };
    } else {
      return { service: 'Polygon', status: '❌ FAILED', error: data.error || 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'Polygon', status: '❌ ERROR', error: error.message };
  }
}

// Test 6: NewsAPI
async function testNewsAPI() {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    return { service: 'NewsAPI', status: '⚠️  OPTIONAL', error: 'API key not found (optional)' };
  }

  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=1&apiKey=${apiKey}`);
    const data = await response.json();

    if (data.status === 'ok') {
      return { service: 'NewsAPI', status: '✅ WORKING', details: 'API key is valid' };
    } else {
      return { service: 'NewsAPI', status: '❌ FAILED', error: data.message || 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'NewsAPI', status: '❌ ERROR', error: error.message };
  }
}

// Test 7: FRED API
async function testFRED() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    return { service: 'FRED', status: '⚠️  OPTIONAL', error: 'API key not found (optional)' };
  }

  try {
    const response = await fetch(`https://api.stlouisfed.org/fred/series?series_id=GDP&api_key=${apiKey}&file_type=json`);
    const data = await response.json();

    if (data.seriess) {
      return { service: 'FRED', status: '✅ WORKING', details: 'API key is valid' };
    } else if (data.error_message) {
      return { service: 'FRED', status: '❌ FAILED', error: data.error_message };
    } else {
      return { service: 'FRED', status: '❌ FAILED', error: 'Invalid API key' };
    }
  } catch (error) {
    return { service: 'FRED', status: '❌ ERROR', error: error.message };
  }
}

// Test 8: Twilio (SMS)
async function testTwilio() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { service: 'Twilio', status: '⚠️  OPTIONAL', error: 'Credentials not found (optional)' };
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (response.ok) {
      return { service: 'Twilio', status: '✅ WORKING', details: 'Credentials are valid' };
    } else {
      return { service: 'Twilio', status: '❌ FAILED', error: 'Invalid credentials' };
    }
  } catch (error) {
    return { service: 'Twilio', status: '❌ ERROR', error: error.message };
  }
}

// Test 9: Database Connection
async function testDatabase() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return { service: 'Database', status: '❌ MISSING', error: 'DATABASE_URL not found' };
  }

  if (dbUrl.includes('localhost')) {
    return {
      service: 'Database',
      status: '⚠️  WARNING',
      error: 'Using localhost - need production database for deployment'
    };
  }

  return { service: 'Database', status: '✅ CONFIGURED', details: 'Production database URL set' };
}

// Run all tests
async function runTests() {
  console.log('\n🔍 Testing API Keys for FinsightX AI Deployment\n');
  console.log('='.repeat(70));

  const results = await Promise.all([
    testOpenAI(),
    testPinecone(),
    testAlphaVantage(),
    testFMP(),
    testPolygon(),
    testNewsAPI(),
    testFRED(),
    testTwilio(),
    testDatabase()
  ]);

  console.log('\n');

  // Print results
  let hasErrors = false;
  let hasWarnings = false;

  results.forEach(result => {
    const statusIcon = result.status.includes('✅') ? '✅' :
                      result.status.includes('⚠️') ? '⚠️ ' : '❌';

    console.log(`${statusIcon} ${result.service.padEnd(20)} ${result.status}`);

    if (result.details) {
      console.log(`   └─ ${result.details}`);
    }
    if (result.error) {
      console.log(`   └─ ${result.error}`);
    }

    if (result.status.includes('❌')) hasErrors = true;
    if (result.status.includes('⚠️')) hasWarnings = true;
  });

  console.log('\n' + '='.repeat(70));

  // Summary
  const working = results.filter(r => r.status.includes('✅')).length;
  const failed = results.filter(r => r.status.includes('❌')).length;
  const warnings = results.filter(r => r.status.includes('⚠️')).length;

  console.log(`\n📊 Summary: ${working} working | ${failed} failed | ${warnings} warnings\n`);

  if (hasErrors) {
    console.log('❌ CRITICAL: Fix failed API keys before deployment\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  WARNING: Some optional services not configured\n');
    console.log('💡 TIP: Your app will work, but some features may be limited\n');
  } else {
    console.log('✅ SUCCESS: All API keys are working!\n');
    console.log('🚀 Ready to deploy to Vercel!\n');
  }
}

runTests().catch(console.error);
