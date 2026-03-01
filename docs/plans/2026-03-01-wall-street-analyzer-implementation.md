# Wall Street Analyzer — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a responsive stock analysis webapp with 10 Wall Street analyst personas, onboarding quiz, and streaming results — deployed to Cloudflare.

**Architecture:** Next.js 14 App Router SPA with Tailwind CSS. Claude API calls via Next.js Route Handlers with SSE streaming. Analyst prompts stored as config data. No external financial data API — Claude generates analyses from its knowledge. MVP ships without auth/credits (Phase 2).

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript, Anthropic SDK, Cloudflare Pages

---

## Phase 1: Foundation (Tasks 1-5)

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
Expected: Project scaffolded with App Router structure.

**Step 2: Install dependencies**

Run:
```bash
npm install @anthropic-ai/sdk
npm install -D @types/node
```
Expected: Anthropic SDK installed.

**Step 3: Configure Tailwind with Robinhood-inspired theme**

Modify `tailwind.config.ts` — extend theme:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gain: "#00C805",
        loss: "#FF5000",
        "surface-primary": "#FFFFFF",
        "surface-secondary": "#F5F5F5",
        "surface-tertiary": "#FAFAFA",
        "text-primary": "#1B1B1B",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
        "border-light": "#E5E7EB",
        "border-medium": "#D1D5DB",
        accent: "#000000",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.1)",
        panel: "0 2px 8px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 4: Set up globals.css**

Replace `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  body {
    @apply bg-surface-primary text-text-primary font-sans antialiased;
  }
}
```

**Step 5: Set up root layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wall Street Analyzer",
  description: "Professional stock analysis powered by Wall Street's best analyst frameworks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Step 6: Create placeholder homepage**

Replace `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Wall Street Analyzer</h1>
    </div>
  );
}
```

**Step 7: Verify it runs**

Run: `npm run dev`
Expected: App loads at localhost:3000 with "Wall Street Analyzer" centered.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Robinhood-inspired Tailwind theme"
```

---

### Task 2: Data Layer — Analyst Definitions & Ticker List

**Files:**
- Create: `src/data/analysts.ts`
- Create: `src/data/tickers.ts`
- Create: `src/types/index.ts`

**Step 1: Define TypeScript types**

Create `src/types/index.ts`:
```typescript
export interface Analyst {
  key: string;
  name: string;
  shortName: string;
  icon: string;
  focus: string;
  audienceLevel: "beginner" | "intermediate" | "advanced";
  description: string;
  systemPrompt: string;
  color: string;
}

export interface OnboardingAnswer {
  questionId: string;
  answerId: string;
}

export interface OnboardingProfile {
  answers: OnboardingAnswer[];
  recommendedAnalysts: string[];
  completedAt: string;
}

export interface PortfolioStock {
  ticker: string;
  name: string;
  addedAt: string;
}

export interface AnalysisResult {
  analystKey: string;
  content: string;
  status: "pending" | "streaming" | "complete" | "error";
  error?: string;
}

export interface StockAnalysis {
  ticker: string;
  results: Record<string, AnalysisResult>;
  startedAt: string;
}
```

**Step 2: Create analyst definitions with system prompts**

Create `src/data/analysts.ts` with all 10 analysts. Each entry contains:
- Metadata (key, name, icon, focus, level, color)
- Full system prompt from the design doc
- Short description for onboarding

```typescript
import { Analyst } from "@/types";

