'use client';

import { useEffect, useRef, useState } from 'react';
import { getCandlestickConfig, getChartConfig, CHART_COLORS, PERIOD_BUTTONS } from '@/constants';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { getBinanceKlines } from '@/lib/binance.actions';
import { convertOHLCData, periodToBinanceConfig } from '@/lib/utils';
import { ColorType } from 'lightweight-charts';
import { useTheme } from '@/components/ThemeProvider';

interface BinanceChartProps {
  symbol: string;
  initialKlines: OHLCData[];
  children?: React.ReactNode;
  height?: number;
}

const BinanceChart = ({ symbol, initialKlines, children, height = 360 }: BinanceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [period, setPeriod] = useState<Period>('daily');
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(initialKlines);
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      setIsLoading(true);
      const config = periodToBinanceConfig(selectedPeriod);
      const newData = await getBinanceKlines(symbol, config.interval, config.limit);
      setOhlcData(newData ?? []);
    } catch (e) {
      console.error('Failed to fetch Binance klines', e);
    } finally {
      setIsLoading(false);
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

    const chart = createChart(container, {
      ...getChartConfig(height, showTime, theme),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig(theme));

    series.setData(convertOHLCData(ohlcData));
    chart.timeScale().fitContent();

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
  }, [height, period]);

  // Update chart data
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const converted = convertOHLCData(ohlcData);
    candleSeriesRef.current.setData(converted);
    chartRef.current?.timeScale().fitContent();
  }, [ohlcData]);

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

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        {/* Period Selection */}
        <div className="button-group">
          <span className="mx-2 text-sm font-medium text-purple-100/50">Period:</span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={period === value ? 'config-button-active' : 'config-button'}
              onClick={() => handlePeriodChange(value)}
              disabled={isLoading}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  );
};

export default BinanceChart;
