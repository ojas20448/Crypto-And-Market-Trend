# Stock Trend Predictor

An advanced stock market analysis and prediction tool with real-time charting, technical indicators, and rule-based predictions for cryptocurrencies and Indian stocks.

## Features

- **Real-time Data**: Live cryptocurrency prices from CoinGecko (free, no API key required)
- **Technical Indicators**: RSI, MACD, EMA, Bollinger Bands, Stochastic, ADX, ATR, OBV, VWAP
- **Interactive Charts**: Candlestick charts, volume analysis, trend indicators
- **Rule-Based Predictions**: Trading signals with confidence scores based on multiple indicators
- **Performance Tracking**: Monitor prediction accuracy and win rates
- **Backtesting**: Test trading strategies on historical data
- **Currency**: All prices displayed in Indian Rupees (₹)

## Supported Markets

### Cryptocurrencies
- Bitcoin (BTC)
- Ethereum (ETH)
- Binance Coin (BNB)

### Indian Stocks
- Reliance Industries
- Tata Consultancy Services (TCS)
- HDFC Bank
- Infosys
- ICICI Bank

## Getting Started

The app works immediately without any configuration. **No API keys required!**

### Data Sources

- **Cryptocurrencies**: Real-time data from CoinGecko API (free tier, rate-limited)
- **Indian Stocks**: Realistic mock data with proper market patterns

When rate limits are hit, the app automatically falls back to realistic mock data.

## Technical Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React, Tailwind CSS, shadcn/ui
- **Charts**: Recharts, Canvas API
- **Indicators**: Custom technical analysis algorithms
- **Predictions**: Rule-based trading signals from multiple indicators

## Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## Features in Detail

### Technical Indicators
- **Trend Indicators**: EMA (8, 20, 50), VWAP
- **Momentum Indicators**: RSI, Stochastic, MACD
- **Volatility Indicators**: Bollinger Bands, ATR
- **Volume Indicators**: OBV, Volume
- **Trend Strength**: ADX

### Trading Signals
Automatically generated from multiple indicators:
- BUY signals when multiple bullish indicators align
- SELL signals when multiple bearish indicators align
- HOLD signals for neutral or mixed market conditions

### Performance Analytics
- Prediction accuracy tracking
- Confusion matrix analysis
- Signal-by-signal performance
- Confidence calibration charts

### Backtesting
- Configurable trading strategies
- Stop-loss and take-profit settings
- Performance metrics (Sharpe ratio, max drawdown, profit factor)
- Detailed trade logs

## License

MIT
