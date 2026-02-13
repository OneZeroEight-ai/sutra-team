"""
Persona Definition File (PDF) Schema — v1.0

Implements Patent Section 2.1: Persona Definition Layer
This is the portable, structured specification that defines an agent's
identity, voice, values, knowledge, and behavioral constraints.

The PDF is LLM-agnostic. The Prompt Assembly Pipeline renders it
into LLM-specific system prompts.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import json
from pathlib import Path


class Visibility(Enum):
    PRIVATE = "private"
    UNLISTED = "unlisted"
    PUBLIC = "public"
    ENTERPRISE = "enterprise"


class UncertaintyProtocol(Enum):
    ESCALATE = "escalate"
    DELIBERATE = "deliberate"
    DEFER_TO_USER = "defer_to_user"
    APPLY_HIERARCHY = "apply_hierarchy"


class ConstraintType(Enum):
    HARDCODED = "hardcoded"
    SOFTCODED = "softcoded"


@dataclass
class Identity:
    persona_id: str
    name: str
    designation: str
    origin_narrative: str = ""
    creator_id: str = ""
    tagline: str = ""
    version: str = "1.0.0"
    visibility: Visibility = Visibility.PUBLIC
    council_role: str = ""
    path_aspect: str = ""
    path_aspect_pali: str = ""


@dataclass
class VoiceParameters:
    tone_descriptors: list[str] = field(default_factory=list)
    opening_patterns: list[str] = field(default_factory=list)
    closing_signature: str = ""
    avoidance_patterns: list[str] = field(default_factory=list)
    vocabulary_preferences: dict[str, str] = field(default_factory=dict)
    formality_range: tuple[float, float] = (0.6, 0.9)
    response_length: str = "2-3 focused paragraphs"
    platform_adaptations: dict[str, dict] = field(default_factory=dict)
    tts_voice_id: str = ""
    example_phrases: list[str] = field(default_factory=list)


@dataclass
class Principle:
    name: str
    description: str
    application_guidance: str
    priority: int


@dataclass
class ValueFramework:
    primary_framework: str = ""
    primary_framework_description: str = ""
    secondary_frameworks: list[str] = field(default_factory=list)
    principle_hierarchy: list[Principle] = field(default_factory=list)
    constitutional_references: list[dict] = field(default_factory=list)
    uncertainty_protocol: UncertaintyProtocol = UncertaintyProtocol.DELIBERATE
    decision_audit: bool = True
    differentiation_statement: str = ""


@dataclass
class Constraint:
    description: str
    type: ConstraintType
    override_condition: str = ""
    rationale: str = ""


@dataclass
class EscalationRule:
    trigger: str
    action: str
    rationale: str = ""


@dataclass
class BehavioralConstraints:
    hardcoded: list[Constraint] = field(default_factory=list)
    softcoded: list[Constraint] = field(default_factory=list)
    escalation_rules: list[EscalationRule] = field(default_factory=list)
    boundary_definitions: list[str] = field(default_factory=list)


@dataclass
class KnowledgeReference:
    title: str
    source: str
    type: str
    key_passages: list[str] = field(default_factory=list)
    usage_guidance: str = ""


@dataclass
class KnowledgeBase:
    core_references: list[KnowledgeReference] = field(default_factory=list)
    domain_expertise: list[str] = field(default_factory=list)
    knowledge_gaps: list[str] = field(default_factory=list)


@dataclass
class Differentiation:
    differentiation_statement: str = ""
    base_model_divergence_points: list[str] = field(default_factory=list)
    signature_elements: list[str] = field(default_factory=list)
    sample_responses: list[dict] = field(default_factory=list)


@dataclass
class CouncilContext:
    council_type: str = ""
    functional_domain: str = ""
    use_cases: list[str] = field(default_factory=list)
    interaction_with_other_agents: str = ""
    synthesis_weight: str = "equal"


@dataclass
class PersonaDefinitionFile:
    schema_version: str = "1.0.0"
    identity: Identity = field(default_factory=lambda: Identity(persona_id="", name=""))
    voice: VoiceParameters = field(default_factory=VoiceParameters)
    values: ValueFramework = field(default_factory=ValueFramework)
    constraints: BehavioralConstraints = field(default_factory=BehavioralConstraints)
    knowledge: KnowledgeBase = field(default_factory=KnowledgeBase)
    differentiation: Differentiation = field(default_factory=Differentiation)
    council: CouncilContext = field(default_factory=CouncilContext)

    def to_json(self) -> str:
        import dataclasses
        def serialize(obj):
            if dataclasses.is_dataclass(obj):
                return {k: serialize(v) for k, v in dataclasses.asdict(obj).items()}
            if isinstance(obj, Enum):
                return obj.value
            if isinstance(obj, tuple):
                return list(obj)
            return obj
        return json.dumps(serialize(self), indent=2)

    def save(self, path: str):
        Path(path).write_text(self.to_json())

    @classmethod
    def load(cls, path: str) -> dict:
        return json.loads(Path(path).read_text())
