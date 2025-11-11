import type { ChartDataPoint } from "./types"
import { generateSignals } from "./indicators"

export interface BacktestConfig {
  initialCapital: number
  positionSize: number // Percentage of capital per trade
  stopLoss: number // Percentage
  takeProfit: number // Percentage
  tradingFees: number // Percentage per trade
  strategy: "rsi" | "macd" | "ema-crossover" | "multi-indicator" | "ai-signals"
}

export interface Trade {
  id: string
  entryTime: string
  exitTime?: string
  entryPrice: number
  exitPrice?: number
  type: "long" | "short"
  shares: number
  pnl?: number
  pnlPercent?: number
  status: "open" | "closed"
  reason: string
}

export interface BacktestResult {
  config: BacktestConfig
  trades: Trade[]
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  totalPnLPercent: number
  maxDrawdown: number
  sharpeRatio: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  finalCapital: number
  equityCurve: { time: string; equity: number; drawdown: number }[]
}

export function runBacktest(data: ChartDataPoint[], config: BacktestConfig): BacktestResult {
  const trades: Trade[] = []
  let currentCapital = config.initialCapital
  let currentPosition: Trade | null = null
  let peakCapital = config.initialCapital
  let maxDrawdown = 0

  const equityCurve: { time: string; equity: number; drawdown: number }[] = []

  for (let i = 50; i < data.length; i++) {
    const current = data[i]
    const previous = data[i - 1]

    // Update equity curve
    const currentEquity =
      currentCapital + (currentPosition ? (current.close - currentPosition.entryPrice) * currentPosition.shares : 0)

    if (currentEquity > peakCapital) {
      peakCapital = currentEquity
    }

    const drawdown = ((peakCapital - currentEquity) / peakCapital) * 100
    maxDrawdown = Math.max(maxDrawdown, drawdown)

    equityCurve.push({
      time: current.timestamp,
      equity: currentEquity,
      drawdown,
    })

    // Check exit conditions for open position
    if (currentPosition && currentPosition.status === "open") {
      const priceChange = ((current.close - currentPosition.entryPrice) / currentPosition.entryPrice) * 100

      let shouldExit = false
      let exitReason = ""

      if (currentPosition.type === "long") {
        if (priceChange >= config.takeProfit) {
          shouldExit = true
          exitReason = "Take Profit"
        } else if (priceChange <= -config.stopLoss) {
          shouldExit = true
          exitReason = "Stop Loss"
        }
      } else {
        if (priceChange <= -config.takeProfit) {
          shouldExit = true
          exitReason = "Take Profit"
        } else if (priceChange >= config.stopLoss) {
          shouldExit = true
          exitReason = "Stop Loss"
        }
      }

      // Strategy-specific exit signals
      const signal = evaluateStrategy(config.strategy, current, previous)
      if (signal !== currentPosition.type && signal !== "hold") {
        shouldExit = true
        exitReason = "Strategy Exit Signal"
      }

      if (shouldExit) {
        currentPosition.exitTime = current.timestamp
        currentPosition.exitPrice = current.close
        currentPosition.status = "closed"

        const pnl = (current.close - currentPosition.entryPrice) * currentPosition.shares
        const fees = (currentPosition.entryPrice + current.close) * currentPosition.shares * (config.tradingFees / 100)
        currentPosition.pnl = pnl - fees
        currentPosition.pnlPercent = ((current.close - currentPosition.entryPrice) / currentPosition.entryPrice) * 100
        currentPosition.reason += ` | Exit: ${exitReason}`

        currentCapital += currentPosition.pnl
        currentPosition = null
      }
    }

    // Check entry conditions if no position
    if (!currentPosition) {
      const signal = evaluateStrategy(config.strategy, current, previous)

      if (signal === "long" || signal === "short") {
        const positionValue = currentCapital * (config.positionSize / 100)
        const shares = positionValue / current.close
        const fees = positionValue * (config.tradingFees / 100)

        if (currentCapital >= positionValue + fees) {
          const trade: Trade = {
            id: `trade-${i}`,
            entryTime: current.timestamp,
            entryPrice: current.close,
            type: signal,
            shares,
            status: "open",
            reason: getEntryReason(config.strategy, current),
          }

          trades.push(trade)
          currentPosition = trade
          currentCapital -= fees
        }
      }
    }
  }

  // Close any remaining open position at the last price
  if (currentPosition && currentPosition.status === "open") {
    const lastPrice = data[data.length - 1].close
    currentPosition.exitTime = data[data.length - 1].timestamp
    currentPosition.exitPrice = lastPrice
    currentPosition.status = "closed"

    const pnl = (lastPrice - currentPosition.entryPrice) * currentPosition.shares
    const fees = (currentPosition.entryPrice + lastPrice) * currentPosition.shares * (config.tradingFees / 100)
    currentPosition.pnl = pnl - fees
    currentPosition.pnlPercent = ((lastPrice - currentPosition.entryPrice) / currentPosition.entryPrice) * 100
    currentPosition.reason += " | Exit: End of Backtest"

    currentCapital += currentPosition.pnl
  }

  // Calculate metrics
  const closedTrades = trades.filter((t) => t.status === "closed")
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0)
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) <= 0)

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const totalPnLPercent = ((currentCapital - config.initialCapital) / config.initialCapital) * 100

  const avgWin =
    winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0
  const avgLoss =
    losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) : 0

  const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : 0

  // Calculate Sharpe Ratio (simplified)
  const returns = equityCurve.map((e, i) =>
    i > 0 ? (e.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity : 0,
  )
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0

  return {
    config,
    trades: closedTrades,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: closedTrades.length > 0 ? winningTrades.length / closedTrades.length : 0,
    totalPnL,
    totalPnLPercent,
    maxDrawdown,
    sharpeRatio,
    profitFactor,
    avgWin,
    avgLoss,
    finalCapital: currentCapital,
    equityCurve,
  }
}

