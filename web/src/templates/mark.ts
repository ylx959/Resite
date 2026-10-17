/** The default site mark: an orange dot in a white ring. Mirrors `public/favicon.svg`. */
export const MARK_VIEWBOX = '0 0 38 40'
export const MARK_COLOR = '#FF4A00'

/** The mark as a standalone SVG file, for the exported favicon. */
export const MARK_SVG = `<svg width="38" height="40" viewBox="${MARK_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="38" height="40" rx="19" fill="white"/>
<circle cx="19" cy="20" r="17" fill="${MARK_COLOR}"/>
</svg>
`
