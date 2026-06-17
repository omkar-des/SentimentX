"use client"

import { Bookmark, BookmarkCheck, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import type { WatchlistEntry } from "@/lib/types"
import { sentimentColor } from "@/lib/types"
import { SentimentGauge } from "./SentimentGauge"

interface StockCardProps {
  entry: WatchlistEntry
  onSelect: (entry: WatchlistEntry) => void
  onRemove: (ticker: string) => void
}

export function StockCard({ entry, onSelect, onRemove }: StockCardProps) {
  const TrendIcon =
    entry.sentiment === "Bullish" ? TrendingUp :
    entry.sentiment === "Bearish" ? TrendingDown : Minus

  const color = sentimentColor(entry.sentiment)

  return (
    <div
      onClick={() => onSelect(entry)}
      className="relative rounded-[20px] p-4 cursor-pointer transition-all duration-[240ms] border border-[#E2E8F0] bg-white group"
      style={{
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "rgba(59,130,246,0.35)"
        el.style.boxShadow = "0 8px 24px rgba(15,23,42,0.08)"
        el.style.transform = "translateY(-1px)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "#E2E8F0"
        el.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04)"
        el.style.transform = "translateY(0)"
      }}
    >
      {/* Remove from watchlist */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(entry.ticker) }}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
        style={{ color: "#94A3B8", background: "#F8FAFC" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#F87171" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#94A3B8" }}
        title="Remove from watchlist"
      >
        <BookmarkCheck size={14} />
      </button>

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold tracking-wide"
            style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}
          >
            {entry.ticker}
          </span>
          {entry.sentiment && !entry.loading && (
            <TrendIcon size={12} style={{ color }} />
          )}
        </div>
        <p
          className="text-xs mt-0.5 truncate pr-6"
          style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
        >
          {entry.name}
        </p>
      </div>

      {/* Gauge or loader */}
      <div className="flex justify-center py-2">
        {entry.loading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 size={24} className="animate-spin" style={{ color: "#3B82F6" }} />
            <span className="text-xs" style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}>
              Analysing…
            </span>
          </div>
        ) : entry.overall_score !== null ? (
          <SentimentGauge
            score={Math.round(entry.overall_score)}
            sentiment={entry.sentiment}
            size="md"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 py-4">
            <span className="text-xs" style={{ color: "#CBD5E1", fontFamily: "var(--font-body)" }}>
              No data
            </span>
          </div>
        )}
      </div>

      {/* Sector tag */}
      <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "#F1F5F9",
            color: "#475569",
            fontFamily: "var(--font-body)",
          }}
        >
          {entry.sector}
        </span>
      </div>
    </div>
  )
}
