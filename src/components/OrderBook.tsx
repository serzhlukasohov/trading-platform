'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateMockOrderBook } from '@/lib/mockData';

// Module-level cached formatters — created once, reused forever
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const qtyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
  minimumFractionDigits: 0,
});
const totalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

interface OrderBookProps {
  symbol: string;
  orderBook: OrderBook | null;
  currentPrice: number;
}

export const OrderBook = ({ symbol, orderBook, currentPrice }: OrderBookProps) => {
  const [mockData, setMockData] = useState<OrderBook | null>(null);
  useEffect(() => {
    if (!orderBook) setMockData(generateMockOrderBook(currentPrice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const data = orderBook || mockData;

  // Derive max totals only when data changes
  const maxBidTotal = useMemo(
    () => (data && data.bids.length > 0 ? data.bids[data.bids.length - 1].total : 1),
    [data],
  );
  const maxAskTotal = useMemo(
    () => (data && data.asks.length > 0 ? data.asks[0].total : 1),
    [data],
  );

  return (
    <div className="flex h-full flex-col bg-[color:var(--terminal-panel)]">
      {/* Header */}
      <div className="flex-none border-b border-[color:var(--terminal-border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-sm font-semibold">Order Book</h3>
          <div className="text-xs text-gray-400">
            {orderBook ? (
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                Live • {symbol}
              </span>
            ) : (
              `Mock • ${symbol}`
            )}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid flex-none grid-cols-3 gap-2 border-b border-[color:var(--terminal-border)] px-4 py-2 text-xs font-medium text-gray-400">
        <div className="text-left">Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Sum</div>
      </div>

      {/* Scrollable content */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {/* Asks (sell) — reversed so highest is on top */}
        <div className="flex flex-col-reverse">
          {data?.asks.map((ask, index) => {
            const barWidth = (ask.total / maxAskTotal) * 100;
            return (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 gap-2 px-4 py-0.5 text-xs hover:bg-[color:var(--terminal-border)]/30"
              >
                <div
                  className="absolute top-0 right-0 h-full bg-red-500/10"
                  style={{ width: `${barWidth}%` }}
                />
                <div className="relative z-10 text-left font-medium text-red-400">
                  {priceFormatter.format(ask.price)}
                </div>
                <div className="relative z-10 text-right text-gray-300">
                  {qtyFormatter.format(ask.quantity)}
                </div>
                <div className="relative z-10 text-right text-gray-400">
                  {totalFormatter.format(ask.total)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Price */}
        <div className="sticky top-0 z-20 border-y border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)] px-4 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-green-400">
              {priceFormatter.format(currentPrice)}
            </span>
            <span className="text-xs text-gray-400">Current</span>
          </div>
        </div>

        {/* Bids (buy) */}
        <div>
          {data?.bids.map((bid, index) => {
            const barWidth = (bid.total / maxBidTotal) * 100;
            return (
              <div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 gap-2 px-4 py-0.5 text-xs hover:bg-[color:var(--terminal-border)]/30"
              >
                <div
                  className="absolute top-0 right-0 h-full bg-green-500/10"
                  style={{ width: `${barWidth}%` }}
                />
                <div className="relative z-10 text-left font-medium text-green-400">
                  {priceFormatter.format(bid.price)}
                </div>
                <div className="relative z-10 text-right text-gray-300">
                  {qtyFormatter.format(bid.quantity)}
                </div>
                <div className="relative z-10 text-right text-gray-400">
                  {totalFormatter.format(bid.total)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
