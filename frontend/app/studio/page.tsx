'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from '@/components/nav'
import AgentChat from '@/components/agent-chat'
import Treasury from '@/components/treasury'
import { MODELS, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS, findModel } from '@/lib/agents'
import {
  listAgents, createAgent, updateAgent, deleteAgent, recordUsage, resetUsage, totals,
  fundAgent, isDormant, thoughtsRemaining, vitality,
  STUDIO_ACCENTS, STUDIO_GLYPHS, type MiladyAgent, type AgentDraft,
} from '@/lib/studio'

const FUND_AMOUNTS = [0.25, 1, 5]
const fmtThoughts = (n: number) => (n === Infinity ? '∞' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

const fmtTokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))
const fmtUsd = (n: number) => (n >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`)
const fmtAgo = (t: number | null) => {
  if (!t) return 'never'
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const emptyDraft = (): AgentDraft & { accent: string; glyph: string } => ({
  name: '', tagline: '', systemPrompt: '', model: DEFAULT_MODEL,
  temperature: DEFAULT_TEMPERATURE, maxTokens: DEFAULT_MAX_TOKENS,
  accent: STUDIO_ACCENTS[0], glyph: STUDIO_GLYPHS[0],
})

const STARTER: AgentDraft = {
  name: 'mini-milady', tagline: 'local-first, sardonic, helpful',
  systemPrompt: 'You are a milady-type personal AI: local-first, direct, slightly sardonic, and genuinely useful. Keep replies concise. No sycophancy.',
  model: DEFAULT_MODEL, temperature: 0.7, maxTokens: 1024,
}

export default function Studio() {
  const [agents, setAgents] = useState<MiladyAgent[]>([])
  const [draft, setDraft] = useState<(AgentDraft & { accent: string; glyph: string }) | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [fundingId, setFundingId] = useState<string | null>(null)

  const refresh = useCallback(() => setAgents(listAgents()), [])
  useEffect(() => { refresh() }, [refresh])

  const agg = useMemo(() => totals(agents), [agents])
  const openAgent = agents.find((a) => a.id === openId) ?? null

  const startCreate = () => { setEditId(null); setDraft(emptyDraft()) }
  const startEdit = (a: MiladyAgent) => {
    setEditId(a.id)
    setDraft({ name: a.name, tagline: a.tagline, systemPrompt: a.systemPrompt, model: a.model, temperature: a.temperature, maxTokens: a.maxTokens, accent: a.accent, glyph: a.glyph })
  }

  const save = () => {
    if (!draft || !draft.name.trim() || !draft.systemPrompt.trim()) return
    if (editId) updateAgent(editId, draft)
    else createAgent(draft)
    setDraft(null); setEditId(null); refresh()
  }

  const remove = (id: string) => {
    deleteAgent(id)
    if (openId === id) setOpenId(null)
    refresh()
  }

  const fund = (id: string, amount: number) => { fundAgent(id, amount); setFundingId(null); refresh() }

  const onUsage = useCallback((id: string, model: string, prompt: number, completion: number) => {
    recordUsage(id, model, prompt, completion)
    refresh()
  }, [refresh])

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Nav />

      <main className="flex-1 pt-20 section-pad max-w-screen-2xl mx-auto w-full pb-20">
        {/* treasury bar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-5 hairline-bottom">
          <Treasury />
          <span className="mono-tag opacity-30 hidden sm:block">sovereign agents · credits are simulated</span>
        </div>

        {/* heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-label mb-4 opacity-60">✦ &nbsp; studio</p>
            <h1 className="heading text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              agents that <span className="display text-pink" style={{ opacity: 0.85 }}>pay to think.</span>
            </h1>
            <p className="mt-3 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem', maxWidth: '56ch' }}>
              Build milady-type agents, fund each one from the treasury, and they spend their own credits to reply. Run an agent dry and it goes dormant until you top it up.
            </p>
          </div>
          <button onClick={startCreate} className="btn-primary px-5 py-2.5 self-start shrink-0">
            <span className="b">[</span><span className="mx-2">new agent</span><span className="b">]</span>
          </button>
        </div>

        {/* aggregate totals */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-line border border-line mb-10">
          {[
            ['agents', String(agg.agents), false],
            ['requests', String(agg.requests), false],
            ['tokens', fmtTokens(agg.tokens), false],
            ['total spend', fmtUsd(agg.costUsd), false],
            ['credits left', fmtUsd(agg.balanceUsd), true],
          ].map(([label, val, hl]) => (
            <div key={label as string} className="bg-bg p-5">
              <p className={`display ${hl ? 'text-pink' : 'text-ink'}`} style={{ fontSize: '2.25rem', opacity: hl ? 0.9 : 1 }}>{val}</p>
              <p className="mono-tag opacity-40 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* empty state */}
        {agents.length === 0 ? (
          <div className="border border-line border-dashed p-12 text-center">
            <p className="text-ink-3 mb-5" style={{ fontSize: '0.9rem' }}>no agents yet. spin up your first milady-type agent.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={startCreate} className="btn-primary px-5 py-2.5">build from scratch</button>
              <button onClick={() => { createAgent(STARTER); refresh() }} className="btn-ghost px-5 py-2.5">use a starter</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-line border border-line">
            {agents.map((a) => {
              const m = findModel(a.model)
              const dormant = isDormant(a)
              const v = vitality(a)
              return (
                <div key={a.id} className="bg-bg p-6 flex flex-col gap-4 group">
                  <div className="flex items-start gap-3">
                    {/* avatar — desaturates and dims as the agent runs out of credits */}
                    <div
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500"
                      style={{
                        borderColor: `${a.accent}55`,
                        background: `${a.accent}14`,
                        color: a.accent,
                        filter: `grayscale(${(1 - v).toFixed(2)})`,
                        opacity: dormant ? 0.35 : 0.55 + 0.45 * v,
                      }}
                    >
                      {a.glyph}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-2 truncate flex items-center gap-2" style={{ fontSize: '0.95rem' }}>
                        {a.name}
                        {dormant && <span className="mono-tag px-1.5 py-0.5 border border-line opacity-50 shrink-0">dormant</span>}
                      </p>
                      <p className="mono-tag opacity-40 truncate">{a.tagline || '—'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="mono-tag px-2 py-0.5 border border-line opacity-60">{m?.label ?? a.model}</span>
                    <span className="mono-tag px-2 py-0.5 border border-line opacity-50">temp {a.temperature.toFixed(1)}</span>
                  </div>

                  {/* wallet: balance + runway */}
                  <div className="border border-line">
                    <div className="flex items-center justify-between px-3 py-2.5 bg-surface">
                      <div>
                        <p className={dormant ? 'text-ink-3' : 'text-pink'} style={{ fontSize: '1.05rem' }}>{fmtUsd(Math.max(0, a.balanceUsd))}</p>
                        <p className="mono-tag opacity-40 mt-0.5">balance · ~{fmtThoughts(thoughtsRemaining(a))} thoughts left</p>
                      </div>
                      <div className="relative">
                        <button onClick={() => setFundingId((p) => (p === a.id ? null : a.id))} className="mono-tag px-2.5 py-1 border border-pink-border text-pink opacity-80 hover:opacity-100 transition-opacity">
                          fund +
                        </button>
                        {fundingId === a.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setFundingId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-s2 border border-line flex">
                              {FUND_AMOUNTS.map((amt) => (
                                <button key={amt} onClick={() => fund(a.id, amt)} className="mono-tag px-3 py-2 hover:bg-surface text-ink-2 hover:text-pink transition-colors whitespace-nowrap">
                                  +${amt}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {/* vitality bar */}
                    <div className="h-1 bg-line">
                      <div className="h-full transition-all duration-500" style={{ width: `${Math.round(v * 100)}%`, background: a.accent, opacity: 0.7 }} />
                    </div>
                  </div>

                  {/* per-agent usage */}
                  <div className="grid grid-cols-3 gap-px bg-line border border-line">
                    {[
                      ['reqs', String(a.usage.requests)],
                      ['tokens', fmtTokens(a.usage.promptTokens + a.usage.completionTokens)],
                      ['spend', fmtUsd(a.usage.costUsd)],
                    ].map(([l, val]) => (
                      <div key={l} className="bg-bg px-3 py-2.5">
                        <p className="text-ink-2" style={{ fontSize: '0.95rem' }}>{val}</p>
                        <p className="mono-tag opacity-40 mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mono-tag opacity-30 -mt-1">last used {fmtAgo(a.usage.lastUsed)}</p>

                  <div className="flex items-center gap-3 mt-1 hairline-top pt-4">
                    <button onClick={() => setOpenId(a.id)} className="mono-tag text-pink opacity-80 hover:opacity-100 transition-opacity">chat →</button>
                    <span className="text-ink-4 text-xs opacity-40">·</span>
                    <button onClick={() => startEdit(a)} className="mono-tag opacity-50 hover:opacity-90 transition-opacity">edit</button>
                    <span className="text-ink-4 text-xs opacity-40">·</span>
                    <button onClick={() => { resetUsage(a.id); refresh() }} className="mono-tag opacity-50 hover:opacity-90 transition-opacity">reset</button>
                    <button onClick={() => remove(a.id)} className="mono-tag opacity-0 group-hover:opacity-50 hover:!opacity-90 transition-opacity ml-auto">delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── create / edit modal ── */}
      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(5,4,8,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDraft(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-s2 border border-line max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                <p className="text-label opacity-70">{editId ? 'edit agent' : 'new agent'}</p>
                <button onClick={() => setDraft(null)} className="mono-tag opacity-40 hover:opacity-90">✕</button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* identity */}
                <div className="flex gap-3">
                  <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center border text-xl" style={{ borderColor: `${draft.accent}55`, background: `${draft.accent}14`, color: draft.accent }}>
                    {draft.glyph}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="agent name" className="w-full bg-bg border border-line px-3 py-2 text-ink-2 placeholder-ink-4 outline-none focus:border-line-2" style={{ fontSize: '0.85rem' }} />
                    <input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} placeholder="tagline — one line" className="w-full bg-bg border border-line px-3 py-2 text-ink-2 placeholder-ink-4 outline-none focus:border-line-2" style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>

                {/* accent + glyph */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {STUDIO_ACCENTS.map((c) => (
                      <button key={c} onClick={() => setDraft({ ...draft, accent: c })} className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: draft.accent === c ? '#fff' : 'transparent' }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {STUDIO_GLYPHS.map((g) => (
                      <button key={g} onClick={() => setDraft({ ...draft, glyph: g })} className={`w-6 h-6 flex items-center justify-center border ${draft.glyph === g ? 'border-pink-border text-pink' : 'border-line text-ink-3'}`} style={{ fontSize: '0.75rem' }}>{g}</button>
                    ))}
                  </div>
                </div>

                {/* system prompt */}
                <div>
                  <label className="mono-tag opacity-50 block mb-2">system prompt — its personality + rules</label>
                  <textarea value={draft.systemPrompt} onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })} rows={5} placeholder="You are a milady-type agent: local-first, direct, slightly sardonic…" className="w-full bg-bg border border-line px-3 py-2 text-ink-2 placeholder-ink-4 outline-none resize-none focus:border-line-2 leading-relaxed" style={{ fontSize: '0.8125rem' }} />
                </div>

                {/* model */}
                <div>
                  <label className="mono-tag opacity-50 block mb-2">model</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MODELS.map((m) => (
                      <button key={m.id} onClick={() => setDraft({ ...draft, model: m.id })} className={`text-left px-3 py-2 border transition-colors ${draft.model === m.id ? 'border-pink-border bg-surface' : 'border-line hover:bg-surface'}`}>
                        <span className={`block ${draft.model === m.id ? 'text-pink' : 'text-ink-2'}`} style={{ fontSize: '0.8125rem' }}>{m.label}</span>
                        <span className="mono-tag opacity-40">${m.priceIn}/${m.priceOut} per 1M</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* params */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between mb-2"><span className="mono-tag opacity-50">temperature</span><span className="mono-tag text-pink opacity-80">{draft.temperature.toFixed(2)}</span></div>
                    <input type="range" min={0} max={2} step={0.05} value={draft.temperature} onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })} className="w-full" style={{ accentColor: '#f2a7c3' }} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2"><span className="mono-tag opacity-50">max tokens</span><span className="mono-tag text-pink opacity-80">{draft.maxTokens}</span></div>
                    <input type="range" min={64} max={8192} step={64} value={draft.maxTokens} onChange={(e) => setDraft({ ...draft, maxTokens: Number(e.target.value) })} className="w-full" style={{ accentColor: '#f2a7c3' }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line">
                <button onClick={() => setDraft(null)} className="btn-ghost px-4 py-2">cancel</button>
                <button onClick={save} disabled={!draft.name.trim() || !draft.systemPrompt.trim()} className="btn-primary px-4 py-2 disabled:opacity-30">{editId ? 'save' : 'create agent'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── chat drawer ── */}
      <AnimatePresence>
        {openAgent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[55]" style={{ background: 'rgba(5,4,8,0.5)' }} onClick={() => setOpenId(null)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-[56] w-full max-w-md bg-bg border-l border-line flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-line shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border" style={{ borderColor: `${openAgent.accent}55`, background: `${openAgent.accent}14`, color: openAgent.accent }}>{openAgent.glyph}</span>
                  <div className="min-w-0">
                    <p className="text-ink-2 truncate" style={{ fontSize: '0.85rem' }}>{openAgent.name}</p>
                    <p className="mono-tag opacity-40 truncate">{findModel(openAgent.model)?.label} · {fmtUsd(Math.max(0, openAgent.balanceUsd))} left</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => fund(openAgent.id, 1)} className="mono-tag px-2 py-1 border border-pink-border text-pink opacity-80 hover:opacity-100 transition-opacity">fund +$1</button>
                  <button onClick={() => setOpenId(null)} className="mono-tag opacity-40 hover:opacity-90">✕</button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <AgentChat agent={openAgent} dormant={isDormant(openAgent)} onUsage={(p, c) => onUsage(openAgent.id, openAgent.model, p, c)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
