# Wall Street Analyzer — Design Document

**Date:** 2026-03-01
**Status:** Approved

## Overview

A responsive web application that lets users build a stock portfolio and run comprehensive analyses on each stock using 10 distinct Wall Street analyst personas powered by Claude API. Features an onboarding quiz to help novice users identify the most relevant analyst styles, and a credit-based free tier.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Deployment | Cloudflare Pages + Workers |
| Auth | Email magic link (Cloudflare KV for sessions) |
| Database | Cloudflare D1 (SQLite at edge) |
| Cache/Sessions | Cloudflare KV |
| AI | Claude API (Anthropic SDK) with streaming |

## Visual Design Direction

Inspired by Robinhood web app (light theme):
- Background: white (#FFFFFF), subtle gray sections (#F5F5F5)
- Accent green: #00C805 (gains), accent red: #FF5000 (losses)
- Typography: Inter or DM Sans, sans-serif, modern
- Cards: light shadows (0 1px 3px rgba(0,0,0,0.08)), border-radius 8px
- Abundant whitespace, controlled information density
- Sparkline charts in stock headers
- Clean horizontal tab navigation for analysts

## Architecture

### Pages

```
/ — Landing page + login
/dashboard — Main SPA: portfolio sidebar + analysis area
/onboarding — Quiz flow (modal overlay, first visit)
/api/auth/magic-link — POST: send magic link email
/api/auth/verify — GET: verify token, create session
/api/analyze — POST: streaming Claude analysis endpoint
```

### Data Model (D1)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 0,
  onboarding_profile JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolio_stocks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  ticker TEXT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, ticker)
);

CREATE TABLE analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  ticker TEXT NOT NULL,
  analyst_key TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0
);
```

### Credit System

- New account: 0 credits
- Adding 3+ stocks to portfolio: unlocks 3 free credits
- 1 credit = 1 full analysis run (all 10 analysts for 1 stock)
- Credit counter visible in header
- Future: paid plans for more credits

## Onboarding Quiz

### Flow

Full-screen modal on first visit. 4 questions, one per screen, smooth transitions. Skippable. Results stored in `users.onboarding_profile`.

### Questions & Scoring

Each question maps to analyst weights. Final score = sum of weights per analyst. Top 3-4 become "Recommended for you".

**Q1: "What type of investor are you?"**
| Answer | High weight | Medium weight |
|--------|------------|---------------|
| Curious beginner | Goldman, BlackRock, Vanguard | JPMorgan |
| Active investor | Morgan Stanley, JPMorgan, D.E. Shaw | Goldman |
| Portfolio manager | Bridgewater, Citadel, Two Sigma | Renaissance |

**Q2: "What is your primary goal?"**
| Answer | High weight | Medium weight |
|--------|------------|---------------|
| Passive income | BlackRock, Vanguard | Goldman |
| Long-term growth | Goldman, Renaissance | Citadel |
| Active trading | Morgan Stanley, D.E. Shaw, JPMorgan | Two Sigma |

**Q3: "What is your time horizon?"**
| Answer | High weight | Medium weight |
|--------|------------|---------------|
| Short term (days/weeks) | Morgan Stanley, JPMorgan, D.E. Shaw | Two Sigma |
| Medium term (months) | Goldman, Citadel, Two Sigma | Bridgewater |
| Long term (years) | BlackRock, Vanguard, Renaissance | Goldman |

**Q4: "What is your risk tolerance?"**
| Answer | High weight | Medium weight |
|--------|------------|---------------|
| Conservative | BlackRock, Vanguard, Bridgewater | Goldman |
| Moderate | Goldman, Citadel, JPMorgan | Two Sigma |
| Aggressive | Morgan Stanley, D.E. Shaw, Renaissance | Citadel |

### Result

Score each analyst 0-100 based on accumulated weights. Display top 3-4 with explanations. Store profile for tab ordering.

## Analyst Personas

### 10 Analysts

| Key | Short Name | Icon | Focus | Audience Level |
|-----|-----------|------|-------|----------------|
| goldman | Goldman Sachs | 🏦 | Fundamental analysis | All |
| morgan-stanley | Morgan Stanley | 📊 | Technical analysis | Intermediate+ |
| bridgewater | Bridgewater | 🛡️ | Risk assessment | Advanced |
| jpmorgan | JPMorgan | 📈 | Earnings analysis | Intermediate |
| blackrock | BlackRock | 💰 | Dividend income | Beginner+ |
| citadel | Citadel | 🔄 | Sector rotation | Intermediate+ |
| renaissance | Renaissance Tech | 🔢 | Quantitative screening | Advanced |
| vanguard | Vanguard | 📋 | ETF portfolio | Beginner |
| de-shaw | D.E. Shaw | ⚡ | Options strategy | Advanced |
| two-sigma | Two Sigma | 🌍 | Macro outlook | Intermediate+ |

### System Prompts

Each analyst has a dedicated system prompt (provided by user) that defines:
- The persona and expertise level
- The analysis framework to follow
- The specific sections and format to produce
- The output format (research note, memo, dashboard, etc.)

### Rendering Styles

Each analyst's output is rendered with a distinct visual treatment:

- **Goldman Sachs**: Rating box (Buy/Hold/Sell with conviction) at top, structured sections with headers, bull/bear case cards
- **Morgan Stanley**: Technical dashboard grid with indicator cards (RSI, MACD, etc.), trade setup summary box
- **Bridgewater**: Risk dashboard table at top, red/yellow/green risk indicators, memo format
- **JPMorgan**: Decision summary box at top, earnings history table, trade plan
- **BlackRock**: Dividend safety scorecard (1-10 visual), 10-year income projection table, yield comparison
- **Citadel**: Sector ranking table with color-coded momentum, allocation pie, ETF picks
- **Renaissance**: Factor score breakdown table (value, quality, momentum, growth, sentiment), composite ranking
- **Vanguard**: Allocation visualization, ETF purchase list with expense ratios, rebalancing rules
- **D.E. Shaw**: Options payoff description, Greeks table, risk/reward summary, adjustment plan
- **Two Sigma**: Macro dashboard with indicator cards, positioning recommendations, risk factors

## UI Components

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Logo    [Search ticker...]           Credits: 7    [👤] │
├─────────┬────────────────────────────────────────────────┤
│ SIDEBAR │  MAIN CONTENT AREA                             │
│         │                                                │
│ My      │  Stock Header: Name, Price, Change, Sparkline  │
│ Portfolio│                                               │
│         │  [🚀 Run Full Analysis]                        │
│ • AAPL  │                                                │
│ • MSFT  │  ┌──────────────────────────────────────────┐  │
│ • GOOGL │  │ Tab Bar: Analyst tabs (recommended first)│  │
│         │  ├──────────────────────────────────────────┤  │
│ [+ Add] │  │                                          │  │
│         │  │  Analysis content (streamed, formatted)  │  │
│         │  │                                          │  │
│         │  └──────────────────────────────────────────┘  │
└─────────┴────────────────────────────────────────────────┘
```

