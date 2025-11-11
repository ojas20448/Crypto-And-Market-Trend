"use client"

import { useState, useEffect } from "react"
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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionHistory, setPredictionHistory] = useState<Prediction[]>([])
  const [marketData, setMarketData] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchStockData(selectedTicker)
      setChartData(data)
      const quote = await fetchStockQuote(selectedTicker)
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
    loadData()
  }, [selectedTicker])

  useEffect(() => {
    if (chartData.length > 0) {
      loadPrediction()
    }
  }, [chartData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log("[v0] Auto-refreshing data...")
      loadData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [selectedTicker, autoRefresh])

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
              <SelectTrigger className="w-[240px]">
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
            <Button onClick={loadData} disabled={loading} size="icon" variant="outline">
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
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">Current Price</div>
                    <div className="text-2xl font-bold">
                      ₹{chartData[chartData.length - 1]?.close?.toFixed(2) ?? "N/A"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">24h High</div>
                    <div className="text-2xl font-bold">
                      ₹{(() => {
                        const highs = chartData
                          .slice(-96)
                          .map((d) => d.high)
                          .filter((h) => h != null)
                        return highs.length > 0 ? Math.max(...highs).toFixed(2) : "N/A"
                      })()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">24h Low</div>
                    <div className="text-2xl font-bold">
                      ₹{(() => {
                        const lows = chartData
                          .slice(-96)
                          .map((d) => d.low)
                          .filter((l) => l != null)
                        return lows.length > 0 ? Math.min(...lows).toFixed(2) : "N/A"
                      })()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground">Volume</div>
                    <div className="text-2xl font-bold">
                      {chartData[chartData.length - 1]?.volume
                        ? (chartData[chartData.length - 1].volume / 1000000).toFixed(2) + "M"
                        : "N/A"}
                    </div>
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
