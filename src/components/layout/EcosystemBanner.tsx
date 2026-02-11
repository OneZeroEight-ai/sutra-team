"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ECOSYSTEM_LINKS } from "@/lib/constants";

export function EcosystemBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-sutra-surface border-b border-sutra-border">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-6 text-xs text-sutra-muted">
        <span className="hidden sm:inline">Ecosystem:</span>
        {ECOSYSTEM_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sutra-accent transition-colors"
          >
            {link.name}
          </a>
        ))}
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sutra-muted hover:text-sutra-text transition-colors cursor-pointer"
          aria-label="Close banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
