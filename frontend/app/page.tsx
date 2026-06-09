'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useInView, animate } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import DownloadGrid from '@/components/download-grid'
import ChatEmbed from '@/components/chat-embed'
import SovereignDemo from '@/components/sovereign-demo'
import LocalCompute from '@/components/local-compute'
import SectionNav from '@/components/section-nav'

const MiladyViewer = dynamic(() => import('@/components/milady-viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-pink opacity-20 animate-pulse-slow" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '4rem', fontStyle: 'italic', fontWeight: 300 }}>
        ✦
      </span>
    </div>
  ),
})

const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.9, delay, ease: 'easeOut' },
})

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
})

// thin pink bar at the very top that fills as you scroll the page
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  return <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-pink z-[60] origin-left" style={{ scaleX, opacity: 0.8 }} />
}

// floating ↑ button that appears once you've scrolled down
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const h = () => setShow(window.scrollY > 800)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center border border-pink-border bg-bg/80 backdrop-blur text-pink hover:bg-surface transition-colors"
          aria-label="back to top"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// counts up from 0 → `to` the first time it scrolls into view
function CountUp({ to, className, style }: { to: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration: 1.5, ease: 'easeOut', onUpdate: (v) => setVal(Math.floor(v)) })
    return () => controls.stop()
  }, [inView, to])
  return <span ref={ref} className={className} style={style}>{val.toLocaleString()}</span>
}

