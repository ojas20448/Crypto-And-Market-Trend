export interface StockData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  ema8: number
  ema20: number
  ema50: number
  rsi14: number
  macd: number
  macdSignal: number
  macdHistogram: number
  bollingerUpper?: number
  bollingerMiddle?: number
  bollingerLower?: number
  stochasticK?: number
  stochasticD?: number
  atr?: number
  obv?: number
  vwap?: number
  adx?: number
  plusDI?: number
  minusDI?: number
  superTrendUpper?: number
  superTrendLower?: number
  superTrendDirection?: number
  zScore?: number
  mfi?: number
}

export interface Prediction {
  id: string
  ticker: string
  timestamp: string
  timeframe: string
  signal: "buy" | "hold" | "sell"
  confidence: number
  probabilities: {
    buy: number
    hold: number
    sell: number
  }
  explanation: string
  actualOutcome?: "correct" | "incorrect"
  priceChange?: number
}

export interface PerformanceMetrics {
  accuracy: number
  winRate: number
  avgReturn: number
  totalPredictions: number
  correctPredictions: number
  confusionMatrix: {
    buy: { buy: number; hold: number; sell: number }
    hold: { buy: number; hold: number; sell: number }
    sell: { buy: number; hold: number; sell: number }
  }
}

export interface ChartDataPoint extends StockData, TechnicalIndicators {
  prediction?: Prediction
}
