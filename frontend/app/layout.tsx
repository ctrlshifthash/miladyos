import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import Providers from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Milady OS — local-first personal AI',
    template: '%s · Milady OS',
  },
  description: 'Local-first personal AI. Runs on your hardware. No cloud, no surveillance, no compromise.',
  keywords: ['local AI', 'personal AI assistant', 'elizaOS', 'privacy', 'LLM'],
  authors: [{ name: 'milady-ai' }],
  openGraph: {
    title: 'Milady OS — local-first personal AI',
    description: 'Your AI. Your machine. No cloud.',
    type: 'website',
    siteName: 'Milady OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milady OS',
    description: 'local-first personal AI',
  },
}

export const viewport: Viewport = {
  themeColor: '#09080c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
