import { NextRequest, NextResponse } from 'next/server';
import {
  getComprehensiveFinancials,
  getIncomeStatements,
  getBalanceSheets,
  getCashFlowStatements,
  getFinancialRatios,
  getCompanyProfile,
  getQuote,
  searchCompanies,
} from '@/lib/fmp';

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol');
    const action = request.nextUrl.searchParams.get('action') || 'comprehensive';
    const period = (request.nextUrl.searchParams.get('period') || 'annual') as 'annual' | 'quarter';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');
    const query = request.nextUrl.searchParams.get('query');

    // Search companies
    if (action === 'search' && query) {
      const results = await searchCompanies(query);
      return NextResponse.json({ results });
    }

    // Validate symbol for other actions
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'comprehensive':
        const comprehensive = await getComprehensiveFinancials(symbol);
        return NextResponse.json(comprehensive);

      case 'income':
        const income = await getIncomeStatements(symbol, period, limit);
        return NextResponse.json({ symbol, incomeStatements: income });

      case 'balance':
        const balance = await getBalanceSheets(symbol, period, limit);
        return NextResponse.json({ symbol, balanceSheets: balance });

      case 'cashflow':
        const cashFlow = await getCashFlowStatements(symbol, period, limit);
        return NextResponse.json({ symbol, cashFlowStatements: cashFlow });

      case 'ratios':
        const ratios = await getFinancialRatios(symbol, period, limit);
        return NextResponse.json({ symbol, ratios });

      case 'profile':
        const profile = await getCompanyProfile(symbol);
        return NextResponse.json({ symbol, profile });

      case 'quote':
        const quote = await getQuote(symbol);
        return NextResponse.json({ symbol, quote });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Financial API error:', error);

    // Handle specific error cases
    if ((error as Error).message.includes('404')) {
      return NextResponse.json(
        { error: 'Company symbol not found' },
        { status: 404 }
      );
    }

    if ((error as Error).message.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch financial data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
