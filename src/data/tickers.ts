export interface TickerInfo {
  symbol: string;
  name: string;
  sector: string;
}

export const tickers: TickerInfo[] = [
  // Technology
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology" },
  { symbol: "CSCO", name: "Cisco Systems Inc.", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology" },
  { symbol: "ACN", name: "Accenture plc", sector: "Technology" },
  { symbol: "QCOM", name: "Qualcomm Inc.", sector: "Technology" },
  { symbol: "TXN", name: "Texas Instruments Inc.", sector: "Technology" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology" },
  { symbol: "NOW", name: "ServiceNow Inc.", sector: "Technology" },
  { symbol: "PANW", name: "Palo Alto Networks Inc.", sector: "Technology" },
  { symbol: "CRWD", name: "CrowdStrike Holdings Inc.", sector: "Technology" },
  { symbol: "DDOG", name: "Datadog Inc.", sector: "Technology" },
  { symbol: "ZS", name: "Zscaler Inc.", sector: "Technology" },
  { symbol: "NET", name: "Cloudflare Inc.", sector: "Technology" },
  { symbol: "SNOW", name: "Snowflake Inc.", sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", sector: "Technology" },
  { symbol: "ARM", name: "Arm Holdings plc", sector: "Technology" },
  { symbol: "SMCI", name: "Super Micro Computer Inc.", sector: "Technology" },
  { symbol: "MU", name: "Micron Technology Inc.", sector: "Technology" },
  { symbol: "LRCX", name: "Lam Research Corporation", sector: "Technology" },
  { symbol: "AMAT", name: "Applied Materials Inc.", sector: "Technology" },
  { symbol: "SHOP", name: "Shopify Inc.", sector: "Technology" },

  // Financials
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Financials" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials" },
  { symbol: "BAC", name: "Bank of America Corporation", sector: "Financials" },
  { symbol: "WFC", name: "Wells Fargo & Company", sector: "Financials" },
  { symbol: "GS", name: "Goldman Sachs Group Inc.", sector: "Financials" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financials" },
  { symbol: "BLK", name: "BlackRock Inc.", sector: "Financials" },
  { symbol: "SPGI", name: "S&P Global Inc.", sector: "Financials" },
  { symbol: "AXP", name: "American Express Company", sector: "Financials" },
  { symbol: "COIN", name: "Coinbase Global Inc.", sector: "Financials" },
  { symbol: "SQ", name: "Block Inc.", sector: "Financials" },
  { symbol: "SOFI", name: "SoFi Technologies Inc.", sector: "Financials" },
  { symbol: "HOOD", name: "Robinhood Markets Inc.", sector: "Financials" },

  // Healthcare
  { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly and Company", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co. Inc.", sector: "Healthcare" },
  { symbol: "ISRG", name: "Intuitive Surgical Inc.", sector: "Healthcare" },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals Inc.", sector: "Healthcare" },
  { symbol: "GILD", name: "Gilead Sciences Inc.", sector: "Healthcare" },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", sector: "Healthcare" },
  { symbol: "BMY", name: "Bristol-Myers Squibb Company", sector: "Healthcare" },
  { symbol: "SYK", name: "Stryker Corporation", sector: "Healthcare" },

  // Consumer Discretionary
  { symbol: "HD", name: "The Home Depot Inc.", sector: "Consumer Discretionary" },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer Discretionary" },
  { symbol: "MCD", name: "McDonald's Corporation", sector: "Consumer Discretionary" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", sector: "Consumer Discretionary" },
  { symbol: "SBUX", name: "Starbucks Corporation", sector: "Consumer Discretionary" },
  { symbol: "UBER", name: "Uber Technologies Inc.", sector: "Consumer Discretionary" },
  { symbol: "ABNB", name: "Airbnb Inc.", sector: "Consumer Discretionary" },
  { symbol: "RIVN", name: "Rivian Automotive Inc.", sector: "Consumer Discretionary" },
  { symbol: "LCID", name: "Lucid Group Inc.", sector: "Consumer Discretionary" },
  { symbol: "F", name: "Ford Motor Company", sector: "Consumer Discretionary" },
  { symbol: "GM", name: "General Motors Company", sector: "Consumer Discretionary" },

  // Consumer Staples
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Staples" },
  { symbol: "PG", name: "Procter & Gamble Company", sector: "Consumer Staples" },
  { symbol: "KO", name: "The Coca-Cola Company", sector: "Consumer Staples" },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Staples" },
  { symbol: "COST", name: "Costco Wholesale Corporation", sector: "Consumer Staples" },

  // Communication Services
  { symbol: "DIS", name: "The Walt Disney Company", sector: "Communication Services" },
  { symbol: "T", name: "AT&T Inc.", sector: "Communication Services" },
  { symbol: "VZ", name: "Verizon Communications Inc.", sector: "Communication Services" },

  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy" },

  // Industrials
  { symbol: "UPS", name: "United Parcel Service Inc.", sector: "Industrials" },
  { symbol: "DE", name: "Deere & Company", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrials" },
  { symbol: "BA", name: "The Boeing Company", sector: "Industrials" },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrials" },
  { symbol: "RTX", name: "RTX Corporation", sector: "Industrials" },
  { symbol: "AAL", name: "American Airlines Group Inc.", sector: "Industrials" },
  { symbol: "DAL", name: "Delta Air Lines Inc.", sector: "Industrials" },
  { symbol: "UAL", name: "United Airlines Holdings Inc.", sector: "Industrials" },
  { symbol: "LUV", name: "Southwest Airlines Co.", sector: "Industrials" },

  // Real Estate
  { symbol: "O", name: "Realty Income Corporation", sector: "Real Estate" },

  // International / E-Commerce
  { symbol: "MELI", name: "MercadoLibre Inc.", sector: "Consumer Discretionary" },
  { symbol: "SE", name: "Sea Limited", sector: "Technology" },

  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", sector: "ETF" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF", sector: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", sector: "ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sector: "ETF" },
];

export function searchTickers(query: string): TickerInfo[] {
  const q = query.toUpperCase().trim();
  if (!q) return [];
  return tickers
    .filter(
      (t) =>
        t.symbol.includes(q) || t.name.toUpperCase().includes(q)
    )
    .slice(0, 10);
}