### Responsive Behavior

- **Desktop (1024px+)**: Full layout as above
- **Tablet (768-1023px)**: Collapsible sidebar, full content area
- **Mobile (<768px)**: Bottom nav for portfolio, full-screen analysis, swipeable tabs

### Key Interactions

1. **Add stock**: Search input with autocomplete (top 500 US tickers hardcoded)
2. **Select stock**: Click in sidebar → loads stock header, shows cached analyses or empty state
3. **Run analysis**: Button triggers parallel Claude API calls for all 10 analysts
4. **View results**: Tab switching shows each analyst's formatted output
5. **Streaming**: Real-time text appearance as Claude generates each analysis

## API Design

### POST /api/analyze

```json
Request:
{
  "ticker": "AAPL",
  "analysts": ["goldman", "morgan-stanley", ...],
  "userId": "user_xxx"
}

Response: Server-Sent Events (SSE) stream
event: analyst-start
data: {"analyst": "goldman"}

event: analyst-chunk
data: {"analyst": "goldman", "content": "...partial text..."}

event: analyst-complete
data: {"analyst": "goldman"}

event: all-complete
data: {}
```

### Streaming Strategy

- Launch all 10 analyst prompts in parallel using Promise.all
- Each prompt streams independently via SSE
- Frontend updates the active tab in real-time
- Inactive tabs show a progress indicator until complete
- Cache completed analyses in D1 for re-viewing without spending credits

## Error Handling

- API rate limits: queue and retry with exponential backoff
- Partial failures: show completed analyses, retry failed ones
- Network errors: auto-reconnect SSE stream
- Invalid ticker: show suggestion from hardcoded list
- No credits: show upgrade prompt with clear messaging

## Security

- Magic link tokens expire after 15 minutes, single-use
- Session cookies: HttpOnly, Secure, SameSite=Strict
- API key stored in Cloudflare Workers secrets (not client-side)
- Rate limiting on /api/analyze (max 5 requests/minute per user)
- Input sanitization on ticker symbols (alphanumeric only, max 5 chars)

## Future Enhancements (Not in MVP)

- Paid plans (Stripe integration)
- Real-time market data API integration
- Portfolio performance tracking
- Analysis history and comparison
- PDF export of analyses
- Collaborative portfolios
