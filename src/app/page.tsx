import { get24hrTicker, getBinanceKlines } from '@/lib/binance.actions';
import { periodToBinanceConfig, convertBinanceTicker } from '@/lib/utils';
import { TradingTerminal } from '@/components/TradingTerminal';

const SYMBOL = 'BTCUSDT';

const Page = async () => {
  const config = periodToBinanceConfig('daily');

  const [ticker, klines, allTickers] = await Promise.all([
    get24hrTicker(SYMBOL),
    getBinanceKlines(SYMBOL, config.interval, config.limit),
    get24hrTicker(),
  ]);

  const stablecoins = ['USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', 'USDD'];
  const allPairs = allTickers
    .filter((t) => {
      const baseAsset = t.symbol.replace('USDT', '');
      return t.symbol.endsWith('USDT') && !stablecoins.includes(baseAsset);
    })
    .map(convertBinanceTicker)
    .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h);

  return (
    <main className="min-h-screen bg-[color:var(--terminal-deep)]">
      <TradingTerminal
        symbol={SYMBOL}
        initialTicker={ticker}
        initialKlines={klines}
        allPairs={allPairs}
      />
    </main>
  );
};

export default Page;
