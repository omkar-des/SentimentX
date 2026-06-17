import asyncio
import json
import os
import google.generativeai as genai
from stocks import NSE_STOCKS, BSE_STOCKS

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")
ALL_STOCKS = {**NSE_STOCKS, **BSE_STOCKS}

WEIGHTS = {
    "direct": 0.40,
    "sector": 0.20,
    "competitor": 0.15,
    "macro": 0.15,
    "geopolitical": 0.10,
}

SCORE_PROMPT = (
    "You are a financial sentiment analyst specialising in Indian equity markets. "
    "You will be given a list of news articles (title + snippet) related to an Indian stock. "
    "For each article, assign a sentiment score strictly between -1.0 (very bearish) and 1.0 (very bullish), "
    "where 0 is neutral. Return ONLY a valid JSON array of numbers, one per article, in order. "
    "No explanation, no markdown, just the JSON array."
)

SUMMARY_PROMPT = (
    "You are a terse financial analyst covering Indian equity markets. "
    "Given the sentiment scores below for an Indian stock, write exactly 2–3 sentences "
    "explaining the key drivers behind the overall score. "
    "Be specific: name which vectors are strong or weak and what that signals for the stock. "
    "Do not use bullet points, headers, or markdown. Plain prose only."
)


def _score_articles(articles: list[dict], context: str) -> float:
    if not articles:
        return 0.0
    lines = [
        f"{i+1}. {a['title']} — {a['snippet']}"
        for i, a in enumerate(articles)
    ]
    prompt = f"{SCORE_PROMPT}\n\nContext: {context}\n\nArticles:\n" + "\n".join(lines)
    response = model.generate_content(prompt)
    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    scores: list[float] = json.loads(raw.strip())
    return sum(scores) / len(scores) if scores else 0.0


def _generate_summary(ticker: str, name: str, overall: float, vector_scores: dict[str, float]) -> str:
    vector_lines = "\n".join(
        f"  {k}: {round((v + 1) / 2 * 100, 1)}/100"
        for k, v in vector_scores.items()
    )
    prompt = (
        f"{SUMMARY_PROMPT}\n\n"
        f"Stock: {name} ({ticker})\n"
        f"Overall sentiment score: {overall}/100\n"
        f"Vector scores:\n{vector_lines}"
    )
    try:
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception:
        return ""


async def compute_sentiment(ticker: str, article_vectors: dict[str, list[dict]]) -> dict:
    name = ALL_STOCKS.get(ticker, ticker)

    async def score_vector(vector: str, articles: list[dict]):
        raw = await asyncio.to_thread(
            _score_articles, articles, f"{name} ({ticker}) — {vector} news"
        )
        return vector, (-raw if vector == "competitor" else raw)

    # Score all 5 vectors in parallel
    pairs = await asyncio.gather(*[
        score_vector(v, a) for v, a in article_vectors.items()
    ])
    vector_scores: dict[str, float] = dict(pairs)

    weighted = sum(WEIGHTS[v] * vector_scores.get(v, 0.0) for v in WEIGHTS)
    final_score = round((weighted + 1) / 2 * 100, 1)

    # Generate summary in parallel with nothing else (scores already done)
    summary = await asyncio.to_thread(_generate_summary, ticker, name, final_score, vector_scores)

    return {
        "ticker": ticker,
        "name": name,
        "overall_score": final_score,
        "vector_scores": {
            k: round((v + 1) / 2 * 100, 1) for k, v in vector_scores.items()
        },
        "weights": WEIGHTS,
        "summary": summary,
    }
