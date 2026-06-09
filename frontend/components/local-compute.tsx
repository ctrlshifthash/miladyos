'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Self-playing illustration of milady running a model ON YOUR HARDWARE:
// the model stays resident in memory, GPU spikes during generation, and
// nothing is sent to the cloud. Values are representative for a local run.

const RAM_TOTAL = 64
const RAM_MODEL = 41.2 // a 70B-class model resident in memory

export default function LocalCompute() {
  const [load, setLoad] = useState(12)
  const [tps, setTps] = useState(0)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    let gen = false

    const flip = () => {
      if (!alive) return
      gen = !gen
      setGenerating(gen)
      timer = setTimeout(flip, gen ? 3200 : 2600)
    }
    const tick = setInterval(() => {
      if (!alive) return
      setLoad((p) => {
        const target = gen ? 82 + Math.random() * 16 : 9 + Math.random() * 8
        return p + (target - p) * 0.5
      })
      setTps(gen ? 34 + Math.random() * 26 : 0)
    }, 600)

    timer = setTimeout(flip, 1500)
    return () => { alive = false; clearTimeout(timer); clearInterval(tick) }
  }, [])

  const ram = RAM_MODEL + (generating ? 1.4 : 0)

  return (
    <div className="border border-line" style={{ background: '#0d0b13' }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-pink animate-pulse-slow" />
          <span className="text-ink-2" style={{ fontSize: '0.8125rem' }}>milady · running locally</span>
        </div>
        <span className="mono-tag opacity-50">on-device</span>
      </div>

      <div className="px-5 py-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="mono-tag opacity-40">model</span>
          <span className="mono-tag text-ink-2 opacity-70">Llama 3.3 70B · resident</span>
        </div>

        {/* GPU */}
        <Bar label="gpu" value={`${load.toFixed(0)}%`} pct={load} color="#f2a7c3" />
        {/* RAM / VRAM */}
        <Bar label="memory" value={`${ram.toFixed(1)} / ${RAM_TOTAL} GB`} pct={(ram / RAM_TOTAL) * 100} color="#c7b8d8" />

        <div className="flex items-center justify-between pt-1">
          <span className="mono-tag opacity-40">throughput</span>
          <span className="mono-tag" style={{ color: tps > 0 ? '#f2a7c3' : undefined, opacity: tps > 0 ? 0.8 : 0.5 }}>
            {tps > 0 ? `${tps.toFixed(0)} tok/s · generating` : 'idle'}
          </span>
        </div>

        {/* the punchline */}
        <div className="flex items-center justify-between pt-2 mt-1 hairline-top">
          <span className="mono-tag opacity-40">sent to cloud</span>
          <span className="mono-tag text-pink opacity-70">0 bytes ↑</span>
        </div>
      </div>
    </div>
  )
}

function Bar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="mono-tag opacity-40 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-line overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: color, opacity: 0.7 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="mono-tag opacity-50 w-24 text-right shrink-0">{value}</span>
    </div>
  )
}
