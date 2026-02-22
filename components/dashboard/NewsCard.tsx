'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Bitcoin Breaks Key Resistance as Institutional Demand Surges',
    date: 'February 22, 2026',
    gradient: 'from-orange-600/40 to-yellow-900/40',
    emoji: '₿',
  },
  {
    id: 2,
    title: 'Ethereum Layer 2 Solutions See Record Transaction Volume',
    date: 'February 21, 2026',
    gradient: 'from-blue-600/40 to-indigo-900/40',
    emoji: 'Ξ',
  },
  {
    id: 3,
    title: 'SEC Approves New Crypto ETF Products for Retail Investors',
    date: 'February 20, 2026',
    gradient: 'from-purple-600/40 to-purple-900/40',
    emoji: '⚖',
  },
  {
    id: 4,
    title: 'Binance Reports $50B Daily Trading Volume Milestone',
    date: 'February 19, 2026',
    gradient: 'from-yellow-600/40 to-orange-900/40',
    emoji: '📈',
  },
];

export const NewsCard = () => {
  const [idx, setIdx] = useState(0);
  const article = MOCK_NEWS[idx];

  const prev = () => setIdx((i) => (i - 1 + MOCK_NEWS.length) % MOCK_NEWS.length);
  const next = () => setIdx((i) => (i + 1) % MOCK_NEWS.length);

  return (
    <div className="dashboard-card flex flex-col">
      <h3 className="text-base font-semibold text-foreground mb-5">News</h3>

      <div className="flex flex-1 items-center gap-2">
        <button onClick={prev} className="flex-shrink-0 p-1 rounded text-purple-100 hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Image placeholder */}
          <div className={`w-full h-44 rounded-lg bg-gradient-to-br ${article.gradient} flex items-center justify-center text-5xl mb-3`}>
            {article.emoji}
          </div>

          <p className="text-sm font-medium text-purple-400 leading-snug mb-1">
            {article.title}
          </p>
          <p className="text-xs text-purple-100">{article.date}</p>

          {/* Dots */}
          <div className="flex gap-1.5 mt-3">
            {MOCK_NEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-purple-400' : 'w-1.5 bg-purple-100/30'}`}
              />
            ))}
          </div>
        </div>

        <button onClick={next} className="flex-shrink-0 p-1 rounded text-purple-100 hover:text-foreground transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
