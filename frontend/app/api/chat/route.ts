import { NextRequest } from 'next/server'
import { DEFAULT_MODEL, isValidModel, resolveSystemPrompt, clampTemperature, clampMaxTokens } from '@/lib/agents'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'no API key configured' }), { status: 503 })
  }

  const body = await req.json()
  const message: string = body.message?.trim()
  if (!message) {
    return new Response(JSON.stringify({ error: 'message required' }), { status: 400 })
  }

  // model is validated against the allowlist so only known slugs hit the key.
  const model = isValidModel(body.model) ? body.model : (process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL)

  // a custom agent sends its own `system` prompt (capped); built-ins resolve by id.
  const systemPrompt =
    typeof body.system === 'string' && body.system.trim()
      ? body.system.trim().slice(0, 4000)
      : resolveSystemPrompt(body.agent)

  const temperature = clampTemperature(body.temperature)
  const maxTokens = clampMaxTokens(body.maxTokens)

  const history = (body.history ?? []).slice(-20)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ]

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milady.ai',
      'X-Title': 'milady',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
      stream_options: { include_usage: true },
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const err = await upstream.text()
    return new Response(JSON.stringify({ error: err }), { status: 502 })
  }

  // pipe OpenRouter SSE → client SSE: remap delta.content → { token },
  // surface the resolved model up front, and forward final { usage }.
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const dec = new TextDecoder()
      let buf = ''
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta: { model } })}\n\n`))
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? '' // keep trailing partial line for the next chunk
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
              if (json.usage) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ usage: json.usage })}\n\n`))
              }
            } catch { /* partial */ }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
