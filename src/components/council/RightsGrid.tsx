import { RIGHTS_AGENTS } from "@/lib/constants";
import { AgentCard } from "./AgentCard";

export function RightsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {RIGHTS_AGENTS.map((agent) => (
        <AgentCard
          key={agent.name}
          name={agent.name}
          subtitle={`${agent.path_aspect} (${agent.pali_name})`}
          description={agent.functional_domain}
          accentColor={agent.accent_color}
          tags={agent.use_cases.slice(0, 2)}
        />
      ))}
    </div>
  );
}
