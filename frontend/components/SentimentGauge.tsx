import type { SentimentLabel } from "@/lib/types"
import { sentimentColor } from "@/lib/types"

interface SentimentGaugeProps {
  score: number
  sentiment: SentimentLabel | null
  size?: "sm" | "md" | "lg"
}

export function SentimentGauge({ score, sentiment, size = "md" }: SentimentGaugeProps) {
  const color = sentimentColor(sentiment)
  const radius = size === "lg" ? 52 : size === "md" ? 36 : 24
  const stroke = size === "lg" ? 7 : size === "md" ? 6 : 4
  const svgW = (radius + stroke) * 2
  const svgH = svgW / 2 + stroke
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const textCls = size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-sm"
  const labelCls = size === "lg" ? "text-sm" : "text-xs"

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: svgW, height: svgH }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {/* Track */}
          <path
            d={`M ${stroke} ${radius + stroke} A ${radius} ${radius} 0 0 1 ${svgW - stroke} ${radius + stroke}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${stroke} ${radius + stroke} A ${radius} ${radius} 0 0 1 ${svgW - stroke} ${radius + stroke}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
              filter: `drop-shadow(0 0 5px ${color}80)`,
            }}
          />
        </svg>
        {size !== "sm" && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <span
              className={`${textCls} font-bold`}
              style={{ color, fontFamily: "var(--font-mono)" }}
            >
              {score}
            </span>
          </div>
        )}
      </div>
      <span
        className={`${labelCls} font-bold tracking-widest uppercase`}
        style={{ color, fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        {sentiment ?? "—"}
      </span>
    </div>
  )
}
