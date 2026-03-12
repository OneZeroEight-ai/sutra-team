"use client";
import { useSearchParams } from "next/navigation";

export type ReferralContext = "book" | "ad" | "organic";

export function useReferralContext(): ReferralContext {
  const searchParams = useSearchParams();
  const utmSource = searchParams.get("utm_source");
  const utmCampaign = searchParams.get("utm_campaign");
  const utmContent = searchParams.get("utm_content");
  const ref = searchParams.get("ref");

  // Book readers: ?ref=book or ?utm_content=book or coming from Amazon
  if (
    ref === "book" ||
    utmContent?.includes("book") ||
    utmCampaign?.includes("book")
  ) {
    return "book";
  }

  // Ad traffic: utm_source=x with agency campaign
  if (
    utmSource === "x" ||
    utmSource === "twitter" ||
    utmCampaign?.includes("agency")
  ) {
    return "ad";
  }

  return "organic";
}
