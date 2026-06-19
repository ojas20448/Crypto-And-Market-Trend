"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { ChartDataPoint } from "@/lib/types"
import { format } from "@/lib/date-utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface PriceChartProps {
  data: ChartDataPoint[]
  title?: string
}

export function PriceChart({ data, title = "Price Chart" }: PriceChartProps) {
  const [showEMA8, setShowEMA8] = useState(true)
  const [showEMA20, setShowEMA20] = useState(true)
  const [showEMA50, setShowEMA50] = useState(false)
  const [showBollinger, setShowBollinger] = useState(true)
  const [showVWAP, setShowVWAP] = useState(false)

  const chartConfig = {
    close: { label: "Close", color: "var(--foreground)" },
    ema8: { label: "EMA 8", color: "var(--chart-2)" },
    ema20: { label: "EMA 20", color: "var(--chart-3)" },
    ema50: { label: "EMA 50", color: "var(--chart-4)" },
    bbUpper: { label: "BB Upper", color: "var(--chart-5)" },
    bbLower: { label: "BB Lower", color: "var(--chart-5)" },
    vwap: { label: "VWAP", color: "var(--chart-1)" },
  }

  const formattedData = data.map((point) => ({
    time: format(new Date(point.timestamp), "MMM dd HH:mm"),
    close: point.close,
    high: point.high,
    low: point.low,
    open: point.open,
    ema8: point.ema8,
    ema20: point.ema20,
    ema50: point.ema50,
    bbUpper: point.bollingerUpper,
    bbLower: point.bollingerLower,
    bbMiddle: point.bollingerMiddle,
    vwap: point.vwap,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Price movement with technical overlays</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Switch id="ema8" checked={showEMA8} onCheckedChange={setShowEMA8} />
              <Label htmlFor="ema8" className="cursor-pointer">
                EMA 8
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="ema20" checked={showEMA20} onCheckedChange={setShowEMA20} />
              <Label htmlFor="ema20" className="cursor-pointer">
                EMA 20
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="ema50" checked={showEMA50} onCheckedChange={setShowEMA50} />
              <Label htmlFor="ema50" className="cursor-pointer">
                EMA 50
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="bollinger" checked={showBollinger} onCheckedChange={setShowBollinger} />
              <Label htmlFor="bollinger" className="cursor-pointer">
                Bollinger
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="vwap" checked={showVWAP} onCheckedChange={setShowVWAP} />
              <Label htmlFor="vwap" className="cursor-pointer">
                VWAP
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toFixed(0)}`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                      <div className="text-xs font-medium mb-2">{data.time}</div>
                      <div className="grid gap-1 text-xs">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Close:</span>
                          <span className="font-mono font-medium">₹{data.close.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-mono font-medium">₹{data.high.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-mono font-medium">₹{data.low.toFixed(2)}</span>
                        </div>
                        {showEMA8 && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">EMA 8:</span>
                            <span className="font-mono font-medium">₹{data.ema8.toFixed(2)}</span>
                          </div>
                        )}
                        {showEMA20 && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">EMA 20:</span>
                            <span className="font-mono font-medium">₹{data.ema20.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />

              {showBollinger && (
                <>
                  <Area
                    type="monotone"
                    dataKey="bbUpper"
                    stroke="var(--color-bbUpper)"
                    fill="var(--color-bbUpper)"
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="bbLower"
                    stroke="var(--color-bbLower)"
                    fill="var(--color-bbLower)"
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                </>
              )}

              <Line type="monotone" dataKey="close" stroke="var(--color-close)" strokeWidth={2} dot={false} />

              {showEMA8 && (
                <Line
                  type="monotone"
                  dataKey="ema8"
                  stroke="var(--color-ema8)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}

              {showEMA20 && (
                <Line
                  type="monotone"
                  dataKey="ema20"
                  stroke="var(--color-ema20)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}

              {showEMA50 && (
                <Line
                  type="monotone"
                  dataKey="ema50"
                  stroke="var(--color-ema50)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}

              {showVWAP && (
                <Line
                  type="monotone"
                  dataKey="vwap"
                  stroke="var(--color-vwap)"
                  strokeWidth={2}
                  dot={false}
                  opacity={0.7}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
