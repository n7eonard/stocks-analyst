"use client";

import { tickers } from "@/data/tickers";

interface StockHeaderProps {
  ticker: string;
}

export function StockHeader({ ticker }: StockHeaderProps) {
  const info = tickers.find((t) => t.symbol === ticker);

  return (
    <div className="p-6 border-b border-border-light">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{ticker}</h2>
          <p className="text-text-secondary">
            {info?.name || ticker}
          </p>
          {info && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-surface-secondary rounded-full text-text-tertiary">
              {info.sector}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
