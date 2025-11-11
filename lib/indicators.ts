export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // Start with SMA
  let sum = 0
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i]
  }
  ema[period - 1] = sum / period

  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1]
  }

  return ema
}

export function calculateRSI(data: number[], period = 14): number[] {
  const rsi: number[] = []
  const changes: number[] = []

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }

  for (let i = period; i < changes.length; i++) {
    let gains = 0
    let losses = 0

    for (let j = i - period; j < i; j++) {
      if (changes[j] > 0) gains += changes[j]
      else losses += Math.abs(changes[j])
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) {
      rsi[i] = 100
    } else {
      const rs = avgGain / avgLoss
      rsi[i] = 100 - 100 / (1 + rs)
    }
  }

  return rsi
}

export function calculateMACD(
  data: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)

  const macdLine: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] !== undefined && slowEMA[i] !== undefined) {
      macdLine[i] = fastEMA[i] - slowEMA[i]
    }
  }

  const signalLine = calculateEMA(
    macdLine.filter((v) => v !== undefined),
    signalPeriod,
  )
  const histogram: number[] = []

  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== undefined && signalLine[i] !== undefined) {
      histogram[i] = macdLine[i] - signalLine[i]
    }
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  }
}

export function normalizeData(data: number[]): number[] {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  if (range === 0) return data.map(() => 0)

  return data.map((value) => (value - min) / range)
}

export function calculateVolatility(data: number[], period = 20): number {
  if (data.length < period) return 0

  const returns: number[] = []
  for (let i = 1; i < Math.min(period, data.length); i++) {
    returns.push(Math.log(data[i] / data[i - 1]))
  }

  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length

  return Math.sqrt(variance)
}

export function calculateBollingerBands(
  data: number[],
  period = 20,
  stdDev = 2,
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle: number[] = []
  const upper: number[] = []
  const lower: number[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sma = slice.reduce((sum, val) => sum + val, 0) / period
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period
    const std = Math.sqrt(variance)

    middle[i] = sma
    upper[i] = sma + stdDev * std
    lower[i] = sma - stdDev * std
  }

  return { upper, middle, lower }
}

