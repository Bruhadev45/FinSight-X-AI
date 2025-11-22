import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolioHoldings, portfolios } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getStockQuote, searchStocks } from '@/lib/alpha-vantage';

// POST /api/portfolio/holdings - Add stock to portfolio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, symbol, shares, pricePerShare } = body;

    // Get stock info
    const quote = await getStockQuote(symbol);

    const totalCost = shares * pricePerShare;
    const currentValue = shares * quote.price;
    const gainLoss = currentValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;

    // Check if holding exists
    const existing = await db
      .select()
      .from(portfolioHoldings)
      .where(and(
        eq(portfolioHoldings.portfolioId, portfolioId),
        eq(portfolioHoldings.symbol, symbol.toUpperCase())
      ));

    if (existing.length > 0) {
      // Update existing holding
      const holding = existing[0];
      const newShares = holding.shares + shares;
      const newTotalCost = holding.totalCost + totalCost;
      const newAvgCost = newTotalCost / newShares;
      const newCurrentValue = newShares * quote.price;
      const newGainLoss = newCurrentValue - newTotalCost;
      const newGainLossPercent = (newGainLoss / newTotalCost) * 100;

      const updated = await db
        .update(portfolioHoldings)
        .set({
          shares: newShares,
          avgCostPerShare: newAvgCost,
          totalCost: newTotalCost,
          currentPrice: quote.price,
          currentValue: newCurrentValue,
          gainLoss: newGainLoss,
          gainLossPercent: newGainLossPercent,
          lastUpdated: new Date().toISOString(),
        })
        .where(eq(portfolioHoldings.id, holding.id))
        .returning();

      return NextResponse.json({
        success: true,
        holding: updated[0],
        message: `Added ${shares} more shares to existing position`,
      });
    } else {
      // Create new holding
      const newHolding = await db.insert(portfolioHoldings).values({
        portfolioId,
        symbol: symbol.toUpperCase(),
        companyName: quote.symbol, // We'll improve this with company name lookup
        shares,
        avgCostPerShare: pricePerShare,
        totalCost,
        currentPrice: quote.price,
        currentValue,
        gainLoss,
        gainLossPercent,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }).returning();

      return NextResponse.json({
        success: true,
        holding: newHolding[0],
      });
    }
  } catch (error) {
    console.error('Add holding error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio/holdings?id=123 - Remove holding
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const holdingId = searchParams.get('id');

    if (!holdingId) {
      return NextResponse.json(
        { success: false, error: 'Holding ID required' },
        { status: 400 }
      );
    }

    await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, parseInt(holdingId)));

    return NextResponse.json({
      success: true,
      message: 'Holding removed',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
