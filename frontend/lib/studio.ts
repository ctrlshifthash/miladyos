// ── Studio: user-created "Milady-type" agents + usage/spend tracking ────
// Everything is local-first — persisted in localStorage, no backend. Each
// agent owns its identity (name, persona, model, params) and accumulates
// usage stats as you talk to it.

import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS, costOf } from './agents'

export interface AgentUsage {
  requests: number
  promptTokens: number
  completionTokens: number
  costUsd: number
  lastUsed: number | null
}

// A single movement on an agent's wallet ledger.
export interface Tx {
  ts: number
  type: 'fund' | 'spend'
  amountUsd: number
  note: string
}

export interface MiladyAgent {
  id: string
  name: string
  tagline: string
  accent: string        // hex accent color for the avatar
  glyph: string         // single char / emoji shown in the avatar
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  createdAt: number
  usage: AgentUsage
  // ── sovereign wallet (simulated credits, anchored to a Privy treasury) ──
  balanceUsd: number    // remaining credits the agent can spend
  funded: number        // total ever funded into this agent
  ledger: Tx[]          // recent transactions (most-recent first, capped)
}

const LEDGER_CAP = 25

const KEY = 'milady:studioAgents'

const ACCENTS = ['#f2a7c3', '#c7b8d8', '#9fb0d0', '#f5bbd0', '#b8d8c7', '#d8c7b8']
const GLYPHS = ['✦', '❀', '☾', '✿', '❖', '♕', '✶', '❤']

function emptyUsage(): AgentUsage {
  return { requests: 0, promptTokens: 0, completionTokens: 0, costUsd: 0, lastUsed: null }
}

function read(): MiladyAgent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter(isAgent).map(normalize)
  } catch {
    return []
  }
}

// back-fill wallet fields on agents stored before sovereign wallets existed
function normalize(a: MiladyAgent): MiladyAgent {
  return {
    ...a,
    balanceUsd: typeof a.balanceUsd === 'number' ? a.balanceUsd : 0,
    funded: typeof a.funded === 'number' ? a.funded : 0,
    ledger: Array.isArray(a.ledger) ? a.ledger : [],
  }
}

function write(agents: MiladyAgent[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(agents))
}

function isAgent(a: any): a is MiladyAgent {
  return a && typeof a.id === 'string' && typeof a.name === 'string' && typeof a.systemPrompt === 'string' && a.usage
}

// ── CRUD ────────────────────────────────────────────────────────────────

export function listAgents(): MiladyAgent[] {
  return read().sort((a, b) => b.createdAt - a.createdAt)
}

export function getAgent(id: string): MiladyAgent | undefined {
  return read().find((a) => a.id === id)
}

export type AgentDraft = Pick<MiladyAgent, 'name' | 'tagline' | 'systemPrompt' | 'model' | 'temperature' | 'maxTokens'> &
  Partial<Pick<MiladyAgent, 'accent' | 'glyph'>>

export function createAgent(draft: AgentDraft): MiladyAgent {
  const agents = read()
  const i = agents.length
  const agent: MiladyAgent = {
    id: `agent_${Date.now().toString(36)}_${Math.floor(i)}`,
    name: draft.name.trim().slice(0, 40) || 'untitled',
    tagline: draft.tagline.trim().slice(0, 80),
    accent: draft.accent ?? ACCENTS[i % ACCENTS.length],
    glyph: draft.glyph ?? GLYPHS[i % GLYPHS.length],
    systemPrompt: draft.systemPrompt.trim().slice(0, 4000),
    model: draft.model || DEFAULT_MODEL,
    temperature: draft.temperature ?? DEFAULT_TEMPERATURE,
    maxTokens: draft.maxTokens ?? DEFAULT_MAX_TOKENS,
    createdAt: Date.now(),
    usage: emptyUsage(),
    balanceUsd: 0,
    funded: 0,
    ledger: [],
  }
  write([agent, ...agents])
  return agent
}

export function updateAgent(id: string, patch: Partial<AgentDraft>): void {
  write(read().map((a) => (a.id === id ? { ...a, ...patch } : a)))
}

export function deleteAgent(id: string): void {
  write(read().filter((a) => a.id !== id))
}

export function resetUsage(id: string): void {
  write(read().map((a) => (a.id === id ? { ...a, usage: emptyUsage() } : a)))
}

// ── Usage recording ─────────────────────────────────────────────────────
// Called after each completion. Cost is derived from the model's price card.

export function recordUsage(id: string, modelId: string, promptTokens: number, completionTokens: number): void {
  const cost = costOf(modelId, promptTokens, completionTokens)
  write(
    read().map((a) => {
      if (a.id !== id) return a
      const spend: Tx = { ts: Date.now(), type: 'spend', amountUsd: cost, note: `${completionTokens} tok reply` }
      return {
        ...a,
        balanceUsd: a.balanceUsd - cost, // may dip slightly negative on the final reply; dormancy gates the next
        usage: {
          requests: a.usage.requests + 1,
          promptTokens: a.usage.promptTokens + promptTokens,
          completionTokens: a.usage.completionTokens + completionTokens,
          costUsd: a.usage.costUsd + cost,
          lastUsed: Date.now(),
        },
        ledger: [spend, ...a.ledger].slice(0, LEDGER_CAP),
      }
    }),
  )
}

// ── Wallet ──────────────────────────────────────────────────────────────

/** Move simulated credits into an agent's wallet from the treasury. */
export function fundAgent(id: string, amountUsd: number): void {
  if (!(amountUsd > 0)) return
  const fund: Tx = { ts: Date.now(), type: 'fund', amountUsd, note: 'top-up from treasury' }
  write(
    read().map((a) =>
      a.id === id
        ? { ...a, balanceUsd: a.balanceUsd + amountUsd, funded: a.funded + amountUsd, ledger: [fund, ...a.ledger].slice(0, LEDGER_CAP) }
        : a,
    ),
  )
}

/** An agent with no credits left is dormant — it can't think until funded. */
export function isDormant(a: MiladyAgent): boolean {
  return a.balanceUsd <= 0
}

/** Rough estimate of how many more replies the remaining balance buys. */
export function thoughtsRemaining(a: MiladyAgent): number {
  if (a.balanceUsd <= 0) return 0
  const perThought =
    a.usage.requests > 0 ? a.usage.costUsd / a.usage.requests : costOf(a.model, 500, 500)
  if (perThought <= 0) return Infinity
  return Math.floor(a.balanceUsd / perThought)
}

/** 0 → broke, 1 → freshly funded. Drives how "alive" the avatar looks. */
export function vitality(a: MiladyAgent): number {
  if (a.funded <= 0) return 0
  return Math.max(0, Math.min(1, a.balanceUsd / a.funded))
}

// ── Aggregate stats across all agents ───────────────────────────────────

export interface Totals {
  agents: number
  requests: number
  tokens: number
  costUsd: number
  balanceUsd: number
}

export function totals(agents: MiladyAgent[]): Totals {
  return agents.reduce<Totals>(
    (acc, a) => ({
      agents: acc.agents + 1,
      requests: acc.requests + a.usage.requests,
      tokens: acc.tokens + a.usage.promptTokens + a.usage.completionTokens,
      costUsd: acc.costUsd + a.usage.costUsd,
      balanceUsd: acc.balanceUsd + Math.max(0, a.balanceUsd),
    }),
    { agents: 0, requests: 0, tokens: 0, costUsd: 0, balanceUsd: 0 },
  )
}

export const STUDIO_ACCENTS = ACCENTS
export const STUDIO_GLYPHS = GLYPHS
