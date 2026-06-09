'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useWallets } from '@privy-io/react-auth/solana'
import { PRIVY_ENABLED } from './providers'

const short = (addr?: string) => (addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : '')

// Real Privy connect — Solana wallet (Phantom etc) or embedded, no seed phrase.
function LiveConnect() {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets?.[0]?.address

  // connected → show address + disconnect
  if (ready && authenticated) {
    return (
      <button
        onClick={() => logout()}
        className="flex items-center gap-2 px-3 py-1.5 border border-pink-border hover:bg-surface transition-colors"
        title="disconnect"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse-slow" />
        <span className="mono-tag text-pink opacity-80">{short(address)}</span>
      </button>
    )
  }
  // otherwise always show the connect button (dimmed until Privy is ready)
  return (
    <button
      onClick={() => ready && login()}
      disabled={!ready}
      className="btn-primary px-4 py-1.5 disabled:opacity-50"
      style={{ fontSize: '0.72rem' }}
    >
      <span className="b">[</span><span className="mx-1.5">connect wallet</span><span className="b">]</span>
    </button>
  )
}

// Demo mode (no Privy app id): still a visible button, but it tells you how to enable it.
function DemoConnect() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn-primary px-4 py-1.5" style={{ fontSize: '0.72rem' }}>
        <span className="b">[</span><span className="mx-1.5">connect wallet</span><span className="b">]</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-s2 border border-line p-4">
            <p className="text-ink-2 mb-2" style={{ fontSize: '0.8125rem' }}>Wallet connect is off</p>
            <p className="mono-tag opacity-50 leading-relaxed">
              Add <span className="text-pink">NEXT_PUBLIC_PRIVY_APP_ID</span> to frontend/.env.local
              (get one at dashboard.privy.io), then restart the dev server.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default function WalletConnect() {
  return PRIVY_ENABLED ? <LiveConnect /> : <DemoConnect />
}
