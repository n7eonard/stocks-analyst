"use client";

import { useState, useCallback } from "react";
import { quizQuestions, calculateRecommendations } from "@/data/onboarding";

const STORAGE_KEY = "wsa-onboarding-profile";

export interface OnboardingState {
  isComplete: boolean;
  isOpen: boolean;
  currentStep: number;
  answers: Record<string, string>;
  recommendedAnalysts: string[];
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === "undefined") {
      return {
        isComplete: false,
        isOpen: false,
        currentStep: 0,
        answers: {},
        recommendedAnalysts: [],
      };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isOpen: false };
    }
    return {
      isComplete: false,
      isOpen: true,
      currentStep: 0,
      answers: {},
      recommendedAnalysts: [],
    };
  });

  const answerQuestion = useCallback(
    (questionId: string, answerId: string) => {
      setState((prev) => {
        const newAnswers = { ...prev.answers, [questionId]: answerId };
        const isLastQuestion =
          prev.currentStep >= quizQuestions.length - 1;

        if (isLastQuestion) {
          const recommended = calculateRecommendations(newAnswers);
          const newState = {
            isComplete: true,
            isOpen: false,
            currentStep: prev.currentStep,
            answers: newAnswers,
            recommendedAnalysts: recommended,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          return newState;
        }

        return {
          ...prev,
          currentStep: prev.currentStep + 1,
          answers: newAnswers,
        };
      });
    },
    []
  );

  const skipOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      isComplete: true,
      isOpen: false,
      currentStep: 0,
      answers: {},
      recommendedAnalysts: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setState(newState);
  }, []);

  const reopenQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      currentStep: 0,
      answers: {},
      isComplete: false,
    }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const openQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    answerQuestion,
    skipOnboarding,
    reopenQuiz,
    openQuiz,
    closeQuiz,
    totalQuestions: quizQuestions.length,
    currentQuestion: quizQuestions[state.currentStep] || null,
  };
}
