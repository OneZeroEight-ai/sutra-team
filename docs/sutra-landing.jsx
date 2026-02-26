import { useState, useEffect, useRef } from "react";
import { 
  Shield, Zap, Users, Globe, Code, Lock, Eye, Terminal,
  ChevronRight, ChevronDown, Check, Star, ArrowRight,
  Cpu, Layers, BookOpen, ExternalLink, Menu, X,
  Heart, Sparkles, Bot, Key, CreditCard, Server
} from "lucide-react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────
const colors = {
  bg: "#0a0a0f",
  bgCard: "#12121a",
  bgCardHover: "#1a1a25",
  border: "#1e1e2e",
  borderHover: "#2a2a3e",
  text: "#e4e4ef",
  textMuted: "#8888a0",
  textDim: "#55556a",
  accent: "#4fd1c5", // teal
  accentDim: "#2d9e94",
  accentGlow: "rgba(79, 209, 197, 0.15)",
  warm: "#f6ad55", // amber
  warmGlow: "rgba(246, 173, 85, 0.12)",
  danger: "#fc8181",
  purple: "#b794f4",
  green: "#68d391",
};

// ─── AGENTS DATA ──────────────────────────────────────────────────
const councilOfRights = [
  { name: "Wisdom Judge", aspect: "Right View", icon: "⚖️", desc: "Strategic analysis & evidence evaluation" },
  { name: "The Purpose", aspect: "Right Intention", icon: "🎯", desc: "Motivation clarity & values alignment" },
  { name: "Communicator", aspect: "Right Speech", icon: "💬", desc: "Message evaluation & honesty-kindness balance" },
  { name: "Ethics Judge", aspect: "Right Action", icon: "⚡", desc: "Ethical impact analysis & consequence modeling" },
  { name: "Sustainer", aspect: "Right Livelihood", icon: "🌱", desc: "Value creation vs. extraction analysis" },
  { name: "Determined", aspect: "Right Effort", icon: "🔥", desc: "Priority management & burnout detection" },
  { name: "The Aware", aspect: "Right Mindfulness", icon: "👁️", desc: "Pattern surfacing & blind spot detection" },
  { name: "The Focused", aspect: "Right Concentration", icon: "🔬", desc: "Deep analysis & single-problem immersion" },
];

const councilOfExperts = [
  { name: "Legal Analyst", domain: "Contract Law, IP, Compliance", icon: "📜" },
  { name: "Financial Strategist", domain: "Valuation, Fundraising, Unit Economics", icon: "📊" },
  { name: "Tech Architect", domain: "System Design, Architecture, Security", icon: "🏗️" },
  { name: "Market Analyst", domain: "Industry Analysis, Competitive Intel", icon: "📈" },
  { name: "Risk Assessor", domain: "Risk Frameworks, Probability Modeling", icon: "🛡️" },
  { name: "Growth Strategist", domain: "GTM, Growth Loops, Scaling", icon: "🚀" },
];

const sutraAgent = { name: "Sutra", role: "Ethics analyst. Confers with all 15 before answering.", icon: "🪷" };

const templateCategories = [
  { category: "Healthcare", templates: ["Medical Researcher", "Patient Advocate", "Clinical Coordinator"] },
  { category: "Education", templates: ["Curriculum Designer", "Student Mentor", "Research Assistant"] },
  { category: "Real Estate", templates: ["Property Analyst", "Market Researcher", "Deal Evaluator"] },
  { category: "Creative", templates: ["Content Strategist", "Brand Voice", "Campaign Manager"] },
  { category: "Finance", templates: ["Portfolio Analyst", "Tax Strategist", "Compliance Officer"] },
  { category: "Engineering", templates: ["Code Reviewer", "DevOps Lead", "Security Auditor"] },
  { category: "Household", templates: ["Meal Planner", "Budget Tracker", "Schedule Coordinator"] },
  { category: "Nonprofit", templates: ["Grant Writer", "Volunteer Coordinator", "Impact Analyst"] },
  { category: "Sales", templates: ["Lead Qualifier", "Proposal Writer", "Account Strategist"] },
  { category: "Legal", templates: ["Contract Reviewer", "IP Researcher", "Compliance Checker"] },
  { category: "Music", templates: ["A&R Analyst", "Sync Licensing Scout", "Release Strategist"] },
  { category: "Sports", templates: ["Performance Analyst", "Nutrition Coach", "Scouting Coordinator"] },
];

