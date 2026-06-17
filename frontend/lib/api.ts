import type { StockPrice } from "@/lib/types"

const BASE = "http://localhost:8000"

export async function searchStocks(q: string) {
  const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error("Search failed")
  return res.json()
}

export async function fetchSentiment(ticker: string) {
  const res = await fetch(`${BASE}/api/sentiment/${ticker}`)
  if (!res.ok) throw new Error(`Failed to fetch sentiment for ${ticker}`)
  return res.json()
}

export async function fetchPrice(ticker: string): Promise<StockPrice | null> {
  try {
    const res = await fetch(`${BASE}/api/price/${ticker}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
