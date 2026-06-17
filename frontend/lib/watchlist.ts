import type { WatchlistEntry } from "./types"

const KEY = "sentimentx_watchlist_v2"

type StoredEntry = Pick<WatchlistEntry, "ticker" | "name" | "sector">

export function loadWatchlist(): StoredEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

export function saveToWatchlist(ticker: string, name: string, sector: string) {
  const list = loadWatchlist()
  if (list.some((s) => s.ticker === ticker)) return
  list.push({ ticker, name, sector })
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function removeFromWatchlist(ticker: string) {
  const list = loadWatchlist().filter((s) => s.ticker !== ticker)
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function isInWatchlist(ticker: string): boolean {
  return loadWatchlist().some((s) => s.ticker === ticker)
}
