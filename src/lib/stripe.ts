/** Stripe Price IDs for Sutra.team subscription tiers and add-ons */

export const CREATOR_PRICE_ID = "price_1Szow3GBRiRBfxh9KMN2GHOa";
export const PROFESSIONAL_PRICE_ID = "price_1SzoxtGBRiRBfxh91RAuonvW";
export const EXPERT_SESSION_PRICE_ID = "price_1Szp0YGBRiRBfxh9841ANpBk";
export const API_DELIBERATION_PRICE_ID = "price_1SzpJwGBRiRBfxh9wDB98suk";

/** Map tier names to their Stripe price IDs */
export const TIER_PRICE_MAP: Record<string, string> = {
  Creator: CREATOR_PRICE_ID,
  Professional: PROFESSIONAL_PRICE_ID,
};
