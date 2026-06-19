"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BacktestResult } from "@/lib/backtesting"
import { TrendingUp, TrendingDown, Target, Award, DollarSign, Activity } from "lucide-react"

interface BacktestResultsProps {
  result: BacktestResult
}

export function BacktestResults({ result }: BacktestResultsProps) {
  const metricCards = [
    {
      title: "Total P&L",
      value: `₹${result.totalPnL.toFixed(2)}`,
      subtitle: `${result.totalPnLPercent > 0 ? "+" : ""}${result.totalPnLPercent.toFixed(2)}%`,
      icon: DollarSign,
      color: result.totalPnL > 0 ? "text-success" : "text-destructive",
    },
    {
      title: "Win Rate",
      value: `${(result.winRate * 100).toFixed(1)}%`,
      subtitle: `${result.winningTrades}W / ${result.losingTrades}L`,
      icon: Target,
      color: "text-chart-1",
    },
    {
      title: "Sharpe Ratio",
      value: result.sharpeRatio.toFixed(2),
      subtitle: "Total risk-adjusted return",
      icon: Activity,
      color: "text-chart-2",
    },
    {
      title: "Sortino Ratio",
      value: result.sortinoRatio.toFixed(2),
      subtitle: "Downside risk-adjusted",
      icon: Activity,
      color: "text-chart-5",
    },
    {
      title: "Max Drawdown",
      value: `${result.maxDrawdown.toFixed(2)}%`,
      subtitle: "Maximum loss from peak",
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      title: "Profit Factor",
      value: result.profitFactor.toFixed(2),
      subtitle: "Gross profit / Gross loss",
      icon: Award,
      color: "text-chart-3",
    },
    {
      title: "Total Trades",
      value: result.totalTrades.toString(),
      subtitle: `Avg Win: ₹${result.avgWin.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Backtest Results</CardTitle>
              <CardDescription>Strategy: {result.config.strategy}</CardDescription>
            </div>
            <Badge variant={result.totalPnL > 0 ? "default" : "destructive"} className="text-base px-3 py-1">
              {result.totalPnL > 0 ? "Profitable" : "Unprofitable"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Initial Capital:</span>
              <span className="font-mono font-semibold">₹{result.config.initialCapital.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Final Capital:</span>
              <span className="font-mono font-semibold">₹{result.finalCapital.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average Win:</span>
              <span className="font-mono font-semibold text-success">₹{result.avgWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average Loss:</span>
              <span className="font-mono font-semibold text-destructive">₹{result.avgLoss.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
