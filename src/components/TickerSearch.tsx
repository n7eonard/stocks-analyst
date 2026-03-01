"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { searchTickers, TickerInfo } from "@/data/tickers";

interface TickerSearchProps {
  onSelect: (ticker: string) => void;
  placeholder?: string;
  className?: string;
}

export function TickerSearch({
  onSelect,
  placeholder = "Search ticker or company...",
  className = "",
}: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive results synchronously from query — no useEffect needed
  const results: TickerInfo[] = useMemo(
    () => (query.length > 0 ? searchTickers(query) : []),
    [query]
  );

  function handleQueryChange(newQuery: string) {
    setQuery(newQuery);
    setIsOpen(newQuery.length > 0);
    setHighlightedIndex(0);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(ticker: string) {
    onSelect(ticker);
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[highlightedIndex].symbol);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-border-light rounded-card bg-surface-primary focus:outline-none focus:border-accent transition-colors"
      />
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-light rounded-card shadow-card-hover z-10 max-h-60 overflow-y-auto"
        >
          {results.map((ticker, i) => (
            <button
              key={ticker.symbol}
              onClick={() => handleSelect(ticker.symbol)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-surface-secondary transition-colors ${
                i === highlightedIndex ? "bg-surface-secondary" : ""
              }`}
            >
              <div>
                <span className="font-semibold">{ticker.symbol}</span>
                <span className="text-text-secondary ml-2">
                  {ticker.name}
                </span>
              </div>
              <span className="text-xs text-text-tertiary">
                {ticker.sector}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
