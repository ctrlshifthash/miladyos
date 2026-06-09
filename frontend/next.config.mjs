/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ]
  },
  // Privy lazy-loads optional integrations (Stripe on-ramp, Farcaster mini-apps)
  // that we don't use. Map them to empty modules so webpack doesn't fail.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@stripe/crypto': false,
      '@farcaster/mini-app-solana': false,
      '@solana-program/memo': false,
    }
    return config
  },
}

export default nextConfig
