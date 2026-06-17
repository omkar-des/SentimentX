"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight } from "lucide-react"
import { SearchBar } from "@/components/SearchBar"
import { StockCard } from "@/components/StockCard"
import { BottomSheet } from "@/components/BottomSheet"
import { ALL_STOCKS } from "@/lib/stocks"
import { loadWatchlist, saveToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlist"
import { fetchSentiment } from "@/lib/api"
import { getSentiment } from "@/lib/types"
import type { WatchlistEntry, SentimentResult } from "@/lib/types"

type FilterKey = "All" | "Bullish" | "Bearish" | "Neutral"

const FILTER_CONFIG = [
  { key: "All" as FilterKey,     icon: Activity,     color: "#475569", activeBg: "#F1F5F9", activeColor: "#0F172A"  },
  { key: "Bullish" as FilterKey, icon: TrendingUp,   color: "#22C55E", activeBg: "#DCFCE7", activeColor: "#16A34A"  },
  { key: "Bearish" as FilterKey, icon: TrendingDown, color: "#F87171", activeBg: "#FEE2E2", activeColor: "#DC2626"  },
  { key: "Neutral" as FilterKey, icon: Minus,        color: "#FBBF24", activeBg: "#FEF3C7", activeColor: "#D97706"  },
]

export default function Home() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([])
  const [sheetEntry, setSheetEntry] = useState<WatchlistEntry | null>(null)
  const [sheetResult, setSheetResult] = useState<SentimentResult | null>(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All")
  const [discoverQuery, setDiscoverQuery] = useState("")

  useEffect(() => {
    const saved = loadWatchlist()
    setWatchlist(saved.map(s => ({
      ...s,
      overall_score: null,
      sentiment: null,
      loading: false,
    })))
  }, [])

  const loadSentiment = useCallback(async (ticker: string): Promise<SentimentResult | null> => {
    setWatchlist(prev =>
      prev.map(e => e.ticker === ticker ? { ...e, loading: true } : e)
    )
    try {
      const result: SentimentResult = await fetchSentiment(ticker)
      const sentiment = getSentiment(result.overall_score)
      setWatchlist(prev =>
        prev.map(e =>
          e.ticker === ticker
            ? { ...e, loading: false, overall_score: result.overall_score, sentiment }
            : e
        )
      )
      return result
    } catch {
      setWatchlist(prev =>
        prev.map(e => e.ticker === ticker ? { ...e, loading: false } : e)
      )
      return null
    }
  }, [])

  const handleAdd = useCallback((ticker: string, name: string, sector: string) => {
    const entry: WatchlistEntry = { ticker, name, sector, overall_score: null, sentiment: null, loading: true }
    setWatchlist(prev => {
      if (prev.some(e => e.ticker === ticker)) return prev
      return [...prev, entry]
    })
    saveToWatchlist(ticker, name, sector)
    loadSentiment(ticker)
    // Also open the sheet for the new stock
    setSheetEntry(entry)
    setSheetResult(null)
    setSheetLoading(true)
    setSheetOpen(true)
    fetchSentiment(ticker).then(result => {
      if (result) {
        setSheetResult(result)
        setSheetEntry(prev => prev?.ticker === ticker
          ? { ...prev, overall_score: result.overall_score, sentiment: getSentiment(result.overall_score), loading: false }
          : prev
        )
      }
      setSheetLoading(false)
    }).catch(() => setSheetLoading(false))
  }, [loadSentiment])

  const handleRemove = useCallback((ticker: string) => {
    removeFromWatchlist(ticker)
    setWatchlist(prev => prev.filter(e => e.ticker !== ticker))
    if (sheetEntry?.ticker === ticker) {
      setSheetOpen(false)
      setTimeout(() => { setSheetEntry(null); setSheetResult(null) }, 300)
    }
  }, [sheetEntry])

  const handleSelect = useCallback(async (entry: WatchlistEntry) => {
    const latest = watchlist.find(e => e.ticker === entry.ticker) ?? entry
    setSheetEntry(latest)
    setSheetResult(null)
    setSheetLoading(true)
    setSheetOpen(true)
    const result = await loadSentiment(entry.ticker)
    if (result) setSheetResult(result)
    setSheetLoading(false)
  }, [watchlist, loadSentiment])

  const handleDiscoverSelect = useCallback(async (ticker: string, name: string, sector: string) => {
    const existing = watchlist.find(e => e.ticker === ticker)
    if (existing) {
      handleSelect(existing)
      return
    }
    const entry: WatchlistEntry = { ticker, name, sector, overall_score: null, sentiment: null, loading: true }
    setSheetEntry(entry)
    setSheetResult(null)
    setSheetLoading(true)
    setSheetOpen(true)
    const result = await fetchSentiment(ticker)
    if (result) {
      setSheetResult(result)
      setSheetEntry(prev => prev?.ticker === ticker
        ? { ...prev, overall_score: result.overall_score, sentiment: getSentiment(result.overall_score), loading: false }
        : prev
      )
    }
    setSheetLoading(false)
  }, [watchlist, handleSelect])

  const handleToggleWatchlist = useCallback((ticker: string, name: string, sector: string) => {
    if (isInWatchlist(ticker)) {
      handleRemove(ticker)
    } else {
      const entry: WatchlistEntry = { ticker, name, sector, overall_score: null, sentiment: null, loading: true }
      setWatchlist(prev => {
        if (prev.some(e => e.ticker === ticker)) return prev
        return [...prev, entry]
      })
      saveToWatchlist(ticker, name, sector)
      loadSentiment(ticker)
    }
  }, [handleRemove, loadSentiment])

  const filtered = watchlist.filter(e =>
    activeFilter === "All" ? true : e.sentiment === activeFilter
  )

  const sentimentCounts = {
    All: watchlist.length,
    Bullish: watchlist.filter(e => e.sentiment === "Bullish").length,
    Bearish: watchlist.filter(e => e.sentiment === "Bearish").length,
    Neutral: watchlist.filter(e => e.sentiment === "Neutral").length,
  }

  const sheetInWatchlist = sheetEntry ? isInWatchlist(sheetEntry.ticker) : false

  return (
    <div className="min-h-screen w-full" style={{ background: "#FFFFFF" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: "#DBEAFE", border: "1.5px solid #BFDBFE" }}
            >
              <Sparkles size={18} style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-wide leading-none"
                style={{ color: "#0F172A", fontFamily: "var(--font-display)" }}
              >
                SentimentX
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
              >
                AI Sentiment · NSE/BSE
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "#DCFCE7", border: "1.5px solid #BBF7D0" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22C55E" }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: "#16A34A", fontFamily: "var(--font-mono)" }}
            >
              LIVE · NSE
            </span>
            <span
              className="text-xs hidden sm:block"
              style={{ color: "#86EFAC", fontFamily: "var(--font-mono)" }}
            >
              {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-32">

        {/* Search */}
        <div className="mb-8">
          <SearchBar onAdd={handleAdd} />
          <p
            className="mt-2 text-sm"
            style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
          >
            Search any NSE/BSE listed stock to get instant AI sentiment analysis
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Stocks Watched",  value: watchlist.length,                                     color: "#0F172A",  bg: "#F8FAFC",  border: "#E2E8F0" },
            { label: "Bullish Signals", value: watchlist.filter(e => e.sentiment === "Bullish").length, color: "#16A34A", bg: "#DCFCE7",  border: "#BBF7D0" },
            { label: "Bearish Signals", value: watchlist.filter(e => e.sentiment === "Bearish").length, color: "#DC2626", bg: "#FEE2E2",  border: "#FECACA" },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-[20px] p-4"
              style={{ background: stat.bg, border: `1.5px solid ${stat.border}` }}
            >
              <p
                className="text-2xl sm:text-3xl font-bold mb-0.5"
                style={{ color: stat.color, fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: "#475569", fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Watchlist section */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}
            >
              Watchlist — {watchlist.length} stocks
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_CONFIG.map(({ key, icon: Icon, activeBg, activeColor }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150"
                  style={{
                    background: activeFilter === key ? activeBg : "#F8FAFC",
                    color: activeFilter === key ? activeColor : "#94A3B8",
                    border: `1.5px solid ${activeFilter === key ? activeBg : "#E2E8F0"}`,
                    fontFamily: "var(--font-body)",
                    fontWeight: activeFilter === key ? 600 : 400,
                  }}
                >
                  <Icon size={11} />
                  {key}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      background: activeFilter === key ? "rgba(0,0,0,0.08)" : "#E2E8F0",
                      color: activeFilter === key ? activeColor : "#94A3B8",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                    }}
                  >
                    {sentimentCounts[key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-[20px]"
              style={{ background: "#F8FAFC", border: "1.5px dashed #E2E8F0" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: "#DBEAFE" }}
              >
                <Sparkles size={20} style={{ color: "#3B82F6" }} />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: "#475569", fontFamily: "var(--font-body)" }}
              >
                {activeFilter === "All"
                  ? "Nothing here yet — search for a stock to start tracking"
                  : `No ${activeFilter} stocks in your watchlist`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(entry => (
                <StockCard
                  key={entry.ticker}
                  entry={entry}
                  onSelect={handleSelect}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </section>

        {/* Discover section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}
            >
              Discover — NSE &amp; BSE
            </h2>
            <span
              className="text-xs"
              style={{ color: "#CBD5E1", fontFamily: "var(--font-mono)" }}
            >
              {ALL_STOCKS.length} stocks
            </span>
          </div>

          {/* Filter input */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Filter by ticker or name…"
              value={discoverQuery}
              onChange={e => setDiscoverQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-[14px] outline-none transition-all duration-150"
              style={{
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                color: "#0F172A",
                fontFamily: "var(--font-body)",
              }}
              onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "#3B82F6" }}
              onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "#E2E8F0" }}
            />
            {discoverQuery && (
              <button
                onClick={() => setDiscoverQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full"
                style={{ color: "#94A3B8", background: "#F1F5F9" }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {ALL_STOCKS.filter(s => {
              if (!discoverQuery) return true
              const q = discoverQuery.toUpperCase()
              return s.ticker.includes(q) || s.name.toUpperCase().includes(q) || s.sector.toUpperCase().includes(q)
            }).map(stock => {
              const inList = watchlist.some(e => e.ticker === stock.ticker)
              const entry = watchlist.find(e => e.ticker === stock.ticker)
              const sentColor =
                entry?.sentiment === "Bullish" ? "#22C55E" :
                entry?.sentiment === "Bearish" ? "#F87171" :
                entry?.sentiment === "Neutral" ? "#FBBF24" : "#CBD5E1"

              return (
                <div
                  key={stock.ticker}
                  onClick={() => handleDiscoverSelect(stock.ticker, stock.name, stock.sector)}
                  className="flex items-center gap-4 px-4 py-3 rounded-[16px] cursor-pointer transition-all duration-150 border border-[#E2E8F0]"
                  style={{ background: "#FFFFFF" }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = "#BFDBFE"
                    el.style.background = "#F8FAFC"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = "#E2E8F0"
                    el.style.background = "#FFFFFF"
                  }}
                >
                  {/* Ticker */}
                  <div className="w-24 flex-shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}
                    >
                      {stock.ticker}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p
                      className="text-sm truncate"
                      style={{ color: "#475569", fontFamily: "var(--font-body)" }}
                    >
                      {stock.name}
                    </p>
                  </div>

                  {/* Sector */}
                  <div className="hidden md:block w-40 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#F1F5F9", color: "#94A3B8", fontFamily: "var(--font-body)" }}
                    >
                      {stock.sector}
                    </span>
                  </div>

                  {/* Sentiment or Add */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inList && entry?.overall_score != null ? (
                      <>
                        <div
                          className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                          style={{ background: `${sentColor}18` }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: sentColor, fontFamily: "var(--font-mono)" }}
                          >
                            {Math.round(entry.overall_score)}
                          </span>
                        </div>
                        <span
                          className="text-xs font-semibold hidden sm:block"
                          style={{ color: sentColor, fontFamily: "var(--font-mono)", minWidth: 52 }}
                        >
                          {entry.sentiment}
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: inList ? "#F1F5F9" : "#DBEAFE",
                          color: inList ? "#94A3B8" : "#3B82F6",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {inList ? "Loading…" : "Analyse"}
                      </span>
                    )}
                  </div>

                  <ChevronRight size={14} style={{ color: "#CBD5E1", flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        entry={sheetEntry}
        result={sheetResult}
        loading={sheetLoading}
        open={sheetOpen}
        inWatchlist={sheetInWatchlist}
        onClose={() => {
          setSheetOpen(false)
          setTimeout(() => { setSheetEntry(null); setSheetResult(null) }, 300)
        }}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  )
}
