import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface DailyChangesCardProps {
  gainers: TradingPair[];
  losers: TradingPair[];
}

const PairRow = ({ pair }: { pair: TradingPair }) => {
  const isPositive = pair.priceChangePercent >= 0;
  return (
    <Link
      href={`/pairs/${pair.symbol}`}
      className="grid grid-cols-3 rounded px-0 py-2 text-sm transition-colors hover:bg-[color:var(--terminal-border)]/30"
    >
      <span className="text-foreground font-medium">{pair.baseAsset}</span>
      <span
        className={`text-center font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      >
        {isPositive ? '+' : ''}
        {pair.priceChangePercent.toFixed(2)}%
      </span>
      <span className="text-right text-purple-100">{formatCurrency(pair.currentPrice)}</span>
    </Link>
  );
};

export const DailyChangesCard = ({ gainers, losers }: DailyChangesCardProps) => {
  return (
    <div className="dashboard-card">
      <h3 className="text-foreground mb-5 text-base font-semibold">Daily Changes</h3>

      {/* Column headers */}
      <div className="mb-1 grid grid-cols-3 text-xs text-purple-100">
        <span>Top Gainers</span>
        <span className="text-center">Change</span>
        <span className="text-right">Price</span>
      </div>

      <div className="mb-5 space-y-0.5">
        {gainers.map((pair) => (
          <PairRow key={pair.symbol} pair={pair} />
        ))}
      </div>

      {/* Column headers */}
      <div className="mb-1 grid grid-cols-3 border-t border-[color:var(--terminal-border)] pt-4 text-xs text-purple-100">
        <span>Top Losers</span>
        <span className="text-center">Change</span>
        <span className="text-right">Price</span>
      </div>

      <div className="space-y-0.5">
        {losers.map((pair) => (
          <PairRow key={pair.symbol} pair={pair} />
        ))}
      </div>
    </div>
  );
};
