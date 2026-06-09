'use client'

import { usePrivy } from '@privy-io/react-auth'
import { PRIVY_ENABLED } from './providers'

const short = (addr?: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '')

// Live Privy treasury — the real embedded wallet that anchors agent funding.
function PrivyTreasury() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const address = user?.wallet?.address

  if (!ready) {
    return <span className="mono-tag opacity-30">treasury · loading…</span>
  }

  if (!authenticated) {
    return (
      <button onClick={() => login()} className="btn-primary px-4 py-1.5" style={{ fontSize: '0.75rem' }}>
        <span className="b">[</span><span className="mx-2">connect treasury</span><span className="b">]</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse-slow" />
      <span className="mono-tag opacity-60">treasury</span>
      <span className="mono-tag text-pink opacity-80">{short(address)}</span>
      <button onClick={() => logout()} className="mono-tag opacity-30 hover:opacity-70 transition-opacity">disconnect</button>
    </div>
  )
}

// Fallback when no Privy app id is set — funding still works as simulated credits.
function DemoTreasury() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-4" />
      <span className="mono-tag opacity-50">treasury · demo mode</span>
      <span className="mono-tag opacity-30">set NEXT_PUBLIC_PRIVY_APP_ID to connect Privy</span>
    </div>
  )
}

export default function Treasury() {
  return PRIVY_ENABLED ? <PrivyTreasury /> : <DemoTreasury />
}
