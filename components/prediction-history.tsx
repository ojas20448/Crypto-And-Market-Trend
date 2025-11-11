"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Prediction } from "@/lib/types"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, CheckCircleIcon, XCircleIcon } from "@/lib/icons"
import { format } from "@/lib/date-utils"

interface PredictionHistoryProps {
  predictions: Prediction[]
}

export function PredictionHistory({ predictions }: PredictionHistoryProps) {
  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "buy":
        return <TrendingUpIcon className="h-4 w-4 text-success" />
      case "sell":
        return <TrendingDownIcon className="h-4 w-4 text-destructive" />
      default:
        return <MinusIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getOutcomeIcon = (outcome?: string) => {
    if (!outcome) return null
    return outcome === "correct" ? (
      <CheckCircleIcon className="h-4 w-4 text-success" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-destructive" />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction History</CardTitle>
        <CardDescription>Recent AI predictions and outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {predictions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No predictions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-start justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getSignalIcon(prediction.signal)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{prediction.ticker}</Badge>
                        <Badge
                          variant={
                            prediction.signal === "buy"
                              ? "default"
                              : prediction.signal === "sell"
                                ? "destructive"
                                : "secondary"
                          }
                          className="uppercase text-xs"
                        >
                          {prediction.signal}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(prediction.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{prediction.explanation}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(prediction.timestamp), "MMM dd, HH:mm")}</span>
                        {prediction.priceChange && (
                          <span className={prediction.priceChange > 0 ? "text-success" : "text-destructive"}>
                            {prediction.priceChange > 0 ? "+" : ""}
                            {prediction.priceChange.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {getOutcomeIcon(prediction.actualOutcome)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
