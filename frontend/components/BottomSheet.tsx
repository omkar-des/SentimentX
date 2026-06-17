"use client"

import { useEffect, useState } from "react"
import { X, Bookmark, BookmarkCheck, BrainCircuit, Loader2, Sparkles, Clock, RefreshCw } from "lucide-react"
import type { WatchlistEntry, SentimentResult, StockPrice } from "@/lib/types"
import { sentimentColor, sentimentBg } from "@/lib/types"
import { SentimentGauge } from "./SentimentGauge"
import { TypewriterText } from "./TypewriterText"

interface BottomSheetProps {
  entry: WatchlistEntry | null
  result: SentimentResult | null
  loading: boolean
  open: boolean
  inWatchlist: boolean
  price?: StockPrice | null
  priceLoading?: boolean
  onClose: () => void
  onToggleWatchlist: (ticker: string, name: string, sector: string) => void
  onRefreshPrice: (ticker: string) => void
}

const VECTOR_LABELS: Record<string, string> = {
  direct: "Company News",
  sector: "Sector",
  competitor: "Competitor",
  macro: "Macro",
  geopolitical: "Geopolitical",
}

const LOADING_MESSAGES = [
  "Fetching news signals across 5 sentiment vectors…",
  "Scoring articles via Gemini AI…",
  "Applying weighted sentiment model…",
  "Almost done — computing final score…",
  "Generating AI reasoning & forecast…",
]

