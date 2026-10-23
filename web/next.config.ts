import type { NextConfig } from 'next'

/** Full-stack Next.js: the editor runs in the browser; accounts and saved progress live in Server Actions and Route Handlers. */
const config: NextConfig = {
  images: { unoptimized: true },
  /** Hide the floating "N" dev-tools button; it overlaps the editor. */
  devIndicators: false,
  /**
   * No other site may frame the app (clickjacking on the sign-in form). The Preview is unaffected: its iframe
   * uses `srcDoc`, which these headers don't apply to.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  experimental: {
    /** A saved resume carries its images as data URLs (see `MAX_DRAFT_BYTES`), well past the 1 MB default. */
    serverActions: { bodySizeLimit: '10mb' },
  },
}

export default config
