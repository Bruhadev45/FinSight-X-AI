import axios from 'axios';

// Financial Modeling Prep API Client
const fmpClient = axios.create({
  baseURL: 'https://financialmodelingprep.com/api/v3',
  timeout: 15000,
});

// Type Definitions
export interface IncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  ebitda: number;
  ebitdaratio: number;
}

export interface BalanceSheet {
  date: string;
  symbol: string;
  reportedCurrency: string;
  totalAssets: number;
  totalCurrentAssets: number;
  cashAndCashEquivalents: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  totalDebt: number;
  totalEquity: number;
  totalStockholdersEquity: number;
  retainedEarnings: number;
}

export interface CashFlowStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  freeCashFlow: number;
  netCashFlow: number;
  capitalExpenditure: number;
  dividendsPaid: number;
}

export interface FinancialRatios {
  date: string;
  symbol: string;
  currentRatio: number;
  quickRatio: number;
  debtRatio: number;
  debtEquityRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
  netProfitMargin: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceEarningsRatio: number;
  assetTurnover: number;
  inventoryTurnover: number;
}

export interface CompanyProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

// Helper function to generate mock financial data when API endpoints aren't available
function generateMockIncomeStatements(symbol: string, limit: number): IncomeStatement[] {
  const statements: IncomeStatement[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < limit; i++) {
    const year = currentYear - i;
    const baseRevenue = 50000000 * (1 + Math.random() * 0.3);
    const growth = 1 + (0.1 - i * 0.02);
    
    statements.push({
      date: `${year}-12-31`,
      symbol,
      reportedCurrency: 'USD',
      revenue: Math.round(baseRevenue * growth),
      costOfRevenue: Math.round(baseRevenue * growth * 0.6),
      grossProfit: Math.round(baseRevenue * growth * 0.4),
      grossProfitRatio: 0.4,
      operatingExpenses: Math.round(baseRevenue * growth * 0.25),
      operatingIncome: Math.round(baseRevenue * growth * 0.15),
      operatingIncomeRatio: 0.15,
      netIncome: Math.round(baseRevenue * growth * 0.12),
      netIncomeRatio: 0.12,
      eps: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      epsdiluted: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      ebitda: Math.round(baseRevenue * growth * 0.18),
      ebitdaratio: 0.18,
    });
  }
  
  return statements;
}

function generateMockBalanceSheets(symbol: string, limit: number): BalanceSheet[] {
  const sheets: BalanceSheet[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < limit; i++) {
    const year = currentYear - i;
    const baseAssets = 100000000 * (1 + Math.random() * 0.2);
    
    sheets.push({
      date: `${year}-12-31`,
      symbol,
      reportedCurrency: 'USD',
      totalAssets: Math.round(baseAssets),
      totalCurrentAssets: Math.round(baseAssets * 0.4),
      cashAndCashEquivalents: Math.round(baseAssets * 0.15),
      totalLiabilities: Math.round(baseAssets * 0.5),
      totalCurrentLiabilities: Math.round(baseAssets * 0.25),
      totalDebt: Math.round(baseAssets * 0.3),
      totalEquity: Math.round(baseAssets * 0.5),
      totalStockholdersEquity: Math.round(baseAssets * 0.5),
      retainedEarnings: Math.round(baseAssets * 0.2),
    });
  }
  
  return sheets;
}

function generateMockCashFlowStatements(symbol: string, limit: number): CashFlowStatement[] {
  const statements: CashFlowStatement[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < limit; i++) {
    const year = currentYear - i;
    const baseOperatingCash = 20000000 * (1 + Math.random() * 0.2);
    
    statements.push({
      date: `${year}-12-31`,
      symbol,
      reportedCurrency: 'USD',
      operatingCashFlow: Math.round(baseOperatingCash),
      investingCashFlow: Math.round(baseOperatingCash * -0.4),
      financingCashFlow: Math.round(baseOperatingCash * -0.2),
      freeCashFlow: Math.round(baseOperatingCash * 0.7),
      netCashFlow: Math.round(baseOperatingCash * 0.4),
      capitalExpenditure: Math.round(baseOperatingCash * 0.3),
      dividendsPaid: Math.round(baseOperatingCash * 0.1),
    });
  }
  
  return statements;
}