export default function Home() {
  return (
    <>
      <ScrollProgress />

      {/* announcement ticker */}
      <div className="relative overflow-hidden bg-s2 border-b border-line py-2 z-40">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="mono-tag opacity-50 mx-8">
              v2.0.10 released &nbsp;·&nbsp; powered by Claude Fable 5 + Mythos &nbsp;·&nbsp; 1768+ merged PRs &nbsp;·&nbsp; built by agents, tested by humans &nbsp;·&nbsp; elizaOS framework &nbsp;·&nbsp; local-first &nbsp;·&nbsp; 15+ LLM providers &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <Nav />
      <SectionNav />

      <main>

        {/* ── HERO: text · model · chat ───────────────────────────── */}
        <section id="top" className="relative section-pad max-w-screen-xl mx-auto" style={{ minHeight: '100vh' }}>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 50% 60% at 55% 50%, rgba(196,104,136,0.06) 0%, transparent 65%)',
            }}
          />

          {/* mobile: stacked */}
          <div className="lg:hidden flex flex-col gap-10 pt-28 pb-16 relative z-10">
            <div>
              <motion.p {...fade(0.1)} className="text-label mb-6 opacity-60">✦ &nbsp; milady OS &nbsp;·&nbsp; v2.0.10</motion.p>
              <motion.h1 {...fade(0.25)} className="display text-ink" style={{ fontSize: 'clamp(3rem, 14vw, 5rem)' }}>
                intelligence,<br /><span className="text-pink" style={{ opacity: 0.9 }}>contained.</span>
              </motion.h1>
              <motion.p {...fade(0.4)} className="mt-5 text-ink-3 leading-relaxed" style={{ fontSize: '0.9rem' }}>
                A personal AI that runs entirely on <span className="text-ink-2">your own hardware</span> — and shows you exactly how much GPU and RAM every agent is using, live. Nothing ever leaves your machine.
              </motion.p>
              <motion.div {...fade(0.48)} className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {['Fable 5 + Mythos (no guardrails)', 'live GPU + RAM monitor', '3D avatar + voice', 'trading agents'].map((t) => (
                  <span key={t} className="mono-tag opacity-50 flex items-center gap-1.5">
                    <span className="text-pink opacity-60">✦</span>{t}
                  </span>
                ))}
              </motion.div>
              <motion.div {...fade(0.55)} className="mt-6 flex flex-wrap gap-3">
                <Link href="/studio" className="btn-primary"><span className="b">[</span><span className="mx-2">try it</span><span className="b">]</span><span className="text-pink opacity-60 ml-1">→</span></Link>
                <Link href="/install" className="btn-ghost"><span className="mx-1">download ↓</span></Link>
                <a href="https://github.com/trymiladyOS/miladyOS" target="_blank" rel="noopener noreferrer" className="btn-ghost"><span className="mx-1">github ↗</span></a>
              </motion.div>
            </div>
            <motion.div {...fade(0.5)}>
              <ChatEmbed />
            </motion.div>
          </div>

          {/* desktop: 3 columns — pulled to the right viewport edge */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_2.1fr_1.7fr] lg:gap-8 items-center relative z-10 lg:-mr-20 xl:-mr-28" style={{ minHeight: '100vh' }}>

            {/* col 1: text */}
            <div className="pr-8 py-0">
              <motion.p {...fade(0.1)} className="text-label mb-8 opacity-60">
                ✦ &nbsp; milady OS &nbsp;·&nbsp; v2.0.10 &nbsp;·&nbsp; elizaOS
              </motion.p>
              <motion.h1 {...fade(0.25)} className="display text-ink" style={{ fontSize: 'clamp(2.75rem, 5vw, 6rem)' }}>
                intelligence,
                <br />
                <span className="text-pink" style={{ opacity: 0.9 }}>contained.</span>
              </motion.h1>
              <motion.p {...fade(0.45)} className="mt-7 text-ink-2 leading-relaxed" style={{ fontSize: '0.95rem', maxWidth: '42ch' }}>
                A personal AI that runs entirely on <span className="text-ink">your own hardware</span> — and shows you exactly how much GPU and RAM every agent is using, live. Nothing ever leaves your machine.
              </motion.p>
              <motion.div {...fade(0.55)} className="mt-5 flex flex-wrap gap-x-4 gap-y-2" style={{ maxWidth: '42ch' }}>
                {['Fable 5 + Mythos (no guardrails)', 'live GPU + RAM monitor', '3D avatar + voice', 'trading agents'].map((t) => (
                  <span key={t} className="mono-tag opacity-50 flex items-center gap-1.5">
                    <span className="text-pink opacity-60">✦</span>{t}
                  </span>
                ))}
              </motion.div>
              <motion.div {...fade(0.6)} className="mt-8 flex flex-col gap-3">
                <Link href="/studio" className="btn-primary self-start">
                  <span className="b">[</span><span className="mx-2">try it — build an agent</span><span className="b">]</span>
                  <span className="text-pink opacity-60 ml-1">→</span>
                </Link>
                <div className="flex gap-3">
                  <Link href="/install" className="btn-ghost self-start">
                    <span className="mx-1">download</span><span className="opacity-50">↓</span>
                  </Link>
                  <a href="https://github.com/trymiladyOS/miladyOS" target="_blank" rel="noopener noreferrer" className="btn-ghost self-start">
                    <span className="mx-1">github</span><span className="opacity-50">↗</span>
                  </a>
                </div>
              </motion.div>
              <motion.div {...fade(0.75)} className="mt-10 flex flex-wrap gap-6 hairline-top pt-8">
                {([
                  { n: 1768, suf: '+', l: 'prs' },
                  { n: 15, suf: '+', l: 'models' },
                  { t: 'v2', l: 'stable' },
                ] as { n?: number; suf?: string; t?: string; l: string }[]).map((s) => (
                  <div key={s.l}>
                    <span className="display text-ink block" style={{ fontSize: '2rem' }}>
                      {s.n != null ? <><CountUp to={s.n} />{s.suf}</> : s.t}
                    </span>
                    <span className="mono-tag opacity-40 block mt-0.5">{s.l}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* col 2: 3D model — pushed right */}
            <motion.div
              {...fade(0.3)}
              className="relative flex items-center justify-end"
              style={{ height: '100vh', maxHeight: '760px' }}
            >
              {/* pedestal glow under the figure */}
              <div
                className="absolute pointer-events-none"
                style={{
                  width: '80%', height: '40%', bottom: '6%', right: '0%',
                  background: 'radial-gradient(ellipse 50% 50% at 50% 100%, rgba(242,167,195,0.10) 0%, transparent 70%)',
                }}
              />
              <MiladyViewer />
            </motion.div>

            {/* col 3: chat — flush to the right viewport edge */}
            <motion.div {...fade(0.5)} className="flex flex-col justify-center pr-6 xl:pr-10" style={{ height: '100vh', maxHeight: '760px', paddingTop: '6rem', paddingBottom: '3rem' }}>
              <div className="mb-4">
                <p className="text-label opacity-50 mb-1.5">✦ &nbsp; try it live</p>
                <p className="text-ink-3 leading-relaxed" style={{ fontSize: '0.8125rem', maxWidth: '34ch' }}>
                  Talk to milady. Powered by <span className="text-pink">Claude Fable 5</span>.
                </p>
              </div>
              <ChatEmbed />
            </motion.div>

          </div>

          {/* scroll-down cue */}
          <motion.a
            href="#what"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1.5 text-ink-3 hover:text-pink transition-colors duration-200"
          >
            <span className="mono-tag opacity-50">scroll</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>↓</motion.span>
          </motion.a>
        </section>


        {/* ── WHAT IS MILADY ──────────────────────────────────────── */}
        <section id="what" className="scroll-mt-20 section-pad py-24 md:py-32 max-w-screen-lg mx-auto hairline-top text-center">
          <motion.p {...fadeUp()} className="text-label mb-8 opacity-60">what is Milady OS</motion.p>
          <motion.h2
            {...fadeUp(0.05)}
            className="heading text-ink mx-auto"
            style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3.25rem)', maxWidth: '18ch' }}
          >
            a personal AI you{' '}
            <span className="display text-pink" style={{ opacity: 0.85 }}>actually own.</span>
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-8 text-ink-2 leading-relaxed mx-auto"
            style={{ fontSize: '1.0625rem', maxWidth: '58ch' }}
          >
            Milady OS is a local-first AI assistant built on the elizaOS framework. It runs
            entirely on your own machine — no cloud, no account, no one reading your
            conversations. Chat across 15+ LLM providers, give it a 3D avatar and a voice,
            extend it with plugins, and connect a wallet so your agents can trade crypto
            for you on BNB Smart Chain, PancakeSwap, and Solana.
          </motion.p>
          <motion.div {...fadeUp(0.15)} className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3">
            {['local-first · runs on your hardware', '15+ LLM providers', '3D avatar + voice', 'crypto-native wallets', 'build your own agents'].map((t) => (
              <span key={t} className="mono-tag opacity-50 flex items-center gap-2">
                <span className="text-pink opacity-60">✦</span>{t}
              </span>
            ))}
          </motion.div>
        </section>


        {/* ── HOW IT WORKS (detail) ───────────────────────────────── */}
        <section id="how" className="scroll-mt-24 section-pad py-28 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-14 max-w-2xl">
            <p className="text-label mb-5 opacity-60">how it works</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
              one runtime.
              <br />
              <span className="display" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)', color: '#f2a7c3', opacity: 0.85 }}>
                everything on-device.
              </span>
            </h2>
            <p className="mt-6 text-ink-3 leading-relaxed" style={{ fontSize: '0.9rem' }}>
              Milady OS is a single elizaOS runtime that lives on your machine and exposes your agent everywhere — desktop app, local API, web UI. Here is what is actually under it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line">
            {[
              {
                label: 'the runtime',
                body: 'Built on elizaOS in TypeScript on Node.js 22+. An agent is a character definition plus a stack of plugins; the same runtime powers the desktop app, a server daemon, or a headless process.',
              },
              {
                label: 'the models',
                body: 'Defaults to Claude Fable 5 (guardrailed). Switch to Mythos for an unguarded model, or any of GPT-4o, Gemini, Llama, Mistral, Groq — even fully offline via Ollama, mid-conversation. Bring your own keys, or none at all when running local.',
              },
              {
                label: 'the desktop app',
                body: 'A native shell built on Electrobun renders a 3D VRM avatar in WebGL that lip-syncs to text-to-speech and reacts in real time. Drop in any VRM file to change how she looks.',
              },
              {
                label: 'the local API',
                body: 'A REST API on port 2138 and a WebSocket gateway on 18789 expose your agent to scripts, other apps, and the web UI — anything the desktop does, you can automate or build on.',
              },
              {
                label: 'wallets & trading',
                body: 'On first run Milady OS generates EVM and Solana wallets and holds the keys locally. Native BNB Smart Chain and PancakeSwap support lets agents execute swaps within hard limits you set — no MetaMask dependency.',
              },
              {
                label: 'the plugin system',
                body: 'Every capability — LLMs, TTS, vision, memory backends, custom tools — is an npm package. The core itself ships as plugins, so you can add, replace, or remove any part of the agent.',
              },
              {
                label: 'install anywhere',
                body: 'Runs on macOS, Windows, Linux, and Android. Ship it via Docker, npm, Homebrew, Flatpak or Snap — or a single curl one-liner. If it runs code, it runs Milady OS.',
              },
              {
                label: 'built by agents',
                body: 'The codebase itself is maintained by AI: 1768+ pull requests reviewed and merged entirely by agents, with humans doing only QA. v2.0.10, multiple releases a week.',
              },
            ].map((it, i) => (
              <motion.div key={it.label} {...fadeUp(i * 0.04)} className="bg-bg p-7 flex flex-col gap-3 hover:bg-surface hover:-translate-y-0.5 transition-all duration-200">
                <p className="mono-tag text-pink opacity-60">{String(i + 1).padStart(2, '0')} · {it.label}</p>
                <p className="text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>{it.body}</p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ── RUNS ON YOUR HARDWARE ───────────────────────────────── */}
        <section id="hardware" className="scroll-mt-24 section-pad py-28 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-60">local-first</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
                the model runs
                <br />
                <span className="display" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)', color: '#f2a7c3', opacity: 0.85 }}>
                  on your machine.
                </span>
              </h2>

              <p className="mt-7 text-ink-3 leading-relaxed" style={{ fontSize: '0.9rem' }}>
                Milady OS loads the model into your own <span className="text-ink-2">GPU and memory</span> and runs inference there. The panel shows live load, memory footprint, and throughput while it thinks — numbers you only get when the AI is actually on your hardware.
              </p>
              <p className="mt-4 text-ink-3 leading-relaxed" style={{ fontSize: '0.9rem' }}>
                No request ever leaves the device. No metering, no rate limits, no one logging your prompts. Your compute, your data, your rules.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['GPU + RAM on-device', '0 bytes to the cloud', 'no rate limits'].map((t) => (
                  <span key={t} className="mono-tag opacity-50 flex items-center gap-2">
                    <span className="text-pink opacity-60">✦</span>{t}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.12)}>
              <p className="mono-tag opacity-40 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse-slow" />
                live — compute on your hardware
              </p>
              <LocalCompute />
            </motion.div>

          </div>
        </section>


        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-24 section-pad py-28 max-w-screen-xl mx-auto hairline-top">

          <motion.div {...fadeUp()} className="mb-14">
            <p className="text-label mb-5 opacity-60">what it does</p>
            <h2
              className="heading text-ink"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
            >
              built for ownership.
              <br />
              <span
                className="display"
                style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)', color: '#f2a7c3', opacity: 0.85 }}
              >
                not for access.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
            {[
              {
                tag: '— privacy',
                title: 'local-first',
                body: 'No data leaves your machine. No telemetry. No API keys floating in someone else\'s infrastructure. The conversation stays on the device.',
              },
              {
                tag: '— intelligence',
                title: '15+ models',
                body: 'Claude, GPT-4, Gemini, Llama, Mistral, Ollama, Groq — swap providers mid-conversation. One runtime, every model.',
              },
              {
                tag: '— chain',
                title: 'crypto native',
                body: 'EVM and Solana wallets generated on first run. BNB Smart Chain support. PancakeSwap built in. No MetaMask dependency.',
              },
              {
                tag: '— interface',
                title: '3D avatar',
                body: 'A VRM avatar rendered in Electrobun\'s native shell. Real-time expressions and animations. Fully swappable models.',
              },
              {
                tag: '— reach',
                title: 'every platform',
                body: 'macOS, Windows, Linux, Android. Docker, npm, Homebrew, Flatpak, Snap. If it runs code, it runs Milady OS.',
              },
              {
                tag: '— extension',
                title: 'plugin system',
                body: 'LLMs, TTS, vision, custom tools, memory backends. Plugins are npm packages. The whole core ships as plugins.',
              },
            ].map((f, i) => (
              <motion.div
                key={f.tag}
                {...fadeUp(i * 0.05)}
                className="bg-bg hover:bg-surface hover:-translate-y-0.5 p-8 flex flex-col gap-5 transition-all duration-300 group"
              >
                <p className="mono-tag opacity-40 group-hover:opacity-70 transition-opacity duration-200">
                  {f.tag}
                </p>
                <h3
                  className="heading text-ink"
                  style={{ fontSize: '1.35rem' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-ink-3 leading-relaxed" style={{ fontSize: '0.8125rem' }}>
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ── STUDIO · SOVEREIGN AGENTS ───────────────────────────── */}
        <section id="agents" className="scroll-mt-24 section-pad py-28 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-60">studio · new</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
                agents that
                <br />
                <span className="display" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)', color: '#f2a7c3', opacity: 0.85 }}>
                  trade for you.
                </span>
              </h2>

              <p className="mt-7 text-ink-3 leading-relaxed" style={{ fontSize: '0.9rem' }}>
                Connect a wallet and Milady OS builds you a <span className="text-ink-2">trading agent</span> — give it a strategy in plain English, set your limits, and it executes on your behalf across <span className="text-ink-2">BNB Smart Chain, PancakeSwap, and Solana</span>.
              </p>
              <p className="mt-4 text-ink-3 leading-relaxed" style={{ fontSize: '0.9rem' }}>
                It watches the market, places the swaps, takes profit, and reports back — all from your own machine. Your keys never leave the device, and you set the hard caps it can never cross.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['wallets via Privy', 'BNB · PancakeSwap · Solana', 'you set the limits'].map((t) => (
                  <span key={t} className="mono-tag opacity-50 flex items-center gap-2">
                    <span className="text-pink opacity-60">✦</span>{t}
                  </span>
                ))}
              </div>

              <Link href="/studio" className="btn-primary mt-9">
                <span className="b">[</span>
                <span className="mx-2">try it — build an agent</span>
                <span className="b">]</span>
                <span className="text-pink opacity-60 ml-1">→</span>
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.12)}>
              <p className="mono-tag opacity-40 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse-slow" />
                live — an agent trading on your behalf
              </p>
              <SovereignDemo />
            </motion.div>

          </div>
        </section>


        {/* ── BUILT BY AGENTS ─────────────────────────────────────── */}
        <section className="section-pad py-28 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-60">development model</p>
              <h2
                className="heading text-ink"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
              >
                no human reviewers.
              </h2>
              <p
                className="display mt-2"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', color: '#f2a7c3', opacity: 0.8 }}
              >
                not as a novelty.
              </p>

              <p className="mt-8 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                Every PR — feature, fix, refactor, chore — is reviewed and merged by agents. No human approvers in the pipeline. This isn't a party trick. It's the only way to ship 1768+ PRs at this pace without burning out a team.
              </p>
              <p className="mt-4 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                Humans serve one function: QA. They use the software, find the breaks, file issues. Agents handle everything else.
              </p>

              <Link
                href="/tech"
                className="inline-flex items-center gap-2 mt-8 text-sm text-pink opacity-70 hover:opacity-100 transition-opacity duration-150"
                style={{ letterSpacing: '0.04em', fontSize: '0.8125rem' }}
              >
                see the pipeline →
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.12)} className="space-y-px bg-line">
              {[
                { n: '01', title: 'PR submitted', note: 'agent categorizes: feature · fix · chore · docs' },
                { n: '02', title: 'automated checks', note: 'typecheck · lint · tests · build' },
                { n: '03', title: 'semantic review', note: 'agent reads diff, checks logic and correctness' },
                { n: '04', title: 'auto-merge or reject', note: 'approved instantly · actionable feedback if not' },
                { n: '05', title: 'human QA', note: 'real users, real conditions, real issues filed' },
              ].map((s) => (
                <div
                  key={s.n}
                  className="bg-bg hover:bg-surface p-5 flex items-start gap-5 transition-colors duration-200"
                >
                  <span className="mono-tag text-pink opacity-50 shrink-0 pt-0.5">{s.n}</span>
                  <div>
                    <p className="text-sm text-ink-2">{s.title}</p>
                    <p className="mono-tag mt-1 opacity-50">{s.note}</p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </section>


        {/* ── DOWNLOADS ───────────────────────────────────────────── */}
        <section id="download" className="scroll-mt-24 section-pad py-28 max-w-screen-xl mx-auto hairline-top">

          <motion.div {...fadeUp()} className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-label mb-5 opacity-60">acquire</p>
              <h2
                className="heading text-ink"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
              >
                pick your platform.
              </h2>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <a
                href="https://github.com/trymiladyOS/miladyOS/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-3 hover:text-pink transition-colors duration-200 flex items-center gap-1"
                style={{ fontSize: '0.8125rem' }}
              >
                all releases
                <span className="opacity-50">↗</span>
              </a>
              <span className="mono-tag opacity-40">multiple releases per week</span>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="border border-line">
            <DownloadGrid />
          </motion.div>

          <motion.div {...fadeUp(0.12)} className="mt-6 bg-surface border border-line p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-ink-3 shrink-0" style={{ fontSize: '0.8125rem' }}>one-line install</p>
            <code
              className="font-mono text-sm text-ink-2 bg-bg px-4 py-2.5 border border-line flex-1 max-w-sm block"
              style={{ fontSize: '0.8125rem' }}
            >
              curl -fsSL https://get.milady.ai | bash
            </code>
          </motion.div>

        </section>


        {/* ── STACK ───────────────────────────────────────────────── */}
        <section className="section-pad py-28 max-w-screen-xl mx-auto hairline-top">

          <motion.div {...fadeUp()} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-label mb-5 opacity-60">under the hood</p>
              <h2
                className="heading text-ink"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
              >
                the stack.
              </h2>
            </div>
            <Link
              href="/tech"
              className="text-sm text-ink-3 hover:text-ink-2 transition-colors flex items-center gap-1"
              style={{ fontSize: '0.8125rem' }}
            >
              full architecture →
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line">
            {[
              { name: 'elizaOS', sub: 'agent framework' },
              { name: 'TypeScript', sub: 'Node.js 22+ · Bun' },
              { name: 'Electrobun', sub: 'native desktop shell' },
              { name: 'React + Vite', sub: 'web frontend' },
              { name: 'WebGL', sub: '3D avatar rendering' },
              { name: 'REST + WS', sub: ':2138 · :18789' },
            ].map((s, i) => (
              <motion.div
                key={s.name}
                {...fadeUp(i * 0.04)}
                className="bg-bg hover:bg-surface p-6 transition-colors duration-200"
              >
                <p className="text-sm font-medium text-ink-2">{s.name}</p>
                <p className="mono-tag mt-1.5 opacity-50">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ── CLOSE ───────────────────────────────────────────────── */}
        <section className="section-pad py-28 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()}>
            <div className="ornament-divider mb-14">
              <span className="text-pink opacity-20 text-sm">✦</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <h2
                className="display text-ink max-w-2xl"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 6.5rem)' }}
              >
                offline.
                <br />
                <span className="text-pink" style={{ opacity: 0.75 }}>on your terms.</span>
              </h2>

              <div className="flex flex-col gap-3 shrink-0">
                <Link href="/install" className="btn-primary">
                  <span className="b">[</span>
                  <span className="mx-2">get started</span>
                  <span className="b">]</span>
                </Link>
                <a
                  href="https://github.com/trymiladyOS/miladyOS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <span className="mx-1">star on github</span>
                  <span className="opacity-50">↗</span>
                </a>
              </div>
            </div>

            <p
              className="mt-8 text-ink-3 max-w-xl leading-relaxed"
              style={{ fontSize: '0.875rem' }}
            >
              No subscription. No data harvesting. No vendor lock-in. No one watching your conversations. Install once, run indefinitely.
            </p>
          </motion.div>
        </section>

      </main>

      <BackToTop />
      <Footer />
    </>
  )
}
