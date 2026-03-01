"use client";

import { AnalysisResult } from "@/types";
import { analystsByKey } from "@/data/analysts";

interface AnalysisContentProps {
  analystKey: string;
  result: AnalysisResult | undefined;
}

export function AnalysisContent({
  analystKey,
  result,
}: AnalysisContentProps) {
  const analyst = analystsByKey[analystKey];

  if (!result || result.status === "pending") {
    return (
      <div className="p-6 text-center text-text-tertiary">
        <div className="text-3xl mb-3">{analyst?.icon}</div>
        <p className="font-semibold">{analyst?.name}</p>
        <p className="text-sm mt-1">{analyst?.description}</p>
        <p className="text-xs mt-3 text-text-tertiary">
          Run analysis to see results
        </p>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-card">
          <p className="text-sm font-semibold text-loss">Analysis Failed</p>
          <p className="text-sm text-text-secondary mt-1">
            {result.error || "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Analyst badge */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
        <span className="text-xl">{analyst?.icon}</span>
        <div>
          <div className="font-semibold text-sm">{analyst?.name}</div>
          <div className="text-xs text-text-tertiary">{analyst?.focus}</div>
        </div>
        {result.status === "streaming" && (
          <span className="ml-auto text-xs text-gain flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            Analyzing...
          </span>
        )}
        {result.status === "complete" && (
          <span className="ml-auto text-xs text-text-tertiary">
            Complete
          </span>
        )}
      </div>

      {/* Content with basic markdown rendering */}
      <div
        className="prose prose-sm max-w-none
          prose-headings:text-text-primary prose-headings:font-semibold
          prose-h1:text-xl prose-h1:border-b prose-h1:border-border-light prose-h1:pb-2 prose-h1:mb-4
          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
          prose-p:text-text-primary prose-p:leading-relaxed
          prose-strong:text-text-primary
          prose-ul:my-2 prose-li:my-0.5
          prose-table:text-sm
          prose-th:bg-surface-secondary prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
          prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border-light"
        style={{ color: "inherit" }}
      >
        <MarkdownRenderer content={result.content} />
        {result.status === "streaming" && (
          <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown to HTML converter for Claude output
  const html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-:]+$/.test(c))) return ''; // separator row
      const tag = 'td';
      const row = cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('');
      return `<tr>${row}</tr>`;
    })
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return (
    <div
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
    />
  );
}
