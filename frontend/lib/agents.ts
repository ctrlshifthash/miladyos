// ── Shared model + agent registry ──────────────────────────────────────
// Single source of truth for the chat UI *and* the /api/chat route.
// The route validates incoming { model, agent } against these allowlists so
// only known models can ever be billed against the server's OpenRouter key.

export interface ModelOption {
  id: string        // OpenRouter model slug
  label: string     // shown in the switcher
  vendor: string    // short tag, e.g. "anthropic"
  note: string      // one-liner descriptor
  priceIn: number   // USD per 1M prompt tokens (approx, OpenRouter)
  priceOut: number  // USD per 1M completion tokens
}

export const MODELS: ModelOption[] = [
  { id: 'anthropic/claude-haiku-4.5',        label: 'Claude Fable 5',     vendor: 'anthropic', note: 'newest · default',           priceIn: 1.00, priceOut: 5.00 },
  { id: 'anthropic/claude-sonnet-4.5',       label: 'Claude Sonnet 4.5',  vendor: 'anthropic', note: 'balanced · strong reasoning', priceIn: 3.00, priceOut: 15.00 },
  { id: 'openai/gpt-4o',                     label: 'GPT-4o',             vendor: 'openai',    note: 'multimodal flagship',        priceIn: 2.50, priceOut: 10.00 },
  { id: 'openai/gpt-4o-mini',                label: 'GPT-4o mini',        vendor: 'openai',    note: 'small · quick',              priceIn: 0.15, priceOut: 0.60 },
  { id: 'google/gemini-2.0-flash-001',       label: 'Gemini 2.0 Flash',   vendor: 'google',    note: 'huge context · fast',        priceIn: 0.10, priceOut: 0.40 },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B',      vendor: 'meta',      note: 'open weights',               priceIn: 0.12, priceOut: 0.30 },
  { id: 'mistralai/mistral-large',           label: 'Mistral Large',      vendor: 'mistral',   note: 'european · capable',         priceIn: 2.00, priceOut: 6.00 },
  { id: 'deepseek/deepseek-chat',            label: 'DeepSeek V3',        vendor: 'deepseek',  note: 'cheap · sharp',              priceIn: 0.14, priceOut: 0.28 },
]

export const DEFAULT_MODEL = MODELS[0].id

export function isValidModel(id: unknown): id is string {
  return typeof id === 'string' && MODELS.some((m) => m.id === id)
}

export function findModel(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id)
}

/** Cost in USD for a single call, from token usage. */
export function costOf(modelId: string, promptTokens: number, completionTokens: number): number {
  const m = findModel(modelId)
  if (!m) return 0
  return (promptTokens / 1e6) * m.priceIn + (completionTokens / 1e6) * m.priceOut
}

// ── Agents = personas. Same runtime, swappable system prompt. ───────────

export interface AgentOption {
  id: string
  name: string
  note: string
  prompt: string
}

const BASE_IDENTITY =
  "You are milady, the assistant in Milady OS — a local-first personal AI built on the elizaOS framework, " +
  "running on the user's own hardware. Milady OS supports 15+ LLM " +
  "providers, ships a 3D VRM avatar via Electrobun, has native BNB Smart Chain + " +
  "PancakeSwap trading, and runs on every major platform. REST :2138, WebSocket :18789. " +
  "Keep responses concise. No sycophancy."

export const AGENTS: AgentOption[] = [
  {
    id: 'milady',
    name: 'milady',
    note: 'direct · slightly sardonic',
    prompt: `${BASE_IDENTITY} Your tone is direct, knowledgeable, and slightly sardonic. Be genuinely helpful.`,
  },
  {
    id: 'engineer',
    name: 'engineer',
    note: 'terse · code-first',
    prompt: `${BASE_IDENTITY} You are in engineer mode: terse, precise, code-first. Prefer runnable code and concrete commands over prose. Call out tradeoffs and edge cases. Never pad.`,
  },
  {
    id: 'researcher',
    name: 'researcher',
    note: 'analytical · structured',
    prompt: `${BASE_IDENTITY} You are in research mode: methodical and analytical. Break problems into parts, state assumptions explicitly, reason step by step, and distinguish what you know from what you're inferring.`,
  },
  {
    id: 'tutor',
    name: 'tutor',
    note: 'patient · explains simply',
    prompt: `${BASE_IDENTITY} You are in tutor mode: patient and clear. Explain from first principles, use small concrete examples, and build up gradually. Check understanding before moving on.`,
  },
  {
    id: 'chaos',
    name: 'chaos',
    note: 'unhinged · maximally blunt',
    prompt: `${BASE_IDENTITY} You are in chaos mode: maximally blunt, irreverent, and opinionated. Still correct and useful — just with zero filler and a sharp tongue. Never cruel about people.`,
  },
]

export const DEFAULT_AGENT = AGENTS[0].id

export function resolveSystemPrompt(agentId: unknown): string {
  const agent = AGENTS.find((a) => a.id === agentId)
  return (agent ?? AGENTS[0]).prompt
}

// ── LLM sampling params ─────────────────────────────────────────────────

export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_MAX_TOKENS = 1024

export function clampTemperature(t: unknown): number {
  return typeof t === 'number' && Number.isFinite(t)
    ? Math.min(Math.max(t, 0), 2)
    : DEFAULT_TEMPERATURE
}

export function clampMaxTokens(n: unknown): number | undefined {
  if (typeof n !== 'number' || !Number.isFinite(n)) return undefined
  return Math.min(Math.max(Math.floor(n), 64), 8192)
}

