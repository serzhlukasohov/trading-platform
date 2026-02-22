'use client';

import { useEffect, useRef, useState } from 'react';
import { convertBinanceTicker } from '@/lib/utils';

interface UseBinanceWebSocketProps {
  symbol: string;
  streams: ('ticker' | 'kline' | 'depth')[];
  klineInterval?: BinanceInterval;
  enabled?: boolean;
}

interface UseBinanceWebSocketReturn {
  ticker: TradingPair | null;
  ohlcv: OHLCData | null;
  orderBook: OrderBook | null;
  isConnected: boolean;
}

// Throttle helper — only calls fn at most once per `ms`
function throttle<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn(...args);
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

export const useBinanceWebSocket = ({
  symbol,
  streams,
  klineInterval = '1m',
  enabled = true,
}: UseBinanceWebSocketProps): UseBinanceWebSocketReturn => {
  const [ticker, setTicker] = useState<TradingPair | null>(null);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // Mutable order book state — updated in-place, flushed to React on a throttled schedule
  const bidsMapRef = useRef<Map<number, number>>(new Map());
  const asksMapRef = useRef<Map<number, number>>(new Map());
  const snapshotLoadedRef = useRef(false);

  // Throttled setter: at most 4 renders/sec for order book (250ms)
  const flushOrderBookRef = useRef<((symbol: string, updateId: number) => void) | null>(null);

  useEffect(() => {
    flushOrderBookRef.current = throttle((sym: string, updateId: number) => {
      if (!isMountedRef.current) return;

      const bidsMap = bidsMapRef.current;
      const asksMap = asksMapRef.current;

      // Build sorted arrays from maps (top 20 levels only)
      const bids: OrderBookLevel[] = Array.from(bidsMap.entries())
        .filter(([, qty]) => qty > 0)
        .sort(([a], [b]) => b - a)
        .slice(0, 20)
        .reduce<{ levels: OrderBookLevel[]; total: number }>(
          (acc, [price, quantity]) => {
            acc.total += quantity;
            acc.levels.push({ price, quantity, total: acc.total });
            return acc;
          },
          { levels: [], total: 0 },
        ).levels;

      const asks: OrderBookLevel[] = Array.from(asksMap.entries())
        .filter(([, qty]) => qty > 0)
        .sort(([a], [b]) => a - b)
        .slice(0, 20)
        .reduce<{ levels: OrderBookLevel[]; total: number }>(
          (acc, [price, quantity]) => {
            acc.total += quantity;
            acc.levels.push({ price, quantity, total: acc.total });
            return acc;
          },
          { levels: [], total: 0 },
        ).levels;

      // Asks displayed high→low so reverse
      asks.reverse();

      setOrderBook({ symbol: sym, bids, asks, lastUpdateId: updateId });
    }, 250);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) return;

    // Reset order book state on reconnect
    bidsMapRef.current = new Map();
    asksMapRef.current = new Map();
    snapshotLoadedRef.current = false;

    const symbolLower = symbol.toLowerCase();

    const streamNames = streams
      .map((stream) => {
        if (stream === 'depth') return `${symbolLower}@depth@500ms`; // 500ms instead of 100ms
        if (stream === 'ticker') return `${symbolLower}@ticker`;
        if (stream === 'kline') return `${symbolLower}@kline_${klineInterval}`;
        return '';
      })
      .filter(Boolean);

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streamNames.join('/')}`;

    const cleanup = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };

    // Load REST snapshot to seed the order book
    const loadSnapshot = async () => {
      if (!streams.includes('depth')) return;
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`);
        const snap = await res.json();
        if (!isMountedRef.current) return;
        bidsMapRef.current = new Map(
          snap.bids.map(([p, q]: [string, string]) => [parseFloat(p), parseFloat(q)]),
        );
        asksMapRef.current = new Map(
          snap.asks.map(([p, q]: [string, string]) => [parseFloat(p), parseFloat(q)]),
        );
        snapshotLoadedRef.current = true;
        flushOrderBookRef.current?.(symbol, snap.lastUpdateId);
      } catch {
        snapshotLoadedRef.current = true; // proceed with diffs even if snapshot fails
      }
    };

    const connect = () => {
      if (!isMountedRef.current || !enabled) return;
      cleanup();

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) ws.close();
        }, 10000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          if (!isMountedRef.current) {
            ws.close();
            return;
          }
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          loadSnapshot();
        };

        ws.onmessage = (event) => {
          if (!isMountedRef.current) return;

          try {
            const message = JSON.parse(event.data) as { data?: unknown };
            const data = (message.data || message) as Record<string, unknown>;

            // Ticker
            if (data['e'] === '24hrTicker') {
              const d = data as BinanceTickerMessage;
              const tickerUpdate: Binance24hrTicker = {
                symbol: d.s,
                priceChange: d.p,
                priceChangePercent: d.P,
                weightedAvgPrice: d.w,
                prevClosePrice: d.x,
                lastPrice: d.c,
                lastQty: d.Q,
                bidPrice: d.b,
                bidQty: d.B,
                askPrice: d.a,
                askQty: d.A,
                openPrice: d.o,
                highPrice: d.h,
                lowPrice: d.l,
                volume: d.v,
                quoteVolume: d.q,
                openTime: d.O,
                closeTime: d.C,
                firstId: d.F,
                lastId: d.L,
                count: d.n,
              };
              setTicker(convertBinanceTicker(tickerUpdate));
            }

            // Kline
            if (data['e'] === 'kline') {
              const d = data as BinanceKlineMessage;
              const k = d.k;
              setOhlcv([
                k.t / 1000,
                parseFloat(k.o),
                parseFloat(k.h),
                parseFloat(k.l),
                parseFloat(k.c),
              ]);
            }

            // Depth diff — apply to maps, flush throttled
            if (data['e'] === 'depthUpdate') {
              if (!snapshotLoadedRef.current) return; // buffer until snapshot loaded
              const d = data as BinanceDepthMessage;
              for (const [p, q] of d.b) {
                const price = parseFloat(p);
                const qty = parseFloat(q);
                if (qty === 0) bidsMapRef.current.delete(price);
                else bidsMapRef.current.set(price, qty);
              }
              for (const [p, q] of d.a) {
                const price = parseFloat(p);
                const qty = parseFloat(q);
                if (qty === 0) asksMapRef.current.delete(price);
                else asksMapRef.current.set(price, qty);
              }
              flushOrderBookRef.current?.(d.s, d.u);
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.onerror = () => {
          if (isMountedRef.current) setIsConnected(false);
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          if (isMountedRef.current) setIsConnected(false);
          if (!isMountedRef.current || !enabled) return;
          if (event.code !== 1000 && event.code !== 1001) {
            const maxAttempts = 3;
            if (reconnectAttemptsRef.current < maxAttempts) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && enabled) {
                  reconnectAttemptsRef.current += 1;
                  connect();
                }
              }, delay);
            }
          }
        };
      } catch {
        setIsConnected(false);
      }
    };

    const initialTimeout = setTimeout(() => {
      if (isMountedRef.current && enabled) connect();
    }, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimeout);
      cleanup();
      setIsConnected(false);
    };
  }, [symbol, klineInterval, enabled]); // klineInterval added to deps

  return { ticker, ohlcv, orderBook, isConnected };
};
