/**
 * Alpha Vantage API Integration
 * Free tier: 500 requests/day, 5 requests/minute
 * Docs: https://www.alphavantage.co/documentation/
 */

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  lastUpdate: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }

    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No data available for ${symbol}`);
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      lastUpdate: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error('Alpha Vantage API Error:', error);
    throw error;
  }
}

/**
 * Search for stocks by keyword
 */
export async function searchStocks(keyword: string): Promise<StockSearchResult[]> {
  try {
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error('Search failed');
    }

    const matches = data['bestMatches'] || [];
    return matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
    }));
  } catch (error) {
    console.error('Stock search error:', error);
    return [];
  }
}

/**
 * Get historical daily data
 */
export async function getHistoricalData(
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<TimeSeriesData[]> {
  try {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }

    const timeSeries = data['Time Series (Daily)'] || {};
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }));
  } catch (error) {
    console.error('Historical data error:', error);
    return [];
  }
}

/**
 * Get technical indicator: RSI (Relative Strength Index)
 */
export async function getRSI(symbol: string, timePeriod: number = 14): Promise<any> {
  try {
    const url = `${BASE_URL}?function=RSI&symbol=${symbol}&interval=daily&time_period=${timePeriod}&series_type=close&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data['Technical Analysis: RSI'] || {};
  } catch (error) {
    console.error('RSI error:', error);
    return {};
  }
}

/**
 * Get company overview
 */
export async function getCompanyOverview(symbol: string): Promise<any> {
  try {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: data.MarketCapitalization,
      peRatio: data.PERatio,
      dividendYield: data.DividendYield,
      eps: data.EPS,
      beta: data.Beta,
      week52High: data['52WeekHigh'],
      week52Low: data['52WeekLow'],
    };
  } catch (error) {
    console.error('Company overview error:', error);
    throw error;
  }
}

/**
 * Batch get quotes for multiple symbols (respects rate limits)
 */
export async function getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];

  for (let i = 0; i < symbols.length; i++) {
    try {
      const quote = await getStockQuote(symbols[i]);
      quotes.push(quote);

      // Rate limit: 5 requests per minute, add delay
      if (i < symbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between requests
      }
    } catch (error) {
      console.error(`Error fetching ${symbols[i]}:`, error);
    }
  }

  return quotes;
}
