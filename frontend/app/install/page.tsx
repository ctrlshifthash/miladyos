'use client'

import { motion } from 'framer-motion'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import CodeBlock from '@/components/code-block'
import DownloadGrid from '@/components/download-grid'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
})

const methods = [
  {
    id: 'curl',
    label: 'one-line install',
    tag: 'macOS · Linux',
    recommended: true,
    desc: 'Detects your architecture, downloads the right binary, adds it to your PATH. Fastest path to running.',
    code: 'curl -fsSL https://get.milady.ai | bash',
  },
  {
    id: 'homebrew',
    label: 'Homebrew',
    tag: 'macOS · Linux',
    recommended: false,
    desc: 'Easy updates with brew upgrade. Recommended if you\'re already in the Homebrew ecosystem.',
    code: 'brew tap milady-ai/milady\nbrew install milady',
  },
  {
    id: 'npm',
    label: 'npm',
    tag: 'Node.js 22+',
    recommended: false,
    desc: 'Install globally or run without installing via npx. Requires Node.js 22 or later.',
    code: '# global\nnpm install -g milady\n\n# or without installing\nnpx milady',
  },
  {
    id: 'docker',
    label: 'Docker',
    tag: 'all platforms',
    recommended: false,
    desc: 'Containerized. REST API on 2138, WebSocket on 18789, data persisted to a named volume.',
    code: `docker pull ghcr.io/milady-ai/milady:latest\n\ndocker run -d \\\n  -p 2138:2138 \\\n  -p 18789:18789 \\\n  -v milady-data:/app/data \\\n  ghcr.io/milady-ai/milady:latest`,
  },
  {
    id: 'flatpak',
    label: 'Flatpak',
    tag: 'Linux',
    recommended: false,
    desc: 'Sandboxed installation on any Flatpak-supporting Linux distribution.',
    code: 'flatpak install flathub ai.milady.milady',
  },
  {
    id: 'snap',
    label: 'Snap',
    tag: 'Linux',
    recommended: false,
    desc: 'Auto-updating, sandboxed. Available in the Snap store.',
    code: 'snap install milady',
  },
]

const quickstart = [
  {
    n: '01',
    title: 'start milady',
    code: 'milady start',
    note: 'Starts the agent runtime, REST API on :2138, WebSocket gateway on :18789.',
  },
  {
    n: '02',
    title: 'open the interface',
    code: 'milady open',
    note: 'Opens the desktop app. Or go to http://localhost:2138 in any browser.',
  },
  {
    n: '03',
    title: 'configure a provider',
    code: 'milady config set provider ollama\n# no API key needed for local models\n\n# or for cloud:\nmilady config set provider claude\nmilady config set api-key sk-...',
    note: 'Use a local Ollama instance to stay entirely offline.',
  },
  {
    n: '04',
    title: 'start chatting',
    code: `curl -X POST http://localhost:2138/api/chat \\\n  -H "Content-Type: application/json" \\\n  -d '{"message": "hello"}'`,
    note: 'Or just open the UI and talk.',
  },
]

export default function Install() {
  return (
    <>
      <Nav />
      <main>

        <section className="section-pad pt-36 pb-20 max-w-screen-xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <p className="text-label mb-6 opacity-60">✦ &nbsp; install</p>
            <h1
              className="display text-ink"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
            >
              get
              <br />
              <span className="text-pink" style={{ opacity: 0.85 }}>milady.</span>
            </h1>
            <p className="mt-7 text-ink-3 max-w-md leading-relaxed" style={{ fontSize: '0.9375rem' }}>
              Every package manager. Every platform. Pick one.
            </p>
          </motion.div>
        </section>


        {/* install methods */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">installation</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              install methods
            </h2>
          </motion.div>

          <div className="space-y-5">
            {methods.map((m, i) => (
              <motion.div
                key={m.id}
                {...fadeUp(i * 0.06)}
                className="bg-surface border border-line"
              >
                <div className="px-7 py-5 flex flex-wrap items-center gap-3 border-b border-line">
                  <p className="text-sm text-ink-2">{m.label}</p>
                  <span className="mono-tag px-2 py-0.5 border border-line opacity-60">{m.tag}</span>
                  {m.recommended && (
                    <span className="mono-tag px-2 py-0.5 border border-pink-border text-pink opacity-80">
                      recommended
                    </span>
                  )}
                </div>
                <div className="p-7">
                  <p className="text-sm text-ink-3 mb-5 leading-relaxed" style={{ fontSize: '0.8125rem' }}>{m.desc}</p>
                  <CodeBlock code={m.code} lang="bash" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* quick start */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">getting started</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              quick start
            </h2>
          </motion.div>

          <div className="space-y-px bg-line">
            {quickstart.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp(i * 0.07)}
                className="bg-bg hover:bg-surface transition-colors duration-200"
              >
                <div className="p-7 grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="flex items-start gap-4">
                    <span className="mono-tag text-pink opacity-50 shrink-0">{s.n}</span>
                    <p className="text-sm text-ink-2">{s.title}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <CodeBlock code={s.code} lang="bash" />
                    <p className="text-xs text-ink-3 mt-3 opacity-60">{s.note}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* downloads */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-10">
            <p className="text-label mb-5 opacity-50">binaries</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              direct downloads
            </h2>
            <p className="mt-3 text-ink-3" style={{ fontSize: '0.8125rem' }}>
              all releases at{' '}
              <a
                href="https://github.com/milady-ai/milady/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink opacity-70 hover:opacity-100 transition-opacity"
              >
                github.com/milady-ai/milady/releases ↗
              </a>
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.06)} className="border border-line">
            <DownloadGrid />
          </motion.div>
        </section>


        {/* requirements */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-10">
            <p className="text-label mb-5 opacity-50">requirements</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              system requirements
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {[
              ['macOS', '12.0+ · Apple Silicon or Intel'],
              ['Windows', '10 64-bit or later'],
              ['Linux', 'Kernel 5.4+ · glibc 2.31+'],
              ['Android', 'Android 8.0+ (API 26)'],
              ['RAM', '4 GB min · 8 GB recommended'],
              ['Storage', '500 MB · more for local models'],
              ['Node.js', 'v22.0.0+ (for npm install)'],
              ['Docker', '20.10.0+'],
            ].map(([os, req]) => (
              <div key={os} className="bg-bg hover:bg-surface p-5 transition-colors duration-200">
                <p className="text-sm text-ink-2">{os}</p>
                <p className="mono-tag mt-1.5 opacity-50">{req}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
