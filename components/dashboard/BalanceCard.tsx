import { FileText } from 'lucide-react';

export const BalanceCard = () => {
  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-foreground">Estimated Balance</h3>
        <button className="deposit-btn-sm">New deposit</button>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">0.00</span>
          <span className="text-sm text-purple-100">USD</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-purple-100">Today&apos;s PnL</span>
          <span className="text-green-400 font-medium">+0 USD</span>
          <FileText className="h-4 w-4 text-purple-100 cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
};
