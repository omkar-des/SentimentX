import asyncio
import feedparser
from stocks import NSE_STOCKS, BSE_STOCKS, SECTOR_MAP, COMPETITORS

GOOGLE_NEWS_RSS = "https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
MAX_ARTICLES_PER_VECTOR = 8
ALL_STOCKS = {**NSE_STOCKS, **BSE_STOCKS}


def _fetch_rss(query: str) -> list[dict]:
    url = GOOGLE_NEWS_RSS.format(query=query.replace(" ", "+"))
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries[:MAX_ARTICLES_PER_VECTOR]:
        snippet = entry.get("summary", "")[:200]
        articles.append({
            "title": entry.get("title", ""),
            "snippet": snippet,
            "url": entry.get("link", ""),
            "published": entry.get("published", ""),
        })
    return articles


async def fetch_articles_for_stock(ticker: str) -> dict[str, list[dict]]:
    name = ALL_STOCKS.get(ticker, ticker)
    sector = SECTOR_MAP.get(ticker, "")
    competitor_tickers = COMPETITORS.get(ticker, [])[:2]

    direct_q = f'"{name}" OR "{ticker}" stock NSE BSE India'
    sector_q = f'{sector} sector India stock market SEBI RBI'
    macro_q = "India economy budget policy RBI SEBI government stock market"
    geo_q = "crude oil commodity supply chain global trade India market"
    comp_qs = [
        f'"{ALL_STOCKS.get(ct, ct)}" stock India NSE'
        for ct in competitor_tickers
    ]

    tasks = [
        asyncio.to_thread(_fetch_rss, direct_q),
        asyncio.to_thread(_fetch_rss, sector_q),
        asyncio.to_thread(_fetch_rss, macro_q),
        asyncio.to_thread(_fetch_rss, geo_q),
        *[asyncio.to_thread(_fetch_rss, q) for q in comp_qs],
    ]
    results = await asyncio.gather(*tasks)

    comp_articles: list[dict] = []
    for r in results[4:]:
        comp_articles.extend(r)

    return {
        "direct": results[0],
        "sector": results[1],
        "macro": results[2],
        "geopolitical": results[3],
        "competitor": comp_articles[:MAX_ARTICLES_PER_VECTOR],
    }
