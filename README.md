# CoinPulse - Binance Trading Terminal

<div align="center">
  <br />
  <img src="public/logo.svg" alt="CoinPulse Logo" width="200"/>
  <br />
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.js-black?style=for-the-badge&logo=Next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/-Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/-Binance-F3BA2F?style=for-the-badge&logo=binance&logoColor=black" />
  </div>

  <h3 align="center">Professional Cryptocurrency Trading Terminal</h3>

  <div align="center">
    Real-time market data powered by Binance
  </div>
</div>

## 🚀 Features

- **Real-time Trading Data** - 441+ USDT trading pairs from Binance
- **Live WebSocket Streams** - Sub-100ms latency for price updates
- **Professional Charts** - TradingView candlestick charts with 8 timeframes
- **No API Keys Required** - Free public access to all market data
- **24h Market Statistics** - Price changes, volume, high/low tracking
- **Live Chart Updates** - 8 different intervals from 1m to 1D
- **Search & Filter** - Find trading pairs quickly
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Charts:** [Lightweight Charts](https://www.tradingview.com/lightweight-charts/) (TradingView)
- **Data Source:** [Binance Public API](https://binance-docs.github.io/apidocs/spot/en/)
- **WebSocket:** Binance Streams (no auth required)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

```bash

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### No Configuration Needed!

CoinPulse uses Binance's **free public API** - no API keys or registration required. Just install and run!

## 📁 Project Structure

```
coinpulse/
├── app/                        # Next.js App Router
│   ├── pairs/                 # Trading pairs routes
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── home/                  # Home page components
│   ├── ui/                    # UI components (shadcn)
│   ├── BinanceCandlestickChart.tsx
│   ├── BinanceLiveDataWrapper.tsx
│   └── PairHeader.tsx
├── hooks/                      # Custom React hooks
│   └── useBinanceWebSocket.ts
├── lib/                        # Utilities
│   ├── binance.actions.ts     # Binance API integration
│   └── utils.ts               # Helper functions
└── type.d.ts                  # TypeScript definitions
```

## 🎯 Available Routes

- **`/`** - Home page with top trading pairs and Bitcoin chart
- **`/pairs`** - All USDT trading pairs list
- **`/pairs/BTCUSDT`** - Bitcoin live chart
- **`/pairs/ETHUSDT`** - Ethereum live chart
- **`/pairs/[SYMBOL]`** - Any trading pair

## 🧪 Testing

Test the Binance API integration:

```bash
npx tsx scripts/test-binance.ts
```

Expected output:

```
✅ Found 441 USDT trading pairs
✅ BTC Price: $67,476.71
✅ All tests passed!
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📊 API Details

### Binance REST API

| Endpoint        | Purpose                  | Cache Duration |
| --------------- | ------------------------ | -------------- |
| `/exchangeInfo` | Get all trading symbols  | 5 minutes      |
| `/ticker/24hr`  | Get 24h price statistics | 10 seconds     |
| `/klines`       | Get candlestick data     | 30 seconds     |

### Binance WebSocket

| Stream                      | Purpose                  | Update Frequency |
| --------------------------- | ------------------------ | ---------------- |
| `<symbol>@ticker`           | 24h ticker updates       | 1 second         |
| `<symbol>@kline_<interval>` | Live candlestick updates | 1-2 seconds      |

### Rate Limits

- **REQUEST_WEIGHT**: 6000 per minute
- **RAW_REQUESTS**: 61000 per 5 minutes
- No authentication required for market data

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete project documentation
- **[BINANCE_INTEGRATION.md](BINANCE_INTEGRATION.md)** - Binance integration guide
- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - Migration notes

## 🌟 Why Binance?

- ✅ **Free** - No API keys or subscription required
- ✅ **Fast** - Direct exchange data, sub-100ms latency
- ✅ **Reliable** - 99.9% uptime, global CDN
- ✅ **Complete** - 441 USDT pairs with full market data
- ✅ **Real-time** - WebSocket streams for live updates
- ✅ **No Limits** - 6000 requests/minute on public endpoints

## 🔮 Roadmap

### Phase 2: Enhanced UI

- [ ] Order book visualization
- [ ] Recent trades stream
- [ ] Depth charts
- [ ] Multi-pair watchlists

### Phase 3: Trading Features

- [ ] User accounts
- [ ] API key management
- [ ] Place/cancel orders
- [ ] Portfolio tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is for educational purposes.

## 🙏 Acknowledgments

- [Binance](https://www.binance.com/) - For providing free public API access
- [TradingView](https://www.tradingview.com/) - For Lightweight Charts library
- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
