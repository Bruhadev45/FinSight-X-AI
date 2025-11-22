import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolios, portfolioHoldings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getStockQuote } from '@/lib/alpha-vantage';

// GET /api/portfolio - Get user's portfolios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user_1'; // Default for now

    const userPortfolios = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    // Get holdings for each portfolio with live prices
    const portfoliosWithHoldings = await Promise.all(
      userPortfolios.map(async (portfolio) => {
        const holdings = await db
          .select()
          .from(portfolioHoldings)
          .where(eq(portfolioHoldings.portfolioId, portfolio.id));

        // Update prices (rate limit: do batches)
        const updatedHoldings = await Promise.all(
          holdings.slice(0, 5).map(async (holding) => { // Limit to 5 for rate limits
            try {
              const quote = await getStockQuote(holding.symbol);
              const currentValue = holding.shares * quote.price;
              const gainLoss = currentValue - holding.totalCost;
              const gainLossPercent = (gainLoss / holding.totalCost) * 100;

              return {
                ...holding,
                currentPrice: quote.price,
                currentValue,
                gainLoss,
                gainLossPercent,
                change: quote.change,
                changePercent: quote.changePercent,
              };
            } catch (error) {
              return holding; // Return without live price on error
            }
          })
        );

        const totalValue = updatedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
        const totalCost = updatedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return {
          ...portfolio,
          holdings: updatedHoldings,
          totalValue,
          totalGainLoss,
          totalGainLossPercent,
        };
      })
    );

    return NextResponse.json({
      success: true,
      portfolios: portfoliosWithHoldings,
    });
  } catch (error) {
    console.error('Portfolio API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Create new portfolio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'user_1', name, description, isDefault = false } = body;

    const newPortfolio = await db.insert(portfolios).values({
      userId,
      name,
      description,
      isDefault,
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({
      success: true,
      portfolio: newPortfolio[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
