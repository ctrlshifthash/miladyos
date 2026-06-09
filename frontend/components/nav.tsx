'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import WalletConnect from '@/components/wallet-connect'

const links = [
  { href: '/features', label: 'features' },
  { href: '/tech', label: 'tech' },
  { href: '/install', label: 'install' },
  { href: '/community', label: 'community' },
  { href: '/studio', label: 'agents', highlight: true },
]

// boxed social icon — bright white by default, lifts + turns pink on hover
const socialBox =
  'w-9 h-9 flex items-center justify-center border border-line bg-surface text-ink hover:text-pink hover:border-pink hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_16px_rgba(242,167,195,0.25)] transition-all duration-200'

const PumpIcon = () => (
  <Image src="/pump.png" alt="pump.fun" width={17} height={17} className="rounded-sm" />
)
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-bg/80 backdrop-blur-lg border-b border-line'
          : 'bg-transparent'
      }`}
    >
      <div className="section-pad max-w-screen-xl mx-auto">
        <div className="relative flex items-center h-13 py-3.5">

          {/* left: logo */}
          <Link href="/" className="group flex items-center gap-2.5 relative z-10">
              <Image
                src="/logo-sm.png"
                alt="Milady OS"
                width={30}
                height={30}
                priority
                className="rounded-full border border-pink-border group-hover:border-pink transition-colors duration-300"
              />
              <span
                className="text-ink group-hover:text-pink transition-colors duration-300"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                  letterSpacing: '-0.01em',
                }}
              >
                milady OS
              </span>
              <span className="hidden sm:block text-ink-4 font-mono text-xs">·</span>
              <span className="hidden sm:block mono-tag opacity-60">v2.0.10</span>
          </Link>

          {/* center: page links — absolutely centered in the bar */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {links.map((l, i) => (
              <span key={l.href} className="flex items-center">
                {i > 0 && <span className="text-ink-3 font-mono text-xs mx-3 opacity-50">·</span>}
                <Link
                  href={l.href}
                  className={`text-xs tracking-wider transition-colors duration-150 ${
                    pathname === l.href
                      ? 'text-pink'
                      : l.highlight
                      ? 'text-pink opacity-80 hover:opacity-100'
                      : 'text-ink hover:text-pink'
                  }`}
                  style={{ letterSpacing: '0.08em' }}
                >
                  {l.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* right: socials + wallet (desktop) · menu toggle (mobile) */}
          <div className="flex items-center gap-4 ml-auto relative z-10">
            <span className="hidden md:block"><WalletConnect /></span>
            <div className="hidden md:flex items-center gap-2 -mr-2 md:-mr-8 lg:-mr-16 xl:-mr-24">
              <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" title="pump.fun" aria-label="pump.fun" className={socialBox}><PumpIcon /></a>
              <a href="https://x.com/tryMiladyOS" target="_blank" rel="noopener noreferrer" title="X" aria-label="X (Twitter)" className={socialBox}><XIcon /></a>
              <a href="https://github.com/trymiladyOS/miladyOS" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub" className={socialBox}><GithubIcon /></a>
            </div>

            <button
              className="md:hidden flex flex-col justify-center gap-1.5 w-7 h-7"
              onClick={() => setOpen(!open)}
              aria-label="menu"
            >
              <span className={`block w-4 h-px bg-ink-3 transition-all duration-200 ${open ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`block w-4 h-px bg-ink-3 transition-all duration-200 ${open ? '-rotate-45 -translate-y-[1.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden bg-bg border-b border-line">
          <div className="section-pad py-5 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm ${pathname === l.href ? 'text-pink' : 'text-ink-3'}`}
                style={{ letterSpacing: '0.06em' }}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" title="pump.fun" aria-label="pump.fun" className={socialBox}><PumpIcon /></a>
              <a href="https://x.com/tryMiladyOS" target="_blank" rel="noopener noreferrer" title="X" aria-label="X (Twitter)" className={socialBox}><XIcon /></a>
              <a href="https://github.com/trymiladyOS/miladyOS" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub" className={socialBox}><GithubIcon /></a>
            </div>
            <div className="pt-2"><WalletConnect /></div>
          </div>
        </div>
      )}
    </header>
  )
}
