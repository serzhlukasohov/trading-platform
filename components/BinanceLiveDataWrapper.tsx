'use client';

import { useState, useEffect } from 'react';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { convertBinanceTicker } from '@/lib/utils';
import BinanceCandlestickChart from './BinanceCandlestickChart';
import PairHeader from './PairHeader';

interface BinanceLiveDataWrapperProps {
  symbol: string;
  initialTicker: Binance24hrTicker;
  initialKlines: OHLCData[];
}

const BinanceLiveDataWrapper = ({
  symbol,
  initialTicker,
  initialKlines,
}: BinanceLiveDataWrapperProps) => {
  const [liveInterval, setLiveInterval] = useState<BinanceInterval>('1m');
  const [isClient, setIsClient] = useState(false);

  // Only connect WebSocket on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Connect to Binance WebSocket for live price updates only
  // We don't need kline stream as we fetch historical data via REST API
  const { ticker, isConnected } = useBinanceWebSocket({
    symbol,
    streams: ['ticker'],
    enabled: isClient, // Only enable after client-side hydration
  });

  // Use live ticker data if available, otherwise use initial data
  const tradingPair = ticker || convertBinanceTicker(initialTicker);

  return (
    <section className="container mx-auto space-y-6 px-4 py-8">
      {/* Pair Header with Live Stats */}
      <PairHeader tradingPair={tradingPair} isLive={isConnected} />

      {/* Candlestick Chart */}
      <BinanceCandlestickChart
        symbol={symbol}
        data={initialKlines}
        liveOhlcv={null} // We don't use live OHLCV from WebSocket
        initialPeriod="daily"
        liveInterval={liveInterval}
        setLiveInterval={setLiveInterval}
      />
    </section>
  );
};

export default BinanceLiveDataWrapper;
