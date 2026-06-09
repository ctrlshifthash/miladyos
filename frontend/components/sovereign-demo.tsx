'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// A self-playing illustration of a milady trading agent: you connect a wallet,
// the agent trades on your behalf (BNB Smart Chain · PancakeSwap · Solana) and
// the portfolio moves with each fill. Everything here is simulated for the page.

const START = 1000

const TRADES = [
  'swapped 50 USDT → 21.4 CAKE',
  'bought 0.08 BNB on PancakeSwap',
  'sold 14 CAKE — took profit',
  'rotated 120 USDT into SOL',
  'added to BNB position',
  'limit buy filled: CAKE @ $2.31',
  'trimmed 0.02 BNB at resistance',
  'set stop-loss on the SOL bag',
]

interface Fill {
  id: number
  text: string
  pnl: number
}

const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const ACCENT = '#f2a7c3'
const UP = '#7fd1ae'
const DOWN = '#e0758c'

export default function SovereignDemo() {
  const [value, setValue] = useState(START)
  const [fills, setFills] = useState<Fill[]>([])
  const [scanning, setScanning] = useState(true)
  const idRef = useRef(0)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    let val = START
    let i = 0

    const trade = () => {
      if (!alive) return
      const pnl = +(Math.random() * 22 - 8).toFixed(2) // slight positive bias
      val = val + pnl
      setValue(val)
      setScanning(false)
      setFills((prev) => [...prev, { id: idRef.current++, text: TRADES[i % TRADES.length], pnl }].slice(-3))
      i++
      timer = setTimeout(scan, 1700)
    }
    const scan = () => {
      if (!alive) return
      setScanning(true)
      timer = setTimeout(trade, 1100)
    }

    timer = setTimeout(trade, 600)
    return () => { alive = false; clearTimeout(timer) }
  }, [])

  const pnlTotal = value - START
  const up = pnlTotal >= 0
  const pct = ((pnlTotal / START) * 100).toFixed(2)

  return (
    <div className="border border-line" style={{ background: '#0d0b13' }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}14`, color: ACCENT }}
          >
            ✦
          </span>
          <div>
            <p className="text-ink-2" style={{ fontSize: '0.8125rem' }}>seraph · trading agent</p>
            <p className="mono-tag opacity-40">BNB Smart Chain · PancakeSwap</p>
          </div>
        </div>
        <span className="mono-tag flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: UP }} />
          <span className="opacity-60">wallet connected</span>
        </span>
      </div>

      {/* portfolio */}
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-end justify-between">
          <div>
            <motion.p
              key={Math.round(value)}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-pink"
              style={{ fontSize: '1.7rem', fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.02em' }}
            >
              {usd(value)}
            </motion.p>
            <p className="mono-tag opacity-40 mt-0.5">portfolio value · agent-managed</p>
          </div>
          <div className="text-right">
            <p className="mono-tag" style={{ color: up ? UP : DOWN }}>
              {up ? '+' : ''}{usd(pnlTotal).replace('$', '$')}
            </p>
            <p className="mono-tag opacity-40 mt-0.5">{up ? '+' : ''}{pct}% · simulated</p>
          </div>
        </div>
      </div>

      {/* trade feed */}
      <div className="px-5 py-4 space-y-2.5" style={{ minHeight: '168px' }}>
        <AnimatePresence mode="popLayout">
          {fills.map((f) => {
            const win = f.pnl >= 0
            return (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-ink-2 truncate" style={{ fontSize: '0.8125rem' }}>{f.text}</span>
                <span className="mono-tag shrink-0" style={{ color: win ? UP : DOWN }}>
                  {win ? '+' : '−'}${Math.abs(f.pnl).toFixed(2)}
                </span>
              </motion.div>
            )
          })}
          {scanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1 h-1 rounded-full" style={{ background: ACCENT, opacity: 0.5, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
              <span className="mono-tag opacity-40">scanning the market…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
