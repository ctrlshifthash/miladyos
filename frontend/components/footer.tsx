import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="hairline-top mt-32">
      <div className="section-pad max-w-screen-xl mx-auto pt-16 pb-12">

        {/* ornament */}
        <div className="ornament-divider mb-14">
          <span className="text-pink opacity-30 text-sm">✦</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">

          {/* brand */}
          <div>
            <Image src="/logo-sm.png" alt="Milady OS" width={44} height={44} className="rounded-full border border-pink-border block mb-3" />
            <span
              className="text-ink"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '2rem',
                letterSpacing: '-0.02em',
              }}
            >
              milady OS
            </span>
            <p className="mt-3 text-sm text-ink-3 leading-relaxed" style={{ maxWidth: '22ch' }}>
              local-first personal AI.<br />
              your data stays on your machine.<br />
              always.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-pink animate-pulse-slow" />
              <span className="mono-tag opacity-70">v2.0.10 · stable</span>
            </div>
          </div>

          {/* nav */}
          <div>
            <p className="text-label mb-4 opacity-60">navigate</p>
            <ul className="space-y-2.5">
              {[
                ['/features', 'features'],
                ['/tech', 'tech'],
                ['/install', 'install'],
                ['/community', 'community'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-3 hover:text-ink-2 transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* external */}
          <div>
            <p className="text-label mb-4 opacity-60">links</p>
            <ul className="space-y-2.5">
              {[
                ['https://github.com/trymiladyOS/miladyOS', 'github'],
                ['https://github.com/trymiladyOS/miladyOS/releases', 'releases'],
                ['#', 'discord'],
                ['#', 'telegram'],
              ].map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink-3 hover:text-ink-2 transition-colors duration-150 inline-flex items-center gap-1"
                  >
                    {label}
                    <span className="text-pink opacity-40 text-xs">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="hairline-top pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="mono-tag opacity-50">
            © {new Date().getFullYear()} milady-ai
          </p>
          <p className="mono-tag opacity-40">
            built by agents · tested by humans · elizaOS
          </p>
        </div>

      </div>
    </footer>
  )
}
