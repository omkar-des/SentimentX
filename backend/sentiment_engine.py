import asyncio
import json
import math
import os

import google.generativeai as genai
from stocks import NSE_STOCKS, BSE_STOCKS, SECTOR_MAP

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")
ALL_STOCKS = {**NSE_STOCKS, **BSE_STOCKS}

# Base weights. These are RENORMALISED at runtime over only the vectors that
# carry a real signal (see compute_sentiment), so quiet/empty vectors never eat
# weight budget and drag the composite toward 50.
WEIGHTS = {
    "direct": 0.45,
    "sector": 0.20,
    "competitor": 0.13,
    "macro": 0.12,
    "geopolitical": 0.10,
}

VECTOR_LABELS = {
    "direct": "Company News",
    "sector": "Sector / Industry",
    "competitor": "Competitor News",
    "macro": "Macro / Political",
    "geopolitical": "Geopolitical & Supply Chain",
}

# Recency half-life (days) per vector: company/earnings news drifts for weeks,
# geopolitical noise decays in days.
HALF_LIFE_DAYS = {
    "direct": 14.0,
    "sector": 14.0,
    "competitor": 10.0,
    "macro": 30.0,
    "geopolitical": 5.0,
}

# A vector is "active" only if at least one recent article clears this
# materiality bar. Inactive vectors are dropped from the blend, not averaged in.
MATERIALITY_ACTIVE_THRESHOLD = 0.20

# Bad news moves prices more than good news of equal size.
NEG_ASYMMETRY = 1.15

# Per-vector framing tells the model WHOSE sentiment is being measured and how
# to sign it. This is what fixes the competitor-direction error and the generic
# macro/geo problem.
VECTOR_FRAMING = {
    "direct": (
        "These are news items about {name} itself. Score how each moves {name}'s "
        "share price RELATIVE TO WHAT THE MARKET ALREADY EXPECTS."
    ),
    "sector": (
        "These are {sector} news items. Score how each affects {name} SPECIFICALLY, "
        "not the sector in the abstract."
    ),
    "competitor": (
        "These are news items about COMPETITORS of {name}. Score the net effect on "
        "{name}. Industry-wide signals (sector demand, regulation, a peer's results "
        "that reflect overall industry health) usually push {name} the SAME direction "
        "as the peer (contagion) - score with the same sign. Only genuinely zero-sum "
        "events (a rival taking market share or a contract directly from {name}, a "
        "clearly superior rival product) push {name} the OPPOSITE way - score with the "
        "opposite sign. Decide which applies for each item."
    ),
    "macro": (
        "These are macro / policy news items. Score the net effect on {name}, which "
        "operates in {sector}. Macro news is mostly priced in already - score near 0 "
        "with low materiality unless there is a genuine surprise (e.g. an unexpected "
        "RBI rate move for a bank)."
    ),
    "geopolitical": (
        "These are geopolitical / supply-chain news items. Score the net effect on "
        "{name}. For a domestically focused company most of this has little direct "
        "effect - score near 0 with low materiality unless there is a direct channel."
    ),
}

SCORE_PROMPT = (
    "You are a buy-side equity analyst on Indian markets. For EACH numbered article "
    "return two numbers:\n"
    '  "s" = sentiment: the price impact on the target company, from -1.0 to 1.0.\n'
    '  "m" = materiality: how market-moving this specific item is, from 0.0 to 1.0.\n\n'
    "Rules:\n"
    "- Score the SURPRISE, not the tone. Routine, expected, or already-known news is "
    "s near 0 and m near 0.1 even if it sounds positive. A real, unexpected, "
    "price-moving development is scored decisively: a clear beat/win is s = 0.6 to 0.9, "
    "a clear miss/blow is s = -0.6 to -0.9. Do NOT hug zero when the news is material.\n"
    "- Use the full range; the endpoints -1.0 and 1.0 are allowed.\n"
    "- m reflects how likely THIS item actually moves the share price: an earnings "
    "surprise or regulator action is m = 0.8 to 1.0; a routine mention, opinion piece, "
    "or listicle is m = 0.0 to 0.2.\n\n"
    "Return ONLY a JSON array, one object per article, in order, e.g. "
    '[{"s":0.7,"m":0.9},{"s":0.0,"m":0.1}]. No prose, no markdown.'
)

REASONING_PROMPT = (
    "You are a senior equity analyst covering Indian markets. You will receive per-vector "
    "sentiment scores and the key news articles driving them for a stock.\n\n"
    "Return ONLY valid JSON with exactly these three fields:\n"
    "{\n"
    '  "summary": "<2-4 sentences of plain prose. Highlight the most impactful real-world '
    "events - earnings results, policy changes, geopolitical developments, competitor "
    "moves. Name specifics. Do NOT mention vectors, weights, or numeric scores. Write for "
    'an investor, not a quant.>",\n'
    '  "forecast_duration": "<one of exactly: \'~1-2 days\', \'~3-7 days\', \'~2-4 weeks\', '
    "'~1-3 months'>\",\n"
    '  "forecast_reason": "<one sentence explaining why this type of event has this '
    'relevance window>"\n'
    "}\n\n"
    "Forecast duration guidance:\n"
    "- Earnings/quarterly results, guidance updates -> '~3-7 days'\n"
    "- Management changes, one-off corporate announcements -> '~3-7 days'\n"
    "- Product launches, partnerships, contract wins -> '~2-4 weeks'\n"
    "- Regulatory actions, legal proceedings -> '~2-4 weeks'\n"
    "- Macro policy (RBI rate decisions, budget, SEBI rules) -> '~1-3 months'\n"
    "- Geopolitical events, commodity shocks, supply chain disruptions -> '~1-3 months'\n"
    "- Breaking news with no clear follow-through catalyst -> '~1-2 days'"
)


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _recency_weight(age_days: float, half_life: float) -> float:
    return math.exp(-math.log(2) * age_days / half_life)


