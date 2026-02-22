import React from 'react';
import { get24hrTicker, getBinanceKlines } from '@/lib/binance.actions';
import { formatCurrency, convertBinanceTicker } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import BinanceChart from './BinanceChart';

const CoinOverview = async () => {
  try {
    const [ticker, klines] = await Promise.all([
      get24hrTicker('BTCUSDT'),
      getBinanceKlines('BTCUSDT', '15m', 96), // 24h with 15min candles
    ]);

    const tradingPair = convertBinanceTicker(ticker);

    return (
      <div id="coin-overview">
        <BinanceChart symbol="BTCUSDT" initialKlines={klines}>
          <div className="header pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/20 text-2xl font-bold text-orange-400">
              ₿
            </div>
            <div className="info">
              <p>Bitcoin / USDT</p>
              <h1>{formatCurrency(tradingPair.currentPrice)}</h1>
            </div>
          </div>
        </BinanceChart>
      </div>
    );
  } catch (error) {
    console.error('Error fetching Bitcoin overview:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
