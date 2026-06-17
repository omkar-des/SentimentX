import { useEffect, useState, useRef } from "react";
import {
  X, Bookmark, BookmarkCheck, ExternalLink,
  TrendingUp, TrendingDown, Minus, Newspaper, BrainCircuit, LineChart, Sparkles
} from "lucide-react";
import type { Stock } from "../data/mockData";
import { SentimentGauge } from "./SentimentGauge";
import { TypewriterText } from "./TypewriterText";

interface BottomSheetProps {
  stock: Stock | null;
  onClose: () => void;
  onToggleShortlist: (symbol: string) => void;
}

const impactColors: Record<string, string> = {
  positive: "#00e87a",
  negative: "#ff3b5c",
  neutral: "#f59e0b",
};

const impactBg: Record<string, string> = {
  positive: "rgba(0,232,122,0.08)",
  negative: "rgba(255,59,92,0.08)",
  neutral: "rgba(245,158,11,0.08)",
};

type TabId = "summary" | "forecast";

export function BottomSheet({ stock, onClose, onToggleShortlist }: BottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [summaryDone, setSummaryDone] = useState(false);
  const [forecastDone, setForecastDone] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stock) {
      setSummaryDone(false);
      setForecastDone(false);
      setActiveTab("summary");
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [stock?.symbol]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!stock) return null;

  const priceColor = stock.change >= 0 ? "#00e87a" : "#ff3b5c";
  const TrendIcon = stock.sentiment === "Bullish" ? TrendingUp : stock.sentiment === "Bearish" ? TrendingDown : Minus;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(8,10,15,0.75)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden transition-transform duration-300 ease-out"
        style={{
          background: "#0c1018",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          boxShadow: "0 -24px 80px rgba(0,0,0,0.7)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-start justify-between px-5 pt-2 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xl font-bold tracking-wide"
                  style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
                >
                  {stock.symbol}
                </span>
                <TrendIcon size={16} style={{ color: priceColor }} />
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#5a6478", fontFamily: "var(--font-sans)" }}
                >
                  {stock.sector}
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
                {stock.name}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#e8eaf0", fontFamily: "var(--font-mono)" }}
                >
                  ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: priceColor, fontFamily: "var(--font-mono)" }}
                >
                  {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleShortlist(stock.symbol)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={{
                background: stock.shortlisted ? "rgba(0,232,122,0.12)" : "rgba(255,255,255,0.05)",
                color: stock.shortlisted ? "#00e87a" : "#5a6478",
                border: `1px solid ${stock.shortlisted ? "rgba(0,232,122,0.25)" : "rgba(255,255,255,0.08)"}`,
                fontFamily: "var(--font-sans)",
              }}
            >
              {stock.shortlisted ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              <span className="hidden sm:inline">{stock.shortlisted ? "Watching" : "Watch"}</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "#5a6478" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>

          {/* Sentiment score section */}
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-5"
            style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}>
                AI Sentiment Score
              </p>
              <p className="text-xs" style={{ color: "#3a4255", fontFamily: "var(--font-sans)" }}>
                Based on {stock.news.length} recent news signals
              </p>
            </div>
            <SentimentGauge score={stock.sentimentScore} sentiment={stock.sentiment} size="lg" />
          </div>

          {/* News section */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper size={14} style={{ color: "#5a6478" }} />
              <h3
                className="text-xs uppercase tracking-widest"
                style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}
              >
                Latest News Signals
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {stock.news.map(item => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 rounded-xl transition-all duration-150 no-underline"
                  style={{
                    background: impactBg[item.impact],
                    border: `1px solid ${impactColors[item.impact]}20`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${impactColors[item.impact]}40`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `${impactColors[item.impact]}20`)}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: impactColors[item.impact], boxShadow: `0 0 6px ${impactColors[item.impact]}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm leading-snug group-hover:text-white transition-colors"
                      style={{ color: "#c8cad4", fontFamily: "var(--font-sans)" }}
                    >
                      {item.headline}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: "#5a6478", fontFamily: "var(--font-sans)" }}>
                        {item.source}
                      </span>
                      <span className="text-xs" style={{ color: "#3a4255" }}>·</span>
                      <span className="text-xs" style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <ExternalLink
                    size={13}
                    className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: impactColors[item.impact] }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* AI Analysis tabs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} style={{ color: "#00e87a" }} />
              <h3
                className="text-xs uppercase tracking-widest"
                style={{ color: "#5a6478", fontFamily: "var(--font-mono)" }}
              >
                AI Analysis
              </h3>
            </div>

            {/* Tab switcher */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-4"
              style={{ background: "#111520", width: "fit-content" }}
            >
              {(["summary", "forecast"] as TabId[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-all duration-150 capitalize"
                  style={{
                    background: activeTab === tab ? "rgba(0,232,122,0.12)" : "transparent",
                    color: activeTab === tab ? "#00e87a" : "#5a6478",
                    border: activeTab === tab ? "1px solid rgba(0,232,122,0.2)" : "1px solid transparent",
                    fontFamily: "var(--font-sans)",
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab === "summary" ? <BrainCircuit size={12} /> : <LineChart size={12} />}
                  {tab === "summary" ? "Sentiment Summary" : "Near-Term Forecast"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "#080c14",
                border: "1px solid rgba(0,232,122,0.08)",
                minHeight: 140,
              }}
            >
              {/* AI label */}
              <div className="flex items-center gap-1.5 mb-3">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: "rgba(0,232,122,0.15)" }}
                >
                  <Sparkles size={10} style={{ color: "#00e87a" }} />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#00e87a", fontFamily: "var(--font-mono)" }}
                >
                  MarketMind AI
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(0,232,122,0.08)", color: "#5a6478", fontFamily: "var(--font-mono)" }}
                >
                  {activeTab === "summary" ? "Sentiment" : "Forecast"}
                </span>
              </div>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "#a0aabb", fontFamily: "var(--font-sans)" }}
              >
                {activeTab === "summary" ? (
                  <TypewriterText
                    key={`summary-${stock.symbol}`}
                    text={stock.summary}
                    speed={14}
                    onDone={() => setSummaryDone(true)}
                  />
                ) : (
                  <TypewriterText
                    key={`forecast-${stock.symbol}`}
                    text={stock.forecast}
                    speed={12}
                    onDone={() => setForecastDone(true)}
                  />
                )}
              </p>
            </div>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}