def _score_articles(vector: str, articles: list[dict], name: str, sector: str) -> dict:
    """Return {net, active, articles}.

    net    : materiality + recency weighted sentiment in [-1, 1]
    active : True if at least one recent, material article exists
    articles: per-article scores, for the UI / debugging
    """
    if not articles:
        return {"net": 0.0, "active": False, "articles": []}

    framing = VECTOR_FRAMING[vector].format(name=name, sector=sector or "its sector")
    lines = [f"{i + 1}. {a['title']} - {a['snippet']}" for i, a in enumerate(articles)]
    prompt = f"{SCORE_PROMPT}\n\n{framing}\n\nArticles:\n" + "\n".join(lines)

    try:
        resp = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,                       # reproducible
                response_mime_type="application/json",  # no markdown fences to strip
            ),
        )
        parsed = json.loads(resp.text)
    except Exception:
        return {"net": 0.0, "active": False, "articles": []}

    half_life = HALF_LIFE_DAYS[vector]
    num = den = peak = 0.0
    enriched: list[dict] = []

    for a, obj in zip(articles, parsed):
        try:
            s = _clamp(float(obj.get("s", 0.0)), -1.0, 1.0)
            m = _clamp(float(obj.get("m", 0.0)), 0.0, 1.0)
        except (TypeError, ValueError):
            s, m = 0.0, 0.0
        w = m * _recency_weight(a.get("age_days", 3.0), half_life)
        num += s * w
        den += w
        peak = max(peak, w)
        enriched.append({**a, "s": round(s, 3), "m": round(m, 3), "w": round(w, 3)})

    # Materiality-weighted net: one big story dominates seven filler articles,
    # instead of being averaged into nothing.
    net = num / den if den > 1e-6 else 0.0
    if net < 0:
        net = _clamp(net * NEG_ASYMMETRY, -1.0, 0.0)

    return {"net": net, "active": peak >= MATERIALITY_ACTIVE_THRESHOLD, "articles": enriched}


def _generate_reasoning(ticker, name, sector, overall, vector_scores, article_vectors) -> dict:
    article_lines = []
    for vector, articles in article_vectors.items():
        top = articles[:3]
        if not top:
            continue
        score_display = round(vector_scores.get(vector, 50.0), 1)
        article_lines.append(f"\n[{VECTOR_LABELS.get(vector, vector)} - score {score_display}/100]")
        for a in top:
            article_lines.append(f"  - {a['title']} - {a['snippet']}")

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
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )
        return json.loads(resp.text)
    except Exception:
        return {"summary": "", "forecast_duration": "", "forecast_reason": ""}


async def compute_sentiment(ticker: str, article_vectors: dict[str, list[dict]]) -> dict:
    name = ALL_STOCKS.get(ticker, ticker)
    sector = SECTOR_MAP.get(ticker, "")

    async def run(vector: str, articles: list[dict]):
        res = await asyncio.to_thread(_score_articles, vector, articles, name, sector)
        return vector, res

    pairs = await asyncio.gather(*[run(v, a) for v, a in article_vectors.items()])
    results: dict[str, dict] = dict(pairs)

    # Renormalise weights over ACTIVE vectors only. A quiet macro vector no
    # longer caps the achievable range; a strong company signal can carry the
    # score on its own.
    active = {v: r for v, r in results.items() if r["active"]}
    if active:
        total_w = sum(WEIGHTS[v] for v in active)
        weighted = sum(WEIGHTS[v] * active[v]["net"] for v in active) / total_w
    else:
        weighted = 0.0  # genuinely nothing material -> an honest 50, not a forced one

    final_score = round(_clamp((weighted + 1) / 2 * 100, 0.0, 100.0), 1)

    display_scores = {
        v: round(_clamp((r["net"] + 1) / 2 * 100, 0.0, 100.0), 1)
        for v, r in results.items()
    }
    vector_active = {v: r["active"] for v, r in results.items()}

    reasoning = await asyncio.to_thread(
        _generate_reasoning, ticker, name, sector, final_score, display_scores, article_vectors
    )

    return {
        "ticker": ticker,
        "name": name,
        "overall_score": final_score,
        "vector_scores": display_scores,
        "vector_active": vector_active,  # NEW: lets the UI grey out quiet vectors
        "weights": WEIGHTS,
        "summary": reasoning.get("summary", ""),
        "forecast_duration": reasoning.get("forecast_duration", ""),
        "forecast_reason": reasoning.get("forecast_reason", ""),
    }
