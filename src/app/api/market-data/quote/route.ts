import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  try {
    // Try Finnhub API if key is available
    if (process.env.FINNHUB_API_KEY) {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
        { next: { revalidate: 5 } } // Cache for 5 seconds
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Fallback to mock data
    const mockPrice = 150 + Math.random() * 50;
    const mockChange = (Math.random() - 0.5) * 10;
    
    return NextResponse.json({
      c: mockPrice, // Current price
      d: mockChange, // Change
      dp: (mockChange / mockPrice) * 100, // Change percent
      h: mockPrice + Math.random() * 5, // High
      l: mockPrice - Math.random() * 5, // Low
      o: mockPrice + (Math.random() - 0.5) * 3, // Open
      pc: mockPrice - mockChange, // Previous close
      t: Date.now(), // Timestamp
      v: Math.floor(Math.random() * 10000000) // Volume
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    
    // Return mock data on error
    const mockPrice = 150 + Math.random() * 50;
    const mockChange = (Math.random() - 0.5) * 10;
    
    return NextResponse.json({
      c: mockPrice,
      d: mockChange,
      dp: (mockChange / mockPrice) * 100,
      h: mockPrice + Math.random() * 5,
      l: mockPrice - Math.random() * 5,
      o: mockPrice + (Math.random() - 0.5) * 3,
      pc: mockPrice - mockChange,
      t: Date.now(),
      v: Math.floor(Math.random() * 10000000)
    });
  }
}
