"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts"
import type { ChartDataPoint } from "@/lib/types"

interface IndicatorChartsProps {
  data: ChartDataPoint[]
}

export function IndicatorCharts({ data }: IndicatorChartsProps) {
  const chartConfig = {
    rsi: { label: "RSI", color: "var(--chart-1)" },
    macd: { label: "MACD", color: "var(--chart-2)" },
    signal: { label: "Signal", color: "var(--chart-3)" },
    histogram: { label: "Histogram", color: "var(--chart-4)" },
    k: { label: "%K", color: "var(--chart-5)" },
    d: { label: "%D", color: "var(--chart-1)" },
  }

  const formattedData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    rsi: point.rsi14,
    macd: point.macd,
    signal: point.macdSignal,
    histogram: point.macdHistogram,
    k: point.stochasticK || 0,
    d: point.stochasticD || 0,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>RSI Indicator</CardTitle>
          <CardDescription>Relative Strength Index (14-period)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={70} stroke="var(--destructive)" strokeOpacity={0.5} strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="var(--success)" strokeOpacity={0.5} strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="rsi" stroke="var(--color-rsi)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MACD Indicator</CardTitle>
          <CardDescription>Moving Average Convergence Divergence</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="macd" stroke="var(--color-macd)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="signal" stroke="var(--color-signal)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stochastic Oscillator</CardTitle>
          <CardDescription>%K and %D momentum indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={80} stroke="var(--destructive)" strokeOpacity={0.5} strokeDasharray="3 3" />
                <ReferenceLine y={20} stroke="var(--success)" strokeOpacity={0.5} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="k" stroke="var(--color-k)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="d" stroke="var(--color-d)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MACD Histogram</CardTitle>
          <CardDescription>Difference between MACD and Signal line</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="histogram"
                  fill="var(--color-histogram)"
                  stroke="var(--color-histogram)"
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
