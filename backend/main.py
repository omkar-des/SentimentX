from dotenv import load_dotenv
load_dotenv()

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from stocks import NSE_STOCKS, BSE_STOCKS
from news_fetcher import fetch_articles_for_stock
from sentiment_engine import compute_sentiment

app = FastAPI(title="SentimentX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

ALL_STOCKS: dict[str, str] = {**NSE_STOCKS, **BSE_STOCKS}


@app.get("/api/search")
def search_stocks(q: str = ""):
    q = q.strip()
    if not q:
        return []
    q_upper = q.upper()
    results = [
        {"ticker": ticker, "name": name}
        for ticker, name in ALL_STOCKS.items()
        if q_upper in ticker or q_upper in name.upper()
    ]
    return results[:20]


@app.get("/api/sentiment/{ticker}")
async def get_sentiment(ticker: str):
    ticker = ticker.upper()
    if ticker not in ALL_STOCKS:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found.")
    articles = await fetch_articles_for_stock(ticker)
    result = await compute_sentiment(ticker, articles)
    return result


@app.get("/api/price/{ticker}")
async def get_price(ticker: str):
    ticker = ticker.upper()
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}.NS?interval=1d&range=1d"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        meta = data["chart"]["result"][0]["meta"]
        price = meta["regularMarketPrice"]
        prev_close = meta["chartPreviousClose"]
        change = round(price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2)
        return {
            "ticker": ticker,
            "price": price,
            "prev_close": prev_close,
            "change": change,
            "change_pct": change_pct,
            "last_updated": meta["regularMarketTime"],
        }
    except Exception:
        raise HTTPException(status_code=502, detail="Price data unavailable")
