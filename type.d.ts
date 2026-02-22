// ========================================
// Core Types
// ========================================

type OHLCData = [number, number, number, number, number];

type Period = 'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'yearly' | 'max';

interface NextPageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ========================================
// Binance Types
// ========================================

// Binance Trading Symbol
interface BinanceSymbol {
  symbol: string; // e.g., "BTCUSDT"
  status: string; // "TRADING", "BREAK", etc.
  baseAsset: string; // e.g., "BTC"
  quoteAsset: string; // e.g., "USDT"
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  quotePrecision: number;
  baseCommissionPrecision: number;
  quoteCommissionPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  quoteOrderQtyMarketAllowed: boolean;
  allowTrailingStop: boolean;
  cancelReplaceAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
}

// Binance 24hr Ticker
interface Binance24hrTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number; // Number of trades
}

// Binance Kline Intervals
type BinanceInterval =
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '6h'
  | '8h'
  | '12h'
  | '1d'
  | '3d'
  | '1w'
  | '1M';

// Binance WebSocket Ticker Message
interface BinanceTickerMessage {
  e: '24hrTicker';
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // Previous close price
  c: string; // Current close price
  Q: string; // Close quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Base volume
  q: string; // Quote volume
  O: number; // Open time
  C: number; // Close time
  F: number; // First trade ID
  L: number; // Last trade ID
  n: number; // Number of trades
}

// Binance WebSocket Kline Message
interface BinanceKlineMessage {
  e: 'kline';
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is candle closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base volume
    Q: string; // Taker buy quote volume
    B: string; // Ignore
  };
}

// Combined display data (for UI)
interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
  quoteVolume24h: number;
  high24h: number;
  low24h: number;
  trades24h: number;
}

// ========================================
// Component Props
// ========================================

interface DataTableColumn<T> {
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => React.Key;
  tableClassName?: string;
  headerClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
}

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

type PaginationLinkProps = {
  isActive?: boolean;
  size?: ButtonSize;
} & React.ComponentProps<'a'>;

interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMorePages: boolean;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

// ========================================
// Trading Terminal Types
// ========================================

// Order Book Types
interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number; // Cumulative sum
}

interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[]; // Buy orders (green)
  asks: OrderBookLevel[]; // Sell orders (red)
  lastUpdateId: number;
}

// Trading Form Types
type OrderType = 'market' | 'limit';
type OrderSide = 'buy' | 'sell';

interface TradeFormData {
  orderType: OrderType;
  side: OrderSide;
  price: number;
  size: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}

// Position Types
type PositionStatus = 'open' | 'pending' | 'closed';

interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  volume: number;
  invested: number;
  openingPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  status: PositionStatus;
  openTime: number;
  closeTime?: number;
}

// Binance Order Book WebSocket Message
interface BinanceDepthMessage {
  e: 'depthUpdate';
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID
  u: number; // Final update ID
  b: [string, string][]; // Bids [[price, quantity], ...]
  a: [string, string][]; // Asks [[price, quantity], ...]
}
