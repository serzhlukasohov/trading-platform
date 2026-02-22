import {
  CandlestickSeriesPartialOptions,
  ChartOptions,
  ColorType,
  DeepPartial,
} from 'lightweight-charts';

export const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Trading Pairs',
    href: '/pairs',
  },
];

export const CHART_COLORS = {
  dark: {
    background: '#0b1116',
    text: '#8f9fb1',
    grid: '#1a2332',
    border: '#1a2332',
    crosshairV: '#ffffff40',
    crosshairH: '#ffffff20',
    candleUp: '#158A6E',
    candleDown: '#EB1C36',
  },
  light: {
    background: '#ffffff',
    text: '#4b5563',
    grid: '#e5e7eb',
    border: '#d1d5db',
    crosshairV: '#00000030',
    crosshairH: '#00000018',
    candleUp: '#16a34a',
    candleDown: '#dc2626',
  },
} as const;

// Legacy: kept for backwards compat (defaults to dark)
const CHART_COLORS_LEGACY = CHART_COLORS.dark;

export const getCandlestickConfig = (
  theme: 'dark' | 'light' = 'dark',
): CandlestickSeriesPartialOptions => {
  const c = CHART_COLORS[theme];
  return {
    upColor: c.candleUp,
    downColor: c.candleDown,
    wickUpColor: c.candleUp,
    wickDownColor: c.candleDown,
    borderVisible: true,
    wickVisible: true,
  };
};

// Legacy alias
export const getCandlestickSeriesConfig = getCandlestickConfig;

export const getChartConfig = (
  height: number,
  timeVisible: boolean = true,
  theme: 'dark' | 'light' = 'dark',
): DeepPartial<ChartOptions> => {
  const c = CHART_COLORS[theme];
  return {
    width: 0,
    height,
    layout: {
      background: { type: ColorType.Solid, color: c.background },
      textColor: c.text,
      fontSize: 12,
      fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial',
    },
    grid: {
      vertLines: { visible: false },
      horzLines: {
        visible: true,
        color: c.grid,
        style: 2,
      },
    },
    rightPriceScale: {
      borderColor: c.border,
    },
    timeScale: {
      borderColor: c.border,
      timeVisible,
      secondsVisible: false,
    },
    handleScroll: true,
    handleScale: true,
    crosshair: {
      mode: 1,
      vertLine: {
        visible: true,
        color: c.crosshairV,
        width: 1,
        style: 0,
      },
      horzLine: {
        visible: true,
        color: c.crosshairH,
        width: 1,
        style: 0,
      },
    },
    localization: {
      priceFormatter: (price: number) =>
        '$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    },
  };
};

export const PERIOD_CONFIG: Record<
  Period,
  { days: number | string; interval?: 'hourly' | 'daily' }
> = {
  daily: { days: 1, interval: 'hourly' },
  weekly: { days: 7, interval: 'hourly' },
  monthly: { days: 30, interval: 'hourly' },
  '3months': { days: 90, interval: 'daily' },
  '6months': { days: 180, interval: 'daily' },
  yearly: { days: 365 },
  max: { days: 'max' },
};

// Binance-specific interval configuration
export const BINANCE_INTERVAL_CONFIG: Record<Period, { interval: BinanceInterval; limit: number }> =
  {
    daily: { interval: '15m', limit: 96 }, // 24h with 15min candles
    weekly: { interval: '1h', limit: 168 }, // 7d with 1h candles
    monthly: { interval: '4h', limit: 180 }, // 30d with 4h candles
    '3months': { interval: '1d', limit: 90 }, // 90d with daily candles
    '6months': { interval: '1d', limit: 180 }, // 180d with daily candles
    yearly: { interval: '1d', limit: 365 }, // 365d with daily candles
    max: { interval: '1w', limit: 500 }, // Max allowed by Binance
  };

// Available Binance intervals for live chart
export const BINANCE_LIVE_INTERVALS: { value: BinanceInterval; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1D' },
];

export const PERIOD_BUTTONS: { value: Period; label: string }[] = [
  { value: 'daily', label: '1D' },
  { value: 'weekly', label: '1W' },
  { value: 'monthly', label: '1M' },
  { value: '3months', label: '3M' },
  { value: '6months', label: '6M' },
  { value: 'yearly', label: '1Y' },
  { value: 'max', label: 'Max' },
];

export const LIVE_INTERVAL_BUTTONS: { value: '1s' | '1m'; label: string }[] = [
  { value: '1s', label: '1s' },
  { value: '1m', label: '1m' },
];
