"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

const tiers = [
  {
    id: "explorer",
    name: "Explorer",
    price: 9,
    period: "per workspace",
    features: [
      "15 AI council agents + 5 custom agents",
      "Individual agent chat (unlimited)",
      "3 council deliberations/mo",
      "Basic skills (Tier 1–2)",
      "Platform credits included",
      "Community support",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "per workspace",
    features: [
      "Unlimited custom agents",
      "Unlimited deliberations",
      "All 32 skills",
      "Voice sessions",
      "BYOK (bring your own API keys)",
      "Persona editor (Portable Mind Format)",
      "Local LLM support (Ollama, LM Studio, vLLM)",
      "Priority support",
    ],
    cta: "Go Pro",
    featured: true,
  },
  {
    id: "international",
    name: "International",
    price: 99,
    period: "per workspace",
    features: [
      "Everything in Pro",
      "Iceland-hosted dedicated VPS",
      "EU/GDPR compliant — outside US jurisdiction",
      "100% renewable geothermal energy",
      "Dedicated PostgreSQL (encrypted at rest)",
      "WireGuard encrypted tunnel",
      "99.95% SLA",
      "White-label ready",
      "Priority support",
    ],
    cta: "Go Global",
    featured: false,
    badge: "🇮🇸 ICELAND",
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function handlePurchase(tierId: string) {
    if (!isSignedIn) {
      window.location.href = "/sign-up";
      return;
    }

    setLoadingTier(tierId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060E",
        color: "#E2E8F0",
        fontFamily: "'Outfit', system-ui, sans-serif",
        padding: "80px 24px 60px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "#7C3AED",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 12,
            }}
          >
            PRICING
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#F0EFF4",
              marginBottom: 12,
            }}
          >
            Start with 15 specialists. Build your team.
          </h1>
          <p style={{ fontSize: 17, color: "#8892B0", maxWidth: 520, margin: "0 auto" }}>
            Every tier includes 8-layer security enforcement, audit trails,
            cryptographic identity, and kill switches.
          </p>
        </div>

        {/* Pricing Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 40,
          }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                background: "#0f0f24",
                border: tier.featured
                  ? "1px solid rgba(124, 58, 237, 0.5)"
                  : tier.id === "international"
                    ? "1px solid rgba(0, 212, 255, 0.2)"
                    : "1px solid #1e1e3a",
                borderRadius: 16,
                padding: "36px 28px 28px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                ...(tier.featured
                  ? {
                      boxShadow: "0 0 40px rgba(124, 58, 237, 0.15)",
                      transform: "scale(1.03)",
                    }
                  : {}),
              }}
            >
              {/* Badges */}
              {tier.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                    color: "white",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    padding: "4px 14px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              {tier.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    color: "white",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    padding: "4px 14px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tier.badge}
                </div>
              )}

              {/* Tier name */}
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  color: "#8892B0",
                  textTransform: "uppercase",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 8,
                }}
              >
                {tier.name}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: "#F0EFF4" }}>
                  ${tier.price}
                </span>
                <span style={{ fontSize: 16, color: "#4A5568" }}>/mo</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#4A5568",
                  marginBottom: 24,
                }}
              >
                {tier.period}
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  flex: 1,
                  marginBottom: 24,
                }}
              >
                {tier.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14,
                      color: "#CBD5E1",
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: tier.id === "international" ? "#06b6d4" : "#7C3AED",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePurchase(tier.id)}
                disabled={loadingTier === tier.id}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  border: "none",
                  borderRadius: 10,
                  cursor: loadingTier === tier.id ? "wait" : "pointer",
                  transition: "all 0.2s",
                  ...(tier.featured
                    ? {
                        background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                        color: "white",
                      }
                    : tier.id === "international"
                      ? {
                          background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                          color: "white",
                        }
                      : {
                          background: "transparent",
                          color: "#8B5CF6",
                          border: "1px solid rgba(124, 58, 237, 0.3)",
                        }),
                  ...(loadingTier === tier.id
                    ? { opacity: 0.6 }
                    : {}),
                }}
              >
                {loadingTier === tier.id
                  ? "Loading..."
                  : isSignedIn
                    ? tier.cta
                    : "Sign Up"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#4A5568",
            marginBottom: 32,
          }}
        >
          All tiers include 8-layer security enforcement, audit trails,
          cryptographic identity, and kill switches.
        </p>

        {/* Contact */}
        <div style={{ textAlign: "center", fontSize: 14, color: "#8892B0" }}>
          Questions?{" "}
          <a
            href="mailto:info@onezeroeight.ai"
            style={{ color: "#7C3AED", textDecoration: "none" }}
          >
            info@onezeroeight.ai
          </a>
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
            max-width: 420px;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
