"use client";

import { QuizQuestion } from "@/data/onboarding";
import { analysts } from "@/data/analysts";

interface OnboardingQuizProps {
  isOpen: boolean;
  currentStep: number;
  totalQuestions: number;
  currentQuestion: QuizQuestion | null;
  onAnswer: (questionId: string, answerId: string) => void;
  onSkip: () => void;
  recommendedAnalysts: string[];
  isComplete: boolean;
}

export function OnboardingQuiz({
  isOpen,
  currentStep,
  totalQuestions,
  currentQuestion,
  onAnswer,
  onSkip,
}: OnboardingQuizProps) {
  if (!isOpen || !currentQuestion) return null;

  const progress = ((currentStep + 1) / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-accent"
            >
              <rect width="28" height="28" rx="6" fill="currentColor" />
              <path
                d="M7 14L12 19L21 9"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-semibold text-text-primary">
              Wall Street Analyzer
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-sm text-text-tertiary hover:text-text-secondary transition-all duration-200"
          >
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface-secondary rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question counter */}
        <p className="text-sm text-text-tertiary mb-2">
          Question {currentStep + 1} of {totalQuestions}
        </p>

        {/* Question title and subtitle */}
        <h2 className="text-2xl font-bold text-text-primary mb-1">
          {currentQuestion.question}
        </h2>
        <p className="text-text-secondary mb-8">{currentQuestion.subtitle}</p>

        {/* Option cards */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(currentQuestion.id, option.id)}
              className="w-full text-left p-5 bg-white border border-border-light rounded-card shadow-card hover:border-accent hover:shadow-card-hover transition-all duration-200"
            >
              <span className="block font-semibold text-text-primary mb-1">
                {option.label}
              </span>
              <span className="block text-sm text-text-secondary">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface OnboardingResultsProps {
  recommendedAnalysts: string[];
  onStart: () => void;
}

export function OnboardingResults({
  recommendedAnalysts,
  onStart,
}: OnboardingResultsProps) {
  const recommended = recommendedAnalysts
    .map((key) => analysts.find((a) => a.key === key))
    .filter(Boolean);

  if (recommended.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Your recommended analysts
        </h2>
        <p className="text-text-secondary mb-8">
          Based on your answers, these analyst frameworks are the best fit for
          your investment style. You can always change these later.
        </p>

        {/* Recommended analysts list */}
        <div className="flex flex-col gap-3 mb-8">
          {recommended.map((analyst) => {
            if (!analyst) return null;
            return (
              <div
                key={analyst.key}
                className="flex items-start gap-4 p-4 bg-surface-secondary rounded-card"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white text-lg shadow-card">
                  {analyst.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-text-primary">
                      {analyst.name}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {analyst.focus}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {analyst.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-3 bg-accent text-white font-semibold rounded-card hover:opacity-90 transition-all duration-200"
        >
          Start Analyzing
        </button>
      </div>
    </div>
  );
}
