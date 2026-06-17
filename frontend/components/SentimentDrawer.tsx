"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SentimentResult } from "@/lib/types"

interface Props {
  result: SentimentResult | null
  open: boolean
  onClose: () => void
}

const VECTOR_LABELS: Record<string, string> = {
  direct: "Company News",
  sector: "Sector / Industry",
  competitor: "Competitor Impact",
  macro: "Macro / Political",
  geopolitical: "Geopolitical & Supply Chain",
}

const VECTOR_WEIGHTS: Record<string, number> = {
  direct: 40,
  sector: 20,
  competitor: 15,
  macro: 15,
  geopolitical: 10,
}

function GaugeBar({ score }: { score: number }) {
  const color =
    score >= 55 ? "bg-green-500" : score >= 45 ? "bg-yellow-400" : "bg-red-500"
  return (
    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  )
}

export default function SentimentDrawer({ result, open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {result ? (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle>
                {result.name}
                <span className="ml-2 text-muted-foreground font-normal text-base">
                  ({result.ticker})
                </span>
              </SheetTitle>
            </SheetHeader>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall Sentiment Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-3">
                  {result.overall_score.toFixed(1)}
                  <span className="text-base font-normal text-muted-foreground ml-1">/ 100</span>
                </div>
                <GaugeBar score={result.overall_score} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 Bearish</span>
                  <span>50 Neutral</span>
                  <span>100 Bullish</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {Object.entries(result.vector_scores).map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{VECTOR_LABELS[key]}</span>
                    <span className="text-muted-foreground">
                      {score.toFixed(1)} · weight {VECTOR_WEIGHTS[key]}%
                    </span>
                  </div>
                  <GaugeBar score={score} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading…
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
