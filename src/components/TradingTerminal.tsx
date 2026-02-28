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

  const chart = (
    <BinanceCandlestickChart
      symbol={symbol}
      data={initialKlines}
      liveOhlcv={ohlcv}
      liveInterval={liveInterval}
      setLiveInterval={setLiveInterval}
      onOhlcChange={setHoveredOhlc}
      fillHeight
    />
  );

  const pairHeader = (
    <PairHeader
      tradingPair={currentTicker}
      isLive={isConnected}
      liveInterval={liveInterval}
      onOpenPicker={() => setPickerOpen(true)}
      latestOhlc={latestOhlc}
    />
  );

  return (
    <div className="overflow-x-hidden bg-[color:var(--terminal-deep)]">
      {/* ── Mobile header + tabs ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)] px-3 py-2 md:hidden">
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
      <div className="flex shrink-0 border-b border-[color:var(--terminal-border)] bg-[color:var(--terminal-panel)] md:hidden">
        {(['trade', 'chart'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-foreground border-b-2 border-green-500'
                : 'hover:text-foreground text-gray-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Mobile body ── */}
      <div className="md:hidden">
        {activeTab === 'chart' ? (
          <div className="flex h-[420px] flex-col rounded-sm bg-[color:var(--terminal-panel)]">
            {pairHeader}
            {chart}
          </div>
        ) : (
          <div className="flex gap-1">
            <div className="custom-scrollbar w-[55%] overflow-y-auto rounded-sm bg-[color:var(--terminal-panel)]">
              <TradingForm
                symbol={symbol}
                currentPrice={currentTicker.currentPrice}
                onTrade={handleTrade}
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
              <OrderBook
                symbol={symbol}
                orderBook={orderBook}
                currentPrice={currentTicker.currentPrice}
              />
            </div>
          </div>
        )}
        <div className="mt-1 h-[210px] overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
          <PositionsTable
            positions={positions}
            currentPrices={currentPrices}
            onClose={handleClosePosition}
          />
        </div>
      </div>

      {/* ── Desktop grid ──
          Mirrors alphaxle: grid-cols-5 grid-rows-6, h-full on grid
          Col1: sidebar row-span-4  | Col2-4: chart row-span-2 then form row-span-2 | Col5: orderbook row-span-4
          Row 5-6: positions col-span-5
          We use 3-col variant: sidebar(220) | chart(1fr) | orderbook(220)
          grid-rows: repeat(4, 1fr) for chart+form area, then positions
      ── */}
      {/* ── Desktop grid ──
          Reference (alphaxle): grid-template-rows: repeat(6, 15.25rem) — fixed 244px rows, natural scroll
          Our 3-col variant: sidebar(220px) | chart+form(1fr) | orderbook(220px)
          5 rows: rows 1-2=chart, rows 3-4=form, row 5=positions
          sidebar/orderbook span rows 1-4 with internal overflow-y-auto
      ── */}
      <div
        className="hidden w-full gap-2 p-2 md:grid md:grid-cols-[220px_minmax(0,1fr)_220px]"
        style={{ gridTemplateRows: 'repeat(4, 244px) 210px' }}
      >
        {/* Col 1: Sidebar — rows 1-4 (976px + 3 gaps) */}
        <div className="row-span-4 flex flex-col overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
          <AssetsSidebar pairs={allPairs} selectedSymbol={symbol} onSelectPair={handleSelectPair} />
        </div>

        {/* Col 2 rows 1-2: Chart (488px + 1 gap) */}
        <div className="row-span-2 flex flex-col overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
          {pairHeader}
          {chart}
        </div>

        {/* Col 3: Order Book — rows 1-4 (976px + 3 gaps) */}
        <div className="row-span-4 flex flex-col overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
          <OrderBook
            symbol={symbol}
            orderBook={orderBook}
            currentPrice={currentTicker.currentPrice}
          />
        </div>

        {/* Col 2 rows 3-4: Form (488px + 1 gap) */}
        <div className="row-span-2 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
          <TradingForm
            symbol={symbol}
            currentPrice={currentTicker.currentPrice}
            onTrade={handleTrade}
          />
        </div>

        {/* Row 5: Positions — full width */}
        <div className="col-span-3 overflow-hidden rounded-sm bg-[color:var(--terminal-panel)]">
          <PositionsTable
            positions={positions}
            currentPrices={currentPrices}
            onClose={handleClosePosition}
          />
        </div>
      </div>

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
