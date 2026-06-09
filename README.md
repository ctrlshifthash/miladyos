<div align="center">

<img src="assets/banner.png" alt="Milady OS" width="100%" />

<br/>

### a personal AI you *actually own* — running on your hardware, not the cloud

[![Website](https://img.shields.io/badge/site-miladyos.app-f2a7c3?style=for-the-badge&labelColor=0d0b13)](https://miladyos.app)
[![X](https://img.shields.io/badge/follow-@tryMiladyOS-f2a7c3?style=for-the-badge&logo=x&logoColor=white&labelColor=0d0b13)](https://x.com/tryMiladyOS)
[![Claude Fable 5](https://img.shields.io/badge/powered%20by-Claude%20Fable%205-f2a7c3?style=for-the-badge&labelColor=0d0b13)](https://miladyos.app)
[![Mythos](https://img.shields.io/badge/+-Mythos%20(no%20guardrails)-9fb0d0?style=for-the-badge&labelColor=0d0b13)](https://miladyos.app)
[![elizaOS](https://img.shields.io/badge/built%20on-elizaOS-c7b8d8?style=for-the-badge&labelColor=0d0b13)](https://github.com/elizaos)

</div>

---

## ✦ What is Milady OS

**Milady OS** is a local-first personal AI built on the **elizaOS** framework. It runs entirely on your own machine — no cloud, no account, no one reading your conversations. Chat across 15+ models, give it a 3D avatar and a voice, watch exactly how much GPU and RAM it uses live, and build your own agents that **trade crypto for you**.

> Your AI. Your machine. Your keys. Nothing — and no compute — ever leaves your device.

## ✦ Powered by Claude Fable 5 — and Mythos

Milady OS is among the **first projects shipped on [Claude Fable 5](https://miladyos.app)** — Anthropic's newest model and the default, guardrailed brain for every agent.

Need it raw? Switch any agent to **Mythos — the same intelligence, without the guardrails**. Two modes, one runtime: **Fable 5** for safe-by-default, **Mythos** for unfiltered. Plus 15+ other providers (GPT-4o, Gemini, Llama, Mistral, Groq) or fully offline via Ollama — swappable mid-conversation.

## ✦ Features

| | |
|---|---|
| 🖥️ **Local-first** | The model runs on *your* GPU and RAM. No data leaves the device, no rate limits, no metering. |
| 🧠 **Fable 5 + Mythos** | Claude Fable 5 (guardrailed) by default, or **Mythos (no guardrails)** — plus GPT-4o, Gemini, Llama, Mistral, Groq, or offline via Ollama. |
| 🎭 **3D avatar + voice** | A VRM avatar rendered in WebGL that lip-syncs to speech and reacts in real time. Swap in any model. |
| 💱 **Trading agents** | Connect a wallet and your agent trades for you across **BNB Smart Chain, PancakeSwap, and Solana** — within hard limits you set. |
| 📊 **Live compute readout** | See GPU load, RAM footprint, throughput (tok/s), and token spend for every conversation, as it happens. |
| 🧩 **Plugin system** | LLMs, TTS, vision, memory backends, custom tools — every capability is an npm package. The core itself ships as plugins. |
| 🌐 **Runs everywhere** | macOS · Windows · Linux · Android — via Docker, npm, Homebrew, Flatpak, Snap, or a one-line install. |

## ✦ The Studio

The heart of Milady OS. Build your own **milady-type agents** — each with a persona, model, temperament, and avatar — then talk to them, track their **usage and spend**, and let them trade on your behalf. Every agent carries its own wallet (via **Privy**, Solana-native) and its balance, runway, and vitality update live as it works.

## ✦ How it works

```
┌──────────────────────────────────────────────┐
│  Milady OS — one elizaOS runtime, on-device   │
├──────────────────────────────────────────────┤
│  models     Claude Fable 5 + 15 providers     │
│  desktop    Electrobun shell · 3D VRM avatar  │
│  API        REST :2138  ·  WebSocket :18789   │
│  wallets    EVM + Solana · BNB · PancakeSwap  │
│  plugins    npm packages — swap anything      │
└──────────────────────────────────────────────┘
```

The codebase itself is maintained by AI: 1768+ pull requests reviewed and merged entirely by agents, with humans doing only QA.

## ✦ Quick start

```bash
git clone https://github.com/ctrlshifthash/miladyos
cd miladyos/frontend
npm install
cp .env.local.example .env.local   # add your keys (see below)
npm run dev                          # → http://localhost:3000
```

**Environment variables** (`frontend/.env.local`):

```bash
OPENROUTER_API_KEY=          # your OpenRouter key — powers the chat
NEXT_PUBLIC_PRIVY_APP_ID=    # Privy app id — Solana wallet connect (optional)
```

The optional **backend** (`backend/`) is a Hono service exposing the REST + WebSocket gateway — only needed if you're running a local milady instance. The web chat works without it.

## ✦ Deploy

| Part | Where | How |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Import the repo · root directory `frontend` · add the env vars above |
| **Backend** | [Railway](https://railway.app) | New service · root `backend` · env from `backend/.env.example` |

> The backend runs a persistent WebSocket server, so deploy it on Railway (not Vercel's serverless).

## ✦ Tech stack

`elizaOS` · `Next.js 14` · `TypeScript` · `React Three Fiber` · `Privy` · `Tailwind` · `Hono` · `Claude Fable 5`

---

<div align="center">

**[miladyos.app](https://miladyos.app)** · **[@tryMiladyOS](https://x.com/tryMiladyOS)**

*built by agents · tested by humans · offline, on your terms*

</div>
