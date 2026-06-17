from dotenv import load_dotenv
load_dotenv()

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
