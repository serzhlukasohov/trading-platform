'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface TradingFormProps {
  symbol: string;
  currentPrice: number;
  onTrade: (formData: TradeFormData) => void;
}

export const TradingForm = ({ symbol, currentPrice, onTrade }: TradingFormProps) => {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [showTPSL, setShowTPSL] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [sizePercent, setSizePercent] = useState(0);

  const availableBalance = 3474;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseInt(e.target.value);
    setSizePercent(pct);
    const amount = (availableBalance * pct) / 100 / currentPrice;
    setSize(pct === 0 ? '' : amount.toFixed(6));
  };

  const handleTrade = (side: OrderSide) => {
    const sizeNum = parseFloat(size);
    if (!size || sizeNum <= 0) {
      toast.error('Please enter a valid size');
      return;
    }

    onTrade({
      orderType,
      side,
      price: currentPrice,
      size: sizeNum,
      leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });

    setSize('');
    setSizePercent(0);
    setStopLoss('');
    setTakeProfit('');
    setShowTPSL(false);

    toast.success(
      `${side === 'buy' ? 'Buy' : 'Sell'} order placed: ${sizeNum} ${symbol.replace('USDT', '')} @ ${formatCurrency(currentPrice)}`,
    );
  };

  const inputCls =
    'w-full rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] px-2.5 py-1 text-sm text-foreground placeholder-gray-500 focus:border-purple-500 focus:outline-none';

  const selectCls =
    'w-full rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] px-2.5 py-1 text-sm text-foreground focus:border-purple-500 focus:outline-none cursor-pointer';

  return (
    <div className="flex flex-col gap-1.5 bg-[color:var(--terminal-panel)] px-3 py-2">
      {/* Market / Limit tabs — underline style */}
      <div className="flex border-b border-[color:var(--terminal-border)]">
        {(['market', 'limit'] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`px-3 pb-1.5 text-sm font-medium capitalize transition-colors ${
              orderType === t
                ? 'border-b-2 border-purple-500 text-foreground'
                : 'text-gray-400 hover:text-foreground'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Account + Available balance — single row */}
      <div className="flex items-center justify-between">
        <select className="rounded border border-[color:var(--terminal-border)] bg-[color:var(--terminal-deep)] px-2 py-0.5 text-xs text-gray-400 focus:outline-none cursor-pointer">
          <option>DEMO</option>
        </select>
        <span className="text-xs text-gray-400">
          Avail: <span className="font-medium text-foreground">{formatCurrency(availableBalance)}</span>
        </span>
      </div>

      {/* Position Mode + Leverage side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-0.5 block text-[10px] text-gray-500">Position Mode</label>
          <select className={selectCls}>
            <option>USD</option>
            <option>Coin</option>
          </select>
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] text-gray-500">Leverage</label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className={selectCls}
          >
            {[1, 2, 5, 10, 20, 50, 100].map((lev) => (
              <option key={lev} value={lev}>
                {lev}:1
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Size input + TP/SL checkbox on same row */}
      <div>
        <div className="mb-0.5 flex items-center justify-between">
          <label className="text-[10px] text-gray-500">Size ({symbol.replace('USDT', '')})</label>
          <button
            onClick={() => setShowTPSL(!showTPSL)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-foreground"
          >
            <span
              className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors ${
                showTPSL
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-[color:var(--terminal-border)]'
              }`}
            >
              {showTPSL && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            TP/SL
          </button>
        </div>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="0"
          className={inputCls}
        />
      </div>

      {/* TP/SL inputs */}
      {showTPSL && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-0.5 block text-[10px] text-gray-500">Take Profit</label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={formatCurrency(currentPrice * 1.05)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] text-gray-500">Stop Loss</label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={formatCurrency(currentPrice * 0.95)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Percentage slider */}
      <div>
        <input
          type="range"
          min="0"
          max="100"
          step="25"
          value={sizePercent}
          onChange={handleSliderChange}
          className="pct-slider"
        />
        <div className="pct-slider-labels">
          {[0, 25, 50, 75, 100].map((pct) => (
            <span key={pct} className={`text-[10px] ${sizePercent === pct ? 'text-purple-400 font-semibold' : 'text-gray-500'}`}>
              {pct}%
            </span>
          ))}
        </div>
      </div>

      {/* Buy + Sell */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleTrade('buy')}
          className="rounded py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-400 transition-colors active:scale-95"
        >
          Buy
        </button>
        <button
          onClick={() => handleTrade('sell')}
          className="rounded py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-400 transition-colors active:scale-95"
        >
          Sell
        </button>
      </div>
    </div>
  );
};
