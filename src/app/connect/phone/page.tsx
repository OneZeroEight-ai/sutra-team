import type { Metadata } from "next";
import { PhonePortal } from "@/components/connect/PhonePortal";

export const metadata: Metadata = {
  title: "Phone Portal",
  description:
    "Dial in to your Sutra.team council from any phone. No internet required.",
};

export default function PhonePage() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Phone Portal
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            Dial in from anywhere. No internet, no app, no browser. Just your
            phone and your council.
          </p>
        </div>
        <PhonePortal />
      </div>
    </section>
  );
}
