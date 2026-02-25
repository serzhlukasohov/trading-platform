import { FileText } from 'lucide-react';

export const BalanceCard = () => {
  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between">
        <h3 className="text-foreground text-base font-semibold">Estimated Balance</h3>
        <button className="deposit-btn-sm">New deposit</button>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-foreground text-4xl font-bold">0.00</span>
          <span className="text-sm text-purple-100">USD</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-purple-100">Today&apos;s PnL</span>
          <span className="font-medium text-green-400">+0 USD</span>
          <FileText className="hover:text-foreground h-4 w-4 cursor-pointer text-purple-100 transition-colors" />
        </div>
      </div>
    </div>
  );
};
