const RELEASES = 'https://github.com/milady-ai/milady/releases'

const platforms = [
  { name: 'macOS', detail: 'Apple Silicon', tag: 'ARM64 · .dmg', href: RELEASES },
  { name: 'macOS', detail: 'Intel', tag: 'x86_64 · .dmg', href: RELEASES },
  { name: 'Windows', detail: 'x64', tag: '.exe · NSIS', href: RELEASES },
  { name: 'Linux', detail: 'x86_64', tag: '.AppImage · .deb', href: RELEASES },
  { name: 'Android', detail: 'ARM64', tag: '.apk · v8+', href: RELEASES },
  { name: 'Docker', detail: 'all platforms', tag: 'docker pull', href: RELEASES },
  { name: 'npm', detail: 'Node.js 22+', tag: 'npm install', href: RELEASES },
  { name: 'Homebrew', detail: 'macOS · Linux', tag: 'brew install', href: RELEASES },
  { name: 'Flatpak', detail: 'Linux', tag: 'flatpak install', href: RELEASES },
  { name: 'Snap', detail: 'Linux', tag: 'snap install', href: RELEASES },
  { name: 'Debian', detail: 'Ubuntu · Debian', tag: 'apt · .deb', href: RELEASES },
]

export default function DownloadGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-line">
      {platforms.map((p) => (
        <a
          key={`${p.name}-${p.detail}`}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-bg hover:bg-surface p-5 flex flex-col justify-between gap-6 transition-colors duration-200"
          style={{ minHeight: '5.5rem' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-2 group-hover:text-ink transition-colors duration-200">
                {p.name}
              </p>
              <p className="mono-tag mt-0.5 opacity-50">{p.detail}</p>
            </div>
            <span className="text-pink opacity-0 group-hover:opacity-40 transition-opacity duration-200 text-xs mt-0.5">
              ↓
            </span>
          </div>
          <span className="mono-tag opacity-40 group-hover:opacity-60 transition-opacity duration-200">
            {p.tag}
          </span>
        </a>
      ))}
    </div>
  )
}
