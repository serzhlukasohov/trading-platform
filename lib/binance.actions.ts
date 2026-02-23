'use server';

import qs from 'query-string';

const BINANCE_BASE_URL = process.env.BINANCE_API_BASE_URL || 'https://api.binance.com/api/v3';

/**
 * Generic fetcher for Binance API
 * Binance public API doesn't require authentication for market data
 */
async function binanceFetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BINANCE_BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      `Binance API Error: ${response.status}: ${errorBody.msg || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Get exchange information - all trading pairs and their details
 * Use this to get list of all USDT trading pairs
 */
export async function getBinanceExchangeInfo(): Promise<{
  timezone: string;
  serverTime: number;
  symbols: BinanceSymbol[];
}> {
  return binanceFetcher('exchangeInfo', undefined, 300); // Cache for 5 minutes
}

/**
 * Get all USDT trading pairs (filtered and sorted by volume)
 */
export async function getBinanceUSDTPairs(): Promise<BinanceSymbol[]> {
  const exchangeInfo = await getBinanceExchangeInfo();

  return exchangeInfo.symbols.filter(
    (symbol) => symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING',
  );
}

/**
 * Get 24hr ticker price change statistics
 * @param symbol - Optional. If not provided, returns all symbols
 */
export async function get24hrTicker(): Promise<Binance24hrTicker[]>;
export async function get24hrTicker(symbol: string): Promise<Binance24hrTicker>;
export async function get24hrTicker(
  symbol?: string,
): Promise<Binance24hrTicker | Binance24hrTicker[]> {
  const params = symbol ? { symbol: symbol.toUpperCase() } : undefined;

  return binanceFetcher('ticker/24hr', params, 10); // Cache for 10 seconds (frequent updates)
}

/**
 * Get klines/candlestick data for a symbol
 * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
 * @param interval - Kline interval
 * @param limit - Number of candles to return (default: 500, max: 1000)
 * @param startTime - Optional start time in ms
 * @param endTime - Optional end time in ms
 */
export async function getBinanceKlines(
  symbol: string,
  interval: BinanceInterval,
  limit: number = 500,
  startTime?: number,
  endTime?: number,
): Promise<OHLCData[]> {
  const params: QueryParams = {
    symbol: symbol.toUpperCase(),
    interval,
    limit: Math.min(limit, 1000), // Binance max is 1000
  };

  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;

  const klines = await binanceFetcher<(string | number)[][]>('klines', params, 30); // Cache for 30 seconds

  // Convert Binance format to internal OHLCData format
  return klines.map((kline) => [
    Math.floor(kline[0] / 1000), // Convert ms to seconds
    parseFloat(kline[1]), // Open
    parseFloat(kline[2]), // High
    parseFloat(kline[3]), // Low
    parseFloat(kline[4]), // Close
  ]);
}

/**
 * Get current average price for a symbol
 */
export async function getBinanceAvgPrice(symbol: string): Promise<{ mins: number; price: string }> {
  return binanceFetcher('avgPrice', { symbol: symbol.toUpperCase() }, 10);
}

/**
 * Ping Binance server to check connectivity
 */
export async function pingBinance(): Promise<Record<string, never>> {
  return binanceFetcher('ping', undefined, 60);
}

/**
 * Get Binance server time
 */
export async function getBinanceServerTime(): Promise<{ serverTime: number }> {
  return binanceFetcher('time', undefined, 60);
}
