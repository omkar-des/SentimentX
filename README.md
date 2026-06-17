# SentimentX

An Indian stock market sentiment dashboard that aggregates news across 5 sentiment vectors, scores them using Gemini AI, and displays a weighted 0–100 sentiment score per NSE-listed stock.

## How it works

For any stock you search, the app fetches live news across five vectors and scores each one via `gemini-2.5-flash`. The scores are combined into a single sentiment reading using a weighted formula:

| Vector | Weight | Notes |
|---|---|---|
| Direct company news | 40% | |
| Sector / industry | 20% | |
| Competitor news | 15% | Inverted — bad news for rivals is bullish |
| Macro / political | 15% | |
| Geopolitical / supply chain | 10% | |

The final score sits on a 0–100 scale and is labelled **Bullish**, **Neutral**, or **Bearish**.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, TailwindCSS, Shadcn/ui |
| Backend | Python, FastAPI, Gemini 2.5 Flash |
| News source | Google News RSS |
| Persistence | localStorage (no auth, no database) |

## Project structure

```
frontend/   Next.js app
backend/    FastAPI app
```

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [Gemini API key](https://aistudio.google.com/app/apikey)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend expects the backend running on port 8000.

## API

| Endpoint | Description |
|---|---|
| `GET /api/search?q={query}` | Search NSE stocks by name or ticker |
| `GET /api/sentiment/{ticker}` | Get full sentiment breakdown for a ticker |

## Notes

- Article text is truncated to headline + 200 characters before being sent to Gemini (cost control).
- Sentiment scores are cached in React component state only — refreshing a row re-fetches from the API.
