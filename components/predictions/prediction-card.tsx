"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Prediction } from "@/lib/types"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, BrainIcon, RefreshIcon } from "@/lib/icons"

interface PredictionCardProps {
  prediction: Prediction | null
  loading?: boolean
  onRefresh?: () => void
}

export function PredictionCard({ prediction, loading, onRefresh }: PredictionCardProps) {
  const getSignalIcon = (signal?: string) => {
    switch (signal) {
      case "buy":
        return <TrendingUpIcon className="h-5 w-5 text-success" />
      case "sell":
        return <TrendingDownIcon className="h-5 w-5 text-destructive" />
      default:
        return <MinusIcon className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getSignalColor = (signal?: string) => {
    switch (signal) {
      case "buy":
        return "bg-success/10 text-success border-success/20"
      case "sell":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-success"
    if (confidence >= 0.6) return "text-warning"
    return "text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>AI Prediction</CardTitle>
              <CardDescription>Machine learning trend analysis</CardDescription>
            </div>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} disabled={loading} size="sm" variant="outline">
              <RefreshIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshIcon className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Analyzing market data...</p>
            </div>
          </div>
        ) : prediction ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSignalIcon(prediction.signal)}
                <div>
                  <p className="text-sm text-muted-foreground">Signal</p>
                  <p className="text-2xl font-bold uppercase">{prediction.signal}</p>
                </div>
              </div>
              <Badge className={getSignalColor(prediction.signal)}>{prediction.ticker}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className={`font-mono font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={prediction.confidence * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Probability Distribution</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-3 w-3 text-success" />
                    <span>Buy</span>
                  </div>
                  <span className="font-mono font-medium">{(prediction.probabilities.buy * 100).toFixed(1)}%</span>
                </div>
                <Progress value={prediction.probabilities.buy * 100} className="h-1.5" />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MinusIcon className="h-3 w-3 text-muted-foreground" />
                    <span>Hold</span>
                  </div>
                  <span className="font-mono font-medium">{(prediction.probabilities.hold * 100).toFixed(1)}%</span>
                </div>
                <Progress value={prediction.probabilities.hold * 100} className="h-1.5" />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingDownIcon className="h-3 w-3 text-destructive" />
                    <span>Sell</span>
                  </div>
                  <span className="font-mono font-medium">{(prediction.probabilities.sell * 100).toFixed(1)}%</span>
                </div>
                <Progress value={prediction.probabilities.sell * 100} className="h-1.5" />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Analysis</p>
              <p className="text-sm leading-relaxed">{prediction.explanation}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Timeframe: {prediction.timeframe}</span>
              <span>{new Date(prediction.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No prediction available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
