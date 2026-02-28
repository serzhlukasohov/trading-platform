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
      <h3 className="text-foreground mb-5 text-base font-semibold">News</h3>

      <div className="flex flex-1 items-center gap-2">
        <button
          onClick={prev}
          className="hover:text-foreground flex-shrink-0 rounded p-1 text-purple-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          {/* Image placeholder */}
          <div
            className={`h-44 w-full rounded-lg bg-gradient-to-br ${article.gradient} mb-3 flex items-center justify-center text-5xl`}
          >
            {article.emoji}
          </div>

          <p className="mb-1 text-sm leading-snug font-medium text-purple-400">{article.title}</p>
          <p className="text-xs text-purple-100">{article.date}</p>

          {/* Dots */}
          <div className="mt-3 flex gap-1.5">
            {MOCK_NEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-purple-400' : 'w-1.5 bg-purple-100/30'}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={next}
          className="hover:text-foreground flex-shrink-0 rounded p-1 text-purple-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
