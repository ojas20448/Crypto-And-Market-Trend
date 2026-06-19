"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { Prediction } from "@/lib/types"
import { calculateConfidencePerformance } from "@/lib/performance-metrics"

interface ConfidenceAnalysisProps {
  predictions: Prediction[]
}

export function ConfidenceAnalysis({ predictions }: ConfidenceAnalysisProps) {
  const confidenceStats = calculateConfidencePerformance(predictions)

  const chartConfig = {
    accuracy: { label: "Accuracy", color: "var(--chart-2)" },
  }

  const chartData = confidenceStats.map((stat) => ({
    range: stat.label,
    accuracy: stat.accuracy * 100,
    total: stat.total,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence vs Accuracy</CardTitle>
        <CardDescription>Performance at different confidence levels</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--color-accuracy)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          {confidenceStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold">{(stat.accuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">{stat.total} predictions</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
