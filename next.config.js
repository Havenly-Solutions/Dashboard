/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  typescript: {
    // Re-enabled for production hardening
    ignoreBuildErrors: false,
  },
  eslint: {
    // Re-enabled for production hardening
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com https://browser.sentry-cdn.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: https://*.havenly.solutions https://image.mux.com",
              "connect-src 'self' http://localhost:3000 http://localhost:3005 http://127.0.0.1:3005 https://7005527958066f112000572887640306.r2.cloudflarestorage.com https://*.r2.cloudflarestorage.com https://*.havenly.solutions wss://*.havenly.solutions https://api.havenly.solutions wss://api.havenly.solutions https://video.mux.com https://*.sentry.io https://sentry.io https://*.ingest.sentry.io https://vercel.live",
              "frame-src 'self' https://vercel.live",
              "frame-ancestors 'self' https://havenly.solutions https://dashboard.havenly.solutions"
            ].join('; ')
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  },
}

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    org: "havenly-solutions",
    project: "javascript-nextjs",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
  }
);
