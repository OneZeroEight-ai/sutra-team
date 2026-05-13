export const dynamic = 'force-dynamic';

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

export default async function LawCheckoutPage() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("No email on Clerk user");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    client_reference_id: userId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_LAW_FULL_COUNCIL!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_LAW_URL || "https://law.sutra.team"}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_LAW_URL || "https://law.sutra.team"}/sign-up?checkout=cancelled`,
    metadata: {
      product: "law",
      tier: "full_council",
      clerk_user_id: userId,
    },
  });

  if (!session.url) throw new Error("No Stripe Checkout URL");
  redirect(session.url);
}
