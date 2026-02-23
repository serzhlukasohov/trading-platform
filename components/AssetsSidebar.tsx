'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface AssetsSidebarProps {
  pairs: TradingPair[];
  selectedSymbol: string;
  onSelectPair: (symbol: string) => void;
}

const fmtPrice = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
});

export const AssetsSidebar = ({ pairs, selectedSymbol, onSelectPair }: AssetsSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPairs = useMemo(() => {
    if (!searchQuery) return pairs;
    const q = searchQuery.toLowerCase();
    return pairs.filter(
      (p) => p.symbol.toLowerCase().includes(q) || p.baseAsset.toLowerCase().includes(q),
    );
  }, [pairs, searchQuery]);

  return (
    <div className="flex h-full flex-col bg-[color:var(--terminal-panel)]">
      {/* Header: "Assets" + All dropdown */}
      <div className="flex-none border-b border-[color:var(--terminal-border)] px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-foreground text-sm font-semibold">Assets</span>
          <select className="cursor-pointer rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] px-2 py-0.5 text-xs text-gray-400 focus:outline-none">
            <option>All</option>
            <option>Spot</option>
            <option>Futures</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="text-foreground w-full rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] py-1.5 pr-7 pl-8 text-xs placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 text-gray-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid flex-none grid-cols-[1fr_auto_auto] gap-x-2 border-b border-[color:var(--terminal-border)] px-3 py-1.5 text-[10px] font-medium text-gray-500">
        <div>Asset</div>
        <div className="w-14 text-right">Price</div>
        <div className="w-12 text-right">Change</div>
      </div>

      {/* Pairs list */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {filteredPairs.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">No pairs found</div>
        ) : (
          filteredPairs.map((pair) => {
            const isSelected = pair.symbol === selectedSymbol;
            const isPositive = pair.priceChangePercent >= 0;

            return (
              <button
                key={pair.symbol}
                onClick={() => onSelectPair(pair.symbol)}
                className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-2 px-3 py-1.5 text-left transition-colors ${
                  isSelected
                    ? 'border-l-2 border-purple-500 bg-purple-500/15'
                    : 'border-l-2 border-transparent hover:bg-[color:var(--terminal-border)]/30'
                }`}
              >
                {/* Asset: full symbol + base-to-USD subtext */}
                <div className="min-w-0">
                  <div
                    className={`truncate text-xs font-semibold ${isSelected ? 'text-foreground' : 'text-gray-200'}`}
                  >
                    {pair.symbol}
                  </div>
                  <div className="truncate text-[10px] text-gray-500">{pair.baseAsset} to USD</div>
                </div>

                {/* Price */}
                <div className="w-14 truncate text-right text-[11px] text-gray-300">
                  {fmtPrice.format(pair.currentPrice)}
                </div>

                {/* Change */}
                <div
                  className={`w-12 text-right text-[11px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                >
                  {isPositive ? '+' : ''}
                  {pair.priceChangePercent.toFixed(2)}%
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
