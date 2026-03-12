"use client";
import { useReferralContext } from "@/hooks/useReferralContext";

export function BookReaderBanner() {
  const context = useReferralContext();
  if (context !== "book") return null;

  return (
    <div className="bg-gradient-to-r from-[#0a1628] to-[#0f2040] border-b border-yellow-500/20 py-3 px-6 text-center text-sm">
      <span className="text-yellow-400 font-semibold">
        Welcome, $9 AI Team reader.
      </span>{" "}
      <span className="text-white/80">
        Your 15 specialists are already waiting — sign up and deploy in 2
        minutes.
      </span>{" "}
      <a
        href="/quick-start?ref=book"
        className="text-yellow-400 underline ml-2"
      >
        Quick start guide →
      </a>
    </div>
  );
}
