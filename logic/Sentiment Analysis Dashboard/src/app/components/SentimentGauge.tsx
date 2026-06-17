import type { SentimentLabel } from "../data/mockData";

interface SentimentGaugeProps {
  score: number;
  sentiment: SentimentLabel;
  size?: "sm" | "md" | "lg";
}

export function SentimentGauge({ score, sentiment, size = "md" }: SentimentGaugeProps) {
  const color =
    sentiment === "Bullish" ? "#00e87a" :
    sentiment === "Bearish" ? "#ff3b5c" : "#f59e0b";

  const radius = size === "lg" ? 52 : size === "md" ? 36 : 24;
  const stroke = size === "lg" ? 6 : size === "md" ? 5 : 4;
  const svgSize = (radius + stroke) * 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;

  const textSize = size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-sm";
  const labelSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svgSize, height: svgSize / 2 + stroke }}>
        <svg width={svgSize} height={svgSize / 2 + stroke} viewBox={`0 0 ${svgSize} ${svgSize / 2 + stroke}`}>
          {/* Track */}
          <path
            d={`M ${stroke} ${radius + stroke} A ${radius} ${radius} 0 0 1 ${svgSize - stroke} ${radius + stroke}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d={`M ${stroke} ${radius + stroke} A ${radius} ${radius} 0 0 1 ${svgSize - stroke} ${radius + stroke}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        {size !== "sm" && (
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
            <span className={`${textSize} font-bold`} style={{ color, fontFamily: "var(--font-mono)" }}>
              {score}
            </span>
          </div>
        )}
      </div>
      <span
        className={`${labelSize} font-semibold tracking-widest uppercase`}
        style={{ color, fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        {sentiment}
      </span>
    </div>
  );
}
