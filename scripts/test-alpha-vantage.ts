import { getStockQuote, searchStocks, getCompanyOverview } from '../src/lib/alpha-vantage';

async function testAlphaVantage() {
  console.log('🧪 Testing Alpha Vantage API...\n');

  try {
    // Test 1: Get stock quote
    console.log('📊 Test 1: Getting Apple (AAPL) quote...');
    const quote = await getStockQuote('AAPL');
    console.log('✅ Success!');
    console.log(`   Price: $${quote.price}`);
    console.log(`   Change: ${quote.change >= 0 ? '+' : ''}${quote.change} (${quote.changePercent.toFixed(2)}%)`);
    console.log(`   Volume: ${quote.volume.toLocaleString()}`);
    console.log(`   Day Range: $${quote.low} - $${quote.high}\n`);

    // Test 2: Search stocks
    console.log('🔍 Test 2: Searching for "Apple"...');
    const searchResults = await searchStocks('Apple');
    console.log(`✅ Found ${searchResults.length} results:`);
    searchResults.slice(0, 3).forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.symbol} - ${result.name}`);
    });
    console.log();

    // Test 3: Company overview
    console.log('🏢 Test 3: Getting Tesla (TSLA) company info...');
    const overview = await getCompanyOverview('TSLA');
    console.log('✅ Success!');
    console.log(`   Name: ${overview.name}`);
    console.log(`   Sector: ${overview.sector}`);
    console.log(`   Market Cap: $${(parseInt(overview.marketCap) / 1e9).toFixed(2)}B`);
    console.log(`   P/E Ratio: ${overview.peRatio}\n`);

    console.log('🎉 All tests passed! Alpha Vantage is working correctly.\n');

    console.log('✨ You can now build:');
    console.log('   ✓ Portfolio tracking');
    console.log('   ✓ Stock price alerts');
    console.log('   ✓ Technical indicators');
    console.log('   ✓ Company research');
    console.log('   ✓ Stock search feature\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your .env file has ALPHA_VANTAGE_API_KEY');
    console.log('   2. Verify API key is correct');
    console.log('   3. Free tier: 5 requests/minute, 500/day');
  }
}

testAlphaVantage();
