import { EXPERT_AGENTS } from "@/lib/constants";
import { AgentCard } from "./AgentCard";

export function ExpertsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EXPERT_AGENTS.map((agent) => (
        <AgentCard
          key={agent.name}
          name={agent.name}
          subtitle={agent.domain}
          description={agent.knowledge_sources.join(", ")}
          accentColor={agent.accent_color}
        />
      ))}
    </div>
  );
}