export function calculateStochastic(
  high: number[],
  low: number[],
  close: number[],
  kPeriod = 14,
  dPeriod = 3,
): { k: number[]; d: number[] } {
  const k: number[] = []

  for (let i = kPeriod - 1; i < close.length; i++) {
    const highestHigh = Math.max(...high.slice(i - kPeriod + 1, i + 1))
    const lowestLow = Math.min(...low.slice(i - kPeriod + 1, i + 1))

    if (highestHigh === lowestLow) {
      k[i] = 50
    } else {
      k[i] = ((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100
    }
  }

  // Calculate %D (SMA of %K)
  const d: number[] = []
  for (let i = dPeriod - 1; i < k.length; i++) {
    const slice = k.slice(i - dPeriod + 1, i + 1).filter((v) => v !== undefined)
    d[i] = slice.reduce((sum, val) => sum + val, 0) / slice.length
  }

  return { k, d }
}

export function calculateATR(high: number[], low: number[], close: number[], period = 14): number[] {
  const tr: number[] = []

  for (let i = 1; i < close.length; i++) {
    const highLow = high[i] - low[i]
    const highClose = Math.abs(high[i] - close[i - 1])
    const lowClose = Math.abs(low[i] - close[i - 1])
    tr[i] = Math.max(highLow, highClose, lowClose)
  }

  const atr: number[] = []
  let sum = 0

  for (let i = 1; i <= period && i < tr.length; i++) {
    sum += tr[i]
  }
  atr[period] = sum / period

  for (let i = period + 1; i < tr.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period
  }

  return atr
}

export function calculateOBV(close: number[], volume: number[]): number[] {
  const obv: number[] = [volume[0]]

  for (let i = 1; i < close.length; i++) {
    if (close[i] > close[i - 1]) {
      obv[i] = obv[i - 1] + volume[i]
    } else if (close[i] < close[i - 1]) {
      obv[i] = obv[i - 1] - volume[i]
    } else {
      obv[i] = obv[i - 1]
    }
  }

  return obv
}

export function calculateVWAP(high: number[], low: number[], close: number[], volume: number[]): number[] {
  const vwap: number[] = []
  let cumulativeTPV = 0
  let cumulativeVolume = 0

  for (let i = 0; i < close.length; i++) {
    const typicalPrice = (high[i] + low[i] + close[i]) / 3
    cumulativeTPV += typicalPrice * volume[i]
    cumulativeVolume += volume[i]

    vwap[i] = cumulativeTPV / cumulativeVolume
  }

  return vwap
}

export function calculateADX(
  high: number[],
  low: number[],
  close: number[],
  period = 14,
): { adx: number[]; plusDI: number[]; minusDI: number[] } {
  const tr: number[] = []
  const plusDM: number[] = [0]
  const minusDM: number[] = [0]

  for (let i = 1; i < close.length; i++) {
    const highLow = high[i] - low[i]
    const highClose = Math.abs(high[i] - close[i - 1])
    const lowClose = Math.abs(low[i] - close[i - 1])
    tr[i] = Math.max(highLow, highClose, lowClose)

    const upMove = high[i] - high[i - 1]
    const downMove = low[i - 1] - low[i]

    plusDM[i] = upMove > downMove && upMove > 0 ? upMove : 0
    minusDM[i] = downMove > upMove && downMove > 0 ? downMove : 0
  }

  const smoothedTR: number[] = []
  const smoothedPlusDM: number[] = []
  const smoothedMinusDM: number[] = []

  smoothedTR[period] = tr.slice(1, period + 1).reduce((sum, val) => sum + val, 0)
  smoothedPlusDM[period] = plusDM.slice(1, period + 1).reduce((sum, val) => sum + val, 0)
  smoothedMinusDM[period] = minusDM.slice(1, period + 1).reduce((sum, val) => sum + val, 0)

  for (let i = period + 1; i < close.length; i++) {
    smoothedTR[i] = smoothedTR[i - 1] - smoothedTR[i - 1] / period + tr[i]
    smoothedPlusDM[i] = smoothedPlusDM[i - 1] - smoothedPlusDM[i - 1] / period + plusDM[i]
    smoothedMinusDM[i] = smoothedMinusDM[i - 1] - smoothedMinusDM[i - 1] / period + minusDM[i]
  }

  const plusDI: number[] = []
  const minusDI: number[] = []
  const dx: number[] = []

  for (let i = period; i < close.length; i++) {
    plusDI[i] = (smoothedPlusDM[i] / smoothedTR[i]) * 100
    minusDI[i] = (smoothedMinusDM[i] / smoothedTR[i]) * 100

    const diDiff = Math.abs(plusDI[i] - minusDI[i])
    const diSum = plusDI[i] + minusDI[i]
    dx[i] = diSum === 0 ? 0 : (diDiff / diSum) * 100
  }

  const adx: number[] = []
  const dxValues = dx.filter((v) => v !== undefined)

  if (dxValues.length >= period) {
    adx[period * 2 - 1] = dxValues.slice(0, period).reduce((sum, val) => sum + val, 0) / period

    for (let i = period * 2; i < close.length; i++) {
      if (dx[i] !== undefined && adx[i - 1] !== undefined) {
        adx[i] = (adx[i - 1] * (period - 1) + dx[i]) / period
      }
    }
  }

  return { adx, plusDI, minusDI }
}

export interface TradingSignal {
  type: "buy" | "sell" | "hold"
  strength: number
  reason: string
}

export function generateSignals(data: {
  rsi: number
  macd: number
  macdSignal: number
  close: number
  ema8?: number
  ema20?: number
  bollingerUpper?: number
  bollingerLower?: number
  stochasticK?: number
  adx?: number
}): TradingSignal[] {
  const signals: TradingSignal[] = []

  // RSI signals
  if (data.rsi < 30) {
    signals.push({ type: "buy", strength: 0.7, reason: "RSI oversold (<30)" })
  } else if (data.rsi > 70) {
    signals.push({ type: "sell", strength: 0.7, reason: "RSI overbought (>70)" })
  }

  // MACD signals
  if (data.macd > data.macdSignal) {
    signals.push({ type: "buy", strength: 0.6, reason: "MACD bullish crossover" })
  } else if (data.macd < data.macdSignal) {
    signals.push({ type: "sell", strength: 0.6, reason: "MACD bearish crossover" })
  }

  // EMA crossover signals
  if (data.ema8 && data.ema20) {
    if (data.ema8 > data.ema20) {
      signals.push({ type: "buy", strength: 0.5, reason: "EMA8 above EMA20" })
    } else {
      signals.push({ type: "sell", strength: 0.5, reason: "EMA8 below EMA20" })
    }
  }

  // Bollinger Bands signals
  if (data.bollingerLower && data.close < data.bollingerLower) {
    signals.push({ type: "buy", strength: 0.6, reason: "Price below lower Bollinger Band" })
  }
  if (data.bollingerUpper && data.close > data.bollingerUpper) {
    signals.push({ type: "sell", strength: 0.6, reason: "Price above upper Bollinger Band" })
  }

  // Stochastic signals
  if (data.stochasticK && data.stochasticK < 20) {
    signals.push({ type: "buy", strength: 0.5, reason: "Stochastic oversold" })
  } else if (data.stochasticK && data.stochasticK > 80) {
    signals.push({ type: "sell", strength: 0.5, reason: "Stochastic overbought" })
  }

  // Trend strength (ADX)
  if (data.adx && data.adx > 25) {
    const lastSignal = signals[signals.length - 1]
    if (lastSignal) {
      lastSignal.strength += 0.2
      lastSignal.reason += " (strong trend)"
    }
  }

  if (signals.length === 0) {
    return [{ type: "hold", strength: 0.5, reason: "No clear signal" }]
  }

  return signals
}
