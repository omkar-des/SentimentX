"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { searchStocks } from "@/lib/api"
import { NSE_STOCKS } from "@/lib/stocks"
import type { StockSuggestion } from "@/lib/types"

interface SearchBarProps {
  onAdd: (ticker: string, name: string, sector: string) => void
}

export function SearchBar({ onAdd }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<StockSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const data = await searchStocks(q)
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (val: string) => {
    setQuery(val)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleSelect = (stock: StockSuggestion) => {
    const info = NSE_STOCKS.find(s => s.ticker === stock.ticker)
    const sector = info?.sector ?? "Other"
    onAdd(stock.ticker, stock.name, sector)
    setQuery("")
    setOpen(false)
    setFocused(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200"
        style={{
          background: "#F8FAFC",
          border: `1.5px solid ${focused ? "#3B82F6" : "#E2E8F0"}`,
          boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.1)" : "none",
        }}
      >
        {loading
          ? <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: "#3B82F6" }} />
          : <Search size={16} className="flex-shrink-0" style={{ color: focused ? "#3B82F6" : "#94A3B8" }} />
        }
        <input
          type="text"
          placeholder="Search stocks — RELIANCE, TCS, INFY…"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { setFocused(true); if (query) setOpen(true) }}
          className="flex-1 bg-transparent outline-none min-w-0"
          style={{
            color: "#0F172A",
            fontFamily: "var(--font-body)",
            fontSize: "16px",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); setResults([]) }}
            className="flex-shrink-0 transition-colors"
            style={{ color: "#94A3B8" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0F172A" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#94A3B8" }}
          >
            <X size={14} />
          </button>
        )}
        <span
          className="hidden sm:flex items-center justify-center w-6 h-6 rounded text-xs flex-shrink-0"
          style={{ background: "#E2E8F0", color: "#94A3B8", fontFamily: "var(--font-mono)" }}
        >
          /
        </span>
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-[16px] overflow-hidden z-50"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            boxShadow: "0 20px 48px rgba(15,23,42,0.12)",
          }}
        >
          {results.map((stock, i) => {
            const info = NSE_STOCKS.find(s => s.ticker === stock.ticker)
            return (
              <div
                key={stock.ticker}
                onClick={() => handleSelect(stock)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100"
                style={{
                  borderBottom: i < results.length - 1 ? "1px solid #F1F5F9" : "none",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ background: "#DBEAFE" }}
                >
                  <Search size={13} style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}
                    >
                      {stock.ticker}
                    </span>
                    {info?.sector && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#F1F5F9", color: "#475569", fontFamily: "var(--font-body)" }}
                      >
                        {info.sector}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}
                  >
                    {stock.name}
                  </p>
                </div>
                <span
                  className="text-xs font-medium flex-shrink-0"
                  style={{ color: "#3B82F6", fontFamily: "var(--font-body)" }}
                >
                  + Add
                </span>
              </div>
            )
          })}
        </div>
      )}

      {open && query.trim().length > 0 && !loading && results.length === 0 && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-[16px] px-4 py-6 text-center z-50"
          style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0" }}
        >
          <p className="text-sm" style={{ color: "#94A3B8", fontFamily: "var(--font-body)" }}>
            No stocks found for "{query}"
          </p>
        </div>
      )}
    </div>
  )
}
