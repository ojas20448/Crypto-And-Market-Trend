"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { MetricsOverview } from "@/components/performance/metrics-overview"
import { ConfusionMatrix } from "@/components/performance/confusion-matrix"
import { SignalPerformance } from "@/components/performance/signal-performance"
import { ConfidenceAnalysis } from "@/components/performance/confidence-analysis"
import { PredictionHistory } from "@/components/predictions/prediction-history"
import { Card, CardContent } from "@/components/ui/card"
import { generateMockPerformanceData, calculatePerformanceMetrics } from "@/lib/performance-metrics"
import type { Prediction, PerformanceMetrics } from "@/lib/types"
import { RefreshCw } from "lucide-react"

export default function PerformancePage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simulate loading data
    setTimeout(() => {
      const mockPredictions = generateMockPerformanceData()
      setPredictions(mockPredictions)
      setMetrics(calculatePerformanceMetrics(mockPredictions))
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track AI prediction accuracy and model performance</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading performance data...</p>
              </div>
            </CardContent>
          </Card>
        ) : metrics ? (
          <>
            <MetricsOverview metrics={metrics} />

            <div className="grid gap-6 lg:grid-cols-2">
              <SignalPerformance predictions={predictions} />
              <ConfusionMatrix metrics={metrics} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ConfidenceAnalysis predictions={predictions} />
              <PredictionHistory predictions={predictions.slice(0, 10)} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
