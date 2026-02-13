"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function CreditBadge() {
  const { isSignedIn } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => setCredits(null));
  }, [isSignedIn]);

  if (!isSignedIn || credits === null) return null;

  return (
    <div
      className={`text-xs px-2 py-1 rounded-full ${
        credits > 5
          ? "bg-zinc-800 text-zinc-400"
          : credits > 0
            ? "bg-amber-900/50 text-amber-400"
            : "bg-red-900/50 text-red-400"
      }`}
    >
      {credits} credit{credits !== 1 ? "s" : ""}
    </div>
  );
}
