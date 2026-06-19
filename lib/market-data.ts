import type { StockData, ChartDataPoint } from "./types"
import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochastic,
  calculateATR,
  calculateOBV,
  calculateVWAP,
  calculateADX,
  calculateSuperTrend,
  calculateZScore,
  calculateMFI,
} from "./indicators"

export async function fetchStockData(ticker: string, interval = "15m"): Promise<ChartDataPoint[]> {
  try {
    console.log("[v0] Fetching stock data for:", ticker, "timeframe:", interval)

    const response = await fetch(`/api/stock/intraday/${ticker}?timeframe=${interval}`)

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] API error:", error)
      throw new Error(error.error || "Failed to fetch stock data")
    }

    const { data: stockData } = await response.json()
    console.log("[v0] Received", stockData.length, "data points")

    // Calculate indicators
    return calculateIndicators(stockData)
  } catch (error) {
    console.error("[v0] Error fetching stock data:", error)
    // Fallback to mock data if API fails
    console.log("[v0] Falling back to mock data")
    const stockData = generateMockStockData(30)
    return calculateIndicators(stockData)
  }
}

export async function fetchStockQuote(ticker: string) {
  try {
    const response = await fetch(`/api/stock/quote/${ticker}`)

    if (!response.ok) {
      throw new Error("Failed to fetch quote")
    }

    const { quote } = await response.json()
    return quote
  } catch (error) {
    console.error("[v0] Error fetching quote:", error)
    return null
  }
}

// Generate realistic mock stock data for demo/fallback purposes
export function generateMockStockData(days = 30): StockData[] {
  const data: StockData[] = []
  let basePrice = 150 + Math.random() * 50
  const now = new Date()

  for (let i = days * 96; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000)

    const volatility = 0.02
    const trend = Math.sin(i / 100) * 0.001
    const change = (Math.random() - 0.5) * volatility + trend
    basePrice = basePrice * (1 + change)

    const open = basePrice
    const high = basePrice * (1 + Math.random() * 0.01)
    const low = basePrice * (1 - Math.random() * 0.01)
    const close = low + Math.random() * (high - low)
    const volume = Math.floor(1000000 + Math.random() * 2000000)

    data.push({
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close,
      volume,
    })

    basePrice = close
  }

  return data
}

export function calculateIndicators(stockData: StockData[]): ChartDataPoint[] {
  const validData = stockData.filter((d) => {
    const isValid =
      d.close != null &&
      d.open != null &&
      d.high != null &&
      d.low != null &&
      d.volume != null &&
      !isNaN(d.close) &&
      !isNaN(d.open) &&
      !isNaN(d.high) &&
      !isNaN(d.low) &&
      !isNaN(d.volume)
    if (!isValid) {
      console.warn("[v0] Filtering out invalid data point:", d)
    }
    return isValid
  })

  if (validData.length === 0) {
    console.error("[v0] No valid data points found, generating mock data")
    return calculateIndicators(generateMockStockData(30))
  }

  if (validData.length < stockData.length) {
    console.warn("[v0] Filtered out", stockData.length - validData.length, "invalid data points")
  }

  const closePrices = validData.map((d) => d.close)
  const highPrices = validData.map((d) => d.high)
  const lowPrices = validData.map((d) => d.low)
  const volumes = validData.map((d) => d.volume)

  const ema8 = calculateEMA(closePrices, 8)
  const ema20 = calculateEMA(closePrices, 20)
  const ema50 = calculateEMA(closePrices, 50)
  const rsi14 = calculateRSI(closePrices, 14)
  const { macd, signal, histogram } = calculateMACD(closePrices)
  const { upper: bbUpper, middle: bbMiddle, lower: bbLower } = calculateBollingerBands(closePrices)
  const { k: stochK, d: stochD } = calculateStochastic(highPrices, lowPrices, closePrices)
  const atr = calculateATR(highPrices, lowPrices, closePrices)
  const obv = calculateOBV(closePrices, volumes)
  const vwap = calculateVWAP(highPrices, lowPrices, closePrices, volumes)
  const { adx, plusDI, minusDI } = calculateADX(highPrices, lowPrices, closePrices)
  const { upper: stUpper, lower: stLower, direction: stDir } = calculateSuperTrend(highPrices, lowPrices, closePrices)
  const zScore = calculateZScore(closePrices)
  const mfi = calculateMFI(highPrices, lowPrices, closePrices, volumes)

  return validData.map((data, i) => {
    return {
      timestamp: data.timestamp,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume,
      ema8: ema8[i] ?? data.close,
      ema20: ema20[i] ?? data.close,
      ema50: ema50[i] ?? data.close,
      rsi14: rsi14[i] ?? 50,
      macd: macd[i] ?? 0,
      macdSignal: signal[i] ?? 0,
      macdHistogram: histogram[i] ?? 0,
      bollingerUpper: bbUpper[i] ?? data.close * 1.02,
      bollingerMiddle: bbMiddle[i] ?? data.close,
      bollingerLower: bbLower[i] ?? data.close * 0.98,
      stochasticK: stochK[i] ?? 50,
      stochasticD: stochD[i] ?? 50,
      atr: atr[i] ?? 0,
      obv: obv[i] ?? volumes[i],
      vwap: vwap[i] ?? data.close,
      adx: adx[i] ?? 0,
      plusDI: plusDI[i] ?? 0,
      minusDI: minusDI[i] ?? 0,
      superTrendUpper: stUpper[i] ?? data.close,
      superTrendLower: stLower[i] ?? data.close,
      superTrendDirection: stDir[i] ?? 1,
      zScore: zScore[i] ?? 0,
      mfi: mfi[i] ?? 50,
    }
  })
}

export const AVAILABLE_TICKERS = [
  // Top 3 Cryptocurrencies
  { symbol: "BTC", name: "Bitcoin", type: "crypto", market: "Cryptocurrency" },
  { symbol: "ETH", name: "Ethereum", type: "crypto", market: "Cryptocurrency" },
  { symbol: "BNB", name: "Binance Coin", type: "crypto", market: "Cryptocurrency" },

  // Top 5 Indian Stocks (NSE)
  { symbol: "RELIANCE.BSE", name: "Reliance Industries", type: "stock", market: "India NSE/BSE" },
  { symbol: "TCS.BSE", name: "Tata Consultancy Services", type: "stock", market: "India NSE/BSE" },
  { symbol: "HDFCBANK.BSE", name: "HDFC Bank", type: "stock", market: "India NSE/BSE" },
  { symbol: "INFY.BSE", name: "Infosys", type: "stock", market: "India NSE/BSE" },
  { symbol: "ICICIBANK.BSE", name: "ICICI Bank", type: "stock", market: "India NSE/BSE" },
]
