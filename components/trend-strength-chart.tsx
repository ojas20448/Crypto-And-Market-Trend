"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import type { ChartDataPoint } from "@/lib/types"
import { format } from "@/lib/date-utils"

interface TrendStrengthChartProps {
  data: ChartDataPoint[]
}

export function TrendStrengthChart({ data }: TrendStrengthChartProps) {
  const chartConfig = {
    adx: { label: "ADX", color: "var(--chart-1)" },
    plusDI: { label: "+DI", color: "var(--success)" },
    minusDI: { label: "-DI", color: "var(--destructive)" },
    atr: { label: "ATR", color: "var(--chart-4)" },
  }

  const formattedData = data.map((point) => ({
    time: format(new Date(point.timestamp), "MMM dd HH:mm"),
    adx: point.adx || 0,
    plusDI: point.plusDI || 0,
    minusDI: point.minusDI || 0,
    atr: point.atr || 0,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ADX - Trend Strength</CardTitle>
          <CardDescription>Average Directional Index with +DI and -DI</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={25} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="adx" stroke="var(--color-adx)" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="plusDI"
                  stroke="var(--color-plusDI)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="minusDI"
                  stroke="var(--color-minusDI)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ATR - Volatility</CardTitle>
          <CardDescription>Average True Range indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="atr" stroke="var(--color-atr)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