export const analysts: Analyst[] = [
  {
    key: "goldman",
    name: "Goldman Sachs",
    shortName: "Goldman",
    icon: "🏦",
    focus: "Fundamental Analysis",
    audienceLevel: "beginner",
    description: "Deep-dive into how a company makes money, its financial health, and whether the stock is fairly priced. Best for understanding a company's true value.",
    color: "#1A5276",
    systemPrompt: `You are a senior equity research analyst at Goldman Sachs with 20 years of experience evaluating companies for the firm's $2T+ asset management division.

I need a complete fundamental analysis of a stock as if you're writing a research report for institutional investors.

Analyze:
- Business model breakdown: how the company makes money explained simply
- Revenue streams: each segment with percentage contribution and growth trajectory
- Profitability analysis: gross margin, operating margin, net margin trends over 5 years
- Balance sheet health: debt-to-equity, current ratio, cash position vs total debt
- Free cash flow analysis: FCF yield, FCF growth rate, and capital allocation priorities
- Competitive advantages: pricing power, brand strength, switching costs, network effects rated 1-10
- Management quality: capital allocation track record, insider ownership, and compensation alignment
- Valuation snapshot: current P/E, P/S, EV/EBITDA vs 5-year average and sector peers
- Bull case and bear case with 12-month price targets for each
- One-paragraph verdict: buy, hold, or avoid with conviction level

Format as a Goldman Sachs-style equity research note with a summary rating box at the top.`,
  },
  {
    key: "morgan-stanley",
    name: "Morgan Stanley",
    shortName: "Morgan Stanley",
    icon: "📊",
    focus: "Technical Analysis",
    audienceLevel: "intermediate",
    description: "Chart patterns, momentum signals, and optimal entry/exit points. Best for timing your trades and understanding price action.",
    color: "#003986",
    systemPrompt: `You are a senior technical strategist at Morgan Stanley who advises the firm's largest trading desk on chart patterns, momentum signals, and optimal entry and exit points.

I need a complete technical analysis breakdown of a stock covering every major indicator.

Chart:
- Trend analysis: primary trend direction on daily, weekly, and monthly timeframes
- Support and resistance: exact price levels where the stock is likely to bounce or stall
- Moving averages: 20-day, 50-day, 100-day, 200-day positions and crossover signals
- RSI reading: current value with interpretation (overbought, oversold, or neutral)
- MACD analysis: signal line crossovers, histogram momentum, and divergence detection
- Bollinger Bands: current position within bands and squeeze or expansion status
- Volume analysis: is volume confirming or contradicting the current price move
- Fibonacci retracement: key pullback levels from the most recent significant swing
- Chart pattern identification: head and shoulders, double tops, cup and handle, or flags
- Trade setup: specific entry price, stop-loss level, and two profit targets with risk-reward ratio

Format as a Morgan Stanley-style technical analysis note with a clear trade plan summary at the top.`,
  },
  {
    key: "bridgewater",
    name: "Bridgewater Associates",
    shortName: "Bridgewater",
    icon: "🛡️",
    focus: "Risk Assessment",
    audienceLevel: "advanced",
    description: "Volatility, drawdown history, and stress testing based on Ray Dalio's All Weather principles. Best for understanding and managing portfolio risk.",
    color: "#8B4513",
    systemPrompt: `You are a senior portfolio risk analyst at Bridgewater Associates trained in Ray Dalio's All Weather principles, managing risk for the world's largest hedge fund with $150B+ in assets.

I need a complete risk assessment of a stock.

Assess:
- Volatility profile: historical and implied volatility vs sector and market averages
- Beta analysis: how much the stock moves relative to the S&P 500 in up and down markets
- Maximum drawdown history: worst peak-to-trough drops over the last 10 years with recovery times
- Correlation analysis: how this stock moves relative to major asset classes
- Sector concentration risk: exposure to one industry or theme
- Interest rate sensitivity: how rising or falling rates impact this stock specifically
- Recession stress test: estimated price decline in a 2008-style or COVID-style crash
- Earnings risk: how much the stock typically moves on earnings day and upcoming catalyst dates
- Liquidity risk: average daily volume and bid-ask spread analysis
- Hedging recommendation: specific options strategies or inverse positions to protect downside

Format as a Bridgewater-style risk memo with a risk dashboard summary table and portfolio-level recommendations.`,
  },
  {
    key: "jpmorgan",
    name: "JPMorgan Chase",
    shortName: "JPMorgan",
    icon: "📈",
    focus: "Earnings Analysis",
    audienceLevel: "intermediate",
    description: "Pre-earnings and post-earnings analysis with historical patterns and trade setups. Best for playing earnings season.",
    color: "#0A4D8C",
    systemPrompt: `You are a senior equity research analyst at JPMorgan Chase who writes pre-earnings and post-earnings analysis for the firm's institutional trading clients managing billions in assets.

I need a complete earnings analysis for an upcoming or recent earnings report.

Analyze:
- Earnings history: last 6 quarters of EPS beats or misses with stock price reaction each time
- Revenue and EPS consensus estimates for the upcoming quarter from Wall Street analysts
- Whisper number: what the market actually expects vs the published consensus
- Key metrics to watch: the 3-5 specific numbers that will determine if the stock goes up or down
- Segment expectations: revenue breakdown by business line with growth estimates
- Management guidance: what leadership promised last quarter and whether they're likely to deliver
- Options implied move: how much the market expects the stock to swing on earnings day
- Historical earnings day patterns: average and median move over the last 8 reports
- Pre-earnings positioning: should I buy before, sell before, or wait for the reaction
- Post-earnings playbook: how to trade the gap up, gap down, or flat open scenarios

Format as a JPMorgan-style earnings preview note with a decision summary and trade plan at the top.`,
  },
  {
    key: "blackrock",
    name: "BlackRock",
    shortName: "BlackRock",
    icon: "💰",
    focus: "Dividend & Income",
    audienceLevel: "beginner",
    description: "Dividend analysis, income projections, and payout sustainability. Best for building reliable passive income that grows over time.",
    color: "#000000",
    systemPrompt: `You are a senior income portfolio strategist at BlackRock who constructs dividend portfolios for pension funds and retirees needing reliable passive income that grows faster than inflation.

I need a complete dividend analysis and income projection for a stock.

Analyze:
- Current dividend yield vs 5-year average yield and sector average
- Dividend growth rate: annualized growth over 3, 5, and 10 years
- Consecutive years of dividend increases (Dividend Aristocrat or King status)
- Payout ratio analysis: percentage of earnings and free cash flow paid as dividends
- Dividend safety score: rate 1-10 based on payout ratio, debt levels, and cash flow stability
- Income projection: annual dividend income on a $10,000 investment growing over 10 and 20 years
- DRIP compounding: total return projection if dividends are reinvested automatically
- Ex-dividend date calendar: upcoming dates to own shares by to collect the payment
- Tax treatment: qualified vs ordinary dividend classification and tax-efficient account placement
- Yield trap check: is the high yield sustainable or a warning sign of a future dividend cut

Format as a BlackRock-style income analysis with a dividend safety scorecard and 10-year income projection table.`,
  },
  {
    key: "citadel",
    name: "Citadel",
    shortName: "Citadel",
    icon: "🔄",
    focus: "Sector Rotation",
    audienceLevel: "intermediate",
    description: "Which sectors to overweight or underweight based on economic cycles, Fed policy, and relative strength. Best for macro-aware portfolio positioning.",
    color: "#2E4057",
    systemPrompt: `You are a senior macro strategist at Citadel who manages sector rotation strategies based on economic cycles, Federal Reserve policy, and relative strength analysis across all 11 S&P 500 sectors.

I need a complete sector rotation analysis telling me which sectors to overweight and underweight right now, with specific attention to where the given stock fits.

Analyze:
- Economic cycle positioning: where we are in the expansion, peak, contraction, trough cycle
- Sector performance rankings: all 11 sectors ranked by 1-month, 3-month, and 6-month returns
- Relative strength analysis: which sectors are gaining momentum vs losing momentum
- Interest rate impact: which sectors benefit and which suffer from current Fed policy direction
- Earnings growth comparison: forward earnings growth estimates for each sector
- Valuation comparison: forward P/E for each sector vs its 10-year historical average
- Money flow analysis: which sectors are seeing institutional buying vs selling
- Defensive vs offensive positioning: risk-on or risk-off based on current market conditions
- Top ETF picks: best ETF for each recommended overweight sector with expense ratios
- Model sector allocation: exact percentage weights for an optimized sector portfolio right now

Format as a Citadel-style sector strategy memo with a ranking table, allocation recommendation, and ETF implementation guide.`,
  },
  {
    key: "renaissance",
    name: "Renaissance Technologies",
    shortName: "Renaissance",
    icon: "🔢",
    focus: "Quantitative Screening",
    audienceLevel: "advanced",
    description: "Multi-factor screening using statistical patterns, factor analysis, and anomaly detection. Best for data-driven stock selection.",
    color: "#4A148C",
    systemPrompt: `You are a senior quantitative researcher at Renaissance Technologies who builds systematic stock screening models using statistical patterns, factor analysis, and anomaly detection to find mispriced securities.

I need a multi-factor analysis of the given stock using your quantitative framework.

Screen:
- Value factors: P/E vs sector median, P/FCF, EV/EBITDA quartile ranking
- Quality factors: ROE, margin stability, debt-to-equity, interest coverage
- Momentum factors: price vs 200-day MA, relative strength rank, earnings revision direction
- Growth factors: revenue growth rate, EPS growth acceleration, margin expansion
- Sentiment factors: insider buying/selling, institutional accumulation, short interest trends
- Custom composite score: blend all factors into a single ranking score from 1-100
- Factor breakdown: individual score for each factor category (1-100)
- Peer comparison: how this stock ranks vs its closest 10 sector peers on each factor
- Historical factor performance: how stocks with similar factor profiles have performed
- Key risks: which factors are weakest and what could cause a score deterioration

Format as a Renaissance-style quantitative screening report with a ranked factor score breakdown table.`,
  },
  {
    key: "vanguard",
    name: "Vanguard",
    shortName: "Vanguard",
    icon: "📋",
    focus: "ETF & Portfolio",
    audienceLevel: "beginner",
    description: "Low-cost, diversified ETF portfolio construction with asset allocation guidance. Best for building a simple, effective long-term portfolio.",
    color: "#8B0000",
    systemPrompt: `You are a senior portfolio strategist at Vanguard who builds low-cost, diversified ETF portfolios for investors ranging from aggressive growth seekers to conservative retirees needing capital preservation.

Given the stock the user is analyzing, I need portfolio context and ETF alternatives.

Build:
- Stock assessment: is this an appropriate individual holding or better accessed via ETF
- ETF alternatives: which Vanguard and other low-cost ETFs provide exposure to this company's sector
- Asset allocation context: how this stock fits in a balanced portfolio
- Specific ETF selection: ticker symbol, expense ratio, and assets under management for each pick
- Core vs satellite: is this a core holding or a satellite tactical position
- Geographic diversification: how to balance this with international exposure
- Bond allocation context: appropriate bond allocation given this stock's risk profile
- Expected return range: historical annual return at different allocation levels
- Rebalancing rules: how often to rebalance if holding this stock
- Dollar cost averaging plan: how to build a position over time vs lump sum

Format as a Vanguard-style investment policy statement with allocation guidance and a specific ETF comparison list.`,
  },
  {
    key: "de-shaw",
    name: "D.E. Shaw",
    shortName: "D.E. Shaw",
    icon: "⚡",
    focus: "Options Strategy",
    audienceLevel: "advanced",
    description: "Options strategies for income, protection, and leveraged upside with defined risk. Best for sophisticated traders using derivatives.",
    color: "#1B5E20",
    systemPrompt: `You are a senior options strategist at D.E. Shaw who designs options strategies for sophisticated investors seeking income generation, downside protection, and leveraged upside with defined risk.

I need options strategy recommendations for the given stock.

Design:
- Current implied volatility assessment: is IV high, low, or fair vs historical
- Strategy selection: covered calls, cash-secured puts, spreads, straddles, or iron condors with reasoning
- Exact trade setup: specific strike prices, expiration dates, and contract quantities for a $10,000 position
- Maximum profit calculation: the most I can make if the trade goes perfectly
- Maximum loss calculation: the most I can lose in the worst-case scenario
- Breakeven price: exactly where the stock needs to be at expiration
- Probability of profit: estimated likelihood based on current implied volatility
- Greeks analysis: delta, theta, gamma exposure and what they mean for the position
- Adjustment plan: what to do if the stock moves against the position
- Exit rules: when to take profits early and when to cut losses

Format as a D.E. Shaw-style options trade recommendation with a payoff description and risk management rules.`,
  },
  {
    key: "two-sigma",
    name: "Two Sigma",
    shortName: "Two Sigma",
    icon: "🌍",
    focus: "Macro Outlook",
    audienceLevel: "intermediate",
    description: "Economic data, Fed policy, geopolitical risks, and cross-asset signals synthesized into a market outlook. Best for understanding the big picture.",
    color: "#0D47A1",
    systemPrompt: `You are a senior macro strategist at Two Sigma who synthesizes economic data, Federal Reserve policy, geopolitical risks, and cross-asset signals into a comprehensive market outlook for the firm's portfolio managers.

I need a macro context analysis for the given stock covering everything that could impact it in the next 3-6 months.

Assess:
- Economic indicators impact: how GDP growth, unemployment, inflation affect this specific stock
- Federal Reserve analysis: how current policy stance and rate expectations impact this stock
- Earnings environment: how aggregate earnings trends affect this stock's sector
- Valuation context: is this stock's sector cheap, fair, or expensive by historical standards
- Credit market signals: what high yield and investment grade spreads say about risk appetite
- Market breadth impact: what broad market health means for this stock
- Sentiment indicators: VIX, put-call ratio, and what they suggest for this stock
- Geopolitical risk factors: active risks that could specifically impact this company
- Seasonal patterns: historical performance of this stock in the coming months
- Actionable positioning: specific recommendation for this stock given the macro backdrop

Format as a Two Sigma-style macro strategy note with a market dashboard summary and clear positioning recommendation.`,
  },
];

