import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const priceId =
    body.priceId || process.env.NEXT_PUBLIC_STRIPE_PILOT_PRICE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sutra.team"}/council/deliberate?purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sutra.team"}/pricing`,
      metadata: {
        userId,
        credits: "10",
      },
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error("[checkout] Error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
