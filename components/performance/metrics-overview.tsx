"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PerformanceMetrics } from "@/lib/types"
import { Target, TrendingUp, Award, Activity } from "lucide-react"

interface MetricsOverviewProps {
  metrics: PerformanceMetrics
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const metricCards = [
    {
      title: "Accuracy",
      value: `${(metrics.accuracy * 100).toFixed(1)}%`,
      description: `${metrics.correctPredictions} of ${metrics.totalPredictions} correct`,
      icon: Target,
      progress: metrics.accuracy * 100,
      color: "text-chart-1",
    },
    {
      title: "Win Rate",
      value: `${(metrics.winRate * 100).toFixed(1)}%`,
      description: "Profitable predictions",
      icon: TrendingUp,
      progress: metrics.winRate * 100,
      color: "text-success",
    },
    {
      title: "Avg Return",
      value: `${metrics.avgReturn > 0 ? "+" : ""}${metrics.avgReturn.toFixed(2)}%`,
      description: "Per prediction",
      icon: Award,
      progress: Math.min(100, Math.abs(metrics.avgReturn) * 10),
      color: metrics.avgReturn > 0 ? "text-success" : "text-destructive",
    },
    {
      title: "Total Predictions",
      value: metrics.totalPredictions.toString(),
      description: "Analyzed trades",
      icon: Activity,
      progress: 100,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            <Progress value={metric.progress} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