export const analystsByKey = Object.fromEntries(
  analysts.map((a) => [a.key, a])
);
```

**Step 3: Create US ticker list**

Create `src/data/tickers.ts` with ~100 most popular US tickers (enough for MVP):
```typescript
export interface TickerInfo {
  symbol: string;
  name: string;
  sector: string;
}

export const tickers: TickerInfo[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financials" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Staples" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Discretionary" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Communication Services" },
  { symbol: "BAC", name: "Bank of America", sector: "Financials" },
  { symbol: "XOM", name: "Exxon Mobil Corp.", sector: "Energy" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Staples" },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Staples" },
  { symbol: "CSCO", name: "Cisco Systems", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corp.", sector: "Technology" },
  { symbol: "COST", name: "Costco Wholesale", sector: "Consumer Staples" },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer Discretionary" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co.", sector: "Healthcare" },
  { symbol: "T", name: "AT&T Inc.", sector: "Communication Services" },
  { symbol: "VZ", name: "Verizon Communications", sector: "Communication Services" },
  { symbol: "WFC", name: "Wells Fargo & Co.", sector: "Financials" },
  { symbol: "CVX", name: "Chevron Corp.", sector: "Energy" },
  { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Healthcare" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corp.", sector: "Technology" },
  { symbol: "ACN", name: "Accenture plc", sector: "Technology" },
  { symbol: "MCD", name: "McDonald's Corp.", sector: "Consumer Discretionary" },
  { symbol: "QCOM", name: "Qualcomm Inc.", sector: "Technology" },
  { symbol: "TXN", name: "Texas Instruments", sector: "Technology" },
  { symbol: "UPS", name: "United Parcel Service", sector: "Industrials" },
  { symbol: "LOW", name: "Lowe's Companies", sector: "Consumer Discretionary" },
  { symbol: "GS", name: "Goldman Sachs Group", sector: "Financials" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financials" },
  { symbol: "BLK", name: "BlackRock Inc.", sector: "Financials" },
  { symbol: "SPGI", name: "S&P Global Inc.", sector: "Financials" },
  { symbol: "SYK", name: "Stryker Corp.", sector: "Healthcare" },
  { symbol: "AXP", name: "American Express", sector: "Financials" },
  { symbol: "DE", name: "Deere & Co.", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrials" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrials" },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrials" },
  { symbol: "RTX", name: "RTX Corp.", sector: "Industrials" },
  { symbol: "SBUX", name: "Starbucks Corp.", sector: "Consumer Discretionary" },
  { symbol: "PLTR", name: "Palantir Technologies", sector: "Technology" },
  { symbol: "COIN", name: "Coinbase Global", sector: "Financials" },
  { symbol: "SQ", name: "Block Inc.", sector: "Financials" },
  { symbol: "SNOW", name: "Snowflake Inc.", sector: "Technology" },
  { symbol: "UBER", name: "Uber Technologies", sector: "Technology" },
  { symbol: "ABNB", name: "Airbnb Inc.", sector: "Consumer Discretionary" },
  { symbol: "SHOP", name: "Shopify Inc.", sector: "Technology" },
  { symbol: "PANW", name: "Palo Alto Networks", sector: "Technology" },
  { symbol: "CRWD", name: "CrowdStrike Holdings", sector: "Technology" },
  { symbol: "DDOG", name: "Datadog Inc.", sector: "Technology" },
  { symbol: "ZS", name: "Zscaler Inc.", sector: "Technology" },
  { symbol: "NET", name: "Cloudflare Inc.", sector: "Technology" },
  { symbol: "MELI", name: "MercadoLibre Inc.", sector: "Consumer Discretionary" },
  { symbol: "SE", name: "Sea Limited", sector: "Technology" },
  { symbol: "RIVN", name: "Rivian Automotive", sector: "Consumer Discretionary" },
  { symbol: "LCID", name: "Lucid Group", sector: "Consumer Discretionary" },
  { symbol: "F", name: "Ford Motor Co.", sector: "Consumer Discretionary" },
  { symbol: "GM", name: "General Motors", sector: "Consumer Discretionary" },
  { symbol: "AAL", name: "American Airlines", sector: "Industrials" },
  { symbol: "DAL", name: "Delta Air Lines", sector: "Industrials" },
  { symbol: "UAL", name: "United Airlines Holdings", sector: "Industrials" },
  { symbol: "LUV", name: "Southwest Airlines", sector: "Industrials" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "ETF" },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", sector: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock", sector: "ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500", sector: "ETF" },
  { symbol: "SOFI", name: "SoFi Technologies", sector: "Financials" },
  { symbol: "HOOD", name: "Robinhood Markets", sector: "Financials" },
  { symbol: "ARM", name: "Arm Holdings", sector: "Technology" },
  { symbol: "SMCI", name: "Super Micro Computer", sector: "Technology" },
  { symbol: "MU", name: "Micron Technology", sector: "Technology" },
  { symbol: "LRCX", name: "Lam Research", sector: "Technology" },
  { symbol: "AMAT", name: "Applied Materials", sector: "Technology" },
  { symbol: "NOW", name: "ServiceNow Inc.", sector: "Technology" },
  { symbol: "ISRG", name: "Intuitive Surgical", sector: "Healthcare" },
  { symbol: "REGN", name: "Regeneron Pharma", sector: "Healthcare" },
  { symbol: "GILD", name: "Gilead Sciences", sector: "Healthcare" },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific", sector: "Healthcare" },
  { symbol: "BMY", name: "Bristol-Myers Squibb", sector: "Healthcare" },
  { symbol: "O", name: "Realty Income Corp.", sector: "Real Estate" },
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
```

**Step 4: Commit**

```bash
git add src/types/index.ts src/data/analysts.ts src/data/tickers.ts
git commit -m "feat: add analyst definitions, system prompts, and ticker data"
```

---

### Task 3: Onboarding Quiz Component

**Files:**
- Create: `src/data/onboarding.ts`
- Create: `src/components/OnboardingQuiz.tsx`
- Create: `src/hooks/useOnboarding.ts`

**Step 1: Define onboarding questions and scoring data**

Create `src/data/onboarding.ts`:
```typescript
export interface QuizOption {
  id: string;
  label: string;
  description: string;
  weights: Record<string, number>; // analyst key -> weight (0-3)
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "investor-type",
    question: "What type of investor are you?",
    subtitle: "This helps us recommend the right analysis styles",
    options: [
      {
        id: "beginner",
        label: "Curious Beginner",
        description: "I'm learning about investing and want clear, easy-to-understand analyses",
        weights: {
          goldman: 3, blackrock: 3, vanguard: 3, jpmorgan: 2,
          "morgan-stanley": 1, bridgewater: 0, citadel: 1,
          renaissance: 0, "de-shaw": 0, "two-sigma": 1,
        },
      },
      {
        id: "active",
        label: "Active Investor",
        description: "I trade regularly and want actionable insights for timing my moves",
        weights: {
          "morgan-stanley": 3, jpmorgan: 3, "de-shaw": 3, goldman: 2,
          blackrock: 1, vanguard: 0, bridgewater: 1, citadel: 2,
          renaissance: 1, "two-sigma": 2,
        },
      },
      {
        id: "manager",
        label: "Portfolio Manager",
        description: "I manage a diversified portfolio and need comprehensive risk and macro analysis",
        weights: {
          bridgewater: 3, citadel: 3, "two-sigma": 3, renaissance: 2,
          goldman: 2, "morgan-stanley": 1, jpmorgan: 1, blackrock: 1,
          vanguard: 1, "de-shaw": 2,
        },
      },
    ],
  },
  {
    id: "goal",
    question: "What is your primary investment goal?",
    subtitle: "Different goals benefit from different analysis frameworks",
    options: [
      {
        id: "income",
        label: "Passive Income",
        description: "Build reliable dividend income that grows over time",
        weights: {
          blackrock: 3, vanguard: 3, goldman: 2, jpmorgan: 1,
          "morgan-stanley": 0, bridgewater: 1, citadel: 1,
          renaissance: 1, "de-shaw": 1, "two-sigma": 0,
        },
      },
      {
        id: "growth",
        label: "Long-Term Growth",
        description: "Grow my wealth over years by picking great companies",
        weights: {
          goldman: 3, renaissance: 3, citadel: 2, bridgewater: 1,
          blackrock: 1, vanguard: 2, jpmorgan: 1, "morgan-stanley": 1,
          "de-shaw": 0, "two-sigma": 1,
        },
      },
      {
        id: "trading",
        label: "Active Trading",
        description: "Make tactical trades based on short-term opportunities",
        weights: {
          "morgan-stanley": 3, "de-shaw": 3, jpmorgan: 3, "two-sigma": 2,
          citadel: 2, goldman: 1, renaissance: 1, bridgewater: 1,
          blackrock: 0, vanguard: 0,
        },
      },
    ],
  },
  {
    id: "horizon",
    question: "What is your typical time horizon?",
    subtitle: "Your holding period determines which analyses matter most",
    options: [
      {
        id: "short",
        label: "Short Term",
        description: "Days to weeks — I want quick, actionable setups",
        weights: {
          "morgan-stanley": 3, jpmorgan: 3, "de-shaw": 3, "two-sigma": 2,
          citadel: 1, goldman: 0, renaissance: 1, bridgewater: 1,
          blackrock: 0, vanguard: 0,
        },
      },
      {
        id: "medium",
        label: "Medium Term",
        description: "Months — I hold positions through trends and cycles",
        weights: {
          goldman: 3, citadel: 3, "two-sigma": 3, bridgewater: 2,
          jpmorgan: 2, "morgan-stanley": 1, renaissance: 2,
          "de-shaw": 1, blackrock: 1, vanguard: 1,
        },
      },
      {
        id: "long",
        label: "Long Term",
        description: "Years — I buy and hold quality assets",
        weights: {
          blackrock: 3, vanguard: 3, renaissance: 3, goldman: 2,
          bridgewater: 2, citadel: 1, "two-sigma": 1, jpmorgan: 0,
          "morgan-stanley": 0, "de-shaw": 0,
        },
      },
    ],
  },
  {
    id: "risk",
    question: "What is your risk tolerance?",
    subtitle: "This determines which risk frameworks we emphasize",
    options: [
      {
        id: "conservative",
        label: "Conservative",
        description: "Capital preservation first — I sleep better with lower volatility",
        weights: {
          blackrock: 3, vanguard: 3, bridgewater: 3, goldman: 2,
          "two-sigma": 1, citadel: 1, jpmorgan: 1, renaissance: 1,
          "morgan-stanley": 0, "de-shaw": 0,
        },
      },
      {
        id: "moderate",
        label: "Moderate",
        description: "Balanced approach — willing to accept some volatility for better returns",
        weights: {
          goldman: 3, citadel: 3, jpmorgan: 3, "two-sigma": 2,
          bridgewater: 2, renaissance: 2, blackrock: 1, vanguard: 1,
          "morgan-stanley": 1, "de-shaw": 1,
        },
      },
      {
        id: "aggressive",
        label: "Aggressive",
        description: "High risk, high reward — I'm comfortable with big swings",
        weights: {
          "morgan-stanley": 3, "de-shaw": 3, renaissance: 3, citadel: 2,
          jpmorgan: 2, "two-sigma": 2, goldman: 1, bridgewater: 1,
          blackrock: 0, vanguard: 0,
        },
      },
    ],
  },
];

