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
import { convertOHLCData, periodToBinanceConfig } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

export interface OHLCValues {
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
  fillHeight?: boolean;
  children?: React.ReactNode;
  initialPeriod?: Period;
  liveInterval: BinanceInterval;
  setLiveInterval: (interval: BinanceInterval) => void;
  onOhlcChange?: (ohlc: OHLCValues | null) => void;
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
  onOhlcChange,
}: BinanceCandlestickChartProps) => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();

  const { theme } = useTheme();

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

  // Initialize chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(period);

    const panelBg =
      getComputedStyle(document.documentElement).getPropertyValue('--terminal-panel').trim() ||
      CHART_COLORS[theme].background;

    const initW = fillHeight
      ? (outerRef.current?.clientWidth ?? container.clientWidth)
      : container.clientWidth;
    const initH = fillHeight ? (outerRef.current?.clientHeight ?? height) : height;

    const baseConfig = getChartConfig(initH, showTime, theme);
    const chart = createChart(container, {
      ...baseConfig,
      width: initW,
      height: initH,
      layout: {
        ...baseConfig.layout,
        background: { type: ColorType.Solid, color: panelBg },
      },
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig(theme));

    series.setData(convertOHLCData(ohlcData));
    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        onOhlcChange?.(null);
        return;
      }
      const bar = param.seriesData.get(series) as OHLCValues | undefined;
      onOhlcChange?.(bar ?? null);
    });

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const watchEl = fillHeight ? outerRef.current : container;
    if (watchEl) {
      const observer = new ResizeObserver((entries) => {
        if (!entries.length) return;
        const { width, height: h } = entries[0].contentRect;
        if (width > 0 && h > 0) {
          chart.applyOptions({ width, height: h });
        }
      });
      observer.observe(watchEl);
      return () => {
        observer.disconnect();
        chart.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      };
    }

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [period]);

  // Update chart data when ohlcData or liveOhlcv changes
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];
      const lastHistoricalCandle = ohlcData[ohlcData.length - 1];
      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        merged = [...ohlcData.slice(0, -1), liveOhlcv];
      } else {
        merged = [...ohlcData, liveOhlcv];
      }
    } else {
      merged = ohlcData;
    }

    merged.sort((a, b) => a[0] - b[0]);
    const converted = convertOHLCData(merged);
    candleSeriesRef.current.setData(converted);

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;
    if (dataChanged) {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [ohlcData, liveOhlcv]);

  // Update chart colors on theme change
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current) return;
    const c = CHART_COLORS[theme];
    const panelBg =
      getComputedStyle(document.documentElement).getPropertyValue('--terminal-panel').trim() ||
      c.background;
    chartRef.current.applyOptions({
      layout: { background: { type: ColorType.Solid, color: panelBg }, textColor: c.text },
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

  if (fillHeight) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={outerRef} className="min-h-0 flex-1">
          <div ref={chartContainerRef} />
        </div>
        <div className="chart-interval-bar shrink-0">
          <div className="button-group flex-1">
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
          <div className="button-group border-l border-[color:var(--terminal-border)] pl-2">
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
      </div>
    );
  }

  return (
    <div id="candlestick-chart">
      <div ref={chartContainerRef} className="chart" style={{ height }} />

      <div className="chart-interval-bar">
        <div className="button-group flex-1">
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
        <div className="button-group border-l border-[color:var(--terminal-border)] pl-2">
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
    </div>
  );
};

export default BinanceCandlestickChart;
