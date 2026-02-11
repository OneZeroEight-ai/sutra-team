import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Sutra.team developer documentation — API reference, persona schema, authentication, and integration guides.",
};

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/council/deliberate",
    description: "Submit query to council",
  },
  {
    method: "POST",
    path: "/v1/council/deliberate/stream",
    description: "Streaming deliberation via SSE",
  },
  {
    method: "GET",
    path: "/v1/council/{id}/perspectives",
    description: "Individual agent perspectives",
  },
  {
    method: "POST",
    path: "/v1/persona/create",
    description: "Create a new persona",
  },
  {
    method: "PUT",
    path: "/v1/persona/{id}",
    description: "Update persona (creates new version)",
  },
  {
    method: "GET",
    path: "/v1/persona/{id}",
    description: "Get persona definition",
  },
  {
    method: "POST",
    path: "/v1/persona/{id}/chat",
    description: "Direct single-persona chat",
  },
  {
    method: "GET",
    path: "/v1/memory/{persona_id}/report",
    description: "Memory report",
  },
  {
    method: "POST",
    path: "/v1/memory/{persona_id}/import",
    description: "Import memory state",
  },
  {
    method: "GET",
    path: "/v1/differentiation/{id}/score",
    description: "Differentiation metrics",
  },
  {
    method: "POST",
    path: "/v1/knowledge/{id}/ingest",
    description: "Add docs to knowledge base",
  },
];

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
};

export default function DocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Developer Documentation
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            Everything you need to integrate with the Sutra.team platform.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-sutra-gold/30 bg-sutra-gold/5 px-4 py-1.5 text-xs text-sutra-gold">
            Full API docs coming with Phase 2 launch
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="API Reference"
            subtitle="Core endpoints for council deliberation, persona management, memory, and differentiation"
          />
          <div className="rounded-xl border border-sutra-border bg-sutra-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sutra-border bg-sutra-bg">
                  <th className="text-left py-3 px-4 text-sutra-muted font-medium w-20">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sutra-muted font-medium">
                    Endpoint
                  </th>
                  <th className="text-left py-3 px-4 text-sutra-muted font-medium hidden sm:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {API_ENDPOINTS.map((ep) => (
                  <tr
                    key={ep.path + ep.method}
                    className="border-b border-sutra-border last:border-0"
                  >
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-mono text-xs font-semibold ${methodColors[ep.method] ?? "text-sutra-muted"}`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-sutra-text">
                      {ep.path}
                    </td>
                    <td className="py-2.5 px-4 text-sutra-muted hidden sm:table-cell">
                      {ep.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Persona Schema */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Persona Definition File (PDF)"
            subtitle="Every persona is defined by four blocks"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Identity Block",
                fields: [
                  "persona_id (UUID)",
                  "name",
                  "designation",
                  "origin_narrative",
                  "creator_id",
                  "tagline",
                  "version (SemVer)",
                  "visibility (private | unlisted | public | enterprise)",
                ],
              },
              {
                name: "Voice Parameters",
                fields: [
                  "tone_descriptors (string[])",
                  "opening_patterns (templates)",
                  "closing_signature",
                  "avoidance_patterns",
                  "platform_adaptations",
                  "vocabulary_preferences",
                  "formality_range (0.0–1.0)",
                ],
              },
              {
                name: "Value Framework",
                fields: [
                  "primary_framework",
                  "secondary_frameworks",
                  "constitutional_refs",
                  "principle_hierarchy (ordered)",
                  "uncertainty_protocol",
                  "decision_audit_log",
                ],
              },
              {
                name: "Behavioral Constraints",
                fields: [
                  "hardcoded_constraints (absolute)",
                  "softcoded_defaults (overridable)",
                  "escalation_protocols",
                  "boundary_definitions",
                ],
              },
            ].map((block) => (
              <Card key={block.name}>
                <h4 className="text-sm font-semibold text-sutra-text mb-3">
                  {block.name}
                </h4>
                <ul className="space-y-1">
                  {block.fields.map((field) => (
                    <li
                      key={field}
                      className="text-xs font-mono text-sutra-muted"
                    >
                      {field}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Authentication"
            subtitle="Multiple auth methods for different use cases"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "OAuth 2.0 / JWT",
                desc: "Standard token-based authentication for web and mobile applications",
                use: "Web apps, mobile apps",
              },
              {
                name: "API Keys",
                desc: "Simple key-based authentication for programmatic access and server-to-server",
                use: "Backend integrations, scripts",
              },
              {
                name: "Enterprise SSO",
                desc: "SAML-based single sign-on for enterprise deployments",
                use: "Enterprise plan only",
              },
            ].map((auth) => (
              <Card key={auth.name}>
                <h4 className="text-sm font-semibold text-sutra-text">
                  {auth.name}
                </h4>
                <p className="mt-2 text-xs text-sutra-muted">{auth.desc}</p>
                <p className="mt-2 text-xs text-sutra-accent">{auth.use}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Roles & Permissions"
            subtitle="Role-based access control for persona and council operations"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "Creator",
                desc: "Full control over persona definition, knowledge base, and settings",
              },
              {
                role: "Operator",
                desc: "Deploy and manage personas without editing definitions",
              },
              {
                role: "User",
                desc: "Interact with personas and submit council deliberations",
              },
              {
                role: "Viewer",
                desc: "Read-only access to differentiation scores and public data",
              },
            ].map((r) => (
              <Card key={r.role}>
                <h4 className="text-sm font-semibold text-sutra-accent">
                  {r.role}
                </h4>
                <p className="mt-2 text-xs text-sutra-muted">{r.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
