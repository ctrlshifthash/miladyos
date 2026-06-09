'use client'

import { useEffect, useState } from 'react'

// Fixed vertical section navigator for the homepage. Labels are always visible;
// the active one tracks scroll position via IntersectionObserver. Click to scroll.
const SECTIONS = [
  { id: 'top', label: 'intro' },
  { id: 'what', label: 'what it is' },
  { id: 'how', label: 'how it works' },
  { id: 'hardware', label: 'on-device' },
  { id: 'features', label: 'features' },
  { id: 'agents', label: 'agents' },
  { id: 'download', label: 'download' },
]

export default function SectionNav() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const go = (id: string) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed left-5 xl:left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1">
      <p className="mono-tag opacity-50 mb-2 pl-1" style={{ fontSize: '0.6rem' }}>on this page</p>
      {SECTIONS.map((s) => {
        const on = active === s.id
        return (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            aria-current={on}
            className="group flex items-center gap-3 py-1.5 text-left"
          >
            <span
              className={`block h-0.5 rounded-full transition-all duration-300 ${
                on ? 'w-7 bg-pink' : 'w-3.5 bg-ink-2 opacity-70 group-hover:w-5 group-hover:bg-pink'
              }`}
            />
            <span
              className={`mono-tag transition-all duration-200 ${
                on ? 'text-pink opacity-100' : 'text-ink opacity-90 group-hover:text-pink'
              }`}
            >
              {s.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
