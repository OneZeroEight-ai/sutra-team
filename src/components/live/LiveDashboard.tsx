'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

// ── Types ────────────────────────────────────────────────────────────────────

type EventType =
  | 'deliberation_started'
  | 'agent_perspective_start'
  | 'agent_perspective_complete'
  | 'synthesis_start'
  | 'synthesis_complete'
  | 'skill_invoked'
  | 'skill_complete'
  | 'heartbeat_pulse'
  | 'sammasuit_check'
  | 'memory_update'
  | 'ping'

interface LiveEvent {
  event: EventType
  agent_id: string
  timestamp: string
  payload?: Record<string, unknown>
}

interface AgentCard {
  name: string
  aspect?: string
  status: 'waiting' | 'thinking' | 'complete'
  preview?: string
  confidence?: number
  tokens?: number
}

interface SammaSuitCheck {
  layer: string
  status: 'passed' | 'blocked' | 'warning'
  detail: string
  ts: string
}

interface ActivityEntry {
  id: string
  type: EventType
  label: string
  detail?: string
  ts: string
  status?: 'ok' | 'warn' | 'block'
}

// ── Constants ────────────────────────────────────────────────────────────────

const LAYER_COLORS: Record<string, string> = {
  KARMA:   '#f59e0b',
  SILA:    '#6366f1',
  METTA:   '#ec4899',
  SANGHA:  '#10b981',
  NIRVANA: '#ef4444',
  DHARMA:  '#8b5cf6',
  BODHI:   '#06b6d4',
  SUTRA:   '#f97316',
}

