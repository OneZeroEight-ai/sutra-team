import { PRICING_TIERS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export function PricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {PRICING_TIERS.map((tier) => (
        <Card
          key={tier.name}
          className={
            tier.highlighted
              ? "border-sutra-accent/50 relative ring-1 ring-sutra-accent/20"
              : ""
          }
        >
          {tier.highlighted && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sutra-accent text-white text-xs font-medium whitespace-nowrap">
              Most Popular
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-sutra-text">
              {tier.name}
            </h3>
            <p className="text-xs text-sutra-muted mt-1">{tier.target_user}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-sutra-text">
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm text-sutra-muted">{tier.period}</span>
              )}
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {tier.includes.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-sutra-accent shrink-0 mt-0.5" />
                <span className="text-sm text-sutra-muted">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            variant={tier.highlighted ? "primary" : "secondary"}
            className="w-full"
            href={tier.name === "Enterprise" ? "/about#contact" : "/docs"}
          >
            {tier.name === "Enterprise"
              ? "Contact Sales"
              : tier.price === "Free"
                ? "Get Started Free"
                : "Get Started"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
