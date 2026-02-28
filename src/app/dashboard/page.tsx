import { get24hrTicker } from '@/lib/binance.actions';
import { convertBinanceTicker } from '@/lib/utils';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { PnLAnalysisCard } from '@/components/dashboard/PnLAnalysisCard';
import { DailyChangesCard } from '@/components/dashboard/DailyChangesCard';
import { NewsCard } from '@/components/dashboard/NewsCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | CoinPulse',
  description: 'Your trading dashboard with PnL analysis and market overview.',
};

const stablecoins = ['USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', 'USDD'];

const DashboardPage = async () => {
  const allTickers = await get24hrTicker();

  const usdtPairs = allTickers
    .filter((t) => {
      const base = t.symbol.replace('USDT', '');
      return t.symbol.endsWith('USDT') && !stablecoins.includes(base);
    })
    .map(convertBinanceTicker);

  const topGainers = [...usdtPairs]
    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    .slice(0, 5);

  const topLosers = [...usdtPairs]
    .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
    .slice(0, 5);

  return (
    <main className="main-container">
      {/* Row 1: Balance + Profile */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BalanceCard />
        <UserProfileCard />
      </div>

      {/* Row 2: PnL Analysis */}
      <PnLAnalysisCard />

      {/* Row 3: Daily Changes + News */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DailyChangesCard gainers={topGainers} losers={topLosers} />
        <NewsCard />
      </div>
    </main>
  );
};

export default DashboardPage;
