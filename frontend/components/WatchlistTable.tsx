"use client"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw } from "lucide-react"
import SentimentBadge from "./SentimentBadge"
import { WatchlistEntry } from "@/lib/types"

interface Props {
  entries: WatchlistEntry[]
  onRemove: (ticker: string) => void
  onRefresh: (ticker: string) => void
  onSelect: (ticker: string) => void
}

export default function WatchlistTable({ entries, onRemove, onRefresh, onSelect }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Search for a stock above and add it to your watchlist.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Sentiment Score</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((e) => (
          <TableRow
            key={e.ticker}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelect(e.ticker)}
          >
            <TableCell className="font-mono font-medium">{e.ticker}</TableCell>
            <TableCell>{e.name}</TableCell>
            <TableCell>
              {e.loading ? (
                <span className="text-muted-foreground text-sm">Analysing…</span>
              ) : (
                <SentimentBadge score={e.overall_score} />
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="icon"
                variant="ghost"
                onClick={(ev) => { ev.stopPropagation(); onRefresh(e.ticker) }}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(ev) => { ev.stopPropagation(); onRemove(e.ticker) }}
                title="Remove"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