export function calculateRecommendations(
  answers: Record<string, string>
): string[] {
  const scores: Record<string, number> = {};

  for (const question of quizQuestions) {
    const answerId = answers[question.id];
    if (!answerId) continue;
    const option = question.options.find((o) => o.id === answerId);
    if (!option) continue;
    for (const [analystKey, weight] of Object.entries(option.weights)) {
      scores[analystKey] = (scores[analystKey] || 0) + weight;
    }
  }

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([key]) => key);
}
```

**Step 2: Create onboarding hook for state management**

Create `src/hooks/useOnboarding.ts`:
```typescript
"use client";

import { useState, useCallback } from "react";
import { quizQuestions, calculateRecommendations } from "@/data/onboarding";

const STORAGE_KEY = "wsa-onboarding-profile";

export interface OnboardingState {
  isComplete: boolean;
  isOpen: boolean;
  currentStep: number;
  answers: Record<string, string>;
  recommendedAnalysts: string[];
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === "undefined") {
      return {
        isComplete: false,
        isOpen: false,
        currentStep: 0,
        answers: {},
        recommendedAnalysts: [],
      };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isOpen: false };
    }
    return {
      isComplete: false,
      isOpen: true,
      currentStep: 0,
      answers: {},
      recommendedAnalysts: [],
    };
  });

  const answerQuestion = useCallback(
    (questionId: string, answerId: string) => {
      setState((prev) => {
        const newAnswers = { ...prev.answers, [questionId]: answerId };
        const isLastQuestion =
          prev.currentStep >= quizQuestions.length - 1;

        if (isLastQuestion) {
          const recommended = calculateRecommendations(newAnswers);
          const newState = {
            isComplete: true,
            isOpen: false,
            currentStep: prev.currentStep,
            answers: newAnswers,
            recommendedAnalysts: recommended,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          return newState;
        }

        return {
          ...prev,
          currentStep: prev.currentStep + 1,
          answers: newAnswers,
        };
      });
    },
    []
  );

  const skipOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      isComplete: true,
      isOpen: false,
      currentStep: 0,
      answers: {},
      recommendedAnalysts: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setState(newState);
  }, []);

  const reopenQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      currentStep: 0,
      answers: {},
      isComplete: false,
    }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const openQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    answerQuestion,
    skipOnboarding,
    reopenQuiz,
    openQuiz,
    closeQuiz,
    totalQuestions: quizQuestions.length,
    currentQuestion: quizQuestions[state.currentStep] || null,
  };
}
```

**Step 3: Build OnboardingQuiz component**

Create `src/components/OnboardingQuiz.tsx` — full-screen modal with animated transitions, progress bar, and card-based question layout matching Robinhood style:

```tsx
"use client";

