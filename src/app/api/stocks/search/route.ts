import { NextRequest, NextResponse } from 'next/server';
import { searchStocks } from '@/lib/alpha-vantage';

// GET /api/stocks/search?q=Apple
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: false,
        error: 'Search query required',
      }, { status: 400 });
    }

    const results = await searchStocks(query);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    }, { status: 500 });
  }
}
