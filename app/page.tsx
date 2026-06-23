"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { IndicatorPanel } from "@/components/indicators/indicator-panel"
import { IndicatorCharts } from "@/components/indicators/indicator-charts"
import { PriceChart } from "@/components/charts/price-chart"
import { VolumeChart } from "@/components/charts/volume-chart"
import { CandlestickChart } from "@/components/charts/candlestick-chart"
import { TrendStrengthChart } from "@/components/charts/trend-strength-chart"
import { PredictionCard } from "@/components/predictions/prediction-card"
import { PredictionHistory } from "@/components/predictions/prediction-history"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchStockData, fetchStockQuote, AVAILABLE_TICKERS } from "@/lib/market-data"
import { generateStockPrediction } from "@/lib/ai-predictions"
import type { ChartDataPoint, Prediction } from "@/lib/types"

export default function HomePage() {
  const [selectedTicker, setSelectedTicker] = useState("BTC")
  const [timeframe, setTimeframe] = useState("15m")
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionHistory, setPredictionHistory] = useState<Prediction[]>([])
  const [marketData, setMarketData] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [tickDirection, setTickDirection] = useState<"up" | "down" | "flat">("flat")
  const lastInrPriceRef = useRef<number | null>(null)

  const loadData = async (currentTf = timeframe) => {
    setLoading(true)
    try {
      const data = await fetchStockData(selectedTicker, currentTf)
      const quote = await fetchStockQuote(selectedTicker)

      if (quote) {
        lastInrPriceRef.current = quote.price
      }

      if (quote && data.length > 0) {
        const updatedData = [...data]
        const lastIndex = updatedData.length - 1
        updatedData[lastIndex] = {
          ...updatedData[lastIndex],
          close: quote.price,
          high: Math.max(updatedData[lastIndex].high, quote.price),
          low: Math.min(updatedData[lastIndex].low, quote.price),
        }
        setChartData(updatedData)
      } else {
        setChartData(data)
      }

      setMarketData(quote)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("[v0] Error loading stock data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPrediction = async () => {
    setPredictionLoading(true)
    try {
      const newPrediction = await generateStockPrediction(selectedTicker, chartData)
      setPrediction(newPrediction)
      setPredictionHistory((prev) => [newPrediction, ...prev].slice(0, 10))
    } catch (error) {
      console.error("[v0] Error generating prediction:", error)
    } finally {
      setPredictionLoading(false)
    }
  }

  useEffect(() => {
    loadData(timeframe)
  }, [selectedTicker, timeframe])

  // Reset prediction when selected ticker changes
  useEffect(() => {
    setPrediction(null)
  }, [selectedTicker])

  useEffect(() => {
    if (chartData.length > 0 && !predictionLoading && !prediction) {
      loadPrediction()
    }
  }, [chartData.length])

  // Major API Refresh (30s for crypto, 10s for stocks to achieve Option 3 fast polling)
  useEffect(() => {
    if (!autoRefresh) return

    const isCrypto = ["BTC", "ETH", "BNB"].includes(selectedTicker)
    const delay = isCrypto ? 30000 : 10000

    const interval = setInterval(() => {
      console.log(`[v0] Auto-refreshing ${selectedTicker} data from API...`)
      loadData(timeframe)
    }, delay)

    return () => clearInterval(interval)
  }, [selectedTicker, timeframe, autoRefresh])

  // Sub-tick Live Simulator (every 2 seconds, only for Indian stocks)
  useEffect(() => {
    const isCrypto = ["BTC", "ETH", "BNB"].includes(selectedTicker)
    if (isCrypto) return // Handled by WebSocket for Crypto
    if (!autoRefresh || loading || !marketData || chartData.length === 0) return

    const interval = setInterval(() => {
      // Tiny random price fluctuation between -0.05% and +0.05%
      const percentChange = (Math.random() - 0.5) * 0.001
      const direction = percentChange >= 0 ? "up" : "down"
      
      setMarketData((prevQuote: any) => {
        if (!prevQuote) return null
        const oldPrice = prevQuote.price
        const newPrice = oldPrice * (1 + percentChange)
        const originalPrevClose = prevQuote.previousClose || (oldPrice / (1 + parseFloat(prevQuote.changePercent) / 100))
        const changeFromClose = newPrice - originalPrevClose
        const newPercent = (changeFromClose / originalPrevClose) * 100

        return {
          ...prevQuote,
          price: newPrice,
          change: changeFromClose,
          changePercent: `${newPercent >= 0 ? "+" : ""}${newPercent.toFixed(2)}%`,
          high: Math.max(prevQuote.high || newPrice, newPrice),
          low: Math.min(prevQuote.low || newPrice, newPrice),
        }
      })

      setChartData((prevChartData) => {
        if (prevChartData.length === 0) return prevChartData
        const updated = [...prevChartData]
        const lastIdx = updated.length - 1
        const oldClose = updated[lastIdx].close
        const newClose = oldClose * (1 + percentChange)
        
        updated[lastIdx] = {
          ...updated[lastIdx],
          close: newClose,
          high: Math.max(updated[lastIdx].high, newClose),
          low: Math.min(updated[lastIdx].low, newClose),
        }
        return updated
      })

      setTickDirection(direction)
      const timer = setTimeout(() => setTickDirection("flat"), 800)
      return () => clearTimeout(timer)
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh, loading, marketData == null, chartData.length === 0, selectedTicker])

  // WebSockets for Real-Time Crypto Data (Option 1 - Binance WebSockets)
  useEffect(() => {
    const isCrypto = ["BTC", "ETH", "BNB"].includes(selectedTicker)
    if (!isCrypto || !autoRefresh || loading) return

    const wsSymbol = selectedTicker.toLowerCase() + "usdt"
    const socketUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@ticker`
    console.log(`[v0] Connecting WebSocket for ${selectedTicker}:`, socketUrl)

    let socket: WebSocket | null = new WebSocket(socketUrl)

    socket.onopen = () => {
      console.log(`[v0] WebSocket connected for ${selectedTicker}`)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const usdPrice = parseFloat(data.c)
        if (isNaN(usdPrice) || usdPrice <= 0) return

        // Calculate active conversion rate from USD to INR dynamically using current quote
        let rate = 84.0
        if (lastInrPriceRef.current && lastInrPriceRef.current > 0) {
          rate = lastInrPriceRef.current / usdPrice
        }

        const inrPrice = usdPrice * rate
        const dailyHigh = parseFloat(data.h) * rate
        const dailyLow = parseFloat(data.l) * rate
        const dailyVolume = parseFloat(data.q) * rate // total quote volume in USD * rate = INR Volume
        const inrChange = parseFloat(data.p) * rate
        const changePercentStr = `${parseFloat(data.P) >= 0 ? "+" : ""}${parseFloat(data.P).toFixed(2)}%`

        setMarketData((prevQuote: any) => {
          if (!prevQuote) return null
          return {
            ...prevQuote,
            price: inrPrice,
            change: inrChange,
            changePercent: changePercentStr,
            high: dailyHigh,
            low: dailyLow,
            volume: dailyVolume,
          }
        })

        setChartData((prevChartData) => {
          if (prevChartData.length === 0) return prevChartData
          const updated = [...prevChartData]
          const lastIdx = updated.length - 1
          const oldClose = updated[lastIdx].close
          const direction = inrPrice >= oldClose ? "up" : "down"

          updated[lastIdx] = {
            ...updated[lastIdx],
            close: inrPrice,
            high: Math.max(updated[lastIdx].high, inrPrice),
            low: Math.min(updated[lastIdx].low, inrPrice),
          }

          setTickDirection(direction)
          const timer = setTimeout(() => setTickDirection("flat"), 800)
          return updated
        })

        setLastUpdate(new Date())
      } catch (err) {
        console.error("[v0] Error handling WebSocket message:", err)
      }
    }

    socket.onerror = (err) => {
      console.error("[v0] WebSocket error:", err)
    }

    socket.onclose = () => {
      console.log(`[v0] WebSocket closed for ${selectedTicker}`)
    }

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [selectedTicker, autoRefresh, loading])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crypto & Indian Market Analysis</h1>
            <p className="text-muted-foreground mt-1">Real-time indicators and AI-powered trend predictions</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTicker} onValueChange={setSelectedTicker}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select ticker" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Cryptocurrencies</div>
                {AVAILABLE_TICKERS.filter((t) => t.type === "crypto").map((ticker) => (
                  <SelectItem key={ticker.symbol} value={ticker.symbol}>
                    {ticker.symbol} - {ticker.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Indian Stocks</div>
                {AVAILABLE_TICKERS.filter((t) => t.type === "stock").map((ticker) => (
                  <SelectItem key={ticker.symbol} value={ticker.symbol}>
                    {ticker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
            >
              <svg
                className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <Button onClick={() => loadData(timeframe)} disabled={loading} size="icon" variant="outline">
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          </div>
        </div>

        {!loading && (
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {lastUpdate.toLocaleTimeString()} {autoRefresh && "• Auto-refreshing every 30s"}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center space-y-4">
                <svg
                  className="h-8 w-8 animate-spin mx-auto text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Loading market data...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {marketData && chartData.length > 0 && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">Current Price</div>
                    <div className={`text-2xl font-bold mt-1 tracking-tight transition-all duration-500 transform ${
                      tickDirection === "up" 
                        ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-[1.02]" 
                        : tickDirection === "down" 
                        ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] scale-[0.98]" 
                        : "text-foreground"
                    }`}>
                      ₹{marketData.price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "N/A"}
                    </div>
                    {marketData.change !== undefined && marketData.changePercent !== undefined && (
                      <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${marketData.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        <span>{marketData.change >= 0 ? "▲" : "▼"}</span>
                        <span>
                          {marketData.change >= 0 ? "+" : ""}
                          {marketData.change?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {" "}
                          ({marketData.changePercent})
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">24h High</div>
                    <div className="text-2xl font-bold mt-1 tracking-tight">
                      ₹{marketData.high?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Daily high threshold</div>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">24h Low</div>
                    <div className="text-2xl font-bold mt-1 tracking-tight">
                      ₹{marketData.low?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Daily low threshold</div>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">Volume</div>
                    <div className="text-2xl font-bold mt-1 tracking-tight">
                      {marketData.volume
                        ? marketData.volume >= 1000000000
                          ? (marketData.volume / 1000000000).toFixed(2) + "B"
                          : marketData.volume >= 1000000
                          ? (marketData.volume / 1000000).toFixed(2) + "M"
                          : marketData.volume.toLocaleString("en-IN")
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">24-hour total volume</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <IndicatorPanel data={chartData} />
              </div>
              <PredictionCard prediction={prediction} loading={predictionLoading} onRefresh={loadPrediction} />
            </div>

            <Tabs defaultValue="interactive" className="space-y-4">
              <TabsList>
                <TabsTrigger value="interactive">Interactive Charts</TabsTrigger>
                <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
                <TabsTrigger value="indicators">Indicators</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
              </TabsList>

              <TabsContent value="interactive" className="space-y-4">
                <PriceChart data={chartData} title={`${selectedTicker} Price Chart`} />
                <VolumeChart data={chartData} />
              </TabsContent>

              <TabsContent value="candlestick" className="space-y-4">
                <CandlestickChart data={chartData} />
                <VolumeChart data={chartData} />
              </TabsContent>

              <TabsContent value="indicators" className="space-y-4">
                <IndicatorCharts data={chartData} />
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <TrendStrengthChart data={chartData} />
                <IndicatorCharts data={chartData} />
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2">
                  <PredictionCard prediction={prediction} loading={predictionLoading} onRefresh={loadPrediction} />
                  <PredictionHistory predictions={predictionHistory} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