const SKILL_ICONS: Record<string, string> = {
  'web-search':      '\u{1F50D}',
  'email-sender':    '\u2709\uFE0F',
  'calendar':        '\u{1F4C5}',
  'browser':         '\u{1F310}',
  'file-manager':    '\u{1F4C1}',
  'slack':           '\u{1F4AC}',
  'telegram':        '\u{1F4F1}',
  'code-executor':   '\u26A1',
  'document-reader': '\u{1F4C4}',
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LiveDashboard() {
  const { userId, isSignedIn } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [agentCards, setAgentCards] = useState<Record<string, AgentCard>>({})
  const [sammaSuitChecks, setSammaSuitChecks] = useState<SammaSuitCheck[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([])
  const [karmaTotal, setKarmaTotal] = useState(0)
  const [karmaUsed, setKarmaUsed] = useState(0)
  const [deliberationId, setDeliberationId] = useState<string | null>(null)
  const [synthesisPreview, setSynthesisPreview] = useState<string | null>(null)
  const [queryPreview, setQueryPreview] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'deliberating' | 'synthesizing' | 'complete'>('idle')
  const feedRef = useRef<HTMLDivElement>(null)

  const pushActivity = useCallback((entry: Omit<ActivityEntry, 'id'>) => {
    setActivityFeed(prev => [
      { ...entry, id: crypto.randomUUID() },
      ...prev.slice(0, 49)
    ])
  }, [])

  const handleEvent = useCallback((ev: LiveEvent) => {
    const ts = new Date(ev.timestamp).toLocaleTimeString()

    switch (ev.event) {
      case 'deliberation_started': {
        const p = ev.payload!
        setDeliberationId(p.deliberation_id as string)
        setQueryPreview(p.query_preview as string)
        setKarmaTotal(p.karma_budget as number)
        setKarmaUsed(0)
        setAgentCards({})
        setSynthesisPreview(null)
        setPhase('deliberating')
        pushActivity({ type: ev.event, label: 'Council convened', detail: p.query_preview as string, ts, status: 'ok' })
        break
      }

      case 'agent_perspective_start': {
        const p = ev.payload!
        const name = p.council_member as string
        setAgentCards(prev => ({
          ...prev,
          [name]: { name, aspect: p.eightfold_aspect as string | undefined, status: 'thinking' }
        }))
        break
      }

      case 'agent_perspective_complete': {
        const p = ev.payload!
        const name = p.council_member as string
        const tokens = p.tokens_used as number
        setAgentCards(prev => ({
          ...prev,
          [name]: {
            ...prev[name],
            status: 'complete',
            preview: p.preview as string,
            confidence: p.confidence as number,
            tokens
          }
        }))
        setKarmaUsed(prev => prev + tokens)
        pushActivity({ type: ev.event, label: `${name}`, detail: (p.preview as string)?.slice(0, 80), ts, status: 'ok' })
        break
      }

      case 'synthesis_start': {
        const p = ev.payload!
        setPhase('synthesizing')
        pushActivity({ type: ev.event, label: 'Sutra synthesizing', detail: `${p.agreements} agreements, ${p.tensions} tensions, ${p.gaps} gaps`, ts, status: 'ok' })
        break
      }

      case 'synthesis_complete': {
        const p = ev.payload!
        setSynthesisPreview(p.synthesis_preview as string)
        setKarmaUsed(p.total_tokens as number)
        setPhase('complete')
        pushActivity({ type: ev.event, label: 'Synthesis complete', detail: `${p.duration_ms}ms, ${(p.total_tokens as number).toLocaleString()} tokens`, ts, status: 'ok' })
        break
      }

      case 'skill_invoked': {
        const p = ev.payload!
        const skill = p.skill as string
        const icon = SKILL_ICONS[skill] || '\u{1F527}'
        pushActivity({ type: ev.event, label: `${icon} ${skill} invoked`, detail: p.input_preview as string, ts, status: 'ok' })
        break
      }

      case 'skill_complete': {
        const p = ev.payload!
        pushActivity({ type: ev.event, label: `${SKILL_ICONS[p.skill as string] || '\u{1F527}'} ${p.skill} complete`, detail: `${p.duration_ms}ms`, ts, status: 'ok' })
        break
      }

      case 'heartbeat_pulse': {
        const p = ev.payload!
        pushActivity({ type: ev.event, label: 'Heartbeat', detail: p.task_preview as string, ts, status: 'ok' })
        break
      }

      case 'sammasuit_check': {
        const p = ev.payload!
        const layer = p.layer as string
        const status = p.status as 'passed' | 'blocked' | 'warning'
        setSammaSuitChecks(prev => [
          { layer, status, detail: p.detail as string, ts },
          ...prev.slice(0, 7)
        ])
        pushActivity({
          type: ev.event,
          label: `${layer} ${status === 'passed' ? 'passed' : status === 'blocked' ? 'BLOCKED' : 'warning'}`,
          detail: p.detail as string,
          ts,
          status: status === 'passed' ? 'ok' : status === 'blocked' ? 'block' : 'warn'
        })
        break
      }

      case 'memory_update': {
        const p = ev.payload!
        pushActivity({ type: ev.event, label: `Memory: ${p.tier}`, detail: p.preview as string, ts, status: 'ok' })
        break
      }
    }
  }, [pushActivity])

  // Fetch customer ID from backend auth
  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.customer?.id) setCustomerId(data.customer.id)
      })
      .catch(() => {})
  }, [isSignedIn])

  // WebSocket connection
  useEffect(() => {
    if (!customerId) return
    const apiBase = process.env.NEXT_PUBLIC_SUTRA_API_URL?.replace('https://', 'wss://').replace('http://', 'ws://')
    if (!apiBase) return
    const url = `${apiBase}/ws/live/${customerId}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    ws.onmessage = (msg) => {
      try {
        const ev: LiveEvent = JSON.parse(msg.data)
        if (ev.event !== 'ping') handleEvent(ev)
      } catch { /* ignore malformed messages */ }
    }

    return () => ws.close()
  }, [customerId, handleEvent])

  const karmaPercent = karmaTotal > 0 ? Math.min((karmaUsed / karmaTotal) * 100, 100) : 0
  const completedAgents = Object.values(agentCards).filter(a => a.status === 'complete').length
  const thinkingAgents = Object.values(agentCards).filter(a => a.status === 'thinking').length
  const totalAgents = Object.keys(agentCards).length

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 font-mono p-6 grid grid-cols-[1fr_320px] grid-rows-[auto_1fr_auto] gap-4 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="col-span-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? '#10b981' : '#ef4444',
              boxShadow: connected ? '0 0 8px #10b981' : 'none',
            }}
          />
          <span className="text-[11px] text-slate-500 uppercase tracking-widest">
            {connected ? 'Live' : 'Disconnected'}
          </span>
          {queryPreview && (
            <span className="text-xs text-slate-400 ml-4">
              &ldquo;{queryPreview.slice(0, 60)}{queryPreview.length > 60 ? '\u2026' : ''}&rdquo;
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <PhaseIndicator phase={phase} />
          {totalAgents > 0 && (
            <span className="text-[11px] text-slate-500">
              {completedAgents}/{totalAgents} agents complete
              {thinkingAgents > 0 && ` \u00B7 ${thinkingAgents} thinking`}
            </span>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col gap-4 min-h-0">

        {/* KARMA Budget */}
        {karmaTotal > 0 && (
          <div className="bg-[#0f1629] border border-slate-800 rounded-lg p-4">
            <div className="flex justify-between mb-2 text-[11px]">
              <span style={{ color: LAYER_COLORS.KARMA }} className="uppercase tracking-widest">
                KARMA &middot; Token Budget
              </span>
              <span className="text-slate-400">
                {karmaUsed.toLocaleString()} / {karmaTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-1 bg-slate-800 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${karmaPercent}%`,
                  background: karmaPercent > 80 ? '#ef4444' : karmaPercent > 60 ? '#f59e0b' : LAYER_COLORS.KARMA,
                }}
              />
            </div>
          </div>
        )}

        {/* Agent Cards Grid */}
        {totalAgents > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
            {Object.values(agentCards).map(agent => (
              <AgentCardComponent key={agent.name} agent={agent} />
            ))}
          </div>
        )}

        {/* Synthesis Output */}
        {synthesisPreview && (
          <div className="rounded-lg p-5 border border-orange-500" style={{ background: 'linear-gradient(135deg, #0f1629 0%, #1a1040 100%)' }}>
            <div className="text-[11px] text-orange-500 uppercase tracking-widest mb-3">
              Sutra &middot; Synthesis
            </div>
            <p className="text-[13px] leading-relaxed text-slate-300 m-0">
              {synthesisPreview}
            </p>
          </div>
        )}

        {/* Idle state */}
        {phase === 'idle' && totalAgents === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-800 text-[13px] border border-dashed border-slate-800 rounded-lg p-16 text-center whitespace-pre-line">
            {connected
              ? 'Waiting for activity\u2026\nStart a deliberation or heartbeat to see live output.'
              : 'Connecting to agent feed\u2026'}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="flex flex-col gap-4 min-h-0">

        {/* Samma Suit Checks */}
        <div className="bg-[#0f1629] border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">
            Samma Suit &middot; Layers
          </div>
          {sammaSuitChecks.length === 0 ? (
            <div className="text-[11px] text-slate-800">No checks yet</div>
          ) : (
            sammaSuitChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: i < sammaSuitChecks.length - 1 ? '1px solid #0a0e1a' : 'none' }}>
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: check.status === 'passed' ? '#10b981' : check.status === 'blocked' ? '#ef4444' : '#f59e0b' }}
                />
                <span className="text-[11px] font-semibold" style={{ color: LAYER_COLORS[check.layer] || '#94a3b8' }}>
                  {check.layer}
                </span>
                <span className="text-[10px] text-slate-600 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {check.detail}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-[#0f1629] border border-slate-800 rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
          <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">
            Activity Feed
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto flex flex-col gap-1.5">
            {activityFeed.map(entry => (
              <div
                key={entry.id}
                className="text-[11px] p-1.5 px-2 rounded bg-[#0a0e1a]"
                style={{ borderLeft: `2px solid ${entry.status === 'ok' ? '#10b981' : entry.status === 'block' ? '#ef4444' : '#f59e0b'}` }}
              >
                <div className="flex justify-between" style={{ marginBottom: entry.detail ? '2px' : 0 }}>
                  <span className="text-slate-200">{entry.label}</span>
                  <span className="text-slate-700">{entry.ts}</span>
                </div>
                {entry.detail && (
                  <div className="text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">
                    {entry.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AgentCardComponent({ agent }: { agent: AgentCard }) {
  const statusColor = agent.status === 'complete' ? '#10b981' : agent.status === 'thinking' ? '#f59e0b' : '#334155'

  return (
    <div
      className="rounded-md p-3 transition-all duration-300"
      style={{
        background: agent.status === 'complete' ? 'rgba(16,185,129,0.05)' : agent.status === 'thinking' ? 'rgba(245,158,11,0.05)' : '#0f1629',
        border: `1px solid ${statusColor}33`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-200">{agent.name}</span>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: statusColor,
            boxShadow: agent.status === 'thinking' ? `0 0 6px ${statusColor}` : 'none',
            animation: agent.status === 'thinking' ? 'pulse 1.5s infinite' : 'none',
          }}
        />
      </div>
      {agent.aspect && (
        <div className="text-[10px] text-slate-600 mb-1.5">{agent.aspect}</div>
      )}
      {agent.preview && (
        <div className="text-[10px] text-slate-500 overflow-hidden line-clamp-2">
          {agent.preview}
        </div>
      )}
      {agent.confidence !== undefined && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex-1 h-0.5 bg-slate-800 rounded">
            <div className="h-full bg-emerald-500 rounded" style={{ width: `${agent.confidence * 100}%` }} />
          </div>
          <span className="text-[10px] text-slate-600">{Math.round(agent.confidence * 100)}%</span>
        </div>
      )}
    </div>
  )
}

function PhaseIndicator({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    idle:         { label: 'Idle', color: '#334155' },
    deliberating: { label: 'Deliberating', color: '#f59e0b' },
    synthesizing: { label: 'Synthesizing', color: '#8b5cf6' },
    complete:     { label: 'Complete', color: '#10b981' },
  }
  const { label, color } = map[phase] || map.idle
  return (
    <span
      className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-xl"
      style={{ color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}
