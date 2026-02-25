/**
 * Mock Data Generators for Trading Terminal
 */

export const generateMockOrderBook = (currentPrice: number): OrderBook => {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  // Generate 20 bids (below current price)
  let totalBids = 0;
  for (let i = 0; i < 20; i++) {
    const priceOffset = (i + 1) * (currentPrice * 0.0001); // 0.01% steps
    const price = currentPrice - priceOffset;
    const quantity = Math.random() * 10 + 0.5; // Random quantity 0.5-10.5
    totalBids += quantity;

    bids.push({
      price: parseFloat(price.toFixed(2)),
      quantity: parseFloat(quantity.toFixed(4)),
      total: parseFloat(totalBids.toFixed(4)),
    });
  }

  // Generate 20 asks (above current price)
  let totalAsks = 0;
  for (let i = 0; i < 20; i++) {
    const priceOffset = (i + 1) * (currentPrice * 0.0001); // 0.01% steps
    const price = currentPrice + priceOffset;
    const quantity = Math.random() * 10 + 0.5; // Random quantity 0.5-10.5
    totalAsks += quantity;

    asks.push({
      price: parseFloat(price.toFixed(2)),
      quantity: parseFloat(quantity.toFixed(4)),
      total: parseFloat(totalAsks.toFixed(4)),
    });
  }

  // Reverse asks so highest price is first
  asks.reverse();

  return {
    symbol: 'BTCUSDT',
    bids,
    asks,
    lastUpdateId: Date.now(),
  };
};

export const generateMockPositions = (): Position[] => {
  const now = Date.now();

  return [
    {
      id: '1',
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'limit',
      volume: 0.05,
      invested: 3200,
      openingPrice: 64000,
      currentPrice: 67000,
      takeProfit: 70000,
      stopLoss: 62000,
      pnl: 150,
      pnlPercent: 4.69,
      status: 'open',
      openTime: now - 3600000 * 24, // 1 day ago
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      side: 'buy',
      type: 'market',
      volume: 2,
      invested: 6400,
      openingPrice: 3200,
      currentPrice: 3150,
      stopLoss: 3000,
      pnl: -100,
      pnlPercent: -1.56,
      status: 'open',
      openTime: now - 3600000 * 12, // 12 hours ago
    },
    {
      id: '3',
      symbol: 'ADAUSDT',
      side: 'sell',
      type: 'limit',
      volume: 1000,
      invested: 450,
      openingPrice: 0.45,
      currentPrice: 0.43,
      takeProfit: 0.4,
      pnl: 20,
      pnlPercent: 4.44,
      status: 'open',
      openTime: now - 3600000 * 6, // 6 hours ago
    },
  ];
};
