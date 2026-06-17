# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: SentimentX — Indian Stock Market Sentiment Dashboard

Monorepo with a Next.js frontend and Python FastAPI backend. The app aggregates news across 5 sentiment vectors (direct company, sector, competitor, macro, geopolitical), scores them via Gemini AI, and displays a weighted 0–100 sentiment score per stock.

## Structure

```
frontend/   Next.js 16 + TailwindCSS + Shadcn/ui
backend/    Python FastAPI + Anthropic SDK
```

## Running the frontend

```bash
cd frontend
npm run dev       # dev server on http://localhost:3000
npm run build     # production build
npx tsc --noEmit  # type check only
```

## Running the backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

## Backend architecture

| File | Purpose |
|---|---|
| `main.py` | FastAPI app, CORS, two routes: `GET /api/search` and `GET /api/sentiment/{ticker}` |
| `stocks.py` | Static maps: NSE ticker → company name, ticker → sector, ticker → competitors |
| `news_fetcher.py` | Fetches Google News RSS for each of the 5 sentiment vectors |
| `sentiment_engine.py` | Calls `gemini-2.5-flash` to score articles, applies weights, returns 0–100 score |

## Frontend architecture

| Path | Purpose |
|---|---|
| `app/page.tsx` | Root client component — orchestrates watchlist state, sentiment fetching, drawer |
| `components/SearchBar.tsx` | Debounced search → calls `/api/search` → adds to watchlist |
| `components/WatchlistTable.tsx` | Displays saved stocks with scores; row click opens drawer |
| `components/SentimentDrawer.tsx` | Side drawer with per-vector score breakdown and gauge bars |
| `components/SentimentBadge.tsx` | Colour-coded badge (Bullish/Neutral/Bearish) |
| `lib/api.ts` | Thin fetch wrappers for the FastAPI backend |
| `lib/watchlist.ts` | localStorage persistence for the watchlist |
| `lib/types.ts` | Shared TypeScript interfaces |

## Sentiment weights

| Vector | Weight |
|---|---|
| Direct company news | 40% |
| Sector / industry | 20% |
| Competitor (inverse) | 15% |
| Macro / political | 15% |
| Geopolitical / supply chain | 10% |

Competitor sentiment is **inverted** — bad news for rivals is treated as a bullish signal.

## Design system

All frontend and UI work **must** follow `design systems/design.md` (the Skylearn design system). Read that file before writing or editing any component, page, or style. It defines colors, typography, spacing, border radii, motion, component patterns, and accessibility requirements. Do not use Tailwind defaults or Shadcn defaults if they conflict with the design system.

## Key constraints

- Articles are truncated to headline + 200-char snippet before sending to Gemini (cost control).
- Uses `gemini-2.5-flash` for scoring (fast, cheap); responses are plain JSON arrays of floats in `[-1, 1]`.
- Sentiment scores are cached in component state only; refreshing a row re-fetches from the API.
- No auth — watchlist is persisted in `localStorage`.
- The sentiment engine uses the `google-generativeai` SDK with `GEMINI_API_KEY` in `.env`.
