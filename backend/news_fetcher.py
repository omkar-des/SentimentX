import asyncio
import calendar
from datetime import datetime, timezone

import feedparser
from stocks import NSE_STOCKS, BSE_STOCKS, SECTOR_MAP, COMPETITORS

GOOGLE_NEWS_RSS = "https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
MAX_ARTICLES_PER_VECTOR = 8
ALL_STOCKS = {**NSE_STOCKS, **BSE_STOCKS}


def _age_days(entry) -> float:
    """Article age in days, used by the engine for recency decay.

    feedparser exposes published_parsed as a UTC struct_time; calendar.timegm
    treats it as UTC (time.mktime would wrongly treat it as local time).
    """
    pp = entry.get("published_parsed")
    if not pp:
        return 3.0  # unknown date -> assume moderately recent, neither fresh nor stale
    published = datetime.fromtimestamp(calendar.timegm(pp), tz=timezone.utc)
    return max((datetime.now(timezone.utc) - published).total_seconds() / 86400.0, 0.0)


def _fetch_rss(query: str) -> list[dict]:
    url = GOOGLE_NEWS_RSS.format(query=query.replace(" ", "+"))
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries[:MAX_ARTICLES_PER_VECTOR]:
        articles.append({
            "title": entry.get("title", ""),
            "snippet": entry.get("summary", "")[:200],
            "url": entry.get("link", ""),
            "age_days": _age_days(entry),  # <-- now actually consumed downstream
        })
    return articles


def _macro_query(sector: str) -> str:
    # Stock/sector-specific so KOTAKBANK and TATASTEEL no longer get identical macro news.
    base = "RBI repo rate inflation India union budget policy"
    return f"{base} {sector} sector impact" if sector else f"{base} stock market"


def _geo_query(sector: str) -> str:
    if sector:
        return f"{sector} India tariffs global trade supply chain geopolitical"
    return "India crude oil tariffs global trade geopolitical market"


async def fetch_articles_for_stock(ticker: str) -> dict[str, list[dict]]:
    name = ALL_STOCKS.get(ticker, ticker)
    sector = SECTOR_MAP.get(ticker, "")
    competitor_tickers = COMPETITORS.get(ticker, [])[:3]  # was [:2]

    direct_q = f'"{name}" OR "{ticker}" stock NSE BSE India'
    sector_q = (
        f'{sector} sector India outlook demand regulation'
        if sector else f'{name} industry India'
    )
    macro_q = _macro_query(sector)
    geo_q = _geo_query(sector)
    # "results" biases toward earnings news, the contagion-relevant peer signal.
    comp_qs = [f'"{ALL_STOCKS.get(ct, ct)}" results stock India' for ct in competitor_tickers]

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
