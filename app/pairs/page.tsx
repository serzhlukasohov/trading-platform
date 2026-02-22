import { get24hrTicker } from '@/lib/binance.actions';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatPercentage, formatCurrency, convertBinanceTicker } from '@/lib/utils';
import DataTable from '@/components/DataTable';
import CoinsPagination from '@/components/CoinsPagination';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'USDT Trading Pairs - Live Binance Market Data | CoinPulse',
  description:
    'Real-time USDT trading pairs from Binance. Track live prices, 24h volume, and market statistics.',
};

const PairsListPage = async ({ searchParams }: NextPageProps) => {
  const { page, search } = await searchParams;

  const currentPage = Number(page) || 1;
  const perPage = 20;

  // Get all 24hr tickers from Binance
  const allTickers = await get24hrTicker();

  // Stablecoins to exclude (they don't have interesting price movements)
  const stablecoins = ['USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', 'USDD'];

  // Filter for USDT pairs only and convert to TradingPair format
  const usdtPairs = allTickers
    .filter(
      (ticker) =>
        ticker.symbol.endsWith('USDT') &&
        parseFloat(ticker.quoteVolume) > 0 &&
        !stablecoins.some((stable) => ticker.symbol.startsWith(stable)),
    )
    .map(convertBinanceTicker)
    .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h); // Sort by volume descending

  // Apply search filter if provided
  const searchTerm = typeof search === 'string' ? search.toLowerCase() : '';
  const filteredPairs = searchTerm
    ? usdtPairs.filter(
        (pair) =>
          pair.symbol.toLowerCase().includes(searchTerm) ||
          pair.baseAsset.toLowerCase().includes(searchTerm),
      )
    : usdtPairs;

  // Pagination
  const startIndex = (currentPage - 1) * perPage;
  const paginatedPairs = filteredPairs.slice(startIndex, startIndex + perPage);
  const totalPages = Math.ceil(filteredPairs.length / perPage);
  const hasMorePages = currentPage < totalPages;

  const columns: DataTableColumn<TradingPair>[] = [
    {
      header: 'Rank',
      cellClassName: 'rank-cell',
      cell: (_pair, index) => (
        <>
          #{startIndex + index + 1}
          <Link href={`/pairs/${_pair.symbol}`} aria-label="View pair" />
        </>
      ),
    },
    {
      header: 'Pair',
      cellClassName: 'token-cell',
      cell: (pair) => (
        <div className="token-info">
          {/* Placeholder icon - you could integrate CoinGecko for logos later */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">
            {pair.baseAsset.charAt(0)}
          </div>
          <p>
            {pair.baseAsset} <span className="text-gray-500">/USDT</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (pair) => formatCurrency(pair.currentPrice),
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: (pair) => {
        const isTrendingUp = pair.priceChangePercent > 0;

        return (
          <span
            className={cn('change-value', {
              'text-green-600': isTrendingUp,
              'text-red-500': !isTrendingUp,
            })}
          >
            {isTrendingUp && '+'}
            {formatPercentage(pair.priceChangePercent)}
          </span>
        );
      },
    },
    {
      header: '24h Volume (USDT)',
      cellClassName: 'market-cap-cell',
      cell: (pair) => formatCurrency(pair.quoteVolume24h, 0),
    },
    {
      header: '24h High/Low',
      cellClassName: 'price-cell',
      cell: (pair) => (
        <div className="flex flex-col text-xs">
          <span className="text-green-500">{formatCurrency(pair.high24h)}</span>
          <span className="text-red-500">{formatCurrency(pair.low24h)}</span>
        </div>
      ),
    },
  ];

  return (
    <main id="coins-page">
      <div className="content">
        <div className="mb-4 flex items-center justify-between">
          <h4>USDT Trading Pairs</h4>
          <div className="text-sm text-gray-400">
            {filteredPairs.length} pairs
            {searchTerm && ` matching "${search}"`}
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <form action="/pairs" method="get" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search pairs (e.g., BTC, ETH)..."
              defaultValue={searchTerm}
              className="w-full rounded-lg border border-gray-700 bg-[#1a2332] px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-purple-600 px-4 py-1 text-sm text-white hover:bg-purple-700"
            >
              Search
            </button>
          </form>
        </div>

        {paginatedPairs.length > 0 ? (
          <>
            <DataTable
              tableClassName="coins-table"
              columns={columns}
              data={paginatedPairs}
              rowKey={(pair) => pair.symbol}
            />

            <CoinsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasMorePages={hasMorePages}
            />
          </>
        ) : (
          <div className="rounded-lg bg-[#1a2332] p-8 text-center">
            <p className="text-gray-400">No trading pairs found matching your search.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default PairsListPage;
