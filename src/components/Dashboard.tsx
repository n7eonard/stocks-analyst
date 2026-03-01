"use client";

import { useState } from "react";
import { Header } from "./Header";
import { PortfolioSidebar } from "./PortfolioSidebar";
import { StockHeader } from "./StockHeader";
import { AnalysisPanel } from "./AnalysisPanel";
import { OnboardingQuiz, OnboardingResults } from "./OnboardingQuiz";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAnalysis } from "@/hooks/useAnalysis";

export function Dashboard() {
  const portfolio = usePortfolio();
  const onboarding = useOnboarding();
  const analysis = useAnalysis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, answerId: string) => {
    onboarding.answerQuestion(questionId, answerId);
    if (onboarding.currentStep >= onboarding.totalQuestions - 1) {
      setShowResults(true);
    }
  };

  const handleRunAnalysis = () => {
    if (!portfolio.selectedTicker) return;
    analysis.runAnalysis(portfolio.selectedTicker);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onRetakeQuiz={onboarding.reopenQuiz}
      />

      <div className="flex-1 flex overflow-hidden">
        <PortfolioSidebar
          stocks={portfolio.stocks}
          selectedTicker={portfolio.selectedTicker}
          onSelect={portfolio.selectStock}
          onAdd={portfolio.addStock}
          onRemove={portfolio.removeStock}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {portfolio.selectedTicker ? (
            <div>
              <StockHeader ticker={portfolio.selectedTicker} />
              <AnalysisPanel
                ticker={portfolio.selectedTicker}
                results={analysis.getTickerResults(
                  portfolio.selectedTicker
                )}
                recommendedAnalysts={onboarding.recommendedAnalysts}
                isAnalyzing={analysis.isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
                onCancelAnalysis={analysis.cancelAnalysis}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center px-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">
                  Select a stock to analyze
                </h3>
                <p className="text-text-secondary max-w-md">
                  Add stocks to your portfolio using the sidebar, then
                  select one to run comprehensive Wall Street-style
                  analyses.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <OnboardingQuiz
        isOpen={onboarding.isOpen && !onboarding.isComplete}
        currentStep={onboarding.currentStep}
        totalQuestions={onboarding.totalQuestions}
        currentQuestion={onboarding.currentQuestion}
        onAnswer={handleAnswer}
        onSkip={onboarding.skipOnboarding}
        recommendedAnalysts={onboarding.recommendedAnalysts}
        isComplete={onboarding.isComplete}
      />

      {showResults && onboarding.recommendedAnalysts.length > 0 && (
        <OnboardingResults
          recommendedAnalysts={onboarding.recommendedAnalysts}
          onStart={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
