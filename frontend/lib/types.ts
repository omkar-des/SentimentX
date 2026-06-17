export interface StockSuggestion {
  ticker: string
  name: string
}

export interface StockPrice {
  ticker: string
  price: number
  prev_close: number
  change: number
  change_pct: number
  last_updated: number
}

export interface SentimentResult {
  ticker: string
  name: string
  overall_score: number
  vector_scores: {
    direct: number
    sector: number
    competitor: number
    macro: number
    geopolitical: number
  }
  weights: {
    direct: number
    sector: number
    competitor: number
    macro: number
    geopolitical: number
  }
  summary: string
  forecast_duration?: string
  forecast_reason?: string
}

export type SentimentLabel = "Bullish" | "Bearish" | "Neutral"

export function getSentiment(score: number): SentimentLabel {
  if (score >= 60) return "Bullish"
  if (score <= 40) return "Bearish"
  return "Neutral"
}

export function sentimentColor(label: SentimentLabel | null): string {
  if (label === "Bullish") return "#22C55E"
  if (label === "Bearish") return "#F87171"
  return "#FBBF24"
}

export function sentimentBg(label: SentimentLabel | null): string {
  if (label === "Bullish") return "#DCFCE7"
  if (label === "Bearish") return "#FEE2E2"
  return "#FEF3C7"
}

export interface WatchlistEntry {
  ticker: string
  name: string
  sector: string
  overall_score: number | null
  sentiment: SentimentLabel | null
  loading: boolean
}
