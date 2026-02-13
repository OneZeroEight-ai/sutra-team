"""
Prompt Assembly Pipeline

Takes a Persona Definition File (JSON) and renders it into an LLM-specific
system prompt. This is what makes personas portable across LLM providers.

Implements Patent Section 5.2.1: Prompt Assembly Pipeline
"""

import json
from pathlib import Path


class PromptAssembler:

    def __init__(self, pdf_path: str):
        self.pdf = json.loads(Path(pdf_path).read_text())

    def assemble(self, target_llm: str = "anthropic", council_mode: bool = False) -> str:
        sections = [
            self._render_identity(target_llm),
            self._render_voice(target_llm),
            self._render_values(target_llm),
            self._render_constraints(target_llm),
            self._render_knowledge(target_llm),
            self._render_differentiation(target_llm),
        ]
        if council_mode:
            sections.append(self._render_council_context(target_llm))
        return "\n\n".join(s for s in sections if s)

    def _render_identity(self, target_llm: str) -> str:
        identity = self.pdf["identity"]
        lines = [
            f"You are {identity['name']}.",
            f"Designation: {identity['designation']}.",
        ]
        if identity.get("origin_narrative"):
            lines.append(f"\n{identity['origin_narrative']}")
        if identity.get("path_aspect"):
            lines.append(f"\nYou are grounded in {identity['path_aspect']} ({identity.get('path_aspect_pali', '')}) of the Noble Eightfold Path.")
        if identity.get("tagline"):
            lines.append(f'\nGuiding principle: "{identity["tagline"]}"')
        return "\n".join(lines)

    def _render_voice(self, target_llm: str) -> str:
        voice = self.pdf["voice"]
        lines = ["## Voice"]
        if voice.get("tone_descriptors"):
            lines.append(f"Tone: {', '.join(voice['tone_descriptors'])}.")
        if voice.get("response_length"):
            lines.append(f"Response length: {voice['response_length']}.")
        if voice.get("opening_patterns"):
            lines.append("\nHow you open responses:")
            for pattern in voice["opening_patterns"]:
                lines.append(f"- {pattern}")
        if voice.get("closing_signature"):
            lines.append(f"\nClosing: {voice['closing_signature']}")
        if voice.get("avoidance_patterns"):
            lines.append("\nNEVER do these:")
            for pattern in voice["avoidance_patterns"]:
                lines.append(f"- {pattern}")
        if voice.get("example_phrases"):
            lines.append("\nCharacteristic phrases (use naturally, don't force):")
            for phrase in voice["example_phrases"]:
                lines.append(f'- "{phrase}"')
        if voice.get("vocabulary_preferences"):
            lines.append("\nVocabulary:")
            for key, guidance in voice["vocabulary_preferences"].items():
                lines.append(f"- {guidance}")

        # Platform-specific adaptation
        platform_key = "text_deliberation"
        platform = voice.get("platform_adaptations", {}).get(platform_key, {})
        if platform and platform.get("tone_shift"):
            lines.append(f"\nFor this context: {platform['tone_shift']}")

        return "\n".join(lines)

    def _render_values(self, target_llm: str) -> str:
        values = self.pdf["values"]
        lines = ["## Values & Principles"]
        if values.get("primary_framework"):
            lines.append(f"Primary framework: {values['primary_framework']}")
        if values.get("primary_framework_description"):
            lines.append(f"\n{values['primary_framework_description']}")
        if values.get("principle_hierarchy"):
            lines.append("\nPrinciple hierarchy (highest priority first):")
            for p in sorted(values["principle_hierarchy"], key=lambda x: x["priority"]):
                lines.append(f"\n{p['priority']}. **{p['name']}**: {p['description']}")
                lines.append(f"   Application: {p['application_guidance']}")
        protocol = values.get("uncertainty_protocol", "deliberate")
        protocol_map = {
            "escalate": "When facing value conflicts, escalate to human operator.",
            "deliberate": "When facing value conflicts, flag the tension, present both sides with your assessment.",
            "defer_to_user": "When facing value conflicts, present the options and let the user decide.",
            "apply_hierarchy": "When facing value conflicts, apply the principle hierarchy above.",
        }
        lines.append(f"\nUncertainty handling: {protocol_map.get(protocol, protocol)}")
        if values.get("differentiation_statement"):
            lines.append(f"\n{values['differentiation_statement']}")
        return "\n".join(lines)

    def _render_constraints(self, target_llm: str) -> str:
        constraints = self.pdf["constraints"]
        lines = ["## Constraints"]
        if constraints.get("hardcoded"):
            lines.append("\nAbsolute constraints (never override):")
            for c in constraints["hardcoded"]:
                lines.append(f"- {c['description']}")
        if constraints.get("softcoded"):
            lines.append("\nDefault behaviors (with override conditions):")
            for c in constraints["softcoded"]:
                lines.append(f"- {c['description']}")
                if c.get("override_condition"):
                    lines.append(f"  Override: {c['override_condition']}")
        if constraints.get("boundary_definitions"):
            lines.append("\nScope:")
            for b in constraints["boundary_definitions"]:
                lines.append(f"- {b}")
        return "\n".join(lines)

    def _render_knowledge(self, target_llm: str) -> str:
        knowledge = self.pdf["knowledge"]
        lines = ["## Knowledge & Expertise"]
        if knowledge.get("domain_expertise"):
            lines.append(f"Domain expertise: {', '.join(knowledge['domain_expertise'])}.")
        if knowledge.get("core_references"):
            lines.append("\nCore references informing your perspective:")
            for ref in knowledge["core_references"]:
                lines.append(f"- {ref['title']} ({ref['source']})")
                if ref.get("usage_guidance"):
                    lines.append(f"  Usage: {ref['usage_guidance']}")
        if knowledge.get("knowledge_gaps"):
            lines.append("\nKnown limitations:")
            for gap in knowledge["knowledge_gaps"]:
                lines.append(f"- {gap}")
        return "\n".join(lines)

    def _render_differentiation(self, target_llm: str) -> str:
        diff = self.pdf["differentiation"]
        lines = ["## Differentiation"]
        if diff.get("differentiation_statement"):
            lines.append(diff["differentiation_statement"])
        if diff.get("base_model_divergence_points"):
            lines.append("\nHow you differ from a standard AI assistant:")
            for point in diff["base_model_divergence_points"]:
                lines.append(f"- {point}")
        if diff.get("signature_elements"):
            lines.append("\nYour signature elements (include in every response):")
            for elem in diff["signature_elements"]:
                lines.append(f"- {elem}")
        return "\n".join(lines)

    def _render_council_context(self, target_llm: str) -> str:
        council = self.pdf["council"]
        lines = ["## Council Context"]
        lines.append("You are part of the Sutra.team Council of Rights.")
        lines.append(f"Functional domain: {council.get('functional_domain', '')}")
        if council.get("interaction_with_other_agents"):
            lines.append(f"\n{council['interaction_with_other_agents']}")
        lines.append("\nKeep your response focused and concise. Other council agents will provide their perspectives. Sutra will synthesize all perspectives into a unified response.")
        return "\n".join(lines)

    # --- LLM-Specific Renderers ---

    def render_for_anthropic(self, council_mode: bool = False) -> str:
        return self.assemble("anthropic", council_mode)

    def render_for_openai(self, council_mode: bool = False) -> str:
        prompt = self.assemble("openai", council_mode)
        prefix = "SYSTEM INSTRUCTIONS: Follow these instructions precisely.\n\n"
        return prefix + prompt

    def render_for_open_source(self, council_mode: bool = False) -> str:
        prompt = self.assemble("meta", council_mode)
        prefix = "### System Prompt ###\n\n"
        suffix = "\n\n### End System Prompt ###"
        return prefix + prompt + suffix


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python prompt_assembler.py <pdf_path> [target_llm] [--council]")
        print("  target_llm: anthropic (default), openai, open_source")
        sys.exit(1)

    pdf_path = sys.argv[1]
    target = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else "anthropic"
    council = "--council" in sys.argv

    assembler = PromptAssembler(pdf_path)

    if target == "openai":
        prompt = assembler.render_for_openai(council)
    elif target == "open_source":
        prompt = assembler.render_for_open_source(council)
    else:
        prompt = assembler.render_for_anthropic(council)

    print(prompt)
    print(f"\n--- Approximate tokens: {len(prompt.split()) * 1.3:.0f} ---")
