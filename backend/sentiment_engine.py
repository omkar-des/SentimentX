import asyncio
import json
import os
import google.generativeai as genai
from stocks import NSE_STOCKS, BSE_STOCKS, SECTOR_MAP

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

VECTOR_LABELS = {
    "direct": "Company News",
    "sector": "Sector / Industry",
    "competitor": "Competitor News",
    "macro": "Macro / Political",
    "geopolitical": "Geopolitical & Supply Chain",
}

SCORE_PROMPT = (
    "You are a financial sentiment analyst specialising in Indian equity markets. "
    "You will be given a list of news articles (title + snippet) related to an Indian stock. "
    "For each article, assign a sentiment score strictly between -1.0 (very bearish) and 1.0 (very bullish), "
    "where 0 is neutral. Return ONLY a valid JSON array of numbers, one per article, in order. "
    "No explanation, no markdown, just the JSON array."
)

REASONING_PROMPT = (
    "You are a senior equity analyst covering Indian markets. You will receive per-vector sentiment "
    "scores and the key news articles driving them for a stock.\n\n"
    "Return ONLY valid JSON with exactly these three fields:\n"
    "{\n"
    '  "summary": "<2-4 sentences of plain prose. Highlight the most impactful real-world events — '
    "earnings results, policy changes, geopolitical developments, competitor moves. Name specifics. "
    'Do NOT mention vectors, weights, or numeric scores. Write for an investor, not a quant.>",\n'
    '  "forecast_duration": "<one of exactly: \'~1-2 days\', \'~3-7 days\', \'~2-4 weeks\', \'~1-3 months\'>",\n'
    '  "forecast_reason": "<one sentence explaining why this type of event has this relevance window>"\n'
    "}\n\n"
    "Forecast duration guidance:\n"
    "- Earnings/quarterly results, guidance updates → '~3-7 days'\n"
    "- Management changes, one-off corporate announcements → '~3-7 days'\n"
    "- Product launches, partnerships, contract wins → '~2-4 weeks'\n"
    "- Regulatory actions, legal proceedings → '~2-4 weeks'\n"
    "- Macro policy (RBI rate decisions, budget, SEBI rules) → '~1-3 months'\n"
    "- Geopolitical events, commodity price shocks, supply chain disruptions → '~1-3 months'\n"
    "- Breaking news with no clear follow-through catalyst → '~1-2 days'"
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


def _generate_reasoning(
    ticker: str,
    name: str,
    sector: str,
    overall: float,
    vector_scores: dict[str, float],
    article_vectors: dict[str, list[dict]],
) -> dict:
    article_lines = []
    for vector, articles in article_vectors.items():
        top = articles[:3]
        if not top:
            continue
        score_display = round(vector_scores.get(vector, 50.0), 1)
        article_lines.append(f"\n[{VECTOR_LABELS.get(vector, vector)} — score {score_display}/100]")
        for a in top:
            article_lines.append(f"  • {a['title']} — {a['snippet']}")

    vector_score_lines = "\n".join(
        f"  {VECTOR_LABELS.get(k, k)}: {round(vector_scores.get(k, 50.0), 1)}/100"
        for k in WEIGHTS
    )

    prompt = (
        f"{REASONING_PROMPT}\n\n"
        f"Stock: {name} ({ticker})\n"
        f"Sector: {sector}\n"
        f"Overall sentiment score: {overall}/100\n"
        f"Per-vector scores:\n{vector_score_lines}\n"
        f"Top news articles:" + "\n".join(article_lines)
    )

    try:
        resp = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(resp.text)
    except Exception:
        try:
            resp = model.generate_content(prompt)
            raw = resp.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw.strip())
        except Exception:
            return {"summary": "", "forecast_duration": "", "forecast_reason": ""}


async def compute_sentiment(ticker: str, article_vectors: dict[str, list[dict]]) -> dict:
    name = ALL_STOCKS.get(ticker, ticker)
    sector = SECTOR_MAP.get(ticker, "")

    async def score_vector(vector: str, articles: list[dict]):
        raw = await asyncio.to_thread(
            _score_articles, articles, f"{name} ({ticker}) — {vector} news"
        )
        return vector, (-raw if vector == "competitor" else raw)

    pairs = await asyncio.gather(*[
        score_vector(v, a) for v, a in article_vectors.items()
    ])
    vector_scores: dict[str, float] = dict(pairs)

    weighted = sum(WEIGHTS[v] * vector_scores.get(v, 0.0) for v in WEIGHTS)
    final_score = round((weighted + 1) / 2 * 100, 1)

    display_scores = {k: round((v + 1) / 2 * 100, 1) for k, v in vector_scores.items()}

    reasoning = await asyncio.to_thread(
        _generate_reasoning, ticker, name, sector, final_score, display_scores, article_vectors
    )

    return {
        "ticker": ticker,
        "name": name,
        "overall_score": final_score,
        "vector_scores": display_scores,
        "weights": WEIGHTS,
        "summary": reasoning.get("summary", ""),
        "forecast_duration": reasoning.get("forecast_duration", ""),
        "forecast_reason": reasoning.get("forecast_reason", ""),
    }
