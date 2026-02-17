import { EXPERT_AGENTS, EXPERT_AVATARS } from "@/lib/constants";
import { AgentCard } from "./AgentCard";

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const LIVE_AGENTS = ["Legal Analyst", "Market Analyst", "Financial Strategist", "Risk Assessor", "Technical Architect", "Growth Strategist"];

export function ExpertsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EXPERT_AGENTS.map((agent) => {
        const isLive = LIVE_AGENTS.includes(agent.name);
        return (
          <div key={agent.name} className={`relative ${isLive ? "" : "opacity-40"}`}>
            <AgentCard
              name={agent.name}
              subtitle={agent.domain}
              description={agent.knowledge_sources.join(", ")}
              accentColor={agent.accent_color}
              imageSrc={EXPERT_AVATARS[toSlug(agent.name)]}
            />
            {!isLive && (
              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
