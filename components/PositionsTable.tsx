'use client';

import { useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface PositionsTableProps {
  positions: Position[];
  currentPrices: Record<string, number>;
  onClose: (positionId: string) => void;
}

export const PositionsTable = ({ positions, currentPrices, onClose }: PositionsTableProps) => {
  const [activeTab, setActiveTab] = useState<PositionStatus>('open');

  const filteredPositions = positions.filter((p) => p.status === activeTab);

  const handleClose = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId);
    if (position) {
      toast.success(
        `Position closed: ${position.symbol} • P&L: ${position.pnl >= 0 ? '+' : ''}${formatCurrency(position.pnl)}`,
      );
      onClose(positionId);
    }
  };

  return (
    <div className="border-t border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)]">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b border-[color:var(--terminal-border)] px-4 py-2">
        <div className="flex gap-6">
          {(['open', 'pending', 'closed'] as PositionStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-purple-500 text-foreground'
                  : 'text-gray-400 hover:text-foreground'
              }`}
            >
              {tab}
              <span className="ml-2 text-xs text-gray-500">
                ({positions.filter((p) => p.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredPositions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No {activeTab} positions</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] text-xs text-gray-400">
                <th className="px-4 py-3 text-left font-medium">Symbol</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Volume</th>
                <th className="px-4 py-3 text-right font-medium">Invested</th>
                <th className="px-4 py-3 text-right font-medium">Opening Price</th>
                <th className="px-4 py-3 text-right font-medium">Current Price</th>
                <th className="px-4 py-3 text-right font-medium">Take Profit</th>
                <th className="px-4 py-3 text-right font-medium">Stop Loss</th>
                <th className="px-4 py-3 text-right font-medium">P&L</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((position) => {
                // Calculate live P&L using current prices
                const currentPrice = currentPrices[position.symbol] || position.currentPrice;
                const priceDiff = currentPrice - position.openingPrice;
                const pnl =
                  position.side === 'buy'
                    ? priceDiff * position.volume
                    : -priceDiff * position.volume;
                const pnlPercent = (pnl / position.invested) * 100;

                return (
                  <tr
                    key={position.id}
                    className="border-b border-[color:var(--terminal-border)] transition-colors hover:bg-[color:var(--terminal-border)]/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-200">{position.symbol}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          position.side === 'buy'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {position.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatNumber(position.volume)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatCurrency(position.invested)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatCurrency(position.openingPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-200">
                      {formatCurrency(currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {position.takeProfit ? formatCurrency(position.takeProfit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {position.stopLoss ? formatCurrency(position.stopLoss) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {pnl >= 0 ? '+' : ''}
                        {formatCurrency(pnl)}
                      </div>
                      <div
                        className={`text-xs ${pnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}
                      >
                        {pnl >= 0 ? '+' : ''}
                        {pnlPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {activeTab === 'open' && (
                        <button
                          onClick={() => handleClose(position.id)}
                          className="rounded-md border border-red-500/50 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
