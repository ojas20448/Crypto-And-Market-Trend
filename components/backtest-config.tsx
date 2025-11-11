"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BacktestConfig } from "@/lib/backtesting"
import { Play } from "lucide-react"

interface BacktestConfigProps {
  config: BacktestConfig
  onConfigChange: (config: BacktestConfig) => void
  onRun: () => void
  loading?: boolean
}

export function BacktestConfigPanel({ config, onConfigChange, onRun, loading }: BacktestConfigProps) {
  const updateConfig = (key: keyof BacktestConfig, value: string | number) => {
    onConfigChange({ ...config, [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backtest Configuration</CardTitle>
        <CardDescription>Set up your trading strategy parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initialCapital">Initial Capital ($)</Label>
            <Input
              id="initialCapital"
              type="number"
              value={config.initialCapital}
              onChange={(e) => updateConfig("initialCapital", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="positionSize">Position Size (%)</Label>
            <Input
              id="positionSize"
              type="number"
              value={config.positionSize}
              onChange={(e) => updateConfig("positionSize", Number(e.target.value))}
              min="1"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopLoss">Stop Loss (%)</Label>
            <Input
              id="stopLoss"
              type="number"
              value={config.stopLoss}
              onChange={(e) => updateConfig("stopLoss", Number(e.target.value))}
              min="0"
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="takeProfit">Take Profit (%)</Label>
            <Input
              id="takeProfit"
              type="number"
              value={config.takeProfit}
              onChange={(e) => updateConfig("takeProfit", Number(e.target.value))}
              min="0"
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradingFees">Trading Fees (%)</Label>
            <Input
              id="tradingFees"
              type="number"
              value={config.tradingFees}
              onChange={(e) => updateConfig("tradingFees", Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select value={config.strategy} onValueChange={(value) => updateConfig("strategy", value)}>
              <SelectTrigger id="strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rsi">RSI Strategy</SelectItem>
                <SelectItem value="macd">MACD Strategy</SelectItem>
                <SelectItem value="ema-crossover">EMA Crossover</SelectItem>
                <SelectItem value="multi-indicator">Multi-Indicator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={onRun} disabled={loading} className="w-full" size="lg">
          <Play className="h-4 w-4 mr-2" />
          {loading ? "Running Backtest..." : "Run Backtest"}
        </Button>
      </CardContent>
    </Card>
  )
}
