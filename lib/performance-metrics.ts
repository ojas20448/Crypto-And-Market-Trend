import type { Prediction, PerformanceMetrics } from "./types"

export function calculatePerformanceMetrics(predictions: Prediction[]): PerformanceMetrics {
  const completedPredictions = predictions.filter((p) => p.actualOutcome)

  if (completedPredictions.length === 0) {
    return {
      accuracy: 0,
      winRate: 0,
      avgReturn: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      confusionMatrix: {
        buy: { buy: 0, hold: 0, sell: 0 },
        hold: { buy: 0, hold: 0, sell: 0 },
        sell: { buy: 0, hold: 0, sell: 0 },
      },
    }
  }

  const correctPredictions = completedPredictions.filter((p) => p.actualOutcome === "correct").length
  const accuracy = correctPredictions / completedPredictions.length

  const profitableTrades = completedPredictions.filter(
    (p) => (p.signal === "buy" && (p.priceChange || 0) > 0) || (p.signal === "sell" && (p.priceChange || 0) < 0),
  ).length
  const winRate = profitableTrades / completedPredictions.length

  const avgReturn = completedPredictions.reduce((sum, p) => sum + (p.priceChange || 0), 0) / completedPredictions.length

  // Build confusion matrix (predicted vs actual)
  const confusionMatrix = {
    buy: { buy: 0, hold: 0, sell: 0 },
    hold: { buy: 0, hold: 0, sell: 0 },
    sell: { buy: 0, hold: 0, sell: 0 },
  }

  completedPredictions.forEach((p) => {
    // For simplicity, we'll determine actual outcome based on price change
    let actualSignal: "buy" | "hold" | "sell"
    if (!p.priceChange) {
      actualSignal = "hold"
    } else if (p.priceChange > 2) {
      actualSignal = "buy"
    } else if (p.priceChange < -2) {
      actualSignal = "sell"
    } else {
      actualSignal = "hold"
    }

    confusionMatrix[p.signal][actualSignal]++
  })

  return {
    accuracy,
    winRate,
    avgReturn,
    totalPredictions: completedPredictions.length,
    correctPredictions,
    confusionMatrix,
  }
}

export function generateMockPerformanceData(): Prediction[] {
  const tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
  const signals: ("buy" | "hold" | "sell")[] = ["buy", "hold", "sell"]
  const predictions: Prediction[] = []

  for (let i = 0; i < 50; i++) {
    const signal = signals[Math.floor(Math.random() * signals.length)]
    const confidence = 0.5 + Math.random() * 0.4

    // Simulate price change based on signal with some noise
    let priceChange: number
    if (signal === "buy") {
      priceChange = (Math.random() - 0.2) * 8 // Biased positive
    } else if (signal === "sell") {
      priceChange = (Math.random() - 0.8) * 8 // Biased negative
    } else {
      priceChange = (Math.random() - 0.5) * 4 // Neutral
    }

    // Determine if prediction was correct
    const actualOutcome: "correct" | "incorrect" =
      (signal === "buy" && priceChange > 0) ||
      (signal === "sell" && priceChange < 0) ||
      (signal === "hold" && Math.abs(priceChange) < 2)
        ? "correct"
        : "incorrect"

    predictions.push({
      id: `pred-${i}`,
      ticker: tickers[Math.floor(Math.random() * tickers.length)],
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      timeframe: "1h",
      signal,
      confidence,
      probabilities: {
        buy: signal === "buy" ? confidence : (1 - confidence) / 2,
        hold: signal === "hold" ? confidence : (1 - confidence) / 2,
        sell: signal === "sell" ? confidence : (1 - confidence) / 2,
      },
      explanation: `Analysis based on technical indicators`,
      actualOutcome,
      priceChange,
    })
  }

  return predictions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function calculateSignalPerformance(predictions: Prediction[]) {
  const bySignal = {
    buy: predictions.filter((p) => p.signal === "buy" && p.actualOutcome),
    hold: predictions.filter((p) => p.signal === "hold" && p.actualOutcome),
    sell: predictions.filter((p) => p.signal === "sell" && p.actualOutcome),
  }

  return {
    buy: {
      total: bySignal.buy.length,
      correct: bySignal.buy.filter((p) => p.actualOutcome === "correct").length,
      avgReturn: bySignal.buy.reduce((sum, p) => sum + (p.priceChange || 0), 0) / bySignal.buy.length || 0,
    },
    hold: {
      total: bySignal.hold.length,
      correct: bySignal.hold.filter((p) => p.actualOutcome === "correct").length,
      avgReturn: bySignal.hold.reduce((sum, p) => sum + (p.priceChange || 0), 0) / bySignal.hold.length || 0,
    },
    sell: {
      total: bySignal.sell.length,
      correct: bySignal.sell.filter((p) => p.actualOutcome === "correct").length,
      avgReturn: bySignal.sell.reduce((sum, p) => sum + (p.priceChange || 0), 0) / bySignal.sell.length || 0,
    },
  }
}

export function calculateConfidencePerformance(predictions: Prediction[]) {
  const ranges = [
    { min: 0.8, max: 1.0, label: "High (80-100%)" },
    { min: 0.6, max: 0.8, label: "Medium (60-80%)" },
    { min: 0, max: 0.6, label: "Low (0-60%)" },
  ]

  return ranges.map((range) => {
    const inRange = predictions.filter((p) => p.confidence >= range.min && p.confidence < range.max && p.actualOutcome)
    const correct = inRange.filter((p) => p.actualOutcome === "correct").length

    return {
      label: range.label,
      total: inRange.length,
      correct,
      accuracy: inRange.length > 0 ? correct / inRange.length : 0,
    }
  })
}
