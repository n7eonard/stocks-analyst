"use client";

export function EmptyPortfolio() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center px-6 max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
            <path d="M16 6v20M6 16h20" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-text-primary">
          Build your portfolio
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Search and add stocks to your portfolio to get started with Wall Street-grade analysis.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-text-tertiary bg-surface-secondary px-3 py-1.5 rounded-full">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 3v8M3 7h8" strokeLinecap="round" />
          </svg>
          Use the search bar in the sidebar
        </div>
      </div>
    </div>
  );
}

export function EmptyAnalysis({ ticker }: { ticker: string }) {
  return (
    <div className="p-8 text-center">
      <div className="w-14 h-14 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-text-primary">
        Ready to analyze {ticker}
      </h3>
      <p className="text-sm text-text-secondary max-w-md mx-auto">
        Click &ldquo;Run Full Analysis&rdquo; to get comprehensive insights from 10 Wall Street analyst perspectives.
      </p>
    </div>
  );
}

export function AnalysisLoading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-secondary" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-surface-secondary rounded" />
          <div className="h-3 w-24 bg-surface-secondary rounded" />
        </div>
      </div>
      <div className="space-y-3 pt-4">
        <div className="h-3 w-full bg-surface-secondary rounded" />
        <div className="h-3 w-5/6 bg-surface-secondary rounded" />
        <div className="h-3 w-4/6 bg-surface-secondary rounded" />
        <div className="h-3 w-full bg-surface-secondary rounded" />
        <div className="h-3 w-3/4 bg-surface-secondary rounded" />
      </div>
      <div className="space-y-3 pt-4">
        <div className="h-4 w-48 bg-surface-secondary rounded" />
        <div className="h-3 w-full bg-surface-secondary rounded" />
        <div className="h-3 w-5/6 bg-surface-secondary rounded" />
      </div>
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-card flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 text-loss mt-0.5">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-loss">Something went wrong</p>
        <p className="text-sm text-text-secondary mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-sm font-medium text-accent hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
