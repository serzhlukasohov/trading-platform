import { get24hrTicker } from '@/lib/binance.actions';
import DataTable from '@/components/DataTable';
import { cn, formatCurrency, formatPercentage, convertBinanceTicker } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CategoriesFallback } from './fallback';
import Link from 'next/link';

const Categories = async () => {
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
      .slice(0, 15); // Top 15 pairs

    const columns: DataTableColumn<TradingPair>[] = [
      {
        header: 'Pair',
        cellClassName: 'category-cell',
        cell: (pair) => (
          <Link href={`/pairs/${pair.symbol}`} className="hover:text-purple-400">
            {pair.baseAsset}/USDT
          </Link>
        ),
      },
      {
        header: 'Price',
        cellClassName: 'price-cell',
        cell: (pair) => formatCurrency(pair.currentPrice),
      },
      {
        header: '24h Change',
        cellClassName: 'change-header-cell',
        cell: (pair) => {
          const isTrendingUp = pair.priceChangePercent > 0;

          return (
            <div className={cn('change-cell', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
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
        header: '24h High',
        cellClassName: 'market-cap-cell',
        cell: (pair) => formatCurrency(pair.high24h),
      },
      {
        header: '24h Low',
        cellClassName: 'market-cap-cell',
        cell: (pair) => formatCurrency(pair.low24h),
      },
      {
        header: '24h Volume (USDT)',
        cellClassName: 'volume-cell',
        cell: (pair) => formatCurrency(pair.quoteVolume24h, 0),
      },
    ];

    return (
      <div id="categories" className="custom-scrollbar">
        <h4>Top Trading Pairs by Volume</h4>

        <DataTable
          columns={columns}
          data={usdtPairs}
          rowKey={(pair) => pair.symbol}
          tableClassName="mt-3"
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching top pairs:', error);
    return <CategoriesFallback />;
  }
};

export default Categories;
