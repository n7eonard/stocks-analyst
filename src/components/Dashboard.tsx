"use client";

import { useState } from "react";
import { Header } from "./Header";
import { PortfolioSidebar } from "./PortfolioSidebar";
import { StockHeader } from "./StockHeader";
import { OnboardingQuiz, OnboardingResults } from "./OnboardingQuiz";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useOnboarding } from "@/hooks/useOnboarding";

export function Dashboard() {
  const portfolio = usePortfolio();
  const onboarding = useOnboarding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Show results screen when quiz just completed
  const handleAnswer = (questionId: string, answerId: string) => {
    onboarding.answerQuestion(questionId, answerId);
    // Check if this was the last question (after state update)
    if (onboarding.currentStep >= onboarding.totalQuestions - 1) {
      setShowResults(true);
    }
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {portfolio.selectedTicker ? (
            <div>
              <StockHeader ticker={portfolio.selectedTicker} />
              {/* Analysis area placeholder - Task 8 */}
              <div className="p-6">
                <button className="px-6 py-3 bg-accent text-white rounded-card font-semibold hover:bg-gray-800 transition-colors">
                  Run Full Analysis
                </button>
                <p className="mt-4 text-sm text-text-tertiary">
                  Analysis results will appear here
                </p>
              </div>
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

      {/* Onboarding overlays */}
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
