import { NextRequest, NextResponse } from "next/server";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
  entities: string[];
  relevance: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "financial markets";
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // Try marketaux API if key is available
    if (process.env.MARKETAUX_API_KEY) {
      const response = await fetch(
        `https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&limit=${limit}&api_token=${process.env.MARKETAUX_API_KEY}`,
        { next: { revalidate: 60 } } // Cache for 60 seconds
      );

      if (response.ok) {
        const data = await response.json();
        const articles: NewsArticle[] = data.data?.map((item: any, index: number) => ({
          id: item.uuid || `news_${index}`,
          title: item.title,
          description: item.description || item.snippet || "",
          url: item.url,
          source: item.source,
          publishedAt: item.published_at,
          sentiment: item.sentiment || "neutral",
          entities: item.entities?.map((e: any) => e.name).slice(0, 3) || [],
          relevance: item.relevance_score || 0.5
        })) || [];

        return NextResponse.json({ articles });
      }
    }

    // Fallback to mock data
    const mockArticles: NewsArticle[] = generateMockNews(query);
    return NextResponse.json({ articles: mockArticles });
  } catch (error) {
    console.error("Error fetching news:", error);
    
    // Return mock data on error
    const mockArticles: NewsArticle[] = generateMockNews(query);
    return NextResponse.json({ articles: mockArticles });
  }
}

function generateMockNews(query: string): NewsArticle[] {
  const sentiments: ("positive" | "negative" | "neutral")[] = ["positive", "negative", "neutral"];
  const sources = ["Financial Times", "Bloomberg", "Reuters", "Wall Street Journal", "CNBC", "MarketWatch"];
  
  const templates = [
    {
      title: "Federal Reserve Announces Interest Rate Decision - Markets Rally",
      description: "The Federal Reserve maintained interest rates at 5.25-5.50%, signaling potential cuts in 2024. Stock markets surged on the news.",
      entities: ["Federal Reserve", "Interest Rates", "Stock Market"],
      sentiment: "positive" as const
    },
    {
      title: "Tech Giants Report Strong Q4 Earnings Despite Economic Headwinds",
      description: "Major technology companies exceeded analyst expectations with robust revenue growth and improved profit margins.",
      entities: ["Technology", "Earnings", "Q4 Results"],
      sentiment: "positive" as const
    },
    {
      title: "Banking Sector Faces Increased Regulatory Scrutiny",
      description: "Regulators announce new compliance requirements for major financial institutions following recent market volatility.",
      entities: ["Banking", "Regulation", "Compliance"],
      sentiment: "negative" as const
    },
    {
      title: "Global Supply Chains Show Signs of Normalization",
      description: "Logistics experts report improved shipping times and reduced bottlenecks across major trade routes.",
      entities: ["Supply Chain", "Logistics", "Trade"],
      sentiment: "positive" as const
    },
    {
      title: "Energy Prices Fluctuate Amid Geopolitical Tensions",
      description: "Oil and natural gas markets experience volatility as international negotiations continue.",
      entities: ["Energy", "Oil", "Geopolitics"],
      sentiment: "neutral" as const
    },
    {
      title: "Cryptocurrency Markets Experience Renewed Investor Interest",
      description: "Bitcoin and major altcoins see significant price increases as institutional adoption accelerates.",
      entities: ["Cryptocurrency", "Bitcoin", "Investment"],
      sentiment: "positive" as const
    },
    {
      title: "Manufacturing PMI Data Points to Economic Slowdown",
      description: "Latest purchasing managers' index figures suggest contraction in manufacturing activity across major economies.",
      entities: ["Manufacturing", "PMI", "Economy"],
      sentiment: "negative" as const
    },
    {
      title: "AI and Automation Drive Productivity Gains in Financial Services",
      description: "Financial institutions report significant efficiency improvements through artificial intelligence adoption.",
      entities: ["AI", "Financial Services", "Automation"],
      sentiment: "positive" as const
    }
  ];

  return templates.map((template, index) => ({
    id: `mock_${Date.now()}_${index}`,
    title: template.title,
    description: template.description,
    url: `https://news.google.com/search?q=${encodeURIComponent(template.title)}`,
    source: sources[index % sources.length],
    publishedAt: new Date(Date.now() - 1000 * 60 * (index * 15 + 5)).toISOString(),
    sentiment: template.sentiment,
    entities: template.entities,
    relevance: 0.95 - (index * 0.05)
  }));
}
