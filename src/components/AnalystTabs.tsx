"use client";

import { analysts } from "@/data/analysts";
import { AnalysisResult } from "@/types";

interface AnalystTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  recommendedAnalysts: string[];
  results: Record<string, AnalysisResult>;
}

export function AnalystTabs({
  activeTab,
  onTabChange,
  recommendedAnalysts,
  results,
}: AnalystTabsProps) {
  // Sort analysts: recommended first, then rest
  const sortedAnalysts = [...analysts].sort((a, b) => {
    const aRec = recommendedAnalysts.includes(a.key) ? 0 : 1;
    const bRec = recommendedAnalysts.includes(b.key) ? 0 : 1;
    return aRec - bRec;
  });

  return (
    <div className="relative border-b border-border-light">
      {/* Right fade indicator for scroll */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 lg:hidden" />

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {sortedAnalysts.map((analyst) => {
            const result = results[analyst.key];
            const isActive = activeTab === analyst.key;
            const isRecommended = recommendedAnalysts.includes(analyst.key);

            return (
              <button
                key={analyst.key}
                onClick={() => onTabChange(analyst.key)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-accent text-accent font-semibold"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                <span>{analyst.icon}</span>
                <span className="hidden sm:inline">{analyst.shortName}</span>

                {/* Status indicator */}
                {result?.status === "streaming" && (
                  <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
                )}
                {result?.status === "complete" && (
                  <span className="w-2 h-2 rounded-full bg-gain" />
                )}
                {result?.status === "error" && (
                  <span className="w-2 h-2 rounded-full bg-loss" />
                )}

                {/* Recommended badge */}
                {isRecommended && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
