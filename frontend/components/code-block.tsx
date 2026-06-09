'use client'

import { useState } from 'react'

interface CodeBlockProps {
  code: string
  lang?: string
  filename?: string
  showCopy?: boolean
}

export default function CodeBlock({ code, lang = 'bash', filename, showCopy = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-s2 border border-line overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
        <span className="mono-tag opacity-40">{filename ?? lang}</span>
        {showCopy && (
          <button
            onClick={copy}
            className="mono-tag opacity-40 hover:opacity-80 transition-opacity duration-150"
          >
            {copied ? 'copied ✓' : 'copy'}
          </button>
        )}
      </div>
      <pre className="px-4 py-4 overflow-x-auto">
        <code className="font-mono text-ink-2 whitespace-pre leading-relaxed" style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
          {code}
        </code>
      </pre>
    </div>
  )
}
