"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { Prediction } from "@/lib/types"
import { calculateSignalPerformance } from "@/lib/performance-metrics"

interface SignalPerformanceProps {
  predictions: Prediction[]
}

export function SignalPerformance({ predictions }: SignalPerformanceProps) {
  const signalStats = calculateSignalPerformance(predictions)

  const chartConfig = {
    correct: { label: "Correct", color: "var(--success)" },
    incorrect: { label: "Incorrect", color: "var(--destructive)" },
  }

  const chartData = [
    {
      signal: "Buy",
      correct: signalStats.buy.correct,
      incorrect: signalStats.buy.total - signalStats.buy.correct,
      accuracy: signalStats.buy.total > 0 ? (signalStats.buy.correct / signalStats.buy.total) * 100 : 0,
      avgReturn: signalStats.buy.avgReturn,
    },
    {
      signal: "Hold",
      correct: signalStats.hold.correct,
      incorrect: signalStats.hold.total - signalStats.hold.correct,
      accuracy: signalStats.hold.total > 0 ? (signalStats.hold.correct / signalStats.hold.total) * 100 : 0,
      avgReturn: signalStats.hold.avgReturn,
    },
    {
      signal: "Sell",
      correct: signalStats.sell.correct,
      incorrect: signalStats.sell.total - signalStats.sell.correct,
      accuracy: signalStats.sell.total > 0 ? (signalStats.sell.correct / signalStats.sell.total) * 100 : 0,
      avgReturn: signalStats.sell.avgReturn,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Signal Type</CardTitle>
        <CardDescription>Accuracy and returns for each prediction type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
              <XAxis dataKey="signal" tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                      <div className="text-sm font-medium mb-2">{data.signal} Signal</div>
                      <div className="grid gap-1 text-xs">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Correct:</span>
                          <span className="font-mono font-medium">{data.correct}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Incorrect:</span>
                          <span className="font-mono font-medium">{data.incorrect}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="font-mono font-medium">{data.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Avg Return:</span>
                          <span
                            className={`font-mono font-medium ${data.avgReturn > 0 ? "text-success" : "text-destructive"}`}
                          >
                            {data.avgReturn > 0 ? "+" : ""}
                            {data.avgReturn.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="correct" fill="var(--color-correct)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="incorrect" fill="var(--color-incorrect)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          {chartData.map((item) => (
            <div key={item.signal} className="text-center">
              <p className="text-sm font-medium">{item.signal}</p>
              <p className="text-xs text-muted-foreground">{item.accuracy.toFixed(1)}% accuracy</p>
              <p
                className={`text-sm font-mono font-semibold mt-1 ${item.avgReturn > 0 ? "text-success" : "text-destructive"}`}
              >
                {item.avgReturn > 0 ? "+" : ""}
                {item.avgReturn.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
