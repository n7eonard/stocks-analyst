export interface QuizOption {
  id: string;
  label: string;
  description: string;
  weights: Record<string, number>; // analyst key -> weight (0-3)
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "investor-type",
    question: "What type of investor are you?",
    subtitle: "This helps us recommend the right analysis styles",
    options: [
      {
        id: "beginner",
        label: "Curious Beginner",
        description:
          "I'm learning about investing and want clear, easy-to-understand analyses",
        weights: {
          goldman: 3,
          blackrock: 3,
          vanguard: 3,
          jpmorgan: 2,
          "morgan-stanley": 1,
          bridgewater: 0,
          citadel: 1,
          renaissance: 0,
          "de-shaw": 0,
          "two-sigma": 1,
        },
      },
      {
        id: "active",
        label: "Active Investor",
        description:
          "I trade regularly and want actionable insights for timing my moves",
        weights: {
          "morgan-stanley": 3,
          jpmorgan: 3,
          "de-shaw": 3,
          goldman: 2,
          blackrock: 1,
          vanguard: 0,
          bridgewater: 1,
          citadel: 2,
          renaissance: 1,
          "two-sigma": 2,
        },
      },
      {
        id: "manager",
        label: "Portfolio Manager",
        description:
          "I manage a diversified portfolio and need comprehensive risk and macro analysis",
        weights: {
          bridgewater: 3,
          citadel: 3,
          "two-sigma": 3,
          renaissance: 2,
          goldman: 2,
          "morgan-stanley": 1,
          jpmorgan: 1,
          blackrock: 1,
          vanguard: 1,
          "de-shaw": 2,
        },
      },
    ],
  },
  {
    id: "goal",
    question: "What is your primary investment goal?",
    subtitle: "Different goals benefit from different analysis frameworks",
    options: [
      {
        id: "income",
        label: "Passive Income",
        description:
          "Build reliable dividend income that grows over time",
        weights: {
          blackrock: 3,
          vanguard: 3,
          goldman: 2,
          jpmorgan: 1,
          "morgan-stanley": 0,
          bridgewater: 1,
          citadel: 1,
          renaissance: 1,
          "de-shaw": 1,
          "two-sigma": 0,
        },
      },
      {
        id: "growth",
        label: "Long-Term Growth",
        description:
          "Grow my wealth over years by picking great companies",
        weights: {
          goldman: 3,
          renaissance: 3,
          citadel: 2,
          bridgewater: 1,
          blackrock: 1,
          vanguard: 2,
          jpmorgan: 1,
          "morgan-stanley": 1,
          "de-shaw": 0,
          "two-sigma": 1,
        },
      },
      {
        id: "trading",
        label: "Active Trading",
        description:
          "Make tactical trades based on short-term opportunities",
        weights: {
          "morgan-stanley": 3,
          "de-shaw": 3,
          jpmorgan: 3,
          "two-sigma": 2,
          citadel: 2,
          goldman: 1,
          renaissance: 1,
          bridgewater: 1,
          blackrock: 0,
          vanguard: 0,
        },
      },
    ],
  },
  {
    id: "horizon",
    question: "What is your typical time horizon?",
    subtitle: "Your holding period determines which analyses matter most",
    options: [
      {
        id: "short",
        label: "Short Term",
        description:
          "Days to weeks \u2014 I want quick, actionable setups",
        weights: {
          "morgan-stanley": 3,
          jpmorgan: 3,
          "de-shaw": 3,
          "two-sigma": 2,
          citadel: 1,
          goldman: 0,
          renaissance: 1,
          bridgewater: 1,
          blackrock: 0,
          vanguard: 0,
        },
      },
      {
        id: "medium",
        label: "Medium Term",
        description:
          "Months \u2014 I hold positions through trends and cycles",
        weights: {
          goldman: 3,
          citadel: 3,
          "two-sigma": 3,
          bridgewater: 2,
          jpmorgan: 2,
          "morgan-stanley": 1,
          renaissance: 2,
          "de-shaw": 1,
          blackrock: 1,
          vanguard: 1,
        },
      },
      {
        id: "long",
        label: "Long Term",
        description:
          "Years \u2014 I buy and hold quality assets",
        weights: {
          blackrock: 3,
          vanguard: 3,
          renaissance: 3,
          goldman: 2,
          bridgewater: 2,
          citadel: 1,
          "two-sigma": 1,
          jpmorgan: 0,
          "morgan-stanley": 0,
          "de-shaw": 0,
        },
      },
    ],
  },
  {
    id: "risk",
    question: "What is your risk tolerance?",
    subtitle: "This determines which risk frameworks we emphasize",
    options: [
      {
        id: "conservative",
        label: "Conservative",
        description:
          "Capital preservation first \u2014 I sleep better with lower volatility",
        weights: {
          blackrock: 3,
          vanguard: 3,
          bridgewater: 3,
          goldman: 2,
          "two-sigma": 1,
          citadel: 1,
          jpmorgan: 1,
          renaissance: 1,
          "morgan-stanley": 0,
          "de-shaw": 0,
        },
      },
      {
        id: "moderate",
        label: "Moderate",
        description:
          "Balanced approach \u2014 willing to accept some volatility for better returns",
        weights: {
          goldman: 3,
          citadel: 3,
          jpmorgan: 3,
          "two-sigma": 2,
          bridgewater: 2,
          renaissance: 2,
          blackrock: 1,
          vanguard: 1,
          "morgan-stanley": 1,
          "de-shaw": 1,
        },
      },
      {
        id: "aggressive",
        label: "Aggressive",
        description:
          "High risk, high reward \u2014 I'm comfortable with big swings",
        weights: {
          "morgan-stanley": 3,
          "de-shaw": 3,
          renaissance: 3,
          citadel: 2,
          jpmorgan: 2,
          "two-sigma": 2,
          goldman: 1,
          bridgewater: 1,
          blackrock: 0,
          vanguard: 0,
        },
      },
    ],
  },
];

export function calculateRecommendations(
  answers: Record<string, string>
): string[] {
  const scores: Record<string, number> = {};

  for (const question of quizQuestions) {
    const answerId = answers[question.id];
    if (!answerId) continue;
    const option = question.options.find((o) => o.id === answerId);
    if (!option) continue;
    for (const [analystKey, weight] of Object.entries(option.weights)) {
      scores[analystKey] = (scores[analystKey] || 0) + weight;
    }
  }

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([key]) => key);
}
