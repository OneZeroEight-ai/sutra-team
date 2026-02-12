import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { TIER_PRICE_MAP } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    const { tier } = await req.json();

    const priceId = TIER_PRICE_MAP[tier];
    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid tier: ${tier}` },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") ?? "https://sutra.team";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?status=success`,
      cancel_url: `${origin}/pricing?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
