import { useState, useRef, useEffect } from "react";
import { Search, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Stock } from "../data/mockData";

interface SearchBarProps {
  allStocks: Stock[];
  onSelect: (stock: Stock) => void;
}

export function SearchBar({ allStocks, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? allStocks.filter(
        s =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (stock: Stock) => {
    setQuery("");
    setOpen(false);
    setFocused(false);
    onSelect(stock);
  };

  const sentimentColor = (s: Stock) =>
    s.sentiment === "Bullish" ? "#00e87a" : s.sentiment === "Bearish" ? "#ff3b5c" : "#f59e0b";

  const TrendIcon = (s: Stock) =>
    s.sentiment === "Bullish" ? TrendingUp : s.sentiment === "Bearish" ? TrendingDown : Minus;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
        style={{
          background: "#111520",
          border: `1px solid ${focused ? "rgba(0,232,122,0.35)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(0,232,122,0.08)" : "none",
        }}
      >
        <Search size={16} style={{ color: focused ? "#00e87a" : "#5a6478", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search stocks — RELIANCE, TCS, INFY..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          className="flex-1 bg-transparent outline-none placeholder-[#3a4255] text-sm"
          style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-[#5a6478] hover:text-[#e8eaf0] transition-colors">
            <X size={14} />
          </button>
        )}
        <span
          className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded"
          style={{ background: "rgba(255,255,255,0.04)", color: "#3a4255", fontFamily: "var(--font-mono)" }}
        >
          <kbd>/</kbd>
        </span>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: "#111520",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,232,122,0.06)",
          }}
        >
          {results.map(stock => {
            const Icon = TrendIcon(stock);
            const color = sentimentColor(stock);
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,232,122,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={14} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}>
                      {stock.symbol}
                    </span>
                    <span className="text-xs" style={{ color: "#5a6478" }}>{stock.sector}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
                    {stock.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}>
                    ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs" style={{ color: isPositive ? "#00e87a" : "#ff3b5c", fontFamily: "var(--font-mono)" }}>
                    {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
                <div
                  className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
                  style={{ background: `${color}18`, color, fontFamily: "var(--font-mono)" }}
                >
                  {stock.sentimentScore}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl px-4 py-6 text-center z-50"
          style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm" style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}>No stocks found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