const securityLayers = [
  { name: "KARMA", label: "Budget Enforcement", desc: "Per-agent and per-council token budgets. Never overspend.", native: true, plugin: true },
  { name: "SILA", label: "Audit Trail", desc: "Every agent action logged. Full decision chain transparency.", native: true, plugin: true },
  { name: "METTA", label: "Cryptographic Identity", desc: "Ed25519 keypairs per agent. Verify who said what.", native: true, plugin: true },
  { name: "SANGHA", label: "Skill Vetting", desc: "AST scanning + governed network egress. No rogue skills.", native: true, plugin: true },
  { name: "NIRVANA", label: "Kill Switch", desc: "Council-level emergency halt. Shut down all agents at once.", native: true, plugin: true },
  { name: "DHARMA", label: "Model Permissions", desc: "Per-agent model routing. Claude, OpenAI, Google, local.", native: true, plugin: true },
  { name: "BODHI", label: "Process Isolation", desc: "Agents sandboxed during deliberation. No cross-contamination.", native: true, plugin: false },
  { name: "SUTRA", label: "Value Framework", desc: "Hierarchical ethical principles guiding every response.", native: true, plugin: false },
];

// ─── COMPONENTS ───────────────────────────────────────────────────

function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Agents", href: "#agents" },
    { label: "Security", href: "#security" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Book", href: "/book" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,15,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${colors.border}` : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontSize: 24 }}>🪷</span>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: colors.text, fontWeight: 400 }}>SUTRA.team</span>
        </a>

        {/* Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-desktop">
          {links.map(l => (
            <a key={l.label} href={l.href} style={{ color: colors.textMuted, textDecoration: "none", fontSize: 14, letterSpacing: "0.02em", transition: "color 0.2s" }}
               onMouseEnter={e => e.target.style.color = colors.accent}
               onMouseLeave={e => e.target.style.color = colors.textMuted}>{l.label}</a>
          ))}
          <a href="/dashboard.html" style={{
            background: colors.accent, color: colors.bg, padding: "8px 20px", borderRadius: 6,
            fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em",
          }}>Launch Dashboard</a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: colors.text, cursor: "pointer", display: "none" }} className="nav-mobile-btn">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div style={{ background: colors.bg, borderTop: `1px solid ${colors.border}`, padding: "16px 24px" }} className="nav-mobile-menu">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ display: "block", color: colors.textMuted, textDecoration: "none", padding: "12px 0", fontSize: 15 }}>{l.label}</a>
          ))}
          <a href="/dashboard.html" style={{ display: "block", background: colors.accent, color: colors.bg, padding: "12px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center", marginTop: 12 }}>Launch Dashboard</a>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "center", textAlign: "center", padding: "120px 24px 80px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: `linear-gradient(${colors.accent} 1px, transparent 1px), linear-gradient(90deg, ${colors.accent} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      
      {/* Glow */}
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", maxWidth: 800 }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: colors.accentGlow, border: `1px solid ${colors.accentDim}33`,
          borderRadius: 20, padding: "6px 16px", marginBottom: 32, fontSize: 13,
          color: colors.accent, letterSpacing: "0.04em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent, animation: "pulse 2s infinite" }} />
          Open Source · OpenClaw Compatible · Sammā Suit Protected
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400,
          fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 1.1, color: colors.text,
          margin: "0 0 24px",
        }}>
          The first OS for<br />
          <span style={{ color: colors.accent }}>Autonomous Agents</span>
        </h1>

        <p style={{
          fontSize: "clamp(17px, 2.5vw, 21px)", lineHeight: 1.6, color: colors.textMuted,
          maxWidth: 600, margin: "0 auto 40px",
        }}>
          Create your own AI agency in minutes. 15 prebuilt agents. Open source. 
          Easy enough for anyone. Powerful enough for Fortune 500.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/dashboard.html" style={{
            background: colors.accent, color: colors.bg, padding: "14px 32px", borderRadius: 8,
            fontSize: 16, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: `0 0 30px ${colors.accentGlow}`,
          }}>
            Start Building <ArrowRight size={18} />
          </a>
          <a href="https://github.com/sutra-team" style={{
            background: "transparent", color: colors.text, padding: "14px 32px", borderRadius: 8,
            fontSize: 16, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            border: `1px solid ${colors.border}`,
          }}>
            <Code size={18} /> View Source
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
          {[
            { val: "15", label: "PMF Agents" },
            { val: "12+", label: "Field Templates" },
            { val: "8", label: "Security Layers" },
            { val: "32+", label: "Skills" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</div>
              <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </section>
  );
}

function ValueProps() {
  const props = [
    {
      icon: <Heart size={22} />, color: colors.warm, title: "Easy",
      desc: "If you can describe what you need, you can build an agent. No code required. Visual dashboard. Templates for every field.",
    },
    {
      icon: <Shield size={22} />, color: colors.green, title: "Secure",
      desc: "8 layers of Sammā Suit protection on every agent, every action, every message. Budget enforcement, audit trails, kill switches.",
    },
    {
      icon: <Zap size={22} />, color: colors.accent, title: "Powerful",
      desc: "Multi-agent councils that deliberate in parallel. 15 specialists analyzing your question before Sutra synthesizes the answer.",
    },
    {
      icon: <Globe size={22} />, color: colors.purple, title: "Affordable",
      desc: "BYOK (Bring Your Own Key) or use credits. Iceland servers: 100% renewable energy, 72% lower infrastructure costs. Savings passed to you.",
    },
    {
      icon: <Code size={22} />, color: colors.warm, title: "Extendable",
      desc: "OpenClaw Skills Library compatible. Build custom skills. Connect any API. Every agent is a Portable Mind Format JSON — fork it, modify it, share it.",
    },
    {
      icon: <Key size={22} />, color: colors.danger, title: "Your Choice",
      desc: "BYOK or credits. Claude, OpenAI, Google, DeepSeek, or local models. Your keys, your data, your agents. We never lock you in.",
    },
  ];

  return (
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          Built for everyone
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
          From managing a household to launching an enterprise AI strategy.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {props.map(p => (
          <div key={p.title} style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12,
            padding: 28, transition: "border-color 0.2s, transform 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 8, background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, marginBottom: 16 }}>
              {p.icon}
            </div>
            <h3 style={{ fontSize: 18, color: colors.text, margin: "0 0 10px", fontWeight: 600 }}>{p.title}</h3>
            <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AgentsShowcase() {
  const [activeTab, setActiveTab] = useState("rights");

  return (
    <section id="agents" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          15 specialists. Day one.
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17, maxWidth: 560, margin: "0 auto" }}>
          An ethics council grounded in the Noble Eightfold Path, domain experts for every business function, and Sutra — who confers with all of them.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
        {[
          { id: "rights", label: "Council of Rights", count: 8 },
          { id: "experts", label: "Domain Experts", count: 6 },
          { id: "synthesis", label: "Synthesis", count: 1 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? colors.accentGlow : "transparent",
            border: `1px solid ${activeTab === t.id ? colors.accentDim : colors.border}`,
            color: activeTab === t.id ? colors.accent : colors.textMuted,
            padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
            transition: "all 0.2s",
          }}>
            {t.label} <span style={{ opacity: 0.5, marginLeft: 4 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      {activeTab === "rights" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {councilOfRights.map(a => (
            <div key={a.name} style={{
              background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 10,
              padding: 20, transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHover}
              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: colors.accent }}>{a.aspect}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "experts" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {councilOfExperts.map(a => (
            <div key={a.name} style={{
              background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 10,
              padding: 20, transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHover}
              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: colors.warm }}>{a.domain}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "synthesis" && (
        <div style={{ maxWidth: 480, margin: "0 auto", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 32, textAlign: "center" }}>
          <span style={{ fontSize: 48 }}>🪷</span>
          <h3 style={{ fontSize: 22, color: colors.text, margin: "16px 0 8px", fontWeight: 500 }}>{sutraAgent.name}</h3>
          <p style={{ fontSize: 15, color: colors.textMuted, margin: 0, lineHeight: 1.7 }}>{sutraAgent.role}</p>
          <div style={{ marginTop: 20, padding: 16, background: `${colors.accent}08`, borderRadius: 8, border: `1px solid ${colors.accent}15` }}>
            <p style={{ fontSize: 13, color: colors.accent, margin: 0, fontStyle: "italic" }}>
              "Not just 'what should I do' — but 'what should I do and can I live with it.'"
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function Templates() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? templateCategories : templateCategories.slice(0, 6);

  return (
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          Then build your own
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17, maxWidth: 560, margin: "0 auto" }}>
          Portable Mind Format (PMF) templates for a dozen fields. Open source. Fork, customize, deploy.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {visible.map(cat => (
          <div key={cat.category} style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 10,
            padding: 20, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHover}
            onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 10 }}>{cat.category}</div>
            {cat.templates.map(t => (
              <div key={t} style={{ fontSize: 13, color: colors.textMuted, padding: "4px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <Bot size={12} style={{ color: colors.textDim }} /> {t}
              </div>
            ))}
          </div>
        ))}
      </div>

      {!expanded && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => setExpanded(true)} style={{
            background: "transparent", border: `1px solid ${colors.border}`, color: colors.textMuted,
            padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            Show all {templateCategories.length} categories <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* PMF Explainer */}
      <div style={{
        marginTop: 48, background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: 32, display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap",
      }}>
        <div style={{ flex: "1 1 300px" }}>
          <h3 style={{ fontSize: 18, color: colors.text, margin: "0 0 12px", fontWeight: 600 }}>Portable Mind Format</h3>
          <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>
            Every agent is a structured JSON file — identity, voice, values, knowledge, behavioral constraints. 
            It runs on Claude today. It runs on GPT tomorrow. The persona rides the model. 
            Your agents are never locked to a single provider.
          </p>
          <a href="/book" style={{ color: colors.accent, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12 }}>
            Read The Portable Mind <ArrowRight size={12} />
          </a>
        </div>
        <div style={{ flex: "1 1 300px", background: colors.bg, borderRadius: 8, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: colors.textMuted, lineHeight: 1.8, overflow: "auto" }}>
          <span style={{ color: colors.textDim }}>{"{"}</span><br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"persona_id"</span>: <span style={{ color: colors.warm }}>"sutra-wisdom-judge"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"name"</span>: <span style={{ color: colors.warm }}>"Wisdom Judge"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"framework"</span>: <span style={{ color: colors.warm }}>"noble_eightfold_path"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"aspect"</span>: <span style={{ color: colors.warm }}>"right_view"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"voice"</span>: {"{"} <span style={{ color: colors.warm }}>"tone"</span>: [<span style={{ color: colors.warm }}>"analytical"</span>, <span style={{ color: colors.warm }}>"direct"</span>] {"}"},<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"model"</span>: <span style={{ color: colors.warm }}>"provider_agnostic"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"skills"</span>: [<span style={{ color: colors.warm }}>"web-search"</span>, <span style={{ color: colors.warm }}>"document-reader"</span>],<br />
          &nbsp;&nbsp;<span style={{ color: colors.accent }}>"security"</span>: <span style={{ color: colors.warm }}>"sammasuit_8_layer"</span><br />
          <span style={{ color: colors.textDim }}>{"}"}</span>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          8 layers of protection
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17, maxWidth: 600, margin: "0 auto" }}>
          OpenClaw has 512 known vulnerabilities. Sutra.team has Sammā Suit. 
          Native platform gets all 8 layers. OpenClaw plugin gets 6 — because process isolation and value frameworks require native architecture.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {securityLayers.map(l => (
          <div key={l.name} style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 10,
            padding: 20, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHover}
            onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: colors.accent, fontWeight: 600 }}>{l.name}</span>
                <span style={{ fontSize: 13, color: colors.textMuted, marginLeft: 8 }}>{l.label}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <span title="Native" style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: l.native ? `${colors.green}20` : `${colors.danger}15`, color: l.native ? colors.green : colors.danger }}>
                  {l.native ? "✓" : "✗"} Native
                </span>
                <span title="Plugin" style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: l.plugin ? `${colors.green}20` : `${colors.warm}20`, color: l.plugin ? colors.green : colors.warm }}>
                  {l.plugin ? "✓" : "—"} Plugin
                </span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>{l.desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32, padding: 24, background: `${colors.warm}08`, border: `1px solid ${colors.warm}20`,
        borderRadius: 10, textAlign: "center",
      }}>
        <p style={{ fontSize: 14, color: colors.warm, margin: 0 }}>
          <strong>Already using OpenClaw?</strong> Install the Sammā Suit plugin for 6-layer protection. 
          <a href="https://sammasuit.com" style={{ color: colors.accent, marginLeft: 8, textDecoration: "underline" }}>sammasuit.com</a>
        </p>
      </div>
    </section>
  );
}

function IcelandSection() {
  return (
    <section style={{
      padding: "80px 24px", maxWidth: 1200, margin: "0 auto",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${colors.bgCard} 0%, #0d1b2a 100%)`,
        border: `1px solid ${colors.border}`, borderRadius: 16,
        padding: "48px 40px", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{ flex: "1 1 340px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🇮🇸</span>
            <h3 style={{ fontSize: 24, color: colors.text, fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, margin: 0 }}>
              Powered by Iceland
            </h3>
          </div>
          <p style={{ fontSize: 15, color: colors.textMuted, lineHeight: 1.8, margin: "0 0 20px" }}>
            Our infrastructure runs on 100% renewable geothermal and hydroelectric energy in Iceland — 
            outside US surveillance jurisdiction, with the strongest privacy laws in Europe, and natural cooling 
            that cuts costs by 72% compared to traditional US data centers. Those savings go directly to you.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { val: "100%", label: "Renewable energy" },
              { val: "72%", label: "Lower costs" },
              { val: "GDPR", label: "Aligned privacy" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 700, color: colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "0 0 auto", fontSize: 80, opacity: 0.15 }}>❄️</div>
      </div>
    </section>
  );
}

function OpenClawCompat() {
  return (
    <section style={{ padding: "60px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16,
        padding: "40px 36px", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{ flex: "1 1 340px" }}>
          <div style={{ fontSize: 12, color: colors.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
            Ecosystem
          </div>
          <h3 style={{ fontSize: 26, color: colors.text, fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, margin: "0 0 16px" }}>
            OpenClaw Skills Compatible
          </h3>
          <p style={{ fontSize: 15, color: colors.textMuted, lineHeight: 1.8, margin: "0 0 20px" }}>
            Every skill in the ClawHub library works on Sutra.team — browser control, email, calendar, file management, 
            Slack, Discord, and hundreds more. Plus every skill goes through Sammā Suit's SANGHA scanning before it touches your agents.
          </p>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: colors.textDim, background: colors.bg, padding: 12, borderRadius: 6 }}>
            <span style={{ color: colors.accent }}>$</span> sutra skills install weather-lookup<br />
            <span style={{ color: colors.green }}>✓ Scanned by SANGHA · Approved · Installed</span>
          </div>
        </div>
        <div style={{ flex: "1 1 200px", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {["web-search", "email-sender", "calendar", "browser", "code-executor", "slack", "discord", "file-manager", "zoom", "notion", "obsidian", "telegram"].map(s => (
            <span key={s} style={{
              padding: "6px 12px", borderRadius: 6, background: `${colors.accent}10`,
              border: `1px solid ${colors.accent}20`, fontSize: 12, color: colors.accent,
            }}>{s}</span>
          ))}
          <span style={{ padding: "6px 12px", fontSize: 12, color: colors.textDim }}>+ hundreds more</span>
        </div>
      </div>
    </section>
  );
}

function DeliberationDemo() {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 36px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          Ask once. Hear everything.
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 16 }}>Council deliberation is a skill your agents can invoke — or you can run it yourself from the dashboard.</p>
      </div>

      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden" }}>
        {/* Query */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}`, background: `${colors.accent}05` }}>
          <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 6 }}>YOU ASK</div>
          <div style={{ fontSize: 16, color: colors.text, fontWeight: 500 }}>"Should we open-source our SDK?"</div>
        </div>

        {/* Perspectives */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 11, color: colors.textDim, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>Perspectives</div>
          {[
            { name: "Wisdom Judge", text: "Open-sourcing builds trust and community, but assess what you're giving away vs. keeping proprietary." },
            { name: "Legal Analyst", text: "Patent protection covers the framework. SDK is safe to open-source under Apache 2.0 with a CLA." },
            { name: "Risk Assessor", text: "Low risk if core IP stays closed. Moderate competitive risk — mitigate with fast iteration." },
            { name: "Ethics Judge", text: "Open-sourcing security tooling aligns with industry responsibility." },
          ].map(p => (
            <div key={p.name} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: colors.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: colors.accent, fontWeight: 700, flexShrink: 0 }}>
                {p.name.split(" ").map(w => w[0]).join("")}
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{p.name}</span>
                <p style={{ fontSize: 13, color: colors.textMuted, margin: "4px 0 0", lineHeight: 1.6 }}>{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Synthesis */}
        <div style={{ padding: "20px 24px", background: `${colors.accent}05` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🪷</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.accent }}>Sutra — Synthesis</span>
          </div>
          <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, margin: 0 }}>
            <strong>Consensus:</strong> Open-source the SDK. Legal confirms patent protection. Ethics and Growth align on trust-building.
            <br /><strong style={{ color: colors.warm }}>Tension:</strong> Risk Assessor flags competitive forking. Mitigation: fast iteration + community ownership.
            <br /><strong style={{ color: colors.accent }}>Recommendation:</strong> Proceed with Apache 2.0 + CLA. Ship within 30 days.
          </p>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          Simple pricing
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17 }}>BYOK or credits. Start free, scale when ready.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {/* Explorer */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Explorer</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: colors.text, margin: "12px 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>$9<span style={{ fontSize: 16, color: colors.textMuted, fontWeight: 400 }}>/mo</span></div>
          <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Start with the full team. Build up to 5 agents.</p>
          {[
            "15 pre-built PMF specialists",
            "5 custom agents",
            "Dashboard chat",
            "All 32+ skills",
            "Audit trail",
            "BYOK supported",
          ].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: colors.textMuted }}>
              <Check size={14} style={{ color: colors.green }} /> {f}
            </div>
          ))}
          <a href="/dashboard.html" style={{
            display: "block", textAlign: "center", padding: "12px 0", borderRadius: 8,
            border: `1px solid ${colors.border}`, color: colors.text, textDecoration: "none",
            fontSize: 14, fontWeight: 600, marginTop: 24,
          }}>Get Started</a>
        </div>

        {/* Pro */}
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.accentDim}`, borderRadius: 12, padding: 32,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -10, right: 16, background: colors.accent, color: colors.bg,
            padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700,
          }}>POPULAR</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Pro</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: colors.text, margin: "12px 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>$29<span style={{ fontSize: 16, color: colors.textMuted, fontWeight: 400 }}>/mo</span></div>
          <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Unlimited agents. Full power. All channels.</p>
          {[
            "Everything in Explorer",
            "Unlimited agents",
            "Voice sessions",
            "All channels (Telegram, Slack, Email)",
            "Heartbeat scheduling",
            "Council deliberation skill",
            "Priority support",
          ].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: colors.textMuted }}>
              <Check size={14} style={{ color: colors.accent }} /> {f}
            </div>
          ))}
          <a href="/dashboard.html" style={{
            display: "block", textAlign: "center", padding: "12px 0", borderRadius: 8,
            background: colors.accent, color: colors.bg, textDecoration: "none",
            fontSize: 14, fontWeight: 700, marginTop: 24,
          }}>Go Pro</a>
        </div>

        {/* International */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>International</span>
            <span style={{ fontSize: 16 }}>🇮🇸</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: colors.text, margin: "12px 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>$99<span style={{ fontSize: 16, color: colors.textMuted, fontWeight: 400 }}>/mo</span></div>
          <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Iceland-hosted. Full power. Global privacy.</p>
          {[
            "Everything in Pro",
            "Iceland server infrastructure",
            "100% renewable energy hosting",
            "GDPR-aligned data jurisdiction",
            "Outside US surveillance scope",
            "Bitcoin / crypto payments accepted",
            "Priority international support",
          ].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: colors.textMuted }}>
              <Check size={14} style={{ color: colors.warm }} /> {f}
            </div>
          ))}
          <a href="/dashboard.html" style={{
            display: "block", textAlign: "center", padding: "12px 0", borderRadius: 8,
            border: `1px solid ${colors.warm}`, color: colors.warm, textDecoration: "none",
            fontSize: 14, fontWeight: 600, marginTop: 24,
          }}>Go International</a>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 11, color: colors.textDim }}>
            <span>₿ BTC</span> · <span>Ξ ETH</span> · <span>💳 Card</span> · <span>🏦 Wire</span>
          </div>
        </div>

        {/* Enterprise */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Enterprise</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: colors.text, margin: "12px 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>Custom</div>
          <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Multiple AI agencies. White-label. SSO. SLA.</p>
          {[
            "Everything in International",
            "Custom councils & value frameworks",
            "White-labeling",
            "SSO / SAML",
            "Dedicated support + SLA",
            "Custom model routing",
            "On-prem option",
          ].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: colors.textMuted }}>
              <Check size={14} style={{ color: colors.purple }} /> {f}
            </div>
          ))}
          <a href="/about#contact" style={{
            display: "block", textAlign: "center", padding: "12px 0", borderRadius: 8,
            border: `1px solid ${colors.border}`, color: colors.text, textDecoration: "none",
            fontSize: 14, fontWeight: 600, marginTop: 24,
          }}>Contact Sales</a>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 11, color: colors.textDim }}>
            All payment methods accepted
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{
      padding: "80px 24px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", bottom: "-30%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", color: colors.text, fontWeight: 400, margin: "0 0 16px" }}>
          Your agency is waiting
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17, marginBottom: 32, lineHeight: 1.7 }}>
          15 specialists. 32+ skills. 8 security layers. Open source. 
          Start in minutes.
        </p>
        <a href="/dashboard.html" style={{
          background: colors.accent, color: colors.bg, padding: "16px 40px", borderRadius: 8,
          fontSize: 17, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          boxShadow: `0 0 40px ${colors.accentGlow}`,
        }}>
          Launch Dashboard <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${colors.border}`, padding: "48px 24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 12 }}>Product</div>
          {[
            { label: "Agents", href: "#agents" },
            { label: "Security", href: "#security" },
            { label: "Pricing", href: "#pricing" },
            { label: "Docs", href: "/docs" },
            { label: "Dashboard", href: "/dashboard.html" },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ display: "block", color: colors.textMuted, textDecoration: "none", fontSize: 13, padding: "4px 0" }}>{l.label}</a>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 12 }}>Company</div>
          {[
            { label: "About", href: "/about" },
            { label: "For Experts", href: "/experts/join" },
            { label: "Blog", href: "/blog" },
            { label: "The Portable Mind", href: "/book" },
            { label: "Contact", href: "/about#contact" },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ display: "block", color: colors.textMuted, textDecoration: "none", fontSize: 13, padding: "4px 0" }}>{l.label}</a>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 12 }}>Ecosystem</div>
          {[
            { label: "SammaSuit.com", href: "https://sammasuit.com" },
            { label: "OneZeroEight.ai", href: "https://onezeroeight.ai" },
            { label: "Sutra.exchange", href: "https://sutra.exchange" },
            { label: "GitHub", href: "https://github.com/sutra-team" },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ display: "block", color: colors.textMuted, textDecoration: "none", fontSize: 13, padding: "4px 0" }}>{l.label}</a>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 12 }}>Legal</div>
          {[
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy" },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ display: "block", color: colors.textMuted, textDecoration: "none", fontSize: 13, padding: "4px 0" }}>{l.label}</a>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 4 }}>From the same mind</div>
            <a href="https://a.co/0iBAsM27" style={{ color: colors.textMuted, textDecoration: "none", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <BookOpen size={12} /> The Portable Mind
            </a>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: colors.textDim }}>
          © 2026 sutra.team — <a href="https://onezeroeight.ai" style={{ color: colors.textDim, textDecoration: "none" }}>OneZeroEight.ai</a>
        </div>
        <div style={{ fontSize: 12, color: colors.textDim, display: "flex", alignItems: "center", gap: 12 }}>
          Protected by <a href="https://sammasuit.com" style={{ color: colors.accent, textDecoration: "none" }}>Sammā Suit</a>
          · Open Source · 🇮🇸 Iceland Powered
          <span style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            {[
              { label: "@sutra_ai", href: "https://x.com/sutra_ai" },
              { label: "@sammasuit", href: "https://x.com/sammasuit" },
              { label: "@jbwagoner", href: "https://x.com/jbwagoner" },
            ].map(s => (
              <a key={s.label} href={s.href} style={{ color: colors.textDim, textDecoration: "none", fontSize: 11 }}>{s.label}</a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function SutraLanding() {
  return (
    <div style={{
      background: colors.bg, color: colors.text, minHeight: "100vh",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <NavBar />
      <Hero />
      <ValueProps />
      <AgentsShowcase />
      <Templates />
      <OpenClawCompat />
      <SecuritySection />
      <IcelandSection />
      <DeliberationDemo />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
