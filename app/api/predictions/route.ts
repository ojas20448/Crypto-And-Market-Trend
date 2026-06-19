import { type NextRequest, NextResponse } from "next/server"
import { generateStockPrediction } from "@/lib/ai-predictions"
import { fetchStockData } from "@/lib/market-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticker, timeframe = "1h" } = body

    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 })
    }

    // Fetch stock data
    const data = await fetchStockData(ticker, timeframe)

    // Generate prediction
    const prediction = await generateStockPrediction(ticker, data, timeframe)

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error("[v0] Prediction API error:", error)
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get("ticker") || "BTC"
    const timeframe = searchParams.get("timeframe") || "1h"

    // Fetch stock data
    const data = await fetchStockData(ticker, timeframe)

    // Generate prediction
    const prediction = await generateStockPrediction(ticker, data, timeframe)

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error("[v0] Prediction API error:", error)
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}
