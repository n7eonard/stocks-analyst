"use client";

import { useState, useCallback, useRef } from "react";
import { AnalysisResult } from "@/types";
import { analysts } from "@/data/analysts";

export function useAnalysis() {
  const [results, setResults] = useState<
    Record<string, Record<string, AnalysisResult>>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(
    async (ticker: string, analystKeys?: string[]) => {
      // Abort any existing analysis
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const abortController = new AbortController();
      abortRef.current = abortController;

      const keys = analystKeys || analysts.map((a) => a.key);
      setIsAnalyzing(true);
      setActiveTicker(ticker);

      // Initialize all analysts as pending
      const initialResults: Record<string, AnalysisResult> = {};
      for (const key of keys) {
        initialResults[key] = {
          analystKey: key,
          content: "",
          status: "pending",
        };
      }
      setResults((prev) => ({ ...prev, [ticker]: initialResults }));

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, analystKeys: keys }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ") && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6));
                handleSSEEvent(ticker, currentEvent, data);
              } catch {
                // Skip malformed JSON
              }
              currentEvent = "";
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Analysis error:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  function handleSSEEvent(
    ticker: string,
    event: string,
    data: Record<string, string>
  ) {
    switch (event) {
      case "analyst-start":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              analystKey: data.analyst,
              content: "",
              status: "streaming",
            },
          },
        }));
        break;

      case "analyst-chunk":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              ...prev[ticker]?.[data.analyst],
              content:
                (prev[ticker]?.[data.analyst]?.content || "") +
                data.content,
              status: "streaming",
            },
          },
        }));
        break;

      case "analyst-complete":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              ...prev[ticker]?.[data.analyst],
              status: "complete",
            },
          },
        }));
        break;

      case "analyst-error":
        setResults((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            [data.analyst]: {
              analystKey: data.analyst,
              content: "",
              status: "error",
              error: data.error,
            },
          },
        }));
        break;
    }
  }

  const cancelAnalysis = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsAnalyzing(false);
    }
  }, []);

  const getTickerResults = useCallback(
    (ticker: string) => results[ticker] || {},
    [results]
  );

  return {
    results,
    isAnalyzing,
    activeTicker,
    runAnalysis,
    cancelAnalysis,
    getTickerResults,
  };
}
