import { RIGHTS_AGENTS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

function toSlug(name: string): string {
  return name
    .replace(/^The\s+/i, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function RightsProfileGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {RIGHTS_AGENTS.map((agent) => {
        const slug = toSlug(agent.name);
        return (
          <Card key={agent.name} hover>
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${agent.accent_color}15` }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: agent.accent_color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-sutra-text">
                  {agent.name}
                </h3>
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: agent.accent_color }}
                >
                  {agent.path_aspect} &middot; {agent.pali_name}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-sutra-muted leading-relaxed">
              {agent.functional_domain}
            </p>

            <ul className="mt-4 space-y-1.5">
              {agent.use_cases.slice(0, 3).map((uc) => (
                <li
                  key={uc}
                  className="flex items-start gap-2 text-sm text-sutra-text"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: agent.accent_color }}
                  />
                  {uc}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <Button
                variant="secondary"
                className="w-full"
                href={`/connect/room/voice-${slug}?council=rights`}
              >
                Start Session <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
