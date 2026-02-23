'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import BinanceCandlestickChart from './BinanceCandlestickChart';
import PairHeader from './PairHeader';
import { OrderBook } from './OrderBook';
import { TradingForm } from './TradingForm';
import { PositionsTable } from './PositionsTable';
import { AssetsSidebar } from './AssetsSidebar';
import { generateMockPositions } from '@/lib/mockData';

interface TradingTerminalProps {
  symbol: string;
  initialTicker: Binance24hrTicker;
  initialKlines: OHLCData[];
  allPairs: TradingPair[];
}

export const TradingTerminal = ({
  symbol,
  initialTicker,
  initialKlines,
  allPairs,
}: TradingTerminalProps) => {
  const router = useRouter();

  const [positions, setPositions] = useState<Position[]>([]);

  // Load positions from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved = localStorage.getItem('coinpulse_positions');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPositions(saved ? JSON.parse(saved) : generateMockPositions());
  }, []);

  useEffect(() => {
    localStorage.setItem('coinpulse_positions', JSON.stringify(positions));
  }, [positions]);

  const [liveInterval, setLiveInterval] = useState<BinanceInterval>('1m');

  const { ticker, orderBook, ohlcv, isConnected } = useBinanceWebSocket({
    symbol,
    streams: ['ticker', 'depth', 'kline'],
    klineInterval: liveInterval,
    enabled: true,
  });

  const currentTicker = ticker || {
    symbol: initialTicker.symbol,
    baseAsset: symbol.replace('USDT', ''),
    quoteAsset: 'USDT',
    currentPrice: parseFloat(initialTicker.lastPrice),
    priceChange: parseFloat(initialTicker.priceChange),
    priceChangePercent: parseFloat(initialTicker.priceChangePercent),
    volume24h: parseFloat(initialTicker.volume),
    quoteVolume24h: parseFloat(initialTicker.quoteVolume),
    high24h: parseFloat(initialTicker.highPrice),
    low24h: parseFloat(initialTicker.lowPrice),
    trades24h: initialTicker.count,
  };

  const currentPrices: Record<string, number> = {};
  allPairs.forEach((pair) => {
    currentPrices[pair.symbol] = pair.currentPrice;
  });
  currentPrices[symbol] = currentTicker.currentPrice;

  const handleTrade = (formData: TradeFormData) => {
    const newPosition: Position = {
      id: Date.now().toString(),
      symbol,
      side: formData.side,
      type: formData.orderType,
      volume: formData.size,
      invested: formData.size * formData.price,
      openingPrice: formData.price,
      currentPrice: formData.price,
      stopLoss: formData.stopLoss,
      takeProfit: formData.takeProfit,
      pnl: 0,
      pnlPercent: 0,
      status: 'open',
      openTime: Date.now(),
    };
    setPositions((prev) => [newPosition, ...prev]);
  };

  const handleClosePosition = (positionId: string) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.id === positionId
          ? { ...p, status: 'closed' as PositionStatus, closeTime: Date.now() }
          : p,
      ),
    );
  };

  const handleSelectPair = (newSymbol: string) => {
    router.push(`/pairs/${newSymbol}`);
  };

  return (
    // Grid: 3 cols × 3 rows
    // row 1: sidebar | chart          | orderbook
    // row 2: sidebar | trading form   | orderbook
    // row 3: positions (full width, all 3 cols)
    <div className="grid h-[calc(100vh-80px)] grid-cols-[180px_1fr_280px] grid-rows-[1fr_auto_210px] gap-2 overflow-hidden bg-[color:var(--terminal-deep)] p-2">
      {/* Col 1: Assets Sidebar — spans rows 1+2 */}
      <div className="row-span-2 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
        <AssetsSidebar pairs={allPairs} selectedSymbol={symbol} onSelectPair={handleSelectPair} />
      </div>

      {/* Col 2 row 1: Chart */}
      <div className="col-start-2 row-start-1 flex min-h-0 flex-col overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
        <PairHeader tradingPair={currentTicker} isLive={isConnected} liveInterval={liveInterval} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <BinanceCandlestickChart
            symbol={symbol}
            data={initialKlines}
            liveOhlcv={ohlcv}
            liveInterval={liveInterval}
            setLiveInterval={setLiveInterval}
            fillHeight
          />
        </div>
      </div>

      {/* Col 2 row 2: Trading Form — auto height fits content */}
      <div className="col-start-2 row-start-2 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
        <TradingForm
          symbol={symbol}
          currentPrice={currentTicker.currentPrice}
          onTrade={handleTrade}
        />
      </div>

      {/* Col 3: Order Book — spans rows 1+2 */}
      <div className="col-start-3 row-span-2 row-start-1 min-h-0 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
        <OrderBook
          symbol={symbol}
          orderBook={orderBook}
          currentPrice={currentTicker.currentPrice}
        />
      </div>

      {/* Row 3: Positions Table — full width, all 3 cols */}
      <div className="col-span-3 col-start-1 row-start-3 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
        <PositionsTable
          positions={positions}
          currentPrices={currentPrices}
          onClose={handleClosePosition}
        />
      </div>
    </div>
  );
};
