import { useState } from "react";
import { Activity, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ALL_STOCKS, type Stock } from "./data/mockData";
import { SearchBar } from "./components/SearchBar";
import { StockCard } from "./components/StockCard";
import { BottomSheet } from "./components/BottomSheet";

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(ALL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "Bullish" | "Bearish" | "Neutral">("All");

  const shortlisted = stocks.filter(s => s.shortlisted);
  const filtered = shortlisted.filter(s =>
    activeFilter === "All" ? true : s.sentiment === activeFilter
  );

  const handleToggleShortlist = (symbol: string) => {
    setStocks(prev =>
      prev.map(s => s.symbol === symbol ? { ...s, shortlisted: !s.shortlisted } : s)
    );
    if (selectedStock?.symbol === symbol) {
      setSelectedStock(prev => prev ? { ...prev, shortlisted: !prev.shortlisted } : null);
    }
  };

  const handleSelectStock = (stock: Stock) => {
    const latest = stocks.find(s => s.symbol === stock.symbol) ?? stock;
    setSelectedStock(latest);
  };

  const sentimentCounts = {
    All: shortlisted.length,
    Bullish: shortlisted.filter(s => s.sentiment === "Bullish").length,
    Bearish: shortlisted.filter(s => s.sentiment === "Bearish").length,
    Neutral: shortlisted.filter(s => s.sentiment === "Neutral").length,
  };

  const filterConfig = [
    { key: "All" as const, color: "#e8eaf0", bg: "rgba(255,255,255,0.06)", icon: Activity },
    { key: "Bullish" as const, color: "#00e87a", bg: "rgba(0,232,122,0.08)", icon: TrendingUp },
    { key: "Bearish" as const, color: "#ff3b5c", bg: "rgba(255,59,92,0.08)", icon: TrendingDown },
    { key: "Neutral" as const, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: Minus },
  ];

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "radial-gradient(ellipse at 20% 0%, #0a1628 0%, #080a0f 50%, #080a0f 100%)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-24">

        {/* Top header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,232,122,0.12)", border: "1px solid rgba(0,232,122,0.2)" }}
            >
              <Sparkles size={18} style={{ color: "#00e87a" }} />
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-wide"
                style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
              >
                MarketMind
              </h1>
              <p className="text-xs" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
                AI Sentiment Analyser · NSE/BSE
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.12)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00e87a", boxShadow: "0 0 6px #00e87a" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "#00e87a", fontFamily: "var(--font-mono)" }}
            >
              LIVE · NSE
            </span>
            <span className="text-xs" style={{ color: "#3a4255", fontFamily: "var(--font-mono)" }}>
              {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
            </span>
          </div>
        </header>

        {/* Search */}
        <div className="mb-8">
          <SearchBar allStocks={stocks} onSelect={handleSelectStock} />
          <p className="mt-2 text-xs" style={{ color: "#3a4255", fontFamily: "var(--font-sans)" }}>
            Search any NSE/BSE listed stock to get instant AI sentiment analysis
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Stocks Monitored", value: stocks.length.toString(), color: "#e8eaf0" },
            { label: "Bullish Signals", value: stocks.filter(s => s.sentiment === "Bullish").length.toString(), color: "#00e87a" },
            { label: "Bearish Signals", value: stocks.filter(s => s.sentiment === "Bearish").length.toString(), color: "#ff3b5c" },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-3 sm:p-4"
              style={{ background: "#0e1118", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p
                className="text-xl sm:text-2xl font-bold mb-0.5"
                style={{ color: stat.color, fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Watchlist section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}
            >
              Watchlist — {shortlisted.length} stocks
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterConfig.map(({ key, color, bg, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150"
                  style={{
                    background: activeFilter === key ? bg : "rgba(255,255,255,0.03)",
                    color: activeFilter === key ? color : "#5a6478",
                    border: `1px solid ${activeFilter === key ? `${color}30` : "rgba(255,255,255,0.06)"}`,
                    fontFamily: "var(--font-sans)",
                    fontWeight: activeFilter === key ? 600 : 400,
                  }}
                >
                  <Icon size={11} />
                  {key}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      background: activeFilter === key ? `${color}20` : "rgba(255,255,255,0.04)",
                      color: activeFilter === key ? color : "#3a4255",
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
              className="flex flex-col items-center justify-center py-16 rounded-2xl"
              style={{ background: "#0e1118", border: "1px dashed rgba(255,255,255,0.06)" }}
            >
              <Sparkles size={28} style={{ color: "#3a4255", marginBottom: 12 }} />
              <p className="text-sm" style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}>
                {activeFilter === "All" ? "No stocks in watchlist" : `No ${activeFilter} stocks in watchlist`}
              </p>
              <p className="text-xs mt-1" style={{ color: "#3a4255", fontFamily: "var(--font-sans)" }}>
                Search and bookmark stocks to start tracking sentiment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(stock => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  onSelect={handleSelectStock}
                  onToggleShortlist={handleToggleShortlist}
                />
              ))}
            </div>
          )}
        </div>

        {/* Discover section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}
            >
              Discover — All Tracked Stocks
            </h2>
            <span className="text-xs" style={{ color: "#3a4255", fontFamily: "var(--font-mono)" }}>
              {stocks.length} total
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {stocks.map(stock => {
              const priceColor = stock.change >= 0 ? "#00e87a" : "#ff3b5c";
              const sentimentColor =
                stock.sentiment === "Bullish" ? "#00e87a" :
                stock.sentiment === "Bearish" ? "#ff3b5c" : "#f59e0b";
              return (
                <div
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    background: "#0e1118",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,232,122,0.15)";
                    (e.currentTarget as HTMLElement).style.background = "#111520";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.background = "#0e1118";
                  }}
                >
                  {/* Symbol */}
                  <div className="w-24 flex-shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
                    >
                      {stock.symbol}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className="text-xs truncate" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
                      {stock.name}
                    </p>
                  </div>

                  {/* Sector */}
                  <div className="hidden md:block w-36 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#5a6478", fontFamily: "var(--font-sans)" }}
                    >
                      {stock.sector}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-right w-28 flex-shrink-0">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
                    >
                      ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: priceColor, fontFamily: "var(--font-mono)" }}
                    >
                      {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${sentimentColor}18` }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: sentimentColor, fontFamily: "var(--font-mono)" }}
                      >
                        {stock.sentimentScore}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold hidden sm:block"
                      style={{ color: sentimentColor, fontFamily: "var(--font-mono)", minWidth: 52 }}
                    >
                      {stock.sentiment}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onToggleShortlist={handleToggleShortlist}
      />
    </div>
  );
}
