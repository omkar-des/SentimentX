import { Badge } from "@/components/ui/badge"

interface Props {
  score: number | null
}

function label(score: number): string {
  if (score >= 70) return "Bullish"
  if (score >= 55) return "Mild Bullish"
  if (score >= 45) return "Neutral"
  if (score >= 30) return "Mild Bearish"
  return "Bearish"
}

function variant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 55) return "default"
  if (score >= 45) return "secondary"
  return "destructive"
}

export default function SentimentBadge({ score }: Props) {
  if (score === null) return <Badge variant="outline">—</Badge>
  return (
    <Badge variant={variant(score)}>
      {score.toFixed(1)} · {label(score)}
    </Badge>
  )
}
