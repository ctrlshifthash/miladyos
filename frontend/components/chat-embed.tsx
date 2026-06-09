'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MODELS, AGENTS, DEFAULT_MODEL, DEFAULT_AGENT } from '@/lib/agents'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "i'm milady. local-first personal AI built on elizaOS. ask me anything.",
}

export default function ChatEmbed() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [listening, setListening] = useState(false)
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [agent, setAgent] = useState(DEFAULT_AGENT)
  const [picker, setPicker] = useState<null | 'model' | 'agent'>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const recognitionRef = useRef<any>(null)

  // scroll the message list itself — NOT the page (scrollIntoView would move the whole page)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // restore last model + agent choice
  useEffect(() => {
    const m = localStorage.getItem('milady:model')
    const a = localStorage.getItem('milady:agent')
    if (m && MODELS.some((x) => x.id === m)) setModel(m)
    if (a && AGENTS.some((x) => x.id === a)) setAgent(a)
  }, [])

  const chooseModel = useCallback((id: string) => {
    setModel(id)
    localStorage.setItem('milady:model', id)
    setPicker(null)
  }, [])

  const chooseAgent = useCallback((id: string) => {
    setAgent(id)
    localStorage.setItem('milady:agent', id)
    setPicker(null)
  }, [])

  const activeModel = MODELS.find((m) => m.id === model) ?? MODELS[0]
  const activeAgent = AGENTS.find((a) => a.id === agent) ?? AGENTS[0]

  // stop any speech / recognition when the component goes away
  useEffect(() => () => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    recognitionRef.current?.stop()
  }, [])

  // ── voice OUT: milady speaks her replies, signals the avatar to "talk" ──
  const speak = useCallback((raw: string) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return
    const text = raw
      .replace(/```[\s\S]*?```/g, ' code block ')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[*_`#>~]/g, '')
      .trim()
    if (!text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.05
    u.pitch = 1.2
    const voices = window.speechSynthesis.getVoices()
    u.voice =
      voices.find((v) => /en/i.test(v.lang) && /(female|samantha|zira|aria|jenny|eva|google us)/i.test(v.name)) ??
      voices.find((v) => /en/i.test(v.lang)) ??
      null
    u.onstart = () => window.dispatchEvent(new CustomEvent('milady:speaking', { detail: true }))
    u.onend = () => window.dispatchEvent(new CustomEvent('milady:speaking', { detail: false }))
    u.onerror = () => window.dispatchEvent(new CustomEvent('milady:speaking', { detail: false }))
    window.speechSynthesis.speak(u)
  }, [voiceOn])

  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      if (v && typeof window !== 'undefined') {
        window.speechSynthesis?.cancel()
        window.dispatchEvent(new CustomEvent('milady:speaking', { detail: false }))
      }
      return !v
    })
  }, [])

  // ── voice IN: speak into the mic, transcript fills the input ──
  const toggleMic = useCallback(() => {
    const SR =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    if (!SR) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = false
    let finalText = ''
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interim += r[0].transcript
      }
      setInput((finalText + interim).trim())
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [listening])

  const micSupported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantId = crypto.randomUUID()

    setInput('')
    setLoading(true)
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])

    const history = messages
      .filter(m => !m.streaming && m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, model, agent }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error(`${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? '' // keep trailing partial line for the next chunk
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break
          try {
            const parsed = JSON.parse(raw)
            if (parsed.token) {
              accumulated += parsed.token
              setMessages(prev =>
                prev.map(m => m.id === assistantId
                  ? { ...m, content: accumulated, streaming: true }
                  : m
                )
              )
            }
            if (parsed.error) throw new Error(parsed.error)
          } catch { /* partial */ }
        }
      }

      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
      )
      speak(accumulated)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev =>
        prev.map(m => m.id === assistantId
          ? { ...m, content: 'backend not running. start it with: cd backend; npm run dev', streaming: false }
          : m
        )
      )
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, speak, model, agent])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div
      className="border border-line flex flex-col"
      style={{ height: '480px', background: '#0d0b13' }}
    >
      {/* header */}
      <div className="relative flex items-center justify-between px-5 py-3 border-b border-line shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse-slow shrink-0" />
          {/* agent switcher */}
          <button
            onClick={() => setPicker((p) => (p === 'agent' ? null : 'agent'))}
            className="mono-tag flex items-center gap-1 hover:opacity-100 transition-opacity duration-150 truncate"
            title="switch agent"
          >
            <span className="opacity-60">{activeAgent.name}</span>
            <span className="opacity-30 text-[0.6rem]">▾</span>
          </button>
          <span className="text-ink-4 font-mono text-xs opacity-40">·</span>
          {/* model switcher */}
          <button
            onClick={() => setPicker((p) => (p === 'model' ? null : 'model'))}
            className="mono-tag flex items-center gap-1 hover:opacity-100 transition-opacity duration-150 truncate"
            title="switch model"
          >
            <span className="text-pink opacity-70 truncate">{activeModel.label}</span>
            <span className="opacity-30 text-[0.6rem]">▾</span>
          </button>
        </div>
        <button
          onClick={toggleVoice}
          className="mono-tag flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-100 shrink-0"
          title={voiceOn ? 'mute milady' : 'give milady a voice'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${voiceOn ? 'bg-pink animate-pulse-slow' : 'bg-ink-4'}`} />
          <span className={voiceOn ? 'text-pink opacity-70' : 'opacity-30'}>voice</span>
        </button>

        {/* picker dropdown */}
        <AnimatePresence>
          {picker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPicker(null)} />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 right-4 top-full mt-1 z-20 bg-s2 border border-line max-h-72 overflow-y-auto"
              >
                <p className="mono-tag opacity-40 px-3 pt-3 pb-2">
                  {picker === 'model' ? '— choose model' : '— choose agent'}
                </p>
                {picker === 'model'
                  ? MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => chooseModel(m.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-baseline justify-between gap-3 hover:bg-surface transition-colors duration-150 ${
                          m.id === model ? 'bg-surface' : ''
                        }`}
                      >
                        <span className="flex flex-col">
                          <span className={`text-sm ${m.id === model ? 'text-pink' : 'text-ink-2'}`} style={{ fontSize: '0.8125rem' }}>
                            {m.label}
                          </span>
                          <span className="mono-tag opacity-40 mt-0.5">{m.vendor} · {m.note}</span>
                        </span>
                        {m.id === model && <span className="text-pink text-xs shrink-0">✦</span>}
                      </button>
                    ))
                  : AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => chooseAgent(a.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-baseline justify-between gap-3 hover:bg-surface transition-colors duration-150 ${
                          a.id === agent ? 'bg-surface' : ''
                        }`}
                      >
                        <span className="flex flex-col">
                          <span className={`text-sm ${a.id === agent ? 'text-pink' : 'text-ink-2'}`} style={{ fontSize: '0.8125rem' }}>
                            {a.name}
                          </span>
                          <span className="mono-tag opacity-40 mt-0.5">{a.note}</span>
                        </span>
                        {a.id === agent && <span className="text-pink text-xs shrink-0">✦</span>}
                      </button>
                    ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="shrink-0 w-5 h-5 rounded-full border border-pink-border flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(242,167,195,0.08)' }}
                >
                  <span className="text-pink" style={{ fontSize: '0.4rem' }}>✦</span>
                </div>
              )}
              <div
                className={`max-w-sm rounded-none text-sm leading-relaxed px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-s3 text-ink-2 border border-line'
                    : 'bg-surface text-ink-2 border border-line'
                }`}
                style={{ fontSize: '0.8125rem' }}
              >
                {msg.content || (msg.streaming
                  ? <span className="flex gap-1 items-center py-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1 h-1 rounded-full bg-pink opacity-50"
                          style={{ animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
                      ))}
                    </span>
                  : null
                )}
                {msg.streaming && msg.content && (
                  <span className="inline-block w-0.5 h-3 bg-pink opacity-60 ml-0.5 animate-pulse" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* input */}
      <div className="border-t border-line px-4 py-3 shrink-0 flex items-center gap-3">
        {micSupported && (
          <button
            onClick={toggleMic}
            title={listening ? 'listening… click to stop' : 'speak to milady'}
            className={`shrink-0 transition-opacity duration-150 ${
              listening ? 'text-pink opacity-100 animate-pulse' : 'text-ink-3 opacity-50 hover:opacity-90'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
              <path d="M12 18v4" />
            </svg>
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={listening ? 'listening…' : 'ask milady anything...'}
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-ink-2 placeholder-ink-4 outline-none"
          style={{ fontSize: '0.8125rem' }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="shrink-0 text-pink opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity duration-150 text-lg leading-none"
        >
          {loading
            ? <span className="inline-block w-3 h-3 border border-pink border-t-transparent rounded-full animate-spin" />
            : '↑'
          }
        </button>
      </div>
    </div>
  )
}
