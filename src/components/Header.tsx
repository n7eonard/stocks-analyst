"use client";

interface HeaderProps {
  onMenuToggle: () => void;
  onRetakeQuiz: () => void;
}

export function Header({ onMenuToggle, onRetakeQuiz }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border-light bg-white flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1 text-text-secondary hover:text-text-primary"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">
          <span className="text-accent">Wall Street</span>{" "}
          <span className="text-text-secondary font-normal">Analyzer</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onRetakeQuiz}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    </header>
  );
}
