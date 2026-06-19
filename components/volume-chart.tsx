"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ComposedChart, Bar, Cell, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { ChartDataPoint } from "@/lib/types"
import { format } from "@/lib/date-utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface VolumeChartProps {
  data: ChartDataPoint[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  const [showOBV, setShowOBV] = useState(true)

  const chartConfig = {
    volume: { label: "Volume", color: "var(--chart-1)" },
    obv: { label: "OBV", color: "var(--chart-2)" },
  }

  const formattedData = data.map((point, index) => {
    const prevClose = index > 0 ? data[index - 1].close : point.close
    const isUp = point.close >= prevClose

    return {
      time: format(new Date(point.timestamp), "MMM dd HH:mm"),
      volume: point.volume,
      obv: point.obv,
      fill: isUp ? "var(--success)" : "var(--destructive)",
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Volume Analysis</CardTitle>
            <CardDescription>Trading volume and On-Balance Volume</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="obv" checked={showOBV} onCheckedChange={setShowOBV} />
            <Label htmlFor="obv" className="cursor-pointer text-sm">
              Show OBV
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.15} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              {showOBV && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
              )}
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                      <div className="text-xs font-medium mb-2">{data.time}</div>
                      <div className="grid gap-1 text-xs">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-mono font-medium">{(data.volume / 1000000).toFixed(2)}M</span>
                        </div>
                        {showOBV && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">OBV:</span>
                            <span className="font-mono font-medium">{(data.obv / 1000000).toFixed(2)}M</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar yAxisId="left" dataKey="volume" radius={[4, 4, 0, 0]} opacity={0.8}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              {showOBV && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="obv"
                  stroke="var(--color-obv)"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