import { quizQuestions } from "@/data/onboarding";
import { analysts } from "@/data/analysts";

interface OnboardingQuizProps {
  isOpen: boolean;
  currentStep: number;
  totalQuestions: number;
  currentQuestion: (typeof quizQuestions)[0] | null;
  onAnswer: (questionId: string, answerId: string) => void;
  onSkip: () => void;
  recommendedAnalysts: string[];
  isComplete: boolean;
}

export function OnboardingQuiz({
  isOpen,
  currentStep,
  totalQuestions,
  currentQuestion,
  onAnswer,
  onSkip,
  recommendedAnalysts,
  isComplete,
}: OnboardingQuizProps) {
  if (!isOpen) return null;

  const progress = ((currentStep) / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
        <h1 className="text-lg font-semibold">Wall Street Analyzer</h1>
        <button
          onClick={onSkip}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-surface-secondary">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        {currentQuestion && (
          <div className="w-full max-w-lg">
            <div className="mb-2 text-sm text-text-tertiary">
              Question {currentStep + 1} of {totalQuestions}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {currentQuestion.question}
            </h2>
            <p className="text-text-secondary mb-8">
              {currentQuestion.subtitle}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    onAnswer(currentQuestion.id, option.id)
                  }
                  className="w-full text-left p-4 rounded-card border border-border-light hover:border-accent hover:shadow-card transition-all duration-200 group"
                >
                  <div className="font-semibold group-hover:text-accent transition-colors">
                    {option.label}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function OnboardingResults({
  recommendedAnalysts,
  onClose,
}: {
  recommendedAnalysts: string[];
  onClose: () => void;
}) {
  const recommended = recommendedAnalysts
    .map((key) => analysts.find((a) => a.key === key))
    .filter(Boolean);

  if (recommended.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-2">
            Your recommended analysts
          </h2>
          <p className="text-text-secondary mb-8">
            Based on your profile, these analysis styles will be most
            useful to you. You can always access all 10 analysts.
          </p>

          <div className="space-y-3 mb-8">
            {recommended.map((analyst) => (
              <div
                key={analyst!.key}
                className="flex items-start gap-4 p-4 rounded-card border border-border-light"
              >
                <span className="text-2xl">{analyst!.icon}</span>
                <div>
                  <div className="font-semibold">{analyst!.name}</div>
                  <div className="text-sm text-text-secondary">
                    {analyst!.focus}
                  </div>
                  <div className="text-sm text-text-tertiary mt-1">
                    {analyst!.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-accent text-white rounded-card font-semibold hover:bg-gray-800 transition-colors"
          >
            Start Analyzing
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/data/onboarding.ts src/hooks/useOnboarding.ts src/components/OnboardingQuiz.tsx
git commit -m "feat: add onboarding quiz with scoring and recommendations"
```

---

### Task 4: Portfolio Sidebar Component

**Files:**
- Create: `src/hooks/usePortfolio.ts`
- Create: `src/components/PortfolioSidebar.tsx`
- Create: `src/components/TickerSearch.tsx`

**Step 1: Create portfolio state hook**

Create `src/hooks/usePortfolio.ts`:
```typescript
"use client";

import { useState, useCallback } from "react";
import { PortfolioStock } from "@/types";
import { tickers } from "@/data/tickers";

const STORAGE_KEY = "wsa-portfolio";

export function usePortfolio() {
  const [stocks, setStocks] = useState<PortfolioStock[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const addStock = useCallback((ticker: string) => {
    setStocks((prev) => {
      if (prev.some((s) => s.ticker === ticker)) return prev;
      const info = tickers.find((t) => t.symbol === ticker);
      const newStocks = [
        ...prev,
        {
          ticker,
          name: info?.name || ticker,
          addedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStocks));
      return newStocks;
    });
  }, []);

  const removeStock = useCallback(
    (ticker: string) => {
      setStocks((prev) => {
        const newStocks = prev.filter((s) => s.ticker !== ticker);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStocks));
        return newStocks;
      });
      if (selectedTicker === ticker) setSelectedTicker(null);
    },
    [selectedTicker]
  );

  const selectStock = useCallback((ticker: string) => {
    setSelectedTicker(ticker);
  }, []);

  return {
    stocks,
    selectedTicker,
    addStock,
    removeStock,
    selectStock,
  };
}
```

**Step 2: Create ticker search component with autocomplete**

Create `src/components/TickerSearch.tsx`:
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { searchTickers, TickerInfo } from "@/data/tickers";

interface TickerSearchProps {
  onSelect: (ticker: string) => void;
  placeholder?: string;
  className?: string;
}

export function TickerSearch({
  onSelect,
  placeholder = "Search ticker or company...",
  className = "",
}: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchTickers(query));
      setIsOpen(true);
      setHighlightedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(ticker: string) {
    onSelect(ticker);
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[highlightedIndex].symbol);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-border-light rounded-card bg-surface-primary focus:outline-none focus:border-accent transition-colors"
      />
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-light rounded-card shadow-card-hover z-10 max-h-60 overflow-y-auto"
        >
          {results.map((ticker, i) => (
            <button
              key={ticker.symbol}
              onClick={() => handleSelect(ticker.symbol)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-surface-secondary transition-colors ${
                i === highlightedIndex ? "bg-surface-secondary" : ""
              }`}
            >
              <div>
                <span className="font-semibold">{ticker.symbol}</span>
                <span className="text-text-secondary ml-2">
                  {ticker.name}
                </span>
              </div>
              <span className="text-xs text-text-tertiary">
                {ticker.sector}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create portfolio sidebar**

Create `src/components/PortfolioSidebar.tsx`:
```tsx
"use client";

import { PortfolioStock } from "@/types";
import { TickerSearch } from "./TickerSearch";

interface PortfolioSidebarProps {
  stocks: PortfolioStock[];
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  onAdd: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function PortfolioSidebar({
  stocks,
  selectedTicker,
  onSelect,
  onAdd,
  onRemove,
  isMobileOpen = false,
  onMobileClose,
}: PortfolioSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-border-light
          flex flex-col h-full
          transform transition-transform duration-200
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-text-secondary uppercase tracking-wider">
              My Portfolio
            </h2>
            <span className="text-xs text-text-tertiary">
              {stocks.length} stocks
            </span>
          </div>
          <TickerSearch onSelect={onAdd} placeholder="Add a stock..." />
        </div>

        {/* Stock list */}
        <div className="flex-1 overflow-y-auto">
          {stocks.length === 0 ? (
            <div className="p-4 text-center text-sm text-text-tertiary">
              <p className="mb-2">No stocks yet</p>
              <p>Search above to add your first stock</p>
            </div>
          ) : (
            <div className="py-1">
              {stocks.map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => {
                    onSelect(stock.ticker);
                    onMobileClose?.();
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-surface-secondary transition-colors group ${
                    selectedTicker === stock.ticker
                      ? "bg-surface-secondary border-l-2 border-accent"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {stock.ticker}
                    </div>
                    <div className="text-xs text-text-tertiary truncate max-w-[140px]">
                      {stock.name}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(stock.ticker);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-loss text-xs transition-opacity p-1"
                    title="Remove"
                  >
                    &times;
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
```

**Step 4: Commit**

```bash
git add src/hooks/usePortfolio.ts src/components/TickerSearch.tsx src/components/PortfolioSidebar.tsx
git commit -m "feat: add portfolio sidebar with ticker search and autocomplete"
```

---

### Task 5: Main Dashboard Layout

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/StockHeader.tsx`
- Create: `src/components/Dashboard.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create header component**

Create `src/components/Header.tsx`:
```tsx
"use client";

interface HeaderProps {
  onMenuToggle: () => void;
  onRetakeQuiz: () => void;
}

export function Header({ onMenuToggle, onRetakeQuiz }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border-light bg-white flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1 text-text-secondary hover:text-text-primary"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">
          <span className="text-accent">Wall Street</span>{" "}
          <span className="text-text-secondary font-normal">Analyzer</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onRetakeQuiz}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    </header>
  );
}
```

**Step 2: Create stock header component**

Create `src/components/StockHeader.tsx`:
```tsx
"use client";

import { tickers } from "@/data/tickers";

interface StockHeaderProps {
  ticker: string;
}

export function StockHeader({ ticker }: StockHeaderProps) {
  const info = tickers.find((t) => t.symbol === ticker);

  return (
    <div className="p-6 border-b border-border-light">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{ticker}</h2>
          <p className="text-text-secondary">
            {info?.name || ticker}
          </p>
          {info && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-surface-secondary rounded-full text-text-tertiary">
              {info.sector}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create main Dashboard component**

Create `src/components/Dashboard.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Header } from "./Header";
import { PortfolioSidebar } from "./PortfolioSidebar";
import { StockHeader } from "./StockHeader";
import { OnboardingQuiz, OnboardingResults } from "./OnboardingQuiz";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useOnboarding } from "@/hooks/useOnboarding";

export function Dashboard() {
  const portfolio = usePortfolio();
  const onboarding = useOnboarding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Show results screen when quiz just completed
  const handleAnswer = (questionId: string, answerId: string) => {
    onboarding.answerQuestion(questionId, answerId);
    // Check if this was the last question (after state update)
    if (onboarding.currentStep >= onboarding.totalQuestions - 1) {
      setShowResults(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onRetakeQuiz={onboarding.reopenQuiz}
      />

      <div className="flex-1 flex overflow-hidden">
        <PortfolioSidebar
          stocks={portfolio.stocks}
          selectedTicker={portfolio.selectedTicker}
          onSelect={portfolio.selectStock}
          onAdd={portfolio.addStock}
          onRemove={portfolio.removeStock}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {portfolio.selectedTicker ? (
            <div>
              <StockHeader ticker={portfolio.selectedTicker} />
              {/* Analysis area placeholder - Task 7+ */}
              <div className="p-6">
                <button className="px-6 py-3 bg-accent text-white rounded-card font-semibold hover:bg-gray-800 transition-colors">
                  Run Full Analysis
                </button>
                <p className="mt-4 text-sm text-text-tertiary">
                  Analysis results will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center px-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">
                  Select a stock to analyze
                </h3>
                <p className="text-text-secondary max-w-md">
                  Add stocks to your portfolio using the sidebar, then
                  select one to run comprehensive Wall Street-style
                  analyses.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Onboarding overlays */}
      <OnboardingQuiz
        isOpen={onboarding.isOpen && !onboarding.isComplete}
        currentStep={onboarding.currentStep}
        totalQuestions={onboarding.totalQuestions}
        currentQuestion={onboarding.currentQuestion}
        onAnswer={handleAnswer}
        onSkip={onboarding.skipOnboarding}
        recommendedAnalysts={onboarding.recommendedAnalysts}
        isComplete={onboarding.isComplete}
      />

      {showResults && onboarding.recommendedAnalysts.length > 0 && (
        <OnboardingResults
          recommendedAnalysts={onboarding.recommendedAnalysts}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
```

**Step 4: Wire up page.tsx**

Replace `src/app/page.tsx`:
```tsx
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return <Dashboard />;
}
```

**Step 5: Verify it runs**

Run: `npm run dev`
Expected: App loads with header, empty sidebar with search, empty state message. Onboarding quiz shows on first visit.

**Step 6: Commit**

```bash
git add src/components/Header.tsx src/components/StockHeader.tsx src/components/Dashboard.tsx src/app/page.tsx
git commit -m "feat: build main dashboard layout with header, stock view, and onboarding integration"
```

---

## Phase 2: Analysis Engine (Tasks 6-8)

### Task 6: Claude API Streaming Endpoint

**Files:**
- Create: `src/app/api/analyze/route.ts`

**Step 1: Create SSE streaming endpoint**

Create `src/app/api/analyze/route.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { analystsByKey } from "@/data/analysts";

export const runtime = "edge";

export async function POST(req: Request) {
  const { ticker, analystKeys } = await req.json();

  if (!ticker || !analystKeys || !Array.isArray(analystKeys)) {
    return new Response(
      JSON.stringify({ error: "Missing ticker or analystKeys" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate analyst keys
  const validKeys = analystKeys.filter((k: string) => analystsByKey[k]);
  if (validKeys.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid analyst keys" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      const client = new Anthropic({ apiKey });

      // Run all analysts in parallel
      const promises = validKeys.map(async (analystKey: string) => {
        const analyst = analystsByKey[analystKey];
        if (!analyst) return;

        send("analyst-start", { analyst: analystKey });

        try {
          const stream = await client.messages.stream({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 4096,
            system: analyst.systemPrompt,
            messages: [
              {
                role: "user",
                content: `The stock: ${ticker}. Please provide your complete analysis now.`,
              },
            ],
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send("analyst-chunk", {
                analyst: analystKey,
                content: event.delta.text,
              });
            }
          }

          send("analyst-complete", { analyst: analystKey });
        } catch (error) {
          send("analyst-error", {
            analyst: analystKey,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      await Promise.all(promises);
      send("all-complete", {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/app/api/analyze/route.ts
git commit -m "feat: add Claude API streaming endpoint for parallel analyst execution"
```

---

### Task 7: Analysis Hook & SSE Client

**Files:**
- Create: `src/hooks/useAnalysis.ts`

**Step 1: Create analysis state management hook with SSE parsing**

Create `src/hooks/useAnalysis.ts`:
```typescript
"use client";

import { useState, useCallback, useRef } from "react";
import { AnalysisResult } from "@/types";
import { analysts } from "@/data/analysts";

export function useAnalysis() {
  const [results, setResults] = useState<
    Record<string, Record<string, AnalysisResult>>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(
    async (ticker: string, analystKeys?: string[]) => {
      // Abort any existing analysis
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const abortController = new AbortController();
      abortRef.current = abortController;

      const keys = analystKeys || analysts.map((a) => a.key);
      setIsAnalyzing(true);
      setActiveTicker(ticker);

      // Initialize all analysts as pending
      const initialResults: Record<string, AnalysisResult> = {};
      for (const key of keys) {
        initialResults[key] = {
          analystKey: key,
          content: "",
          status: "pending",
        };
      }
      setResults((prev) => ({ ...prev, [ticker]: initialResults }));

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, analystKeys: keys }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ") && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6));
                handleSSEEvent(ticker, currentEvent, data);
              } catch {
                // Skip malformed JSON
              }
              currentEvent = "";
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Analysis error:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  function handleSSEEvent(
    ticker: string,
    event: string,
    data: Record<string, string>
  ) {
    switch (event) {
      case "analyst-start":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              analystKey: data.analyst,
              content: "",
              status: "streaming",
            },
          },
        }));
        break;

      case "analyst-chunk":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              ...prev[ticker]?.[data.analyst],
              content:
                (prev[ticker]?.[data.analyst]?.content || "") +
                data.content,
              status: "streaming",
            },
          },
        }));
        break;

      case "analyst-complete":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              ...prev[ticker]?.[data.analyst],
              status: "complete",
            },
          },
        }));
        break;

      case "analyst-error":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              analystKey: data.analyst,
              content: "",
              status: "error",
              error: data.error,
            },
          },
        }));
        break;
    }
  }

  const cancelAnalysis = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsAnalyzing(false);
    }
  }, []);

  const getTickerResults = useCallback(
    (ticker: string) => results[ticker] || {},
    [results]
  );

  return {
    results,
    isAnalyzing,
    activeTicker,
    runAnalysis,
    cancelAnalysis,
    getTickerResults,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useAnalysis.ts
git commit -m "feat: add analysis hook with SSE streaming client"
```

---

### Task 8: Analyst Tabs & Analysis Content Display

**Files:**
- Create: `src/components/AnalystTabs.tsx`
- Create: `src/components/AnalysisContent.tsx`
- Create: `src/components/AnalysisPanel.tsx`
- Modify: `src/components/Dashboard.tsx`

**Step 1: Create analyst tab bar**

Create `src/components/AnalystTabs.tsx`:
```tsx
"use client";

import { analysts } from "@/data/analysts";
import { AnalysisResult } from "@/types";

interface AnalystTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  recommendedAnalysts: string[];
  results: Record<string, AnalysisResult>;
}

