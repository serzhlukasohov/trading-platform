'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

type PnlPeriod = '7D' | '1M' | '3M' | '1Y';

interface PnlStats {
  totalProfit: number;
  totalLoss: number;
  netPnl: number;
  tradingVolume: number;
  winRate: number;
  winningDays: number;
  losingDays: number;
  breakevenDays: number;
  avgProfit: number;
  avgLoss: number;
  plRatio: number;
}

interface ChartPoint {
  date: string;
  value: number;
}

const PNL_STATS: Record<PnlPeriod, PnlStats> = {
  '7D': {
    totalProfit: 284.5,
    totalLoss: -142.2,
    netPnl: 142.3,
    tradingVolume: 18420,
    winRate: 62.5,
    winningDays: 5,
    losingDays: 2,
    breakevenDays: 0,
    avgProfit: 56.9,
    avgLoss: -71.1,
    plRatio: 2.0,
  },
  '1M': {
    totalProfit: 1240,
    totalLoss: -520,
    netPnl: 720,
    tradingVolume: 84000,
    winRate: 58,
    winningDays: 18,
    losingDays: 12,
    breakevenDays: 2,
    avgProfit: 68.9,
    avgLoss: -43.3,
    plRatio: 2.38,
  },
  '3M': {
    totalProfit: 3800,
    totalLoss: -1650,
    netPnl: 2150,
    tradingVolume: 260000,
    winRate: 55,
    winningDays: 48,
    losingDays: 38,
    breakevenDays: 4,
    avgProfit: 79.2,
    avgLoss: -43.4,
    plRatio: 2.3,
  },
  '1Y': {
    totalProfit: 14200,
    totalLoss: -7400,
    netPnl: 6800,
    tradingVolume: 1200000,
    winRate: 52,
    winningDays: 156,
    losingDays: 142,
    breakevenDays: 15,
    avgProfit: 91.0,
    avgLoss: -52.1,
    plRatio: 1.92,
  },
};

const PNL_CHART: Record<PnlPeriod, ChartPoint[]> = {
  '7D': [
    { date: '02-16', value: 0 },
    { date: '02-17', value: 1.5 },
    { date: '02-18', value: -0.8 },
    { date: '02-19', value: 2.2 },
    { date: '02-20', value: 1.8 },
    { date: '02-21', value: 3.1 },
    { date: '02-22', value: 2.6 },
  ],
  '1M': [
    { date: '01-22', value: -1 },
    { date: '01-25', value: 0.5 },
    { date: '01-28', value: 2 },
    { date: '02-01', value: 1.2 },
    { date: '02-04', value: 3 },
    { date: '02-08', value: 2.4 },
    { date: '02-12', value: 4 },
    { date: '02-16', value: 3.2 },
    { date: '02-20', value: 4.8 },
    { date: '02-22', value: 4.2 },
  ],
  '3M': [
    { date: 'Dec', value: -2 },
    { date: 'Jan', value: 1 },
    { date: 'Feb', value: 4.5 },
  ],
  '1Y': [
    { date: 'Mar', value: -3 },
    { date: 'May', value: 0 },
    { date: 'Jul', value: 2 },
    { date: 'Sep', value: -1 },
    { date: 'Nov', value: 3 },
    { date: 'Jan', value: 4.5 },
    { date: 'Feb', value: 3.8 },
  ],
};

const PERIODS: PnlPeriod[] = ['7D', '1M', '3M', '1Y'];

// Simple SVG line chart
const PnLChart = ({ data }: { data: ChartPoint[] }) => {
  const W = 1000;
  const H = 160;
  const PAD = { top: 16, bottom: 32, left: 48, right: 16 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, -5);
  const maxVal = Math.max(...values, 5);
  const range = maxVal - minVal || 1;

  const toX = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) => PAD.top + (1 - (v - minVal) / range) * chartH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
  const areaPoints = [
    `${toX(0)},${toY(0)}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.value)}`),
    `${toX(data.length - 1)},${toY(0)}`,
  ].join(' ');

  const yLabels = [maxVal, maxVal / 2, 0, minVal / 2, minVal].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  );
  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {/* Zero line */}
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={W - PAD.right}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={1}
      />

      {/* Grid lines */}
      {yLabels.map((v) => (
        <line
          key={v}
          x1={PAD.left}
          y1={toY(v)}
          x2={W - PAD.right}
          y2={toY(v)}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Area fill */}
      <polygon points={areaPoints} fill="#22c55e" fillOpacity={0.08} />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Y-axis labels */}
      {yLabels.map((v) => (
        <text
          key={v}
          x={PAD.left - 6}
          y={toY(v)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={10}
          fill="currentColor"
          fillOpacity={0.4}
        >
          {v.toFixed(2)}
        </text>
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={toX(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize={10}
          fill="currentColor"
          fillOpacity={0.4}
        >
          {d.date}
        </text>
      ))}
    </svg>
  );
};

export const PnLAnalysisCard = () => {
  const [period, setPeriod] = useState<PnlPeriod>('7D');
  const stats = PNL_STATS[period];

  const statRows = [
    [
      { label: 'Total Profit', value: formatCurrency(stats.totalProfit), positive: true },
      { label: 'Total Loss', value: formatCurrency(stats.totalLoss), positive: false },
      {
        label: 'Net Profit/Loss',
        value: formatCurrency(stats.netPnl),
        positive: stats.netPnl >= 0,
      },
      {
        label: 'Trading Volume',
        value: stats.tradingVolume.toLocaleString('en-US'),
        neutral: true,
      },
    ],
    [
      { label: 'Win Rate', value: `${stats.winRate} %`, positive: true },
      { label: 'Winning Days', value: `${stats.winningDays} Days`, positive: true },
      { label: 'Losing Days', value: `${stats.losingDays} Days`, positive: false },
      { label: 'Breakeven Days', value: `${stats.breakevenDays} Days`, neutral: true },
    ],
    [
      { label: 'Average Profit', value: formatCurrency(stats.avgProfit), positive: true },
      { label: 'Average Loss', value: formatCurrency(stats.avgLoss), positive: false },
      { label: 'Profit/Loss Ratio', value: stats.plRatio.toFixed(2), neutral: true },
      { label: '', value: '', neutral: true },
    ],
  ];

  return (
    <div className="dashboard-card">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-foreground text-base font-semibold">PnL Analysis</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={p === period ? 'pnl-tab-active' : 'pnl-tab'}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-5 space-y-0">
        {statRows.map((row, ri) => (
          <div
            key={ri}
            className="grid grid-cols-4 border-b border-[color:var(--terminal-border)] py-3 last:border-none"
          >
            {row.map((cell, ci) => (
              <div key={ci} className="flex flex-col gap-0.5">
                {cell.label && <span className="text-xs text-purple-100">{cell.label}</span>}
                {cell.value && (
                  <span
                    className={`text-sm font-semibold ${
                      cell.neutral
                        ? 'text-foreground'
                        : cell.positive
                          ? 'text-foreground'
                          : 'text-foreground'
                    }`}
                  >
                    {cell.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="text-foreground">
        <PnLChart data={PNL_CHART[period]} />
      </div>
    </div>
  );
};