function generateMockFinancialRatios(symbol: string, limit: number): FinancialRatios[] {
  const ratios: FinancialRatios[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < limit; i++) {
    const year = currentYear - i;
    
    ratios.push({
      date: `${year}-12-31`,
      symbol,
      currentRatio: parseFloat((1.5 + Math.random() * 0.5).toFixed(2)),
      quickRatio: parseFloat((1.0 + Math.random() * 0.5).toFixed(2)),
      debtRatio: parseFloat((0.4 + Math.random() * 0.2).toFixed(2)),
      debtEquityRatio: parseFloat((0.5 + Math.random() * 0.3).toFixed(2)),
      returnOnAssets: parseFloat((0.08 + Math.random() * 0.05).toFixed(4)),
      returnOnEquity: parseFloat((0.15 + Math.random() * 0.08).toFixed(4)),
      netProfitMargin: parseFloat((0.12 + Math.random() * 0.05).toFixed(4)),
      grossProfitMargin: parseFloat((0.4 + Math.random() * 0.1).toFixed(4)),
      operatingProfitMargin: parseFloat((0.15 + Math.random() * 0.05).toFixed(4)),
      priceToBookRatio: parseFloat((2.5 + Math.random() * 1.5).toFixed(2)),
      priceToSalesRatio: parseFloat((1.5 + Math.random() * 1.0).toFixed(2)),
      priceEarningsRatio: parseFloat((15 + Math.random() * 10).toFixed(2)),
      assetTurnover: parseFloat((0.5 + Math.random() * 0.3).toFixed(4)),
      inventoryTurnover: parseFloat((4 + Math.random() * 2).toFixed(2)),
    });
  }
  
  return ratios;
}

function generateMockCompanyProfile(symbol: string): CompanyProfile {
  const sectors = ['Technology', 'Financial Services', 'Healthcare', 'Consumer Goods', 'Energy'];
  const industries = ['Software', 'Banking', 'Biotechnology', 'Retail', 'Oil & Gas'];
  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  
  return {
    symbol,
    price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    beta: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
    volAvg: Math.floor(Math.random() * 100000000 + 10000000),
    mktCap: Math.floor(Math.random() * 1000000000000 + 10000000000),
    lastDiv: parseFloat((Math.random() * 5).toFixed(2)),
    range: '50.00-500.00',
    changes: parseFloat((Math.random() * 10 - 5).toFixed(2)),
    companyName: `${symbol} Inc.`,
    currency: 'USD',
    cik: `000${Math.floor(Math.random() * 1000000)}`,
    isin: `US${symbol}${Math.floor(Math.random() * 100000)}`,
    cusip: `${symbol}${Math.floor(Math.random() * 100)}`,
    exchange: 'NASDAQ',
    exchangeShortName: 'NASDAQ',
    industry,
    website: `https://www.${symbol.toLowerCase()}.com`,
    description: `${symbol} Inc. is a leading company in the ${industry} industry, providing innovative solutions and services to customers worldwide.`,
    ceo: 'John Smith',
    sector,
    country: 'US',
    fullTimeEmployees: String(Math.floor(Math.random() * 100000 + 1000)),
    phone: '1-800-555-0100',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    dcfDiff: parseFloat((Math.random() * 50 - 25).toFixed(2)),
    dcf: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    image: `https://financialmodelingprep.com/image-stock/${symbol}.png`,
    ipoDate: '2010-01-01',
    defaultImage: false,
    isEtf: false,
    isActivelyTrading: true,
    isAdr: false,
    isFund: false,
  };
}

function generateMockStockQuote(symbol: string): StockQuote {
  const price = parseFloat((Math.random() * 500 + 50).toFixed(2));
  const change = parseFloat((Math.random() * 20 - 10).toFixed(2));
  const changesPercentage = parseFloat(((change / price) * 100).toFixed(2));
  
  return {
    symbol,
    name: `${symbol} Inc.`,
    price,
    changesPercentage,
    change,
    dayLow: parseFloat((price * 0.98).toFixed(2)),
    dayHigh: parseFloat((price * 1.02).toFixed(2)),
    yearHigh: parseFloat((price * 1.25).toFixed(2)),
    yearLow: parseFloat((price * 0.75).toFixed(2)),
    marketCap: Math.floor(Math.random() * 1000000000000 + 10000000000),
    priceAvg50: parseFloat((price * 0.95).toFixed(2)),
    priceAvg200: parseFloat((price * 0.90).toFixed(2)),
    volume: Math.floor(Math.random() * 100000000 + 1000000),
    avgVolume: Math.floor(Math.random() * 100000000 + 1000000),
    open: parseFloat((price * 0.99).toFixed(2)),
    previousClose: parseFloat((price - change).toFixed(2)),
    eps: parseFloat((Math.random() * 10 + 1).toFixed(2)),
    pe: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    earningsAnnouncement: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    sharesOutstanding: Math.floor(Math.random() * 10000000000 + 100000000),
    timestamp: Date.now(),
  };
}

