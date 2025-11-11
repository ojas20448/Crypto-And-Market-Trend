"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { BacktestResult } from "@/lib/backtesting"
import { format } from "@/lib/date-utils"

interface EquityCurveProps {
  result: BacktestResult
}

export function EquityCurve({ result }: EquityCurveProps) {
  const chartConfig = {
    equity: { label: "Equity", color: "hsl(var(--chart-1))" },
    drawdown: { label: "Drawdown", color: "hsl(var(--destructive))" },
  }

  const chartData = result.equityCurve.map((point) => ({
    time: format(new Date(point.time), "MMM dd HH:mm"),
    equity: point.equity,
    drawdown: -point.drawdown,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <div className="text-xs font-medium mb-2">{data.time}</div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Equity:</span>
                          <span className="font-mono font-medium">₹{data.equity.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="equity" stroke="var(--color-equity)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Drawdown Chart</CardTitle>
          <CardDescription>Portfolio decline from peak</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <div className="text-xs font-medium mb-2">{data.time}</div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Drawdown:</span>
                          <span className="font-mono font-medium text-destructive">{data.drawdown.toFixed(2)}%</span>
                        </div>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="var(--color-drawdown)"
                  fill="var(--color-drawdown)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
