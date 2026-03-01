"use client";

import { useState, useCallback } from "react";
import { PortfolioStock } from "@/types";
import { tickers } from "@/data/tickers";

const STORAGE_KEY = "wsa-portfolio";

export function usePortfolio() {
  const [stocks, setStocks] = useState<PortfolioStock[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const addStock = useCallback((ticker: string) => {
    setStocks((prev) => {
      if (prev.some((s) => s.ticker === ticker)) return prev;
      const info = tickers.find((t) => t.symbol === ticker);
      const newStocks = [
        ...prev,
        {
          ticker,
          name: info?.name || ticker,
          addedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStocks));
      return newStocks;
    });
  }, []);

  const removeStock = useCallback(
    (ticker: string) => {
      setStocks((prev) => {
        const newStocks = prev.filter((s) => s.ticker !== ticker);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStocks));
        return newStocks;
      });
      if (selectedTicker === ticker) setSelectedTicker(null);
    },
    [selectedTicker]
  );

  const selectStock = useCallback((ticker: string) => {
    setSelectedTicker(ticker);
  }, []);

  return {
    stocks,
    selectedTicker,
    addStock,
    removeStock,
    selectStock,
  };
}
