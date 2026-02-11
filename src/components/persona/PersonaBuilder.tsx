import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const SCHEMA_BLOCKS = [
  {
    name: "Identity Block",
    fields: "name, designation, origin_narrative, tagline, visibility",
  },
  {
    name: "Voice Parameters",
    fields: "tone_descriptors, opening_patterns, closing_signature, formality_range",
  },
  {
    name: "Value Framework",
    fields: "primary_framework, principle_hierarchy, uncertainty_protocol",
  },
  {
    name: "Behavioral Constraints",
    fields: "hardcoded_constraints, softcoded_defaults, escalation_protocols",
  },
];

export function PersonaBuilder() {
  return (
    <Card className="border-sutra-gold/20 bg-gradient-to-b from-sutra-surface to-sutra-bg">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sutra-gold/30 bg-sutra-gold/5 px-4 py-1.5 text-xs text-sutra-gold mb-4">
          Coming Soon
        </div>
        <h3 className="text-xl font-bold text-sutra-text">
          Create Your Own Persona
        </h3>
        <p className="mt-2 text-sm text-sutra-muted">
          Define identity, voice, values, and constraints using the Persona
          Definition File (PDF) schema.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {SCHEMA_BLOCKS.map((block) => (
          <div
            key={block.name}
            className="rounded-lg border border-sutra-border bg-sutra-bg p-3"
          >
            <p className="text-xs font-semibold text-sutra-text">
              {block.name}
            </p>
            <p className="text-xs text-sutra-muted mt-1 font-mono">
              {block.fields}
            </p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button variant="secondary" href="/docs">
          View Schema Docs <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
