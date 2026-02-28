'use client';

import { ChevronDown, Camera, X } from 'lucide-react';
import { formatCurrency, formatPercentage, trendingClasses } from '@/lib/utils';

interface PairHeaderProps {
  tradingPair: TradingPair;
  isLive?: boolean;
  liveInterval?: string;
  onOpenPicker?: () => void;
  latestOhlc?: { open: number; high: number; low: number; close: number } | null;
}

const PairHeader = ({
  tradingPair,
  isLive = false,
  liveInterval = '1m',
  onOpenPicker,
  latestOhlc,
}: PairHeaderProps) => {
  const { textClass } = trendingClasses(tradingPair.priceChangePercent);
  const isPositive = tradingPair.priceChangePercent >= 0;
  const isCloseUp = latestOhlc ? latestOhlc.close >= latestOhlc.open : isPositive;

  return (
    <div className="flex flex-col border-b border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)]">
      {/* Row 1: symbol pill + camera */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Symbol tab pill — clickable to open picker */}
        <button
          onClick={onOpenPicker}
          className={`flex items-center gap-1.5 rounded bg-[color:var(--terminal-deep)] px-2.5 py-1 text-xs transition-colors ${
            onOpenPicker
              ? 'cursor-pointer hover:bg-[color:var(--terminal-border)]/60'
              : 'cursor-default'
          }`}
        >
          <span className="text-foreground font-semibold">{tradingPair.symbol}</span>
          <span className="text-gray-500">{liveInterval}</span>
          {onOpenPicker && <ChevronDown className="h-3 w-3 text-gray-400" />}
        </button>

        {/* Close pill (navigates away — here just decorative) */}
        <button className="hover:text-foreground text-gray-500 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex-1" />

        {/* Camera / screenshot icon */}
        <button
          className="hover:text-foreground text-gray-500 transition-colors"
          aria-label="Screenshot chart"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Row 2: description • interval • live dot + OHLC */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pb-1.5 text-xs">
        {/* Description */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <span>{tradingPair.baseAsset} to US Dollar</span>
          <span className="text-gray-600">•</span>
          <span>{liveInterval}</span>
          {isLive && (
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          )}
        </div>

        {/* Price + change */}
        <div className="flex items-center gap-1.5">
          <span className="text-foreground font-semibold">
            {formatCurrency(tradingPair.currentPrice)}
          </span>
          <span className={`font-medium ${textClass}`}>
            {isPositive ? '+' : ''}
            {formatPercentage(tradingPair.priceChangePercent)}
          </span>
        </div>

        {/* OHLC values — shown when available */}
        {latestOhlc && (
          <div className="flex items-center gap-2 font-medium">
            <span className="text-gray-500">O</span>
            <span className="text-foreground">{formatCurrency(latestOhlc.open)}</span>
            <span className="text-gray-500">H</span>
            <span className="text-green-400">{formatCurrency(latestOhlc.high)}</span>
            <span className="text-gray-500">L</span>
            <span className="text-red-400">{formatCurrency(latestOhlc.low)}</span>
            <span className="text-gray-500">C</span>
            <span className={isCloseUp ? 'text-green-400' : 'text-red-400'}>
              {formatCurrency(latestOhlc.close)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PairHeader;
