/**
 * Test script for Binance API integration
 * Run with: npx tsx scripts/test-binance.ts
 */

import {
  getBinanceExchangeInfo,
  get24hrTicker,
  getBinanceKlines,
  getBinanceUSDTPairs,
} from '../lib/binance.actions';

async function testBinanceIntegration() {
  console.log('🚀 Testing Binance API Integration...\n');

  try {
    // Test 1: Exchange Info
    console.log('1️⃣  Testing Exchange Info...');
    const exchangeInfo = await getBinanceExchangeInfo();
    console.log(`   ✅ Found ${exchangeInfo.symbols.length} trading symbols`);
    console.log(`   ✅ Server timezone: ${exchangeInfo.timezone}\n`);

    // Test 2: USDT Pairs
    console.log('2️⃣  Testing USDT Pairs Filter...');
    const usdtPairs = await getBinanceUSDTPairs();
    console.log(`   ✅ Found ${usdtPairs.length} USDT trading pairs`);
    console.log(
      `   ✅ First 5 pairs: ${usdtPairs
        .slice(0, 5)
        .map((s) => s.symbol)
        .join(', ')}\n`,
    );

    // Test 3: 24hr Ticker (Single Symbol)
    console.log('3️⃣  Testing 24hr Ticker (BTCUSDT)...');
    const btcTicker = await get24hrTicker('BTCUSDT');
    console.log(`   ✅ BTC Price: $${parseFloat(btcTicker.lastPrice).toLocaleString()}`);
    console.log(`   ✅ 24h Change: ${btcTicker.priceChangePercent}%`);
    console.log(`   ✅ 24h Volume: ${parseFloat(btcTicker.volume).toLocaleString()} BTC\n`);

    // Test 4: 24hr Ticker (All Symbols)
    console.log('4️⃣  Testing 24hr Ticker (All Symbols)...');
    const allTickers = await get24hrTicker();
    console.log(`   ✅ Received ${allTickers.length} ticker updates\n`);

    // Test 5: Klines/Candlestick Data
    console.log('5️⃣  Testing Klines/Candlestick Data (BTCUSDT, 1h, 24 candles)...');
    const klines = await getBinanceKlines('BTCUSDT', '1h', 24);
    console.log(`   ✅ Received ${klines.length} candles`);
    if (klines.length > 0) {
      const lastCandle = klines[klines.length - 1];
      console.log(`   ✅ Latest candle:`);
      console.log(`      - Time: ${new Date(lastCandle[0] * 1000).toISOString()}`);
      console.log(`      - Open: $${lastCandle[1].toLocaleString()}`);
      console.log(`      - High: $${lastCandle[2].toLocaleString()}`);
      console.log(`      - Low: $${lastCandle[3].toLocaleString()}`);
      console.log(`      - Close: $${lastCandle[4].toLocaleString()}\n`);
    }

    console.log('✅ All tests passed! Binance integration is working correctly.\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBinanceIntegration();
