'use client'

import { motion } from 'framer-motion'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
})

const llmProviders = [
  { name: 'Claude', org: 'Anthropic', note: 'Opus · Sonnet · Haiku' },
  { name: 'GPT-4o', org: 'OpenAI', note: 'all GPT-4 variants' },
  { name: 'Gemini', org: 'Google', note: 'Pro · Ultra · Flash' },
  { name: 'Llama 3', org: 'Meta / local', note: 'via Ollama' },
  { name: 'Mistral', org: 'Mistral AI', note: 'all sizes' },
  { name: 'Ollama', org: 'local', note: 'any GGUF model' },
  { name: 'Groq', org: 'Groq', note: 'LPU inference' },
  { name: 'Together AI', org: 'Together', note: 'open models' },
  { name: 'Cohere', org: 'Cohere', note: 'Command family' },
  { name: 'Perplexity', org: 'Perplexity', note: 'search-augmented' },
  { name: 'Fireworks', org: 'Fireworks AI', note: 'fast inference' },
  { name: 'Deepseek', org: 'Deepseek', note: 'R1 · V3' },
  { name: 'xAI', org: 'xAI', note: 'Grok' },
  { name: 'Qwen', org: 'Alibaba', note: 'local / API' },
  { name: 'Custom', org: 'any', note: 'OpenAI-compatible endpoint' },
]

