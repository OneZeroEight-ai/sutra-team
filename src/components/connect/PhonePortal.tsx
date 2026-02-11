"use client";

import { Phone, Shield, Globe, Building } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PhonePortal() {
  return (
    <div className="space-y-12">
      {/* Dial-in card */}
      <div className="max-w-md mx-auto">
        <Card className="border-sutra-gold/30 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sutra-gold/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-sutra-gold" />
          </div>
          <h3 className="text-xl font-bold text-sutra-text">Dial-In Number</h3>
          <p className="mt-4 text-3xl font-mono font-bold text-sutra-gold tracking-wider">
            +1 (888) SUTRA-AI
          </p>
          <p className="text-xs text-sutra-muted mt-2">
            +1 (888) 788-7224
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-sutra-gold/30 bg-sutra-gold/5 px-4 py-1.5 text-xs text-sutra-gold">
            Coming Soon &mdash; Number provisioning in progress
          </div>
        </Card>
      </div>

      {/* How it works */}
      <div>
        <SectionHeading
          title="How Phone Sessions Work"
          subtitle="The same council deliberation, from any phone"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Call the number",
              desc: "Dial from any phone — landline, mobile, or VoIP",
            },
            {
              step: "2",
              title: "Choose your council",
              desc: "IVR greeting: Press 1 for Rights, 2 for Experts, 3 for Combined",
            },
            {
              step: "3",
              title: "Agents deliberate",
              desc: "Hear each agent's perspective spoken aloud, then Sutra's synthesis",
            },
            {
              step: "4",
              title: "Review later",
              desc: "Session logged to memory system — transcript available in your dashboard",
            },
          ].map((item) => (
            <Card key={item.step}>
              <span className="text-xs font-mono text-sutra-accent">
                {item.step}
              </span>
              <h4 className="text-sm font-semibold text-sutra-text mt-2">
                {item.title}
              </h4>
              <p className="text-xs text-sutra-muted mt-1">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Authentication */}
      <div className="max-w-md mx-auto">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5 text-sutra-accent" />
            <h4 className="text-sm font-semibold text-sutra-text">
              PIN Authentication
            </h4>
          </div>
          <p className="text-sm text-sutra-muted leading-relaxed">
            Enter your account PIN when prompted to link the phone session to
            your memory and history. Without a PIN, sessions are anonymous and
            use session-only memory.
          </p>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <SectionHeading title="Phone FAQ" />
        <div className="space-y-3">
          {[
            {
              q: "Can I call from any phone?",
              a: "Yes — landline, mobile, or VoIP. Any phone that can make calls.",
            },
            {
              q: "Is it recorded?",
              a: "Transcribed and stored per your memory preferences. You can export or delete at any time.",
            },
            {
              q: "What about enterprise?",
              a: "Dedicated phone numbers, custom IVR flows, SLA guarantees, and SAML authentication available on Enterprise plans.",
            },
            {
              q: "International numbers?",
              a: "US numbers available at launch. International numbers coming soon.",
            },
          ].map((item) => (
            <Card key={item.q}>
              <h4 className="text-sm font-semibold text-sutra-text">
                {item.q}
              </h4>
              <p className="mt-1 text-sm text-sutra-muted">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
