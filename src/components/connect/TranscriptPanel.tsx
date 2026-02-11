"use client";

import { useEffect, useRef } from "react";

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
  isAgent: boolean;
  accentColor?: string;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="flex flex-col h-full border-l border-sutra-border bg-sutra-bg">
      <div className="px-4 py-3 border-b border-sutra-border">
        <h3 className="text-sm font-semibold text-sutra-text">Transcript</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {entries.length === 0 ? (
          <p className="text-xs text-sutra-muted text-center mt-8">
            Transcript will appear here as the session progresses...
          </p>
        ) : (
          entries.map((entry, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold"
                  style={{ color: entry.accentColor ?? "var(--sutra-text)" }}
                >
                  {entry.speaker}
                </span>
                <span className="text-[10px] text-sutra-muted">
                  {entry.timestamp}
                </span>
              </div>
              <p className="text-sm text-sutra-muted leading-relaxed">
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