export default function Features() {
  return (
    <>
      <Nav />
      <main>

        {/* header */}
        <section className="section-pad pt-36 pb-20 max-w-screen-xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <p className="text-label mb-6 opacity-60">✦ &nbsp; features</p>
            <h1
              className="display text-ink"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
            >
              everything
              <br />
              <span className="text-pink" style={{ opacity: 0.85 }}>it can do.</span>
            </h1>
          </motion.div>
        </section>


        {/* ── 01 · privacy ── */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-50">01 · privacy</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                local-first architecture
              </h2>
              <p
                className="display mt-1"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', color: '#f2a7c3', opacity: 0.6 }}
              >
                nothing phones home.
              </p>
              <p className="mt-6 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                milady was built from first principles around data sovereignty. Nothing is sent remotely unless you configure a cloud LLM — and even then, only the conversation turn transmits. Never history, never files, never identity.
              </p>
              <p className="mt-3 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                No analytics pipeline. No crash reporting that exfiltrates data. No telemetry. The only outbound traffic is what you initiate.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="space-y-px bg-line">
              {[
                ['conversation history', 'local SQLite'],
                ['file attachments', 'local filesystem only'],
                ['local model inference', 'on-device, never transmitted'],
                ['wallet keys', 'local keystore, never uploaded'],
                ['plugin data', 'defined by plugin, auditable'],
                ['telemetry', 'none'],
              ].map(([label, where]) => (
                <div key={label} className="bg-bg hover:bg-surface p-5 flex items-center justify-between gap-4 transition-colors duration-200">
                  <span className="text-sm text-ink-2">{label}</span>
                  <span className="mono-tag opacity-50">{where}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* ── 02 · LLMs ── */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">02 · intelligence</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              15+ providers
            </h2>
            <p className="mt-4 text-ink-3 max-w-lg leading-relaxed" style={{ fontSize: '0.875rem' }}>
              Switch between providers in settings or via the API. milady maintains context across model switches — move from local to cloud and back without losing thread.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
            {llmProviders.map((p, i) => (
              <motion.div
                key={p.name}
                {...fadeUp(i * 0.025)}
                className="bg-bg hover:bg-surface p-5 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-2">{p.name}</span>
                  <span className="mono-tag opacity-40">{p.org}</span>
                </div>
                <p className="mono-tag mt-1.5 opacity-40">{p.note}</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-5 text-ink-3" style={{ fontSize: '0.75rem' }}>
            Any OpenAI-compatible endpoint works. Point milady at a local vLLM, LM Studio, or Jan instance — it just works.
          </p>
        </section>


        {/* ── 03 · crypto ── */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-50">03 · chain</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                blockchain native
              </h2>
              <p className="mt-6 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                EVM and Solana wallets are generated on first run and stored in the local keystore. No extension required, no MetaMask dependency — the wallet is part of the runtime.
              </p>
              <p className="mt-3 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                BNB Smart Chain is native. PancakeSwap is built in as a core plugin. Ask milady to execute trades, check balances, or query DeFi positions in natural language.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="space-y-3">
              {[
                { t: 'auto-generated wallets', b: 'EVM + Solana on first run · stored in local keystore' },
                { t: 'BNB Smart Chain', b: 'native — balances, transactions, contract calls' },
                { t: 'PancakeSwap', b: 'built-in DEX integration · swap in natural language' },
                { t: 'key custody', b: 'you hold your keys · nothing uploaded' },
              ].map((x) => (
                <div key={x.t} className="bg-surface border border-line p-5">
                  <p className="text-sm text-ink-2">{x.t}</p>
                  <p className="mono-tag mt-1.5 opacity-50">{x.b}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* ── 04 · interfaces ── */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">04 · interfaces</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              every interface you need
            </h2>
          </motion.div>

          <div className="space-y-px bg-line">
            {[
              {
                name: 'desktop app',
                sub: 'Electrobun · 3D VRM · macOS · Windows · Linux',
                body: 'The primary interface. Native shell built on Electrobun with real-time 3D VRM avatar rendered via WebGL. Expressions and animations respond to conversation context.',
              },
              {
                name: 'web UI',
                sub: 'React + Vite · browser-based · local server',
                body: 'Full-featured interface served locally on port 2138. Works in any browser. Useful for headless servers, remote access over local network, or just preferring a tab.',
              },
              {
                name: 'terminal UI',
                sub: 'TUI · keyboard-driven · any terminal',
                body: 'No graphics, no overhead. For SSH sessions, servers, or anyone who lives in the terminal.',
              },
              {
                name: 'Android',
                sub: '.apk · ARM64 · Android 8+',
                body: 'Native Android app. Connects to a local milady instance on your network, or runs a lightweight model on-device.',
              },
            ].map((x, i) => (
              <motion.div
                key={x.name}
                {...fadeUp(i * 0.07)}
                className="bg-bg hover:bg-surface p-7 grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors duration-200"
              >
                <div>
                  <p className="text-sm text-ink-2">{x.name}</p>
                  <p className="mono-tag mt-1.5 opacity-40">{x.sub}</p>
                </div>
                <p className="md:col-span-2 text-sm text-ink-3 leading-relaxed" style={{ fontSize: '0.8125rem' }}>
                  {x.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ── 05 · plugins ── */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-50">05 · extension</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                plugin system
              </h2>
              <p className="mt-6 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                Plugins are first-class citizens. Add new LLM providers, TTS engines, vision models, tools, memory backends, or entirely new behaviors.
              </p>
              <p className="mt-3 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                The plugin API is typed TypeScript. Plugins are npm packages — publish one and it's discoverable immediately. The core milady features (BNB, PancakeSwap, Telegram, Discord) all ship as plugins.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)}>
              <div className="grid grid-cols-2 gap-px bg-line">
                {['LLM providers', 'TTS engines', 'vision models', 'memory backends', 'custom tools', 'voice input', 'messaging adapters', 'data connectors'].map((c) => (
                  <div key={c} className="bg-bg hover:bg-surface p-4 transition-colors duration-200">
                    <p className="text-sm text-ink-3">{c}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>


        {/* ── 06 · integrations ── */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">06 · integrations</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              connect everything
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
            {[
              {
                name: 'Telegram',
                tag: 'messaging',
                body: 'Full bot integration. The milady instance acts as your Telegram bot — runs locally, you control it entirely.',
              },
              {
                name: 'Discord',
                tag: 'messaging',
                body: 'Server integration with slash commands and DM support. Community management, Q&A bots, personal assistant in your own server.',
              },
              {
                name: 'REST API',
                tag: 'api',
                body: 'Full REST API on port 2138. Everything the UI does, you can script. Query models, send messages, manage plugins.',
              },
              {
                name: 'WebSocket',
                tag: 'api',
                body: 'Real-time event gateway on port 18789. Stream responses, subscribe to model events, build custom frontends on top of the milady runtime.',
              },
            ].map((x, i) => (
              <motion.div
                key={x.name}
                {...fadeUp(i * 0.07)}
                className="bg-bg hover:bg-surface p-7 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-ink-2">{x.name}</p>
                  <span className="mono-tag opacity-40 px-2 py-0.5 border border-line">{x.tag}</span>
                </div>
                <p className="text-sm text-ink-3 leading-relaxed" style={{ fontSize: '0.8125rem' }}>
                  {x.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
