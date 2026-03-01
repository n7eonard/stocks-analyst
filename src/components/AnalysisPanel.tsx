"use client";

import { useState } from "react";
import { AnalystTabs } from "./AnalystTabs";
import { AnalysisContent } from "./AnalysisContent";
import { AnalysisResult } from "@/types";
import { analysts } from "@/data/analysts";

interface AnalysisPanelProps {
  ticker: string;
  results: Record<string, AnalysisResult>;
  recommendedAnalysts: string[];
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onCancelAnalysis: () => void;
}

export function AnalysisPanel({
  ticker,
  results,
  recommendedAnalysts,
  isAnalyzing,
  onRunAnalysis,
  onCancelAnalysis,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState(() => {
    // Default to first recommended analyst, or first analyst
    return recommendedAnalysts[0] || analysts[0].key;
  });

  const hasAnyResults = Object.values(results).some(
    (r) => r.status !== "pending"
  );

  return (
    <div>
      {/* Action bar */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-border-light">
        {isAnalyzing ? (
          <button
            onClick={onCancelAnalysis}
            className="px-5 py-2.5 bg-loss text-white rounded-card text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Cancel Analysis
          </button>
        ) : (
          <button
            onClick={onRunAnalysis}
            className="px-5 py-2.5 bg-accent text-white rounded-card text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Run Full Analysis
          </button>
        )}

        {isAnalyzing && (
          <span className="text-sm text-text-secondary">
            Analyzing {ticker} with{" "}
            {Object.values(results).filter(
              (r) => r.status === "streaming"
            ).length}{" "}
            active analysts...
          </span>
        )}

        {!isAnalyzing && hasAnyResults && (
          <span className="text-sm text-text-tertiary">
            {Object.values(results).filter((r) => r.status === "complete")
              .length}{" "}
            of {analysts.length} analyses complete
          </span>
        )}
      </div>

      {/* Tabs */}
      <AnalystTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recommendedAnalysts={recommendedAnalysts}
        results={results}
      />

      {/* Content */}
      <AnalysisContent
        analystKey={activeTab}
        result={results[activeTab]}
      />
    </div>
  );
}
