'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MiladyAgent } from '@/lib/studio'
import { findModel } from '@/lib/agents'

// Approx memory footprint (GB) a model of this class would occupy if run locally.
function footprintGb(label = ''): number {
  if (/70b|large/i.test(label)) return 42
  if (/sonnet|gpt-4o\b/i.test(label)) return 18
  if (/mini|flash|haiku|deepseek|v3/i.test(label)) return 7
  return 14
}
const MACHINE_RAM = 64 // notional local machine, for the RAM bar

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  tokens?: number
  costUsd?: number
}

interface Props {
  agent: MiladyAgent
  /** fired once per completed reply so the parent can persist usage */
  onUsage: (promptTokens: number, completionTokens: number) => void
  /** when true the agent is out of credits — block sending */
  dormant?: boolean
}

export default function AgentChat({ agent, onUsage, dormant }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState({ tokens: 0, cost: 0 })
  const [hw, setHw] = useState({ load: 5, ram: footprintGb(findModel(agent.model)?.label) * 0.9, tps: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => { loadingRef.current = loading }, [loading])

  // live GPU / RAM / throughput ticker — spikes while the agent is generating
  useEffect(() => {
    const base = footprintGb(findModel(agent.model)?.label)
    const iv = setInterval(() => {
      setHw((prev) => {
        const active = loadingRef.current
        const targetLoad = active ? 80 + Math.random() * 18 : 4 + Math.random() * 6
        return {
          load: prev.load + (targetLoad - prev.load) * 0.55,
          ram: base * (active ? 0.99 + Math.random() * 0.06 : 0.88 + Math.random() * 0.05),
          tps: active ? 30 + Math.random() * 28 : 0,
        }
      })
    }, 650)
    return () => clearInterval(iv)
  }, [agent.model])

  // reset the thread + compute meter when you switch agents
  useEffect(() => {
    setMessages([{ id: 'w', role: 'assistant', content: `i'm ${agent.name}. ${agent.tagline || 'ask me anything.'}` }])
    setSession({ tokens: 0, cost: 0 })
  }, [agent.id, agent.name, agent.tagline])

  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }) }, [messages])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading || dormant) return
    const assistantId = crypto.randomUUID()
    setInput('')
    setLoading(true)
    setMessages((p) => [
      ...p,
      { id: crypto.randomUUID(), role: 'user', content: text },
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])

    const history = messages.filter((m) => !m.streaming && m.id !== 'w').map((m) => ({ role: m.role, content: m.content }))
    abortRef.current = new AbortController()
    let prompt = 0, completion = 0

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          model: agent.model,
          system: agent.systemPrompt,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        }),
        signal: abortRef.current.signal,
      })
      if (!res.ok || !res.body) throw new Error(`${res.status}`)

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let acc = '', buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break
          try {
            const json = JSON.parse(raw)
            if (json.usage) { prompt = json.usage.prompt_tokens ?? 0; completion = json.usage.completion_tokens ?? 0 }
            if (json.token) {
              acc += json.token
              setMessages((p) => p.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)))
            }
            if (json.error) throw new Error(json.error)
          } catch { /* partial */ }
        }
      }

      // fall back to a rough estimate if the provider withheld usage
      if (!completion) completion = Math.round(acc.length / 4)
      if (!prompt) prompt = Math.round((agent.systemPrompt.length + text.length) / 4)
      const m = findModel(agent.model)
      const costUsd = m ? (prompt / 1e6) * m.priceIn + (completion / 1e6) * m.priceOut : 0
      setMessages((p) => p.map((x) => (x.id === assistantId ? { ...x, streaming: false, tokens: completion, costUsd } : x)))
      setSession((s) => ({ tokens: s.tokens + prompt + completion, cost: s.cost + costUsd }))
      onUsage(prompt, completion)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages((p) => p.map((x) => (x.id === assistantId ? { ...x, content: 'request failed — check your API key.', streaming: false } : x)))
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, agent, onUsage, dormant])

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 border border-line text-ink-2 ${msg.role === 'user' ? 'bg-s3' : 'bg-surface'}`}
                style={{ fontSize: '0.8125rem' }}
              >
                {msg.content || <span className="opacity-40">…</span>}
                {msg.streaming && msg.content && (
                  <span className="inline-block w-0.5 h-3 ml-0.5 animate-pulse" style={{ background: agent.accent }} />
                )}
              </div>
              {msg.role === 'assistant' && !msg.streaming && msg.tokens != null && (
                <span className="mono-tag opacity-30 mt-1">{msg.tokens} tok · ${msg.costUsd!.toFixed(5)}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* live compute panel — GPU load, RAM, throughput, token spend */}
      <div className="border-t border-line px-3 py-2.5 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="mono-tag opacity-40 flex items-center gap-1.5">
            <span className="text-pink opacity-70">⚡</span> compute
          </span>
          <span className="mono-tag opacity-50">{hw.tps > 0 ? `${hw.tps.toFixed(0)} tok/s` : 'idle'}</span>
        </div>

        {/* gpu */}
        <div className="flex items-center gap-2">
          <span className="mono-tag opacity-40 w-7 shrink-0">gpu</span>
          <div className="flex-1 h-1 bg-line overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, hw.load)}%`, background: '#f2a7c3', opacity: 0.7 }} />
          </div>
          <span className="mono-tag opacity-50 w-9 text-right shrink-0">{hw.load.toFixed(0)}%</span>
        </div>

        {/* ram */}
        <div className="flex items-center gap-2">
          <span className="mono-tag opacity-40 w-7 shrink-0">ram</span>
          <div className="flex-1 h-1 bg-line overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, (hw.ram / MACHINE_RAM) * 100)}%`, background: '#c7b8d8', opacity: 0.7 }} />
          </div>
          <span className="mono-tag opacity-50 w-16 text-right shrink-0">{hw.ram.toFixed(1)} GB</span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span className="mono-tag opacity-40">this chat</span>
          <span className="mono-tag opacity-60">{session.tokens.toLocaleString()} tok · ${session.cost.toFixed(4)}</span>
        </div>
      </div>

      {dormant ? (
        <div className="border-t border-line px-3 py-3 shrink-0 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-4" />
          <span className="mono-tag opacity-50">dormant — out of credits. fund this agent to wake it.</span>
        </div>
      ) : (
        <div className="border-t border-line px-3 py-3 flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`message ${agent.name}…`}
            disabled={loading}
            className="flex-1 bg-transparent text-ink-2 placeholder-ink-4 outline-none"
            style={{ fontSize: '0.8125rem' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="shrink-0 disabled:opacity-20 transition-opacity text-lg leading-none"
            style={{ color: agent.accent }}
          >
            {loading ? <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : '↑'}
          </button>
        </div>
      )}
    </div>
  )
}
