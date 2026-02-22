'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  getCandlestickConfig,
  getChartConfig,
  CHART_COLORS,
  BINANCE_LIVE_INTERVALS,
  PERIOD_BUTTONS,
} from '@/constants';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import { getBinanceKlines } from '@/lib/binance.actions';
import { convertOHLCData, periodToBinanceConfig, formatCurrency } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

interface OHLCValues {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface BinanceCandlestickChartProps {
  symbol: string;
  data?: OHLCData[];
  liveOhlcv?: OHLCData | null;
  height?: number;
  fillHeight?: boolean; // fill parent flex container instead of fixed height
  children?: React.ReactNode;
  initialPeriod?: Period;
  liveInterval: BinanceInterval;
  setLiveInterval: (interval: BinanceInterval) => void;
}

const BinanceCandlestickChart = ({
  children,
  data,
  symbol,
  height = 360,
  fillHeight = false,
  initialPeriod = 'daily',
  liveOhlcv = null,
  liveInterval,
  setLiveInterval,
}: BinanceCandlestickChartProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [dynamicHeight, setDynamicHeight] = useState(height);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();
  const [hoveredOhlc, setHoveredOhlc] = useState<OHLCValues | null>(null);

  const { theme } = useTheme();

  // Derive latest OHLC for display (live candle or last historical)
  const latestOhlc: OHLCValues | null = (() => {
    if (hoveredOhlc) return hoveredOhlc;
    const src = liveOhlcv ?? (ohlcData.length > 0 ? ohlcData[ohlcData.length - 1] : null);
    if (!src) return null;
    return { open: src[1], high: src[2], low: src[3], close: src[4] };
  })();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const config = periodToBinanceConfig(selectedPeriod);

      const newData = await getBinanceKlines(symbol, config.interval, config.limit);

      startTransition(() => {
        setOhlcData(newData ?? []);
      });
    } catch (e) {
      console.error('Failed to fetch Binance klines', e);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    setPeriod(newPeriod);
    fetchOHLCData(newPeriod);
  };

  // Measure wrapper height when fillHeight is true
  useEffect(() => {
    if (!fillHeight) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h && h > 0) setDynamicHeight(h);
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [fillHeight]);

  const chartHeight = fillHeight ? dynamicHeight : height;

  // Initialize chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(chartHeight, showTime, theme),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig(theme));

    // Binance data is already in seconds, no need to convert
    series.setData(convertOHLCData(ohlcData));
    chart.timeScale().fitContent();

    // Subscribe to crosshair move for OHLC display
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredOhlc(null);
        return;
      }
      const bar = param.seriesData.get(series) as
        | { open: number; high: number; low: number; close: number }
        | undefined;
      if (bar) {
        setHoveredOhlc({ open: bar.open, high: bar.high, low: bar.low, close: bar.close });
      } else {
        setHoveredOhlc(null);
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [chartHeight, period]);

  // Update chart data when ohlcData or liveOhlcv changes
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];
      const lastHistoricalCandle = ohlcData[ohlcData.length - 1];

      // Replace last candle if timestamps match, otherwise append
      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        merged = [...ohlcData.slice(0, -1), liveOhlcv];
      } else {
        merged = [...ohlcData, liveOhlcv];
      }
    } else {
      merged = ohlcData;
    }

    // Sort by timestamp to ensure chronological order
    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);
    candleSeriesRef.current.setData(converted);

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    // Only fit content when data changes or in historical mode
    if (dataChanged) {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [ohlcData, liveOhlcv]);

  // Update chart colors on theme change without rebuilding
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current) return;
    const c = CHART_COLORS[theme];
    chartRef.current.applyOptions({
      layout: { background: { type: ColorType.Solid, color: c.background }, textColor: c.text },
      grid: { horzLines: { color: c.grid } },
      rightPriceScale: { borderColor: c.border },
      timeScale: { borderColor: c.border },
      crosshair: {
        vertLine: { color: c.crosshairV },
        horzLine: { color: c.crosshairH },
      },
    });
    candleSeriesRef.current.applyOptions({
      upColor: c.candleUp,
      downColor: c.candleDown,
      wickUpColor: c.candleUp,
      wickDownColor: c.candleDown,
    });
  }, [theme]);

  const isCloseUp = latestOhlc ? latestOhlc.close >= latestOhlc.open : true;

  return (
    <div
      id="candlestick-chart"
      ref={fillHeight ? wrapperRef : undefined}
      style={fillHeight ? { display: 'flex', flexDirection: 'column', height: '100%', padding: 0, marginTop: 0, borderRadius: 0, background: 'transparent' } : undefined}
    >
      <div className="chart-header">
        <div className="flex-1 flex items-center gap-3 flex-wrap">
          {children}
          {/* OHLC values */}
          {latestOhlc && (
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-gray-500">O</span>
              <span className="text-foreground">{formatCurrency(latestOhlc.open)}</span>
              <span className="text-gray-500">H</span>
              <span className="text-green-400">{formatCurrency(latestOhlc.high)}</span>
              <span className="text-gray-500">L</span>
              <span className="text-red-400">{formatCurrency(latestOhlc.low)}</span>
              <span className="text-gray-500">C</span>
              <span className={isCloseUp ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(latestOhlc.close)}
              </span>
            </div>
          )}
        </div>

        {/* Period Selection */}
        <div className="button-group">
          <span className="mx-2 text-sm font-medium text-purple-100/50">Period:</span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={period === value ? 'config-button-active' : 'config-button'}
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className="chart"
        style={fillHeight ? { flex: 1, minHeight: 0, height: undefined } : { height: chartHeight }}
      />

      {/* Interval buttons below chart */}
      <div className="chart-interval-bar">
        <div className="button-group">
          {BINANCE_LIVE_INTERVALS.map(({ value, label }) => (
            <button
              key={value}
              className={liveInterval === value ? 'config-button-active' : 'config-button'}
              onClick={() => setLiveInterval(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinanceCandlestickChart;
