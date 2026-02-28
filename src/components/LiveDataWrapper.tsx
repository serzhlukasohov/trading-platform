'use client';

import { Separator } from '@/components/ui/separator';
import CandlestickChart from '@/components/CandlestickChart';
import { useCoinGeckoWebSocket } from '@/hooks/useCoinGeckoWebSocket';
import DataTable from '@/components/DataTable';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useState } from 'react';
import CoinHeader from '@/components/CoinHeader';

const LiveDataWrapper = ({ children, coinId, poolId, coin, coinOHLCData }: LiveDataProps) => {
  const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1s');
  const { trades, ohlcv, price, isConnected } = useCoinGeckoWebSocket({
    coinId,
    poolId,
    liveInterval,
  });

  // Check if WebSocket is configured
  const hasWebSocketConfig =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL &&
    process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : '-'),
    },
    {
      header: 'Amount',
      cellClassName: 'amount-cell',
      cell: (trade) => trade.amount?.toFixed(4) ?? '-',
    },
    {
      header: 'Value',
      cellClassName: 'value-cell',
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : '-'),
    },
    {
      header: 'Buy/Sell',
      cellClassName: 'type-cell',
      cell: (trade) => (
        <span className={trade.type === 'b' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'b' ? 'Buy' : 'Sell'}
        </span>
      ),
    },
    {
      header: 'Time',
      cellClassName: 'time-cell',
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : '-'),
    },
  ];

  return (
    <section id="live-data-wrapper">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usd ?? coin.market_data.current_price.usd}
        livePriceChangePercentage24h={
          price?.change24h ?? coin.market_data.price_change_percentage_24h_in_currency.usd
        }
        priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd}
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />
      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart
          coinId={coinId}
          data={coinOHLCData}
          liveOhlcv={hasWebSocketConfig ? ohlcv : null}
          mode={hasWebSocketConfig ? 'live' : 'historical'}
          initialPeriod="daily"
          liveInterval={liveInterval}
          setLiveInterval={setLiveInterval}
        >
          <h4>Trend Overview {!hasWebSocketConfig && '(Historical Data)'}</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {hasWebSocketConfig && tradeColumns && (
        <div className="trades">
          <h4>Recent Trades</h4>

          <DataTable
            columns={tradeColumns}
            data={trades}
            rowKey={(_, index) => index}
            tableClassName="trades-table"
          />
        </div>
      )}

      {!hasWebSocketConfig && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> WebSocket credentials not configured. Live trading data and
            real-time OHLCV updates are disabled. Historical chart data is still available.
          </p>
        </div>
      )}
    </section>
  );
};

export default LiveDataWrapper;