export function BottomSheet({
  entry, result, loading, open,
  inWatchlist, price, priceLoading, onClose, onToggleWatchlist, onRefreshPrice,
}: BottomSheetProps) {
  const [visible, setVisible] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!loading) { setMsgIdx(0); return }
    setMsgIdx(0)
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  if (!entry) return null

  const color = sentimentColor(entry.sentiment)
  const bg = sentimentBg(entry.sentiment)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "#FFFFFF",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -24px 80px rgba(15,23,42,0.14)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          maxHeight: "90vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E2E8F0" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-start justify-between px-5 pt-3 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #F1F5F9" }}
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-2xl font-bold tracking-wide"
                style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}
              >
                {entry.ticker}
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "#F1F5F9", color: "#475569", fontFamily: "var(--font-body)" }}
              >
                {entry.sector}
              </span>
            </div>
            <p
              className="text-sm mt-0.5"
              style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
            >
              {entry.name}
            </p>

            {/* Live price */}
            <div className="flex items-center gap-2 mt-1">
              {priceLoading && !price ? (
                <span className="text-xs" style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
                  Fetching price…
                </span>
              ) : price ? (
                <>
                  <span className="text-base font-bold" style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                    ₹{price.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: price.change >= 0 ? "#16A34A" : "#DC2626", fontFamily: "var(--font-mono)" }}
                  >
                    {price.change >= 0 ? "▲" : "▼"} {price.change >= 0 ? "+" : ""}{price.change.toFixed(2)} ({Math.abs(price.change_pct).toFixed(2)}%)
                  </span>
                  <button
                    onClick={() => onRefreshPrice(entry.ticker)}
                    className="p-1 rounded-lg transition-colors"
                    style={{ color: "#CBD5E1" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#3B82F6" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#CBD5E1" }}
                    title="Refresh price"
                  >
                    <RefreshCw size={12} className={priceLoading ? "animate-spin" : ""} />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleWatchlist(entry.ticker, entry.name, entry.sector)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-sm font-medium transition-all duration-150"
              style={{
                background: inWatchlist ? "#DBEAFE" : "#F8FAFC",
                color: inWatchlist ? "#1D4ED8" : "#475569",
                border: `1.5px solid ${inWatchlist ? "#BFDBFE" : "#E2E8F0"}`,
                fontFamily: "var(--font-body)",
              }}
            >
              {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              <span className="hidden sm:inline">{inWatchlist ? "Watching" : "Watch"}</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-[12px] transition-colors"
              style={{ color: "#94A3B8" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: "none" }}>

          {loading ? (
            /* Loading state */
            <div
              className="rounded-[20px] p-6 flex flex-col items-center gap-4 mb-5"
              style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#DBEAFE" }}
              >
                <BrainCircuit size={24} style={{ color: "#3B82F6" }} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "#0F172A", fontFamily: "var(--font-body)" }}
                >
                  <TypewriterText
                    key={`${entry.ticker}-${msgIdx}`}
                    text={LOADING_MESSAGES[msgIdx]}
                    speed={22}
                  />
                </p>
                <p
                  className="text-xs"
                  style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
                >
                  This takes about 2 minutes — Gemini is reading live news signals
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: "#3B82F6",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : result ? (
            <>
              {/* Sentiment score banner */}
              <div
                className="flex items-center justify-between p-4 rounded-[20px] mb-5"
                style={{ background: bg, border: `1.5px solid ${color}30` }}
              >
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color, fontFamily: "var(--font-mono)" }}
                  >
                    AI Sentiment Score
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "#475569", fontFamily: "var(--font-body)" }}
                  >
                    Weighted across 5 news vectors
                  </p>
                </div>
                <SentimentGauge
                  score={Math.round(result.overall_score)}
                  sentiment={entry.sentiment}
                  size="lg"
                />
              </div>

              {/* Vector breakdown */}
              <div className="mb-5">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}
                >
                  Vector Breakdown
                </p>
                <div
                  className="rounded-[20px] overflow-hidden"
                  style={{ border: "1.5px solid #E2E8F0" }}
                >
                  {Object.entries(result.vector_scores).map(([key, score], i, arr) => {
                    const weight = result.weights[key as keyof typeof result.weights]
                    const vectorColor = score >= 60 ? "#22C55E" : score <= 40 ? "#F87171" : "#FBBF24"
                    return (
                      <div
                        key={key}
                        className="px-4 py-3"
                        style={{
                          borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#0F172A", fontFamily: "var(--font-body)" }}
                            >
                              {VECTOR_LABELS[key] ?? key}
                            </span>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: "#F1F5F9", color: "#94A3B8", fontFamily: "var(--font-mono)" }}
                            >
                              {Math.round(weight * 100)}%
                            </span>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: vectorColor, fontFamily: "var(--font-mono)" }}
                          >
                            {Math.round(score)}
                          </span>
                        </div>
                        {/* Bar track */}
                        <div
                          className="w-full rounded-full overflow-hidden"
                          style={{ height: 8, background: "#F1F5F9" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${score}%`,
                              background: vectorColor,
                              transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                              boxShadow: `0 0 8px ${vectorColor}60`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Reasoning */}
              {result.summary && (
                <div
                  className="rounded-[16px] p-4 mb-5"
                  style={{ background: "#F8FAFC", border: "1.5px solid #DBEAFE" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={13} style={{ color: "#3B82F6" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#3B82F6", fontFamily: "var(--font-mono)" }}
                    >
                      AI Reasoning
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#475569", fontFamily: "var(--font-body)" }}>
                    <TypewriterText key={result.ticker} text={result.summary} speed={12} />
                  </p>
                  {(result.forecast_duration || result.forecast_reason) && (
                    <>
                      <div className="my-3" style={{ height: 1, background: "#DBEAFE" }} />
                      <div className="flex items-start gap-2">
                        <Clock size={13} style={{ color: "#3B82F6", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          {result.forecast_duration && (
                            <span
                              className="text-xs font-bold uppercase tracking-widest"
                              style={{ color: "#3B82F6", fontFamily: "var(--font-mono)" }}
                            >
                              Relevant for {result.forecast_duration}
                            </span>
                          )}
                          {result.forecast_reason && (
                            <p
                              className="text-xs mt-0.5 leading-relaxed"
                              style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
                            >
                              {result.forecast_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Weights note */}
              <div
                className="rounded-[16px] px-4 py-3 mb-5"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
              >
                <p
                  className="text-xs"
                  style={{ color: "#94A3B8", fontFamily: "var(--font-body)", lineHeight: "1.6" }}
                >
                  Competitor sentiment is <strong style={{ color: "#475569" }}>inversed</strong> — bad news for rivals is a bullish signal. Scores represent Gemini AI's assessment of live Google News articles.
                </p>
              </div>
            </>
          ) : (
            <div
              className="rounded-[20px] p-6 text-center mb-5"
              style={{ background: "#F8FAFC", border: "1.5px dashed #E2E8F0" }}
            >
              <p className="text-sm" style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}>
                No sentiment data yet. Add to watchlist to load.
              </p>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </>
  )
}
