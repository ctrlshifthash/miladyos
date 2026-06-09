'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

// Privy is optional: without NEXT_PUBLIC_PRIVY_APP_ID the app renders normally
// and the wallet button falls back to a clearly-labelled demo mode.
const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

export const PRIVY_ENABLED = Boolean(APP_ID)

// Detects installed Solana wallets. shouldAutoConnect:false stops the "loud"
// auto-connect that makes MetaMask pop up unprompted on page load.
const solanaConnectors = toSolanaWalletConnectors({ shouldAutoConnect: false })

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!APP_ID) return <>{children}</>
  return (
    <PrivyProvider
      appId={APP_ID}
      config={{
        // Solana-only: the connect modal lists only these wallets — no MetaMask/EVM.
        appearance: {
          theme: 'dark',
          accentColor: '#f2a7c3',
          walletChainType: 'solana-only',
          walletList: ['phantom', 'solflare', 'backpack', 'jupiter'],
        },
        externalWallets: { solana: { connectors: solanaConnectors } },
        embeddedWallets: { solana: { createOnLogin: 'users-without-wallets' } },
        loginMethods: ['wallet', 'email'],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