export function AnalystTabs({
  activeTab,
  onTabChange,
  recommendedAnalysts,
  results,
}: AnalystTabsProps) {
  // Sort analysts: recommended first, then rest
  const sortedAnalysts = [...analysts].sort((a, b) => {
    const aRec = recommendedAnalysts.includes(a.key) ? 0 : 1;
    const bRec = recommendedAnalysts.includes(b.key) ? 0 : 1;
    return aRec - bRec;
  });

  return (
    <div className="border-b border-border-light overflow-x-auto">
      <div className="flex min-w-max">
        {sortedAnalysts.map((analyst) => {
          const result = results[analyst.key];
          const isActive = activeTab === analyst.key;
          const isRecommended = recommendedAnalysts.includes(analyst.key);

          return (
            <button
              key={analyst.key}
              onClick={() => onTabChange(analyst.key)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-accent text-accent font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              <span>{analyst.icon}</span>
              <span>{analyst.shortName}</span>

              {/* Status indicator */}
              {result?.status === "streaming" && (
                <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
              )}
              {result?.status === "complete" && (
                <span className="w-2 h-2 rounded-full bg-gain" />
              )}
              {result?.status === "error" && (
                <span className="w-2 h-2 rounded-full bg-loss" />
              )}

              {/* Recommended badge */}
              {isRecommended && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Create analysis content renderer**

Create `src/components/AnalysisContent.tsx` — renders markdown-like content from Claude with analyst-specific styling:

```tsx
"use client";

import { AnalysisResult } from "@/types";
import { analystsByKey } from "@/data/analysts";

interface AnalysisContentProps {
  analystKey: string;
  result: AnalysisResult | undefined;
}

export function AnalysisContent({
  analystKey,
  result,
}: AnalysisContentProps) {
  const analyst = analystsByKey[analystKey];

  if (!result || result.status === "pending") {
    return (
      <div className="p-6 text-center text-text-tertiary">
        <div className="text-3xl mb-3">{analyst?.icon}</div>
        <p className="font-semibold">{analyst?.name}</p>
        <p className="text-sm mt-1">{analyst?.description}</p>
        <p className="text-xs mt-3 text-text-tertiary">
          Run analysis to see results
        </p>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-card">
          <p className="text-sm font-semibold text-loss">Analysis Failed</p>
          <p className="text-sm text-text-secondary mt-1">
            {result.error || "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Analyst badge */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
        <span className="text-xl">{analyst?.icon}</span>
        <div>
          <div className="font-semibold text-sm">{analyst?.name}</div>
          <div className="text-xs text-text-tertiary">{analyst?.focus}</div>
        </div>
        {result.status === "streaming" && (
          <span className="ml-auto text-xs text-gain flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            Analyzing...
          </span>
        )}
        {result.status === "complete" && (
          <span className="ml-auto text-xs text-text-tertiary">
            Complete
          </span>
        )}
      </div>

      {/* Content with basic markdown rendering */}
      <div
        className="prose prose-sm max-w-none
          prose-headings:text-text-primary prose-headings:font-semibold
          prose-h1:text-xl prose-h1:border-b prose-h1:border-border-light prose-h1:pb-2 prose-h1:mb-4
          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
          prose-p:text-text-primary prose-p:leading-relaxed
          prose-strong:text-text-primary
          prose-ul:my-2 prose-li:my-0.5
          prose-table:text-sm
          prose-th:bg-surface-secondary prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
          prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border-light"
        style={{ color: "inherit" }}
      >
        <MarkdownRenderer content={result.content} />
        {result.status === "streaming" && (
          <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown to HTML converter for Claude output
  const html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-:]+$/.test(c))) return ''; // separator row
      const tag = 'td';
      const row = cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('');
      return `<tr>${row}</tr>`;
    })
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return (
    <div
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
    />
  );
}
```

**Step 3: Create analysis panel (combines tabs + content)**

Create `src/components/AnalysisPanel.tsx`:
```tsx
"use client";

import { useState } from "react";
import { AnalystTabs } from "./AnalystTabs";
import { AnalysisContent } from "./AnalysisContent";
import { AnalysisResult } from "@/types";
import { analysts } from "@/data/analysts";

interface AnalysisPanelProps {
  ticker: string;
  results: Record<string, AnalysisResult>;
  recommendedAnalysts: string[];
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onCancelAnalysis: () => void;
}

export function AnalysisPanel({
  ticker,
  results,
  recommendedAnalysts,
  isAnalyzing,
  onRunAnalysis,
  onCancelAnalysis,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState(() => {
    // Default to first recommended analyst, or first analyst
    return recommendedAnalysts[0] || analysts[0].key;
  });

  const hasAnyResults = Object.values(results).some(
    (r) => r.status !== "pending"
  );

  return (
    <div>
      {/* Action bar */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-border-light">
        {isAnalyzing ? (
          <button
            onClick={onCancelAnalysis}
            className="px-5 py-2.5 bg-loss text-white rounded-card text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Cancel Analysis
          </button>
        ) : (
          <button
            onClick={onRunAnalysis}
            className="px-5 py-2.5 bg-accent text-white rounded-card text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Run Full Analysis
          </button>
        )}

        {isAnalyzing && (
          <span className="text-sm text-text-secondary">
            Analyzing {ticker} with{" "}
            {Object.values(results).filter(
              (r) => r.status === "streaming"
            ).length}{" "}
            active analysts...
          </span>
        )}

        {!isAnalyzing && hasAnyResults && (
          <span className="text-sm text-text-tertiary">
            {Object.values(results).filter((r) => r.status === "complete")
              .length}{" "}
            of {analysts.length} analyses complete
          </span>
        )}
      </div>

      {/* Tabs */}
      <AnalystTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recommendedAnalysts={recommendedAnalysts}
        results={results}
      />

      {/* Content */}
      <AnalysisContent
        analystKey={activeTab}
        result={results[activeTab]}
      />
    </div>
  );
}
```

**Step 4: Update Dashboard to integrate analysis**

Modify `src/components/Dashboard.tsx` — add `useAnalysis` hook and wire up AnalysisPanel:

Replace the main content section in Dashboard with:
```tsx
"use client";

import { useState } from "react";
import { Header } from "./Header";
import { PortfolioSidebar } from "./PortfolioSidebar";
import { StockHeader } from "./StockHeader";
import { AnalysisPanel } from "./AnalysisPanel";
import { OnboardingQuiz, OnboardingResults } from "./OnboardingQuiz";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAnalysis } from "@/hooks/useAnalysis";

export function Dashboard() {
  const portfolio = usePortfolio();
  const onboarding = useOnboarding();
  const analysis = useAnalysis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, answerId: string) => {
    onboarding.answerQuestion(questionId, answerId);
    if (onboarding.currentStep >= onboarding.totalQuestions - 1) {
      setShowResults(true);
    }
  };

  const handleRunAnalysis = () => {
    if (!portfolio.selectedTicker) return;
    analysis.runAnalysis(portfolio.selectedTicker);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onRetakeQuiz={onboarding.reopenQuiz}
      />

      <div className="flex-1 flex overflow-hidden">
        <PortfolioSidebar
          stocks={portfolio.stocks}
          selectedTicker={portfolio.selectedTicker}
          onSelect={portfolio.selectStock}
          onAdd={portfolio.addStock}
          onRemove={portfolio.removeStock}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {portfolio.selectedTicker ? (
            <div>
              <StockHeader ticker={portfolio.selectedTicker} />
              <AnalysisPanel
                ticker={portfolio.selectedTicker}
                results={analysis.getTickerResults(
                  portfolio.selectedTicker
                )}
                recommendedAnalysts={onboarding.recommendedAnalysts}
                isAnalyzing={analysis.isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
                onCancelAnalysis={analysis.cancelAnalysis}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center px-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">
                  Select a stock to analyze
                </h3>
                <p className="text-text-secondary max-w-md">
                  Add stocks to your portfolio using the sidebar, then
                  select one to run comprehensive Wall Street-style
                  analyses.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <OnboardingQuiz
        isOpen={onboarding.isOpen && !onboarding.isComplete}
        currentStep={onboarding.currentStep}
        totalQuestions={onboarding.totalQuestions}
        currentQuestion={onboarding.currentQuestion}
        onAnswer={handleAnswer}
        onSkip={onboarding.skipOnboarding}
        recommendedAnalysts={onboarding.recommendedAnalysts}
        isComplete={onboarding.isComplete}
      />

      {showResults && onboarding.recommendedAnalysts.length > 0 && (
        <OnboardingResults
          recommendedAnalysts={onboarding.recommendedAnalysts}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
```

**Step 5: Install prose plugin for Tailwind**

Run:
```bash
npm install @tailwindcss/typography
```

Then add to `tailwind.config.ts` plugins:
```typescript
plugins: [require("@tailwindcss/typography")],
```

**Step 6: Verify it runs**

Run: `npm run dev`
Expected: Full dashboard with sidebar, stock header, analyst tabs, and analysis button. Clicking "Run Full Analysis" calls API (needs ANTHROPIC_API_KEY env var).

**Step 7: Commit**

```bash
git add src/components/AnalystTabs.tsx src/components/AnalysisContent.tsx src/components/AnalysisPanel.tsx src/components/Dashboard.tsx tailwind.config.ts package.json package-lock.json
git commit -m "feat: add analyst tabs, streaming content display, and analysis panel"
```

---

## Phase 3: Polish & Production Readiness (Tasks 9-11)

### Task 9: Environment Configuration & Error States

**Files:**
- Create: `.env.local.example`
- Create: `src/components/EmptyStates.tsx`

**Step 1: Create env example file**

Create `.env.local.example`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Step 2: Create polished empty states and loading components**

Create `src/components/EmptyStates.tsx` with:
- `EmptyPortfolio` — shown when no stocks added (encouraging CTA)
- `EmptyAnalysis` — shown when stock selected but no analysis run
- `AnalysisLoading` — skeleton loading state while streaming
- `ErrorBanner` — error display with retry button

**Step 3: Commit**

```bash
git add .env.local.example src/components/EmptyStates.tsx
git commit -m "feat: add environment config and polished empty states"
```

---

### Task 10: Responsive Design Polish

**Files:**
- Modify: `src/components/PortfolioSidebar.tsx`
- Modify: `src/components/AnalystTabs.tsx`
- Modify: `src/components/Dashboard.tsx`

**Step 1: Polish mobile layout**

- Sidebar: slide-in drawer with backdrop on mobile
- Tabs: horizontal scroll with fade edges on mobile
- Content: full-width with proper padding
- Header: compact with hamburger menu

**Step 2: Verify on different viewport sizes**

Test at 375px, 768px, 1024px, 1440px widths.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: polish responsive design for mobile, tablet, and desktop"
```

---

### Task 11: Cloudflare Deployment Configuration

**Files:**
- Create: `wrangler.toml` (if using Cloudflare Workers directly)
- Modify: `next.config.js`

**Step 1: Configure Next.js for Cloudflare Pages**

Install adapter:
```bash
npm install @cloudflare/next-on-pages
```

Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
};

module.exports = nextConfig;
```

**Step 2: Add build script for Cloudflare**

Add to `package.json` scripts:
```json
"pages:build": "npx @cloudflare/next-on-pages",
"pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat",
"pages:deploy": "npm run pages:build && npx wrangler pages deploy .vercel/output/static"
```

**Step 3: Create .gitignore**

```
node_modules/
.next/
.vercel/
.env.local
.wrangler/
```

**Step 4: Commit**

```bash
git add next.config.js package.json .gitignore wrangler.toml
git commit -m "feat: configure Cloudflare Pages deployment"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| Phase 1 (Tasks 1-5) | Foundation | Working layout, onboarding quiz, portfolio sidebar, ticker search |
| Phase 2 (Tasks 6-8) | Analysis Engine | Claude API streaming, SSE client, analyst tabs, content display |
| Phase 3 (Tasks 9-11) | Polish & Deploy | Error states, responsive polish, Cloudflare deployment |

**Total estimated commits:** 11
**Key dependency:** `ANTHROPIC_API_KEY` environment variable for Phase 2+
