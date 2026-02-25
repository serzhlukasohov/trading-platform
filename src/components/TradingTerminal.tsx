'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import BinanceCandlestickChart, { OHLCValues } from './BinanceCandlestickChart';
import PairHeader from './PairHeader';
import { OrderBook } from './OrderBook';
import { TradingForm } from './TradingForm';
import { PositionsTable } from './PositionsTable';
import { AssetsSidebar } from './AssetsSidebar';
import { AssetPickerModal } from './AssetPickerModal';
import { generateMockPositions } from '@/lib/mockData';
import { formatCurrency, formatPercentage, trendingClasses } from '@/lib/utils';

type MobileTab = 'trade' | 'chart';

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
  const [activeTab, setActiveTab] = useState<MobileTab>('trade');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoveredOhlc, setHoveredOhlc] = useState<OHLCValues | null>(null);

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

  // Derive OHLC for PairHeader: hovered candle takes priority, else live candle
  const latestOhlc: OHLCValues | null =
    hoveredOhlc ||
    (ohlcv ? { open: ohlcv[1], high: ohlcv[2], low: ohlcv[3], close: ohlcv[4] } : null);

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

  const { textClass } = trendingClasses(currentTicker.priceChangePercent);
  const isPositive = currentTicker.priceChangePercent >= 0;

  return (
    // Mobile: flex column
    // Tablet/Desktop (md+): 3-col grid
    //   col 1: sidebar (220px)  col 2: chart+form (1fr)  col 3: orderbook (220px)
    //   row 1: sidebar | chart     | orderbook
    //   row 2: sidebar | form      | orderbook
    //   row 3: positions (all 3 cols)
    <div className="flex h-[calc(100vh-56px)] flex-col gap-1 overflow-hidden bg-[color:var(--terminal-deep)] p-1 md:grid md:grid-cols-[220px_1fr_220px] md:grid-rows-[1fr_auto_210px] md:gap-1.5 md:p-1.5">
      {/* ── Mobile-only: pair info bar ── */}
      <div className="flex items-center justify-between border-b border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)] px-3 py-2 md:hidden">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-[color:var(--terminal-border)]/30"
        >
          <span className="text-foreground text-sm font-semibold">
            {currentTicker.baseAsset}/{currentTicker.quoteAsset}
          </span>
          {activeTab === 'chart' && (
            <>
              <span className="text-foreground text-sm font-semibold">
                {formatCurrency(currentTicker.currentPrice)}
              </span>
              <span className={`text-xs font-medium ${textClass}`}>
                {isPositive ? '+' : ''}
                {formatPercentage(currentTicker.priceChangePercent)}
              </span>
              {isConnected && (
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              )}
            </>
          )}
          <svg
            className="h-3 w-3 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <span className="rounded bg-[color:var(--terminal-deep)] px-2 py-0.5 text-xs text-gray-400">
          DEMO
        </span>
      </div>

      {/* ── Mobile-only: tab bar ── */}
      <div className="flex shrink-0 border-b border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)] md:hidden">
        <button
          onClick={() => setActiveTab('trade')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'trade'
              ? 'text-foreground border-b-2 border-green-500'
              : 'hover:text-foreground text-gray-400'
          }`}
        >
          Trade
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chart'
              ? 'text-foreground border-b-2 border-green-500'
              : 'hover:text-foreground text-gray-400'
          }`}
        >
          Chart
        </button>
      </div>

      {/* ── Col 1: Assets Sidebar — spans rows 1+2 (desktop only) ── */}
      <div className="hidden overflow-hidden rounded-sm bg-[color:var(--terminal-panel)] md:row-span-2 md:block">
        <AssetsSidebar pairs={allPairs} selectedSymbol={symbol} onSelectPair={handleSelectPair} />
      </div>

      {/* ── Col 2 row 1: Chart ── */}
      <div
        className={`${
          activeTab === 'chart' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'
        } overflow-hidden rounded-sm bg-[color:var(--terminal-panel)] md:col-start-2 md:row-start-1 md:flex md:min-h-0 md:flex-col`}
      >
        <PairHeader
          tradingPair={currentTicker}
          isLive={isConnected}
          liveInterval={liveInterval}
          onOpenPicker={() => setPickerOpen(true)}
          latestOhlc={latestOhlc}
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          <BinanceCandlestickChart
            symbol={symbol}
            data={initialKlines}
            liveOhlcv={ohlcv}
            liveInterval={liveInterval}
            setLiveInterval={setLiveInterval}
            onOhlcChange={setHoveredOhlc}
            fillHeight
          />
        </div>
      </div>

      {/* ── Mobile Trade tab: form (55%) + orderbook (45%) side by side ── */}
      {/* ── Desktop: contents dissolve into grid ── */}
      <div
        className={`${
          activeTab === 'trade' ? 'flex' : 'hidden'
        } min-h-0 flex-1 gap-1 overflow-hidden md:contents`}
      >
        {/* Col 2 row 2: Trading Form */}
        <div className="custom-scrollbar w-[55%] overflow-y-auto rounded-sm bg-[color:var(--terminal-panel)] md:col-start-2 md:row-start-2 md:w-auto md:overflow-hidden">
          <TradingForm
            symbol={symbol}
            currentPrice={currentTicker.currentPrice}
            onTrade={handleTrade}
          />
        </div>

        {/* Col 3: Order Book — spans rows 1+2 */}
        <div className="flex-1 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)] md:col-start-3 md:row-span-2 md:row-start-1">
          <OrderBook
            symbol={symbol}
            orderBook={orderBook}
            currentPrice={currentTicker.currentPrice}
          />
        </div>
      </div>

      {/* ── Row 3: Positions Table — full width, all 3 cols ── */}
      <div className="h-[210px] shrink-0 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)] md:col-span-3 md:col-start-1 md:row-start-3 md:h-auto">
        <PositionsTable
          positions={positions}
          currentPrices={currentPrices}
          onClose={handleClosePosition}
        />
      </div>

      {/* ── Asset Picker Modal ── */}
      {pickerOpen && (
        <AssetPickerModal
          pairs={allPairs}
          selectedSymbol={symbol}
          onSelect={handleSelectPair}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};
