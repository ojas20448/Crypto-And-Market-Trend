"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartDataPoint } from "@/lib/types"
import { format } from "@/lib/date-utils"
import { useEffect, useRef, useState } from "react"

interface CandlestickChartProps {
  data: ChartDataPoint[]
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 400,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Chart dimensions
    const padding = { top: 20, right: 60, bottom: 40, left: 60 }
    const chartWidth = dimensions.width - padding.left - padding.right
    const chartHeight = dimensions.height - padding.top - padding.bottom

    // Calculate price range
    const prices = data.flatMap((d) => [d.high, d.low])
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const priceRange = maxPrice - minPrice
    const priceBuffer = priceRange * 0.1

    // Scale functions
    const scaleY = (price: number) => {
      return (
        padding.top + chartHeight - ((price - minPrice + priceBuffer) / (priceRange + priceBuffer * 2)) * chartHeight
      )
    }

    const candleWidth = Math.max(2, chartWidth / data.length - 2)
    const candleSpacing = chartWidth / data.length

    // Draw grid
    ctx.strokeStyle = "hsl(var(--border))"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = "hsl(var(--muted-foreground))"
      ctx.font = "11px monospace"
      ctx.textAlign = "right"
      ctx.fillText(`₹${price.toFixed(2)}`, padding.left - 10, y + 4)
    }

    // Draw candlesticks
    data.forEach((candle, index) => {
      const x = padding.left + index * candleSpacing + candleSpacing / 2

      const isUp = candle.close >= candle.open
      const color = isUp ? "hsl(var(--success))" : "hsl(var(--destructive))"

      // Draw wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, scaleY(candle.high))
      ctx.lineTo(x, scaleY(candle.low))
      ctx.stroke()

      // Draw body
      const bodyTop = Math.max(candle.open, candle.close)
      const bodyBottom = Math.min(candle.open, candle.close)
      const bodyHeight = Math.max(1, scaleY(bodyBottom) - scaleY(bodyTop))

      ctx.fillStyle = color
      ctx.fillRect(x - candleWidth / 2, scaleY(bodyTop), candleWidth, bodyHeight)
    })

    // Draw time labels
    const labelCount = Math.min(6, data.length)
    const labelInterval = Math.floor(data.length / labelCount)
    ctx.fillStyle = "hsl(var(--muted-foreground))"
    ctx.font = "11px sans-serif"
    ctx.textAlign = "center"

    for (let i = 0; i < labelCount; i++) {
      const index = i * labelInterval
      if (index < data.length) {
        const x = padding.left + index * candleSpacing + candleSpacing / 2
        const time = format(new Date(data[index].timestamp), "MMM dd HH:mm")
        ctx.fillText(time, x, dimensions.height - 15)
      }
    }

    // Draw axes
    ctx.strokeStyle = "hsl(var(--border))"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.stroke()
  }, [data, dimensions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candlestick Chart</CardTitle>
        <CardDescription>OHLC price action visualization</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: `${dimensions.height}px`,
            display: "block",
          }}
        />
      </CardContent>
    </Card>
  )
}
