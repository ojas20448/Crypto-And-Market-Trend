"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ChartDataPoint } from "@/lib/types"

interface IndicatorPanelProps {
  data: ChartDataPoint[]
}

export function IndicatorPanel({ data }: IndicatorPanelProps) {
  const latest = data[data.length - 1]

  if (!latest) return null

  const indicators = [
    {
      name: "RSI (14)",
      value: latest.rsi14.toFixed(2),
      status: latest.rsi14 < 30 ? "oversold" : latest.rsi14 > 70 ? "overbought" : "neutral",
      description: latest.rsi14 < 30 ? "Oversold" : latest.rsi14 > 70 ? "Overbought" : "Neutral",
    },
    {
      name: "MACD",
      value: latest.macd.toFixed(2),
      status: latest.macd > latest.macdSignal ? "bullish" : "bearish",
      description: latest.macd > latest.macdSignal ? "Bullish" : "Bearish",
    },
    {
      name: "Stochastic",
      value: latest.stochasticK?.toFixed(2) || "N/A",
      status: (latest.stochasticK || 50) < 20 ? "oversold" : (latest.stochasticK || 50) > 80 ? "overbought" : "neutral",
      description:
        (latest.stochasticK || 50) < 20 ? "Oversold" : (latest.stochasticK || 50) > 80 ? "Overbought" : "Neutral",
    },
    {
      name: "ADX",
      value: latest.adx?.toFixed(2) || "N/A",
      status: (latest.adx || 0) > 25 ? "trending" : "ranging",
      description: (latest.adx || 0) > 25 ? "Strong Trend" : "Weak Trend",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "bullish":
      case "oversold":
        return (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case "bearish":
      case "overbought":
        return (
          <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )
      default:
        return (
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    if (status === "bullish" || status === "oversold") return "default"
    if (status === "bearish" || status === "overbought") return "destructive" as "default"
    return "secondary"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Indicators</CardTitle>
        <CardDescription>Real-time analysis of market conditions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {indicators.map((indicator) => (
          <div key={indicator.name} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(indicator.status)}
                <p className="text-sm font-medium">{indicator.name}</p>
              </div>
              <p className="text-2xl font-bold">{indicator.value}</p>
            </div>
            <Badge variant={getStatusVariant(indicator.status)}>{indicator.description}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
