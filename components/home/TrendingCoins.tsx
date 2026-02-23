/* eslint-disable react-hooks/error-boundaries */
import { get24hrTicker } from '@/lib/binance.actions';
import Link from 'next/link';
import { cn, formatCurrency, formatPercentage, convertBinanceTicker } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { TrendingCoinsFallback } from './fallback';

const TrendingCoins = async () => {
  try {
    // Get all 24hr tickers from Binance
    const allTickers = await get24hrTicker();

    // Stablecoins to exclude
    const stablecoins = ['USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', 'USDD'];

    // Filter for USDT pairs and convert
    const usdtPairs = allTickers
      .filter(
        (ticker) =>
          ticker.symbol.endsWith('USDT') &&
          parseFloat(ticker.quoteVolume) > 0 &&
          !stablecoins.some((stable) => ticker.symbol.startsWith(stable)),
      )
      .map(convertBinanceTicker)
      .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h) // Sort by volume
      .slice(0, 6); // Top 6 by volume

    if (usdtPairs.length === 0) {
      return <TrendingCoinsFallback />;
    }

    const columns: DataTableColumn<TradingPair>[] = [
      {
        header: 'Name',
        cellClassName: 'name-cell',
        cell: (pair) => {
          return (
            <Link href={`/pairs/${pair.symbol}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">
                {pair.baseAsset.charAt(0)}
              </div>
              <p>{pair.baseAsset}/USDT</p>
            </Link>
          );
        },
      },
      {
        header: '24h Change',
        cellClassName: 'change-cell',
        cell: (pair) => {
          const isTrendingUp = pair.priceChangePercent > 0;

          return (
            <div className={cn('price-change', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
              <p className="flex items-center">
                {formatPercentage(pair.priceChangePercent)}
                {isTrendingUp ? (
                  <TrendingUp width={16} height={16} />
                ) : (
                  <TrendingDown width={16} height={16} />
                )}
              </p>
            </div>
          );
        },
      },
      {
        header: 'Price',
        cellClassName: 'price-cell',
        cell: (pair) => formatCurrency(pair.currentPrice),
      },
    ];

    return (
      <div id="trending-coins">
        <h4>Top Trading Pairs</h4>

        <DataTable
          data={usdtPairs}
          columns={columns}
          rowKey={(pair) => pair.symbol}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching top trading pairs:', error);
    return <TrendingCoinsFallback />;
  }
};

export default TrendingCoins;