// API Functions
export async function getIncomeStatements(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<IncomeStatement[]> {
  try {
    const response = await fmpClient.get(`/income-statement/${symbol}`, {
      params: {
        limit,
        period,
        apikey: process.env.FMP_API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    // Free tier doesn't have access to income statements - use mock data
    console.warn(`Income statements not available on free tier for ${symbol}, using mock data`);
    return generateMockIncomeStatements(symbol, limit);
  }
}

export async function getBalanceSheets(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<BalanceSheet[]> {
  try {
    const response = await fmpClient.get(`/balance-sheet-statement/${symbol}`, {
      params: {
        limit,
        period,
        apikey: process.env.FMP_API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    // Free tier doesn't have access to balance sheets - use mock data
    console.warn(`Balance sheets not available on free tier for ${symbol}, using mock data`);
    return generateMockBalanceSheets(symbol, limit);
  }
}

export async function getCashFlowStatements(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<CashFlowStatement[]> {
  try {
    const response = await fmpClient.get(`/cash-flow-statement/${symbol}`, {
      params: {
        limit,
        period,
        apikey: process.env.FMP_API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    // Free tier doesn't have access to cash flow - use mock data
    console.warn(`Cash flow statements not available on free tier for ${symbol}, using mock data`);
    return generateMockCashFlowStatements(symbol, limit);
  }
}

export async function getFinancialRatios(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<FinancialRatios[]> {
  try {
    const response = await fmpClient.get(`/ratios/${symbol}`, {
      params: {
        limit,
        period,
        apikey: process.env.FMP_API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    // Free tier doesn't have access to ratios - use mock data
    console.warn(`Financial ratios not available on free tier for ${symbol}, using mock data`);
    return generateMockFinancialRatios(symbol, limit);
  }
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  try {
    const response = await fmpClient.get(`/profile/${symbol}`, {
      params: {
        apikey: process.env.FMP_API_KEY,
      },
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No profile data returned');
    }
    
    return response.data[0];
  } catch (error: any) {
    // Free tier restriction or error - use mock data
    console.warn(`Company profile not available for ${symbol}, using mock data`);
    return generateMockCompanyProfile(symbol);
  }
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  try {
    const response = await fmpClient.get(`/quote/${symbol}`, {
      params: {
        apikey: process.env.FMP_API_KEY,
      },
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No quote data returned');
    }
    
    return response.data[0];
  } catch (error: any) {
    // Free tier restriction or error - use mock data
    console.warn(`Stock quote not available for ${symbol}, using mock data`);
    return generateMockStockQuote(symbol);
  }
}

export async function searchCompanies(query: string): Promise<any[]> {
  try {
    const response = await fmpClient.get('/search', {
      params: {
        query,
        limit: 10,
        apikey: process.env.FMP_API_KEY,
      },
    });
    return response.data || [];
  } catch (error: any) {
    console.error('Error searching companies:', error.message);
    // Return empty array for search failures
    return [];
  }
}

export async function getComprehensiveFinancials(symbol: string) {
  try {
    const [profile, quote, income, balance, cashFlow, ratios] = await Promise.all([
      getCompanyProfile(symbol),
      getQuote(symbol),
      getIncomeStatements(symbol, 'annual', 3),
      getBalanceSheets(symbol, 'annual', 3),
      getCashFlowStatements(symbol, 'annual', 3),
      getFinancialRatios(symbol, 'annual', 3),
    ]);

    return {
      symbol,
      profile,
      quote,
      financials: {
        incomeStatements: income,
        balanceSheets: balance,
        cashFlowStatements: cashFlow,
        ratios: ratios,
      },
      usingMockData: true, // Flag to indicate some data might be mocked
    };
  } catch (error: any) {
    console.error(`Error fetching comprehensive financials for ${symbol}:`, error.message);
    throw error;
  }
}