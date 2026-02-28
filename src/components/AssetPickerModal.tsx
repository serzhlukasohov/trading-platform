'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface AssetPickerModalProps {
  pairs: TradingPair[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  onClose: () => void;
}

const fmtPrice = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
});

type Filter = 'All' | 'Gainers' | 'Losers';

export const AssetPickerModal = ({
  pairs,
  selectedSymbol,
  onSelect,
  onClose,
}: AssetPickerModalProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = useMemo(() => {
    let list = pairs;

    if (filter === 'Gainers') list = list.filter((p) => p.priceChangePercent > 0);
    else if (filter === 'Losers') list = list.filter((p) => p.priceChangePercent < 0);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.symbol.toLowerCase().includes(q) || p.baseAsset.toLowerCase().includes(q),
      );
    }

    return list;
  }, [pairs, search, filter]);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — slides in from left on mobile, centered on desktop */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-[color:var(--terminal-panel)] shadow-2xl md:relative md:inset-auto md:h-full md:max-w-none md:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--terminal-border)] px-4 py-3">
          <span className="text-foreground text-sm font-semibold">Add symbol</span>
          <button
            onClick={onClose}
            className="hover:text-foreground flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 border-b border-[color:var(--terminal-border)] px-4 py-2.5">
          <div className="relative flex-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="text-foreground w-full cursor-pointer appearance-none rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] py-1.5 pr-7 pl-3 text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Gainers">Gainers</option>
              <option value="Losers">Losers</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-[color:var(--terminal-border)] px-4 py-2.5">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="text-foreground w-full rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] py-1.5 pr-8 pl-9 text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">No pairs found</div>
          ) : (
            filtered.map((pair) => {
              const isSelected = pair.symbol === selectedSymbol;
              const isPositive = pair.priceChangePercent >= 0;

              return (
                <button
                  key={pair.symbol}
                  onClick={() => handleSelect(pair.symbol)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[color:var(--terminal-border)]/30 ${
                    isSelected ? 'bg-purple-500/10' : ''
                  }`}
                >
                  {/* Left: symbol + description */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold ${isSelected ? 'text-purple-400' : 'text-foreground'}`}
                    >
                      {pair.symbol}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {pair.baseAsset} to US Dollar
                    </div>
                  </div>

                  {/* Right: price + change */}
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <div className="text-xs text-gray-400">
                      {fmtPrice.format(pair.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {isPositive ? '+' : ''}
                      {pair.priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
