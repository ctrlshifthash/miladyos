import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const app = new Hono()

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'
const RPM = parseInt(process.env.RATE_LIMIT_RPM ?? '60', 10)
const MILADY_BASE = `http://${process.env.MILADY_HOST ?? 'localhost'}:${process.env.MILADY_PORT ?? 2138}`
const MILADY_WS = `ws://${process.env.MILADY_HOST ?? 'localhost'}:${process.env.MILADY_WS_PORT ?? 18789}`

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-haiku-4.5'

const SYSTEM_PROMPT = `You are milady — a local-first personal AI assistant built on the elizaOS framework. You run on the user's own hardware. You are direct, knowledgeable, and slightly sardonic. You know everything about the milady-ai/milady project: it supports 15+ LLM providers (Claude, GPT-4, Gemini, Ollama, Llama, Mistral, Groq, etc), ships a 3D VRM avatar via Electrobun desktop shell, has native BNB Smart Chain and PancakeSwap trading, auto-generates EVM and Solana wallets, and runs on macOS, Windows, Linux, Android, Docker, npm, Homebrew, Flatpak, and Snap. The codebase is reviewed and merged entirely by AI agents — no human reviewers. REST API runs on port 2138, WebSocket gateway on 18789. Built on elizaOS with TypeScript and Node.js 22+. Keep responses concise. No sycophancy. Be genuinely helpful.`

// ── Rate limiter ────────────────────────────────────────────────────────
const rateBuckets = new Map<string, { count: number; reset: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (bucket.count >= RPM) return false
  bucket.count++
  return true
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, b] of rateBuckets) {
    if (now > b.reset) rateBuckets.delete(ip)
  }
}, 5 * 60_000)

// ── Middleware ──────────────────────────────────────────────────────────
app.use('*', cors({
  origin: FRONTEND_ORIGIN,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(ip)) return c.json({ error: 'rate limit exceeded' }, 429)
  await next()
})

// ── /api/health ─────────────────────────────────────────────────────────
app.get('/api/health', async (c) => {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY)

  // also check if local milady is running
  let miladyRunning = false
  try {
    const res = await fetch(`${MILADY_BASE}/health`, { signal: AbortSignal.timeout(1500) })
    miladyRunning = res.ok
  } catch { /* not running */ }

  return c.json({ status: 'ok', claude: hasKey, milady: miladyRunning })
})

// ── /api/models ─────────────────────────────────────────────────────────
app.get('/api/models', (c) => {
  return c.json({
    providers: [
      { id: 'openrouter', name: OPENROUTER_MODEL, available: Boolean(process.env.OPENROUTER_API_KEY) },
      { id: 'milady', name: 'Local milady', available: false },
    ],
  })
})

// ── /api/chat ───────────────────────────────────────────────────────────
// Accepts: { message: string, history?: { role: 'user'|'assistant', content: string }[] }
// Returns: SSE stream of { token: string } events, terminated by [DONE]
app.post('/api/chat', async (c) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return c.json({ error: 'no API key configured on this server' }, 503)
  }

  let body: { message?: string; history?: { role: 'user' | 'assistant'; content: string }[] }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'invalid JSON' }, 400)
  }

  const message = typeof body.message === 'string' ? body.message.trim() : null
  if (!message) return c.json({ error: 'message is required' }, 400)

  const history = (body.history ?? []).slice(-20)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ]

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const upstream = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
            'X-Title': 'milady',
          },
          body: JSON.stringify({ model: OPENROUTER_MODEL, messages, stream: true }),
        })

        if (!upstream.ok || !upstream.body) {
          const err = await upstream.text()
          throw new Error(`OpenRouter ${upstream.status}: ${err}`)
        }

        const reader = upstream.body.getReader()
        const dec = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const lines = dec.decode(value, { stream: true }).split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') break

            try {
              const json = JSON.parse(raw)
              const token = json.choices?.[0]?.delta?.content
              if (token) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
              }
            } catch { /* partial line */ }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'upstream error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

// ── 404 ────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'not found' }, 404))

// ── HTTP + WebSocket server ────────────────────────────────────────────
const port = parseInt(process.env.PORT ?? '3001', 10)
const httpServer = createServer()
const wss = new WebSocketServer({ server: httpServer })

wss.on('connection', (clientWs) => {
  let miladyWs: WebSocket | null = null
  try {
    miladyWs = new WebSocket(MILADY_WS)
  } catch {
    clientWs.close(1011, 'could not connect to milady websocket')
    return
  }
  miladyWs.on('open', () => {
    clientWs.on('message', (data) => {
      if (miladyWs?.readyState === WebSocket.OPEN) miladyWs.send(data)
    })
  })
  miladyWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data)
  })
  miladyWs.on('close', () => clientWs.close())
  miladyWs.on('error', () => clientWs.close(1011, 'upstream error'))
  clientWs.on('close', () => miladyWs?.close())
  clientWs.on('error', () => miladyWs?.close())
})

httpServer.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  const url = `http://${req.headers.host}${req.url}`
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v)
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const body = chunks.length ? Buffer.concat(chunks) : undefined

  const honoReq = new Request(url, {
    method: req.method ?? 'GET',
    headers,
    body: body?.length ? body : undefined,
  })

  const honoRes = await app.fetch(honoReq)
  res.statusCode = honoRes.status
  honoRes.headers.forEach((v, k) => res.setHeader(k, v))
  const buf = await honoRes.arrayBuffer()
  res.end(Buffer.from(buf))
})

httpServer.listen(port, () => {
  console.log(`backend on :${port}`)
  console.log(`openrouter: ${process.env.OPENROUTER_API_KEY ? 'configured ✓' : 'NO API KEY'}`)
  console.log(`model: ${OPENROUTER_MODEL}`)
})
