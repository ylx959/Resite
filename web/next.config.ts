import type { NextConfig } from 'next'

/** Fully static build (`out/`): the creator runs entirely in the browser. */
const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  /** Hide the floating "N" dev-tools button; it overlaps the editor. */
  devIndicators: false,
}

export default config