function evaluateStrategy(
  strategy: BacktestConfig["strategy"],
  current: ChartDataPoint,
  previous: ChartDataPoint,
): "long" | "short" | "hold" {
  switch (strategy) {
    case "rsi":
      if (current.rsi14 < 30 && previous.rsi14 >= 30) return "long"
      if (current.rsi14 > 70 && previous.rsi14 <= 70) return "short"
      return "hold"

    case "macd":
      if (current.macd > current.macdSignal && previous.macd <= previous.macdSignal) return "long"
      if (current.macd < current.macdSignal && previous.macd >= previous.macdSignal) return "short"
      return "hold"

    case "ema-crossover":
      if (current.ema8 > current.ema20 && previous.ema8 <= previous.ema20) return "long"
      if (current.ema8 < current.ema20 && previous.ema8 >= previous.ema20) return "short"
      return "hold"

    case "multi-indicator":
      const signals = generateSignals({
        rsi: current.rsi14,
        macd: current.macd,
        macdSignal: current.macdSignal,
        close: current.close,
        ema8: current.ema8,
        ema20: current.ema20,
        bollingerUpper: current.bollingerUpper,
        bollingerLower: current.bollingerLower,
        stochasticK: current.stochasticK,
        adx: current.adx,
      })

      const buySignals = signals.filter((s) => s.type === "buy").length
      const sellSignals = signals.filter((s) => s.type === "sell").length

      if (buySignals >= 3) return "long"
      if (sellSignals >= 3) return "short"
      return "hold"

    default:
      return "hold"
  }
}

function getEntryReason(strategy: BacktestConfig["strategy"], current: ChartDataPoint): string {
  switch (strategy) {
    case "rsi":
      return `RSI Strategy: RSI = ${current.rsi14.toFixed(2)}`
    case "macd":
      return `MACD Strategy: MACD = ${current.macd.toFixed(2)}, Signal = ${current.macdSignal.toFixed(2)}`
    case "ema-crossover":
      return `EMA Crossover: EMA8 = ${current.ema8.toFixed(2)}, EMA20 = ${current.ema20.toFixed(2)}`
    case "multi-indicator":
      return `Multi-Indicator: Multiple signals aligned`
    default:
      return "Strategy signal"
  }
}
