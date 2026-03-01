"use client";

import { PortfolioStock } from "@/types";
import { TickerSearch } from "./TickerSearch";

interface PortfolioSidebarProps {
  stocks: PortfolioStock[];
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  onAdd: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function PortfolioSidebar({
  stocks,
  selectedTicker,
  onSelect,
  onAdd,
  onRemove,
  isMobileOpen = false,
  onMobileClose,
}: PortfolioSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-border-light
          flex flex-col h-full
          transform transition-transform duration-200
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-text-secondary uppercase tracking-wider">
              My Portfolio
            </h2>
            <span className="text-xs text-text-tertiary">
              {stocks.length} stocks
            </span>
          </div>
          <TickerSearch onSelect={onAdd} placeholder="Add a stock..." />
        </div>

        {/* Stock list */}
        <div className="flex-1 overflow-y-auto">
          {stocks.length === 0 ? (
            <div className="p-4 text-center text-sm text-text-tertiary">
              <p className="mb-2">No stocks yet</p>
              <p>Search above to add your first stock</p>
            </div>
          ) : (
            <div className="py-1">
              {stocks.map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => {
                    onSelect(stock.ticker);
                    onMobileClose?.();
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-surface-secondary transition-colors group ${
                    selectedTicker === stock.ticker
                      ? "bg-surface-secondary border-l-2 border-accent"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {stock.ticker}
                    </div>
                    <div className="text-xs text-text-tertiary truncate max-w-[140px]">
                      {stock.name}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(stock.ticker);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-loss text-xs transition-opacity p-1"
                    title="Remove"
                  >
                    &times;
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
