# CoinPulse - Binance Trading Terminal

## Project Overview

Professional cryptocurrency trading terminal built with Next.js 16, delivering real-time market data from Binance. Clean, fast platform for tracking 441+ USDT trading pairs.

**Key Features:**

- Real-time WebSocket price updates (sub-100ms latency)
- Professional TradingView candlestick charts
- 441+ USDT trading pairs (stablecoins filtered out)
- No API keys required (free public Binance API)
- 24h market statistics with live updates

## Tech Stack

- **Framework:** Next.js 16.1.0 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui (Radix UI)
- **Charts:** Lightweight Charts (TradingView)
- **Data:** Binance Public API (REST + WebSocket)

## Quick Start

```bash
npm install
npm run dev
```

No configuration needed! Visit `http://localhost:3000`

## Project Structure

```
coinpulse/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx  # Dashboard route
│   │   ├── pairs/              # Trading pairs routes
│   │   │   ├── page.tsx       # All pairs list
│   │   │   └── [symbol]/      # Individual pair (BTCUSDT)
│   │   ├── globals.css
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── dashboard/         # Dashboard components (5 files)
│   │   ├── home/              # Home page components (5 files)
│   │   ├── ui/                # shadcn/ui components (7 files)
│   │   └── *.tsx              # 15 root-level components
│   ├── hooks/
│   │   └── useBinanceWebSocket.ts  # WebSocket connection
│   ├── lib/
│   │   ├── binance.actions.ts      # Binance API
│   │   ├── mockData.ts
│   │   └── utils.ts                # Utilities
│   ├── scripts/
│   │   └── test-binance.ts         # API tests
│   ├── types/
│   │   └── index.d.ts              # TypeScript types
│   └── constants.ts
├── next.config.ts
├── tsconfig.json
├── components.json
└── package.json
```

## Environment Variables

```env
# No API keys required! Public endpoints only
BINANCE_API_BASE_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_BINANCE_WS_URL=wss://stream.binance.com:9443/stream
```

## Available Routes

- `/` - Home with top pairs and Bitcoin chart
- `/pairs` - All USDT pairs list (441+ pairs)
- `/pairs/BTCUSDT` - Bitcoin live chart
- `/pairs/ETHUSDT` - Ethereum live chart
- `/pairs/[SYMBOL]` - Any trading pair

## API Integration

### Server-Side (Binance REST API)

```typescript
import { get24hrTicker, getBinanceKlines } from '@/lib/binance.actions';

// Get 24hr ticker for symbol
const ticker = await get24hrTicker('BTCUSDT');

// Get all tickers
const allTickers = await get24hrTicker();

// Get candlestick data
const klines = await getBinanceKlines('BTCUSDT', '1h', 100);
```

### Client-Side (WebSocket)

```typescript
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';

const { ticker, isConnected } = useBinanceWebSocket({
  symbol: 'BTCUSDT',
  streams: ['ticker'],
  enabled: true,
});
```

### Data Conversion

```typescript
import { convertBinanceTicker, periodToBinanceConfig } from '@/lib/utils';

// Convert Binance ticker to TradingPair
const tradingPair = convertBinanceTicker(binanceTicker);

// Get interval config for period
const config = periodToBinanceConfig('daily');
// Returns: { interval: '15m', limit: 96 }
```

## Type Definitions

**Core Types:**

- `OHLCData` - [timestamp, open, high, low, close]
- `Period` - 'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'yearly' | 'max'
- `BinanceInterval` - '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

**Binance Types:**

- `Binance24hrTicker` - 24-hour price statistics
- `BinanceSymbol` - Trading symbol information
- `TradingPair` - UI display data

All types in `src/types/index.d.ts`

## Development Guidelines

### Code Style

- TypeScript strict mode
- Prettier: 2 spaces, single quotes, semicolons
- ESLint with Next.js config

### Component Patterns

- Server components by default (no 'use client')
- Client components for WebSocket, charts, interactive UI
- Suspense boundaries for async components

### Performance

- Smart revalidation: 10s (tickers), 30s (klines), 5min (exchange info)
- WebSocket for real-time updates with auto-reconnection
- Single WebSocket connection per page
- Stablecoins filtered out (USDC, BUSD, TUSD, etc.)

## Common Tasks

### Add New Trading Pair Feature

1. Update types in `src/types/index.d.ts`
2. Add API function in `src/lib/binance.actions.ts`
3. Create/update component
4. Test with `npx tsx src/scripts/test-binance.ts`

### Modify Chart Config

Edit `src/constants.ts`:

```typescript
export const BINANCE_INTERVAL_CONFIG: Record<Period, {...}> = {
  daily: { interval: '15m', limit: 96 },
  // Add or modify periods
};
```

### Filter Trading Pairs

Edit stablecoins list in `src/app/pairs/page.tsx`:

```typescript
const stablecoins = ['USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', 'USDD'];
```

## Testing

```bash
# Test Binance API integration
npx tsx src/scripts/test-binance.ts

# Expected output:
# ✅ Found 441 USDT trading pairs
# ✅ BTC Price: $67,476.71
# ✅ All tests passed!
```

## Troubleshooting

### WebSocket Issues

See `WEBSOCKET_FIXES.md` for detailed solutions.

**Common fixes:**

- Refresh page if connection drops
- Check console for `[Binance WS]` logs
- Verify `NEXT_PUBLIC_BINANCE_WS_URL` in `.env`

### Build Errors

```bash
# Clean build
rm -rf .next
npm run build
```

### Hydration Errors

- Check `formatCurrency()` and `formatNumber()` use `Intl.NumberFormat('en-US')`
- Avoid `toLocaleString()` in client components

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

## API Details

### Binance REST API

| Endpoint        | Purpose             | Cache |
| --------------- | ------------------- | ----- |
| `/exchangeInfo` | All trading symbols | 5min  |
| `/ticker/24hr`  | 24h statistics      | 10s   |
| `/klines`       | Candlestick data    | 30s   |

### Binance WebSocket

| Stream            | Purpose    | Frequency |
| ----------------- | ---------- | --------- |
| `<symbol>@ticker` | 24h ticker | 1s        |

### Rate Limits

- 6000 requests/minute
- No authentication required

## Resources

- **Binance API Docs:** https://binance-docs.github.io/apidocs/spot/en/
- **Next.js Docs:** https://nextjs.org/docs
- **TradingView Charts:** https://www.tradingview.com/lightweight-charts/

## License

Educational project - see LICENSE file
