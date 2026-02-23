'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface AssetsSidebarProps {
  pairs: TradingPair[];
  selectedSymbol: string;
  onSelectPair: (symbol: string) => void;
}

// Simple number formatter — no currency symbol
const fmtPrice = new Intl.NumberFormat('en-US', { maximumFractionDigits: 5, minimumFractionDigits: 2 });

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
          <span className="text-sm font-semibold text-foreground">Assets</span>
          <select className="rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] px-2 py-0.5 text-xs text-gray-400 focus:outline-none cursor-pointer">
            <option>All</option>
            <option>Spot</option>
            <option>Futures</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] py-1.5 pl-8 pr-7 text-xs text-foreground placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex-none grid grid-cols-3 border-b border-[color:var(--terminal-border)] px-3 py-1.5 text-[10px] font-medium text-gray-500">
        <div>Asset</div>
        <div className="text-right">Price</div>
        <div className="text-right">Change</div>
      </div>

      {/* Pairs list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                className={`w-full grid grid-cols-3 items-center gap-1 px-3 py-1.5 text-left transition-colors ${
                  isSelected
                    ? 'bg-purple-500/15 border-l-2 border-purple-500'
                    : 'border-l-2 border-transparent hover:bg-[color:var(--terminal-border)]/30'
                }`}
              >
                {/* Asset: full symbol + /USDT below */}
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${isSelected ? 'text-foreground' : 'text-gray-200'}`}>
                    {pair.baseAsset}
                  </div>
                  <div className="text-[10px] text-gray-500">/USDT</div>
                </div>

                {/* Price */}
                <div className="text-right text-[11px] text-gray-300 truncate">
                  {fmtPrice.format(pair.currentPrice)}
                </div>

                {/* Change */}
                <div className={`text-right text-[11px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{pair.priceChangePercent.toFixed(2)}%
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
