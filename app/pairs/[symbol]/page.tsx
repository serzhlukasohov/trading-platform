import { get24hrTicker, getBinanceKlines } from '@/lib/binance.actions';
import { periodToBinanceConfig, convertBinanceTicker } from '@/lib/utils';
import { TradingTerminal } from '@/components/TradingTerminal';
import { Metadata } from 'next';

interface PairPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: PairPageProps): Promise<Metadata> {
  const { symbol } = await params;

  return {
    title: `${symbol} - Live Trading | CoinPulse`,
    description: `Live ${symbol} trading chart with real-time price updates and market data.`,
  };
}

const PairPage = async ({ params }: PairPageProps) => {
  const { symbol } = await params;

  try {
    // Fetch initial data for the trading pair
    const config = periodToBinanceConfig('daily');

    const [ticker, klines, allTickers] = await Promise.all([
      get24hrTicker(symbol),
      getBinanceKlines(symbol, config.interval, config.limit),
      get24hrTicker(), // Fetch all pairs for sidebar
    ]);

    // Filter for USDT pairs and exclude stablecoins
    const stablecoins = ['USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', 'USDD'];
    const allPairs = allTickers
      .filter((t) => {
        const baseAsset = t.symbol.replace('USDT', '');
        return t.symbol.endsWith('USDT') && !stablecoins.includes(baseAsset);
      })
      .map(convertBinanceTicker)
      .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h); // Sort by volume

    return (
      <main className="min-h-screen bg-[color:var(--terminal-deep)]">
        <TradingTerminal
          symbol={symbol}
          initialTicker={ticker}
          initialKlines={klines}
          allPairs={allPairs}
        />
      </main>
    );
  } catch (error) {
    console.error(`Error loading pair ${symbol}:`, error);

    return (
      <main className="container mx-auto px-4 py-16">
        <div className="rounded-lg bg-red-500/10 p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-400">Trading Pair Not Found</h1>
          <p className="text-gray-400">
            The trading pair <span className="font-mono text-white">{symbol}</span> could not be
            loaded.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Make sure the symbol is valid (e.g., BTCUSDT, ETHUSDT)
          </p>
        </div>
      </main>
    );
  }
};

export default PairPage;
