'use client'

import { motion } from 'framer-motion'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import CodeBlock from '@/components/code-block'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
})

const endpoints = [
  { method: 'GET', path: '/api/health', desc: 'runtime status and version', res: `{ "status": "ok", "version": "2.0.10", "uptime": 3621 }` },
  { method: 'POST', path: '/api/chat', desc: 'send message · streaming via SSE', res: `{ "id": "msg_01", "role": "assistant", "content": "..." }` },
  { method: 'GET', path: '/api/models', desc: 'list configured providers and availability', res: `{ "providers": [{ "id": "claude", "available": true }, ...] }` },
  { method: 'GET', path: '/api/history', desc: 'retrieve conversation history by session', res: `{ "messages": [...], "total": 42 }` },
  { method: 'POST', path: '/api/models/switch', desc: 'switch active provider mid-conversation', res: `{ "active": "gpt-4o", "switched": true }` },
]

const wsEvents = [
  { event: 'chat.token', desc: 'single streaming token' },
  { event: 'chat.complete', desc: 'full response on completion' },
  { event: 'model.switch', desc: 'active provider changed' },
  { event: 'plugin.event', desc: 'custom event from a plugin' },
  { event: 'system.ready', desc: 'runtime finished startup' },
]

export default function Tech() {
  return (
    <>
      <Nav />
      <main>

        <section className="section-pad pt-36 pb-20 max-w-screen-xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <p className="text-label mb-6 opacity-60">✦ &nbsp; tech</p>
            <h1
              className="display text-ink"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
            >
              under
              <br />
              <span className="text-pink" style={{ opacity: 0.85 }}>the hood.</span>
            </h1>
          </motion.div>
        </section>


        {/* architecture */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">architecture</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              system overview
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-line mb-10">
            {[
              {
                layer: 'foundation',
                name: 'elizaOS',
                desc: 'The agent framework Milady OS is built on. Core agent loop, memory abstractions, plugin system, adapter interfaces.',
                tags: ['TypeScript', 'Node.js 22+', 'Bun'],
              },
              {
                layer: 'desktop shell',
                name: 'Electrobun',
                desc: 'Native desktop container. Cross-platform, ships its own WebView, handles window management and OS integration.',
                tags: ['native', 'WebView', 'cross-platform'],
              },
              {
                layer: 'frontend',
                name: 'React + Vite',
                desc: 'Web UI and embedded desktop interface. WebGL pipeline for real-time VRM avatar with expression and animation control.',
                tags: ['React 18', 'Vite', 'WebGL', 'VRM'],
              },
            ].map((l, i) => (
              <motion.div
                key={l.name}
                {...fadeUp(i * 0.08)}
                className="bg-bg hover:bg-surface p-7 transition-colors duration-200"
              >
                <p className="text-label mb-4 opacity-40">{l.layer}</p>
                <p className="text-base text-ink-2">{l.name}</p>
                <p className="text-sm text-ink-3 mt-3 leading-relaxed" style={{ fontSize: '0.8125rem' }}>{l.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {l.tags.map((t) => (
                    <span key={t} className="mono-tag px-2 py-0.5 border border-line opacity-50">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.1)} className="bg-surface border border-line p-7">
            <p className="text-label mb-5 opacity-50">data flow</p>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {['user input', '→', 'elizaOS loop', '→', 'plugin pipeline', '→', 'LLM provider', '→', 'response stream', '→', 'UI / WebSocket'].map((s, i) => (
                <span
                  key={i}
                  className={s === '→' ? 'text-ink-4' : 'text-ink-3 px-2.5 py-1 bg-bg border border-line'}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-ink-3 mt-4 opacity-60">
              Memory retrieval and plugin hooks run between agent loop and LLM call. All state persisted locally in SQLite.
            </p>
          </motion.div>
        </section>


        {/* built by agents */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-50">development pipeline</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                no human reviewers.
              </h2>
              <p
                className="display mt-1"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', color: '#f2a7c3', opacity: 0.65 }}
              >
                this is the pipeline.
              </p>
              <p className="mt-6 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                Every commit goes through agent review and agent merge. No human approvers. The result: 1768+ PRs shipped with consistent standards, zero reviewer fatigue.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  ['1768+', 'closed prs'],
                  ['0', 'human reviewers in pipeline'],
                  ['100%', 'agent-reviewed merges'],
                ].map(([n, l]) => (
                  <div key={l} className="flex items-baseline justify-between border-b border-line pb-3">
                    <span
                      className="display text-ink"
                      style={{ fontSize: '1.875rem' }}
                    >
                      {n}
                    </span>
                    <span className="mono-tag opacity-50">{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="space-y-px bg-line">
              {[
                { n: '01', t: 'PR submitted', d: 'agent categorizes: feature · fix · refactor · chore · docs · breaking' },
                { n: '02', t: 'automated checks', d: 'TypeScript · ESLint · unit tests · build · dependency audit' },
                { n: '03', t: 'semantic review', d: 'reads full diff · checks logic, API misuse, security, style' },
                { n: '04', t: 'auto-merge or feedback', d: 'approved PRs merge immediately · specific inline comments if not' },
                { n: '05', t: 'human QA', d: 'real users install the build · file issues · repeat' },
              ].map((s) => (
                <div key={s.n} className="bg-bg hover:bg-surface p-6 flex gap-5 transition-colors duration-200">
                  <span className="mono-tag text-pink opacity-50 shrink-0 pt-0.5">{s.n}</span>
                  <div>
                    <p className="text-sm text-ink-2">{s.t}</p>
                    <p className="mono-tag mt-1 opacity-40">{s.d}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* REST API */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">API reference</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              REST API
            </h2>
            <p
              className="display mt-1"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', color: '#f2a7c3', opacity: 0.55 }}
            >
              localhost:2138
            </p>
            <p className="mt-5 text-ink-3 max-w-lg leading-relaxed" style={{ fontSize: '0.875rem' }}>
              Available when Milady OS is running. All responses JSON. Streaming responses use Server-Sent Events.
            </p>
          </motion.div>

          <div className="space-y-px bg-line">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                {...fadeUp(i * 0.05)}
                className="bg-bg hover:bg-surface transition-colors duration-200"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="flex items-center gap-3 md:col-span-1">
                    <span className={`mono-tag px-2 py-0.5 border shrink-0 ${
                      ep.method === 'GET' ? 'border-lavender/30 text-lavender' : 'border-pink-border text-pink'
                    } opacity-80`}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-sm text-ink-2" style={{ fontSize: '0.8125rem' }}>{ep.path}</code>
                  </div>
                  <p className="md:col-span-2 text-sm text-ink-3" style={{ fontSize: '0.8125rem' }}>{ep.desc}</p>
                </div>
                <div className="mx-6 mb-6">
                  <code className="block font-mono text-xs text-ink-3 bg-s2 px-4 py-3 border border-line opacity-70">
                    {ep.res}
                  </code>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* WebSocket */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              WebSocket gateway
            </h2>
            <p
              className="display mt-1"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', color: '#f2a7c3', opacity: 0.55 }}
            >
              localhost:18789
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-px bg-line">
              {wsEvents.map((ev) => (
                <div key={ev.event} className="bg-bg hover:bg-surface p-5 flex items-center gap-5 transition-colors duration-200">
                  <code className="font-mono text-xs text-pink opacity-70 shrink-0 w-28">{ev.event}</code>
                  <span className="text-sm text-ink-3" style={{ fontSize: '0.8125rem' }}>{ev.desc}</span>
                </div>
              ))}
            </div>

            <CodeBlock
              filename="connect.js"
              lang="javascript"
              code={`const ws = new WebSocket('ws://localhost:18789')

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    events: ['chat.token', 'chat.complete'],
  }))
}

ws.onmessage = (e) => {
  const { event, data } = JSON.parse(e.data)
  if (event === 'chat.token') {
    process.stdout.write(data.token)
  }
}`}
            />
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
