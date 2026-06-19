"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { BacktestConfigPanel } from "@/components/backtesting/backtest-config"
import { BacktestResults } from "@/components/backtesting/backtest-results"
import { EquityCurve } from "@/components/backtesting/equity-curve"
import { TradeLog } from "@/components/backtesting/trade-log"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchStockData, AVAILABLE_TICKERS } from "@/lib/market-data"
import { runBacktest, type BacktestConfig, type BacktestResult } from "@/lib/backtesting"
import { RefreshCw } from "lucide-react"

export default function BacktestingPage() {
  const [selectedTicker, setSelectedTicker] = useState("BTC")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)

  const [config, setConfig] = useState<BacktestConfig>({
    initialCapital: 10000,
    positionSize: 10,
    stopLoss: 2,
    takeProfit: 4,
    tradingFees: 0.1,
    strategy: "multi-indicator",
  })

  const runBacktestAnalysis = async () => {
    setLoading(true)
    try {
      const data = await fetchStockData(selectedTicker, "15m")
      const backtestResult = runBacktest(data, config)
      setResult(backtestResult)
    } catch (error) {
      console.error("[v0] Backtest error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backtesting System</h1>
            <p className="text-muted-foreground mt-1">Test trading strategies against historical data</p>
          </div>
          <Select value={selectedTicker} onValueChange={setSelectedTicker}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select ticker" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_TICKERS.map((ticker) => (
                <SelectItem key={ticker.symbol} value={ticker.symbol}>
                  {ticker.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <BacktestConfigPanel config={config} onConfigChange={setConfig} onRun={runBacktestAnalysis} loading={loading} />

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Running backtest...</p>
              </div>
            </CardContent>
          </Card>
        ) : result ? (
          <>
            <BacktestResults result={result} />
            <EquityCurve result={result} />
            <TradeLog trades={result.trades} />
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-[300px]">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Configure your strategy and click Run Backtest to begin</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
