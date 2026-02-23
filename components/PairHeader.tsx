'use client';

import { formatCurrency, formatPercentage, formatNumber, trendingClasses } from '@/lib/utils';

interface PairHeaderProps {
  tradingPair: TradingPair;
  isLive?: boolean;
  liveInterval?: string;
}

const PairHeader = ({ tradingPair, isLive = false, liveInterval = '1m' }: PairHeaderProps) => {
  const { textClass } = trendingClasses(tradingPair.priceChangePercent);
  const isPositive = tradingPair.priceChangePercent >= 0;

  return (
    <div className="chart-tab-bar">
      {/* Tab */}
      <div className="chart-tab">
        <span className="text-foreground font-semibold">
          {tradingPair.baseAsset}/{tradingPair.quoteAsset}
        </span>
        <span className="text-xs text-gray-500">{liveInterval}</span>
        {isLive && (
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        )}
      </div>

      {/* Price + change */}
      <div className="ml-2 flex items-center gap-2">
        <span className="text-foreground text-sm font-semibold">
          {formatCurrency(tradingPair.currentPrice)}
        </span>
        <span className={`text-xs font-medium ${textClass}`}>
          {isPositive ? '+' : ''}
          {formatPercentage(tradingPair.priceChangePercent)}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* 24h stats */}
      <div className="hidden items-center gap-4 text-xs text-gray-400 xl:flex">
        <span>
          <span className="mr-1 text-gray-500">H</span>
          <span className="text-foreground">{formatCurrency(tradingPair.high24h)}</span>
        </span>
        <span>
          <span className="mr-1 text-gray-500">L</span>
          <span className="text-foreground">{formatCurrency(tradingPair.low24h)}</span>
        </span>
        <span>
          <span className="mr-1 text-gray-500">Vol</span>
          <span className="text-foreground">{formatNumber(tradingPair.volume24h, 0)}</span>
        </span>
      </div>
    </div>
  );
};

export default PairHeader;
