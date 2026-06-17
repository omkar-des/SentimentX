import { Bookmark, BookmarkCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Stock } from "../data/mockData";
import { SentimentGauge } from "./SentimentGauge";

interface StockCardProps {
  stock: Stock;
  onSelect: (stock: Stock) => void;
  onToggleShortlist: (symbol: string) => void;
}

export function StockCard({ stock, onSelect, onToggleShortlist }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const priceColor = isPositive ? "#00e87a" : "#ff3b5c";
  const TrendIcon = stock.sentiment === "Bullish" ? TrendingUp : stock.sentiment === "Bearish" ? TrendingDown : Minus;

  return (
    <div
      onClick={() => onSelect(stock)}
      className="group relative rounded-xl p-4 cursor-pointer transition-all duration-200 border"
      style={{
        background: "linear-gradient(135deg, #0e1118 0%, #111622 100%)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,232,122,0.25)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(0,232,122,0.06)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Bookmark button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleShortlist(stock.symbol); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-150 hover:bg-white/5"
        style={{ color: stock.shortlisted ? "#00e87a" : "#5a6478" }}
        title={stock.shortlisted ? "Remove from watchlist" : "Add to watchlist"}
      >
        {stock.shortlisted ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
      </button>

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold tracking-wider"
            style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
          >
            {stock.symbol}
          </span>
          <TrendIcon size={13} style={{ color: priceColor }} />
        </div>
        <p className="text-xs mt-0.5 truncate pr-6" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
          {stock.name}
        </p>
      </div>

      {/* Price row */}
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="text-base font-semibold"
          style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
        >
          ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: priceColor, fontFamily: "var(--font-mono)" }}
        >
          {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center">
        <SentimentGauge score={stock.sentimentScore} sentiment={stock.sentiment} size="md" />
      </div>

      {/* Sector tag */}
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "#5a6478",
            fontFamily: "var(--font-sans)",
          }}
        >
          {stock.sector}
        </span>
      </div>
    </div>
  );
}
