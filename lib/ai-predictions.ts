import type { ChartDataPoint, Prediction } from "./types"
import { generateSignals } from "./indicators"

export async function generateStockPrediction(
  ticker: string,
  data: ChartDataPoint[],
  timeframe = "1h",
): Promise<Prediction> {
  if (!data || data.length < 50) {
    console.log("[v0] Insufficient data for prediction, need at least 50 points, got:", data?.length || 0)
    return generateFallbackPrediction(ticker, data?.[data.length - 1], timeframe)
  }

  const latest = data[data.length - 1]
  const previous = data.slice(-20) // Last 20 data points for trend analysis

  if (
    !latest ||
    typeof latest.close !== "number" ||
    typeof latest.rsi14 !== "number" ||
    typeof latest.macd !== "number" ||
    typeof latest.macdSignal !== "number"
  ) {
    console.log("[v0] Latest data point missing required fields:", {
      hasLatest: !!latest,
      close: latest?.close,
      rsi14: latest?.rsi14,
      macd: latest?.macd,
      macdSignal: latest?.macdSignal,
    })
    return generateFallbackPrediction(ticker, latest, timeframe)
  }

  if (!previous[0] || typeof previous[0].close !== "number") {
    console.log("[v0] Previous data invalid")
    return generateFallbackPrediction(ticker, latest, timeframe)
  }

  // Calculate price momentum
  const priceChange = ((latest.close - previous[0].close) / previous[0].close) * 100
  const volatility = calculateRecentVolatility(previous)

  // Generate trading signals from indicators
  const signals = generateSignals({
    rsi: latest.rsi14,
    macd: latest.macd,
    macdSignal: latest.macdSignal,
    close: latest.close,
    ema8: latest.ema8,
    ema20: latest.ema20,
    bollingerUpper: latest.bollingerUpper,
    bollingerLower: latest.bollingerLower,
    stochasticK: latest.stochasticK,
    adx: latest.adx,
  })

  return generateRuleBasedPrediction(ticker, latest, signals, timeframe)
}

function calculateRecentVolatility(data: ChartDataPoint[]): number {
  const returns: number[] = []
  for (let i = 1; i < data.length; i++) {
    returns.push(Math.log(data[i].close / data[i - 1].close))
  }

  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length

  return Math.sqrt(variance)
}

function generateRuleBasedPrediction(
  ticker: string,
  latest: ChartDataPoint,
  signals: ReturnType<typeof generateSignals>,
  timeframe: string,
): Prediction {
  // Count signal types
  const buySignals = signals.filter((s) => s.type === "buy")
  const sellSignals = signals.filter((s) => s.type === "sell")

  // Calculate weighted scores
  const buyScore = buySignals.reduce((sum, s) => sum + s.strength, 0)
  const sellScore = sellSignals.reduce((sum, s) => sum + s.strength, 0)
  const totalScore = buyScore + sellScore

  let signal: "buy" | "hold" | "sell"
  let confidence: number
  let explanation: string

  if (totalScore === 0) {
    signal = "hold"
    confidence = 0.5
    explanation = "No strong signals detected. Market conditions are neutral."
  } else if (buyScore > sellScore * 1.5) {
    signal = "buy"
    confidence = Math.min(0.85, buyScore / (totalScore + 1))
    explanation = `Multiple bullish signals detected: ${buySignals.map((s) => s.reason).join(", ")}`
  } else if (sellScore > buyScore * 1.5) {
    signal = "sell"
    confidence = Math.min(0.85, sellScore / (totalScore + 1))
    explanation = `Multiple bearish signals detected: ${sellSignals.map((s) => s.reason).join(", ")}`
  } else {
    signal = "hold"
    confidence = 0.6
    explanation = "Mixed signals detected. Recommend waiting for clearer trend confirmation."
  }

  return {
    id: `${ticker}-${Date.now()}`,
    ticker,
    timestamp: latest.timestamp,
    timeframe,
    signal,
    confidence,
    probabilities: {
      buy: signal === "buy" ? confidence : (1 - confidence) / 2,
      hold: signal === "hold" ? confidence : (1 - confidence) / 2,
      sell: signal === "sell" ? confidence : (1 - confidence) / 2,
    },
    explanation,
  }
}

function generateFallbackPrediction(ticker: string, latest: ChartDataPoint, timeframe: string): Prediction {
  return {
    id: `${ticker}-${Date.now()}`,
    ticker,
    timestamp: latest?.timestamp || new Date().toISOString(),
    timeframe,
    signal: "hold",
    confidence: 0.3,
    probabilities: {
      buy: 0.33,
      hold: 0.34,
      sell: 0.33,
    },
    explanation: "Insufficient technical indicator data available for analysis. Waiting for more data points.",
  }
}

export async function batchGeneratePredictions(
  tickers: string[],
  dataMap: Record<string, ChartDataPoint[]>,
  timeframe = "1h",
): Promise<Prediction[]> {
  const predictions = await Promise.all(
    tickers.map((ticker) => generateStockPrediction(ticker, dataMap[ticker], timeframe)),
  )
  return predictions
}
