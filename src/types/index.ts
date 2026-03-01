export interface Analyst {
  key: string;
  name: string;
  shortName: string;
  icon: string;
  focus: string;
  audienceLevel: "beginner" | "intermediate" | "advanced";
  description: string;
  systemPrompt: string;
  color: string;
}

export interface OnboardingAnswer {
  questionId: string;
  answerId: string;
}

export interface OnboardingProfile {
  answers: OnboardingAnswer[];
  recommendedAnalysts: string[];
  completedAt: string;
}

export interface PortfolioStock {
  ticker: string;
  name: string;
  addedAt: string;
}

export interface AnalysisResult {
  analystKey: string;
  content: string;
  status: "pending" | "streaming" | "complete" | "error";
  error?: string;
}

export interface StockAnalysis {
  ticker: string;
  results: Record<string, AnalysisResult>;
  startedAt: string;
}
