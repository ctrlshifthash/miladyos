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

export default function Community() {
  return (
    <>
      <Nav />
      <main>

        <section className="section-pad pt-36 pb-20 max-w-screen-xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <p className="text-label mb-6 opacity-60">✦ &nbsp; community</p>
            <h1
              className="display text-ink"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
            >
              built open.
              <br />
              <span className="text-pink" style={{ opacity: 0.85 }}>used openly.</span>
            </h1>
            <p className="mt-7 text-ink-3 max-w-md leading-relaxed" style={{ fontSize: '0.9375rem' }}>
              The code is on GitHub. Agents review it. Humans use it. Here's how to participate.
            </p>
          </motion.div>
        </section>


        {/* the model */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div {...fadeUp()}>
              <p className="text-label mb-5 opacity-50">how it works</p>
              <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                the QA contributor model
              </h2>

              <p className="mt-6 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                Agents write reviews and merge code. Humans have a different and equally load-bearing role: they use milady in real conditions and report what breaks.
              </p>
              <p className="mt-3 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                No formal QA team. No scripted test scenarios. Real usage, real bugs, real reports. The feedback loop runs from issue to fix to release in hours — not weeks — because the pipeline is automated end-to-end.
              </p>
              <p className="mt-3 text-ink-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                If you run milady, you're already participating. File an issue when something breaks. That's the contribution.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="bg-surface border border-line p-7">
              <p className="text-label mb-6 opacity-50">approximate cycle time</p>
              <div className="space-y-5">
                {[
                  ['bug filed', 'T+0'],
                  ['issue acknowledged', 'T+1h'],
                  ['fix PR opened', 'T+4h'],
                  ['agent review', 'T+4.5h'],
                  ['auto-merge', 'T+5h'],
                  ['release', 'T+6h'],
                ].map(([phase, time], i, arr) => (
                  <div key={phase} className="flex items-center gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-1 h-1 rounded-full bg-pink opacity-60" />
                      {i < arr.length - 1 && <div className="w-px h-5 bg-line-2 mt-1" />}
                    </div>
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm text-ink-3" style={{ fontSize: '0.8125rem' }}>{phase}</span>
                      <span className="mono-tag opacity-50">{time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-3 mt-5 opacity-40">depends on complexity and current queue</p>
            </motion.div>
          </div>
        </section>


        {/* how to help */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">contributing</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              how to help
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
            {[
              {
                title: 'file a bug report',
                body: 'Find something broken? Open an issue on GitHub. Include your OS, milady version, and steps to reproduce. Logs help.',
                action: 'open an issue ↗',
                href: 'https://github.com/milady-ai/milady/issues/new',
              },
              {
                title: 'test a release candidate',
                body: 'Pre-releases are tagged on GitHub. Install them, use milady normally, report regressions. This is the human QA role in the pipeline.',
                action: 'see releases ↗',
                href: 'https://github.com/milady-ai/milady/releases',
              },
              {
                title: 'submit a pull request',
                body: 'Fork, change, open a PR. An agent reviews it — you get feedback from an AI reviewer, not a human. Usually faster.',
                action: 'contributing guide ↗',
                href: 'https://github.com/milady-ai/milady',
              },
              {
                title: 'build a plugin',
                body: 'The plugin API is typed TypeScript. Publish as an npm package with the milady-plugin prefix and it\'s discoverable by the community.',
                action: 'plugin docs ↗',
                href: 'https://github.com/milady-ai/milady',
              },
            ].map((x, i) => (
              <motion.div
                key={x.title}
                {...fadeUp(i * 0.07)}
                className="bg-bg hover:bg-surface p-7 flex flex-col gap-4 transition-colors duration-200"
              >
                <p className="text-sm text-ink-2">{x.title}</p>
                <p className="text-sm text-ink-3 leading-relaxed flex-1" style={{ fontSize: '0.8125rem' }}>{x.body}</p>
                <a
                  href={x.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pink opacity-60 hover:opacity-90 transition-opacity self-start"
                  style={{ letterSpacing: '0.04em' }}
                >
                  {x.action}
                </a>
              </motion.div>
            ))}
          </div>
        </section>


        {/* bug report format */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">bug reports</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              what to include
            </h2>
            <p className="mt-4 text-ink-3 max-w-lg leading-relaxed" style={{ fontSize: '0.875rem' }}>
              The agent that triages issues extracts structured information from your report. Give it signal and the fix comes faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-px bg-line">
              {[
                ['milady version', 'milady --version → 2.0.10'],
                ['OS and architecture', 'macOS 14.5 ARM64'],
                ['LLM provider', 'Claude / Ollama / etc.'],
                ['steps to reproduce', 'numbered, specific'],
                ['expected behavior', 'what should have happened'],
                ['actual behavior', 'what actually happened'],
                ['logs if applicable', '~/.milady/logs/milady.log'],
              ].map(([f, ex]) => (
                <div key={f} className="bg-bg hover:bg-surface p-4 grid grid-cols-2 gap-4 transition-colors duration-200">
                  <span className="text-sm text-ink-2">{f}</span>
                  <span className="mono-tag opacity-40">{ex}</span>
                </div>
              ))}
            </div>

            <div>
              <CodeBlock
                filename="get-logs.sh"
                lang="bash"
                code={`# version
milady --version

# logs
cat ~/.milady/logs/milady.log | tail -100

# full diagnostic bundle
milady diagnostics > milady-diag.txt`}
              />
              <p className="text-xs text-ink-3 mt-4 opacity-50 leading-relaxed">
                Logs contain no personal data — only runtime events, errors, and timing. Safe to share.
              </p>
            </div>
          </div>
        </section>


        {/* links */}
        <section className="section-pad py-24 max-w-screen-xl mx-auto hairline-top">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-label mb-5 opacity-50">find us</p>
            <h2 className="heading text-ink" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              links
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
            {[
              {
                name: 'GitHub',
                handle: 'milady-ai/milady',
                desc: 'Source code, issues, pull requests. Everything lives here.',
                tag: 'primary',
                href: 'https://github.com/milady-ai/milady',
              },
              {
                name: 'Releases',
                handle: 'github · releases',
                desc: 'Changelogs, binaries, version history. Multiple per week.',
                tag: 'releases',
                href: 'https://github.com/milady-ai/milady/releases',
              },
              {
                name: 'Discord',
                handle: 'milady-ai',
                desc: 'Community chat. Bug reports, setups, discussion.',
                tag: 'chat',
                href: '#',
              },
              {
                name: 'Telegram',
                handle: 't.me/milady_ai',
                desc: 'Announcements, releases, community.',
                tag: 'announcements',
                href: '#',
              },
            ].map((l, i) => (
              <motion.a
                key={l.name}
                {...fadeUp(i * 0.07)}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-bg hover:bg-surface p-7 flex items-start justify-between gap-6 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-sm text-ink-2">{l.name}</p>
                    <span className="mono-tag opacity-40 px-1.5 py-0.5 border border-line">{l.tag}</span>
                  </div>
                  <p className="mono-tag opacity-40 mb-3">{l.handle}</p>
                  <p className="text-sm text-ink-3 leading-relaxed" style={{ fontSize: '0.8125rem' }}>{l.desc}</p>
                </div>
                <span className="text-pink opacity-30 group-hover:opacity-70 transition-opacity duration-200 shrink-0 text-sm mt-0.5">
                  ↗
                </span>
              </motion.a>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
