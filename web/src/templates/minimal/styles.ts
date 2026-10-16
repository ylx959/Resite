/**
 * Stylesheet for the Minimal template — the myResume design (tokens from merycodes.com,
 * type scale 18/15/14px) written as plain CSS so the exported site needs no build step.
 * The same string styles the live preview and becomes `assets/style.css`.
 */
export const minimalCss = /* css */ `
:root {
  --lightest: #fcfcfc;
  --zinc-300: #d4d4d8;
  --zinc-400: #9f9fa9;
  --zinc-500: #71717b;
  --zinc-600: #52525c;
  --zinc-800: #27272a;
  --zinc-900: #18181b;
  --primary: var(--zinc-900);
  --secondary: var(--zinc-600);
  --tertiary: var(--zinc-500);
  /* Ink for translucent strokes, fills and underlines. */
  --ink: #000;
  --accent: #ff4a00;
  --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --text-body: 0.9375rem;
  --text-sm: 0.875rem;
  --text-lg: 1.125rem;
  color-scheme: light;
}


*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

html, body {
  background: var(--lightest);
  color: var(--primary);
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: 1.5;
  text-wrap: pretty;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

::selection {
  color: var(--accent);
  text-decoration: underline wavy var(--accent);
  text-decoration-thickness: 0.8px;
  text-underline-offset: 0.2em;
}

a { color: inherit; text-decoration: inherit; }
ul { list-style: none; }
img, svg { display: block; }
button { font: inherit; color: inherit; background: none; border: 0; }

.cv {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2rem;
}
@media (min-width: 768px) { .cv { padding-top: 4rem; padding-bottom: 4rem; } }

/* --- Header ------------------------------------------------------------ */

.cv-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem 0.5rem;
}
@media (min-width: 640px) { .cv-header { flex-direction: row; align-items: flex-end; } }

.cv-header-id { display: flex; flex-direction: column; }
.cv-name-row { display: flex; align-items: center; gap: 0.625rem; }
.cv-name { width: fit-content; font-size: var(--text-lg); line-height: 1.75rem; font-weight: 500; }
.cv-title { color: var(--tertiary); }
.cv-nav { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }

/* Springy hover/tap, like motion's whileHover / whileTap. */
.cv-mark {
  height: 0.9625rem;
  width: auto;
  cursor: default;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: scale 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cv-mark:hover { scale: 0.9; }
.cv-mark:active { scale: 0.8; transition-duration: 120ms; }
@media (prefers-reduced-motion: reduce) { .cv-mark { transition: none; } }
img.cv-mark { max-width: 1.5rem; object-fit: contain; }

/* --- Sections ---------------------------------------------------------- */

.cv-main { margin-top: 4rem; }
.cv-section + .cv-section { margin-top: 5rem; }
.cv-h2 { margin-bottom: 1.5rem; font-size: var(--text-lg); line-height: 1.75rem; font-weight: 600; }
.cv-section--people .cv-h2 { margin-bottom: 0.5rem; }

.cv-prose p + p { margin-top: 0.75rem; }

/* Timeline */
.cv-entry { padding-bottom: 2.5rem; margin-bottom: 2.5rem; border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent); }
.cv-entry:last-child { padding-bottom: 0; margin-bottom: 0; border-bottom: 0; }
.cv-entry-head { display: flex; flex-wrap: wrap; align-items: center; column-gap: 0.5rem; }
.cv-entry-title { font-size: inherit; font-weight: 600; }
.cv-period { margin-top: 1px; font-size: var(--text-sm); line-height: 1.25rem; color: var(--tertiary); }
.cv-entry-subtitle { color: var(--secondary); }
.cv-entry-summary { margin-top: 0.5rem; }
.cv-highlights {
  margin-top: 1.5rem;
  padding-left: 1.5rem;
  list-style: disc;
  color: var(--secondary);
}
.cv-highlights li + li { margin-top: 0.375rem; }
.cv-highlights li::marker { color: var(--zinc-400); }

/* Tags */
.cv-tags > div + div { margin-top: 1rem; }
.cv-tag-row { display: flex; flex-direction: column; gap: 0.5rem; }
@media (min-width: 640px) { .cv-tag-row { flex-direction: row; gap: 1rem; } }
.cv-tag-label { flex-shrink: 0; margin-top: 0.25rem; font-size: var(--text-sm); line-height: 1.25rem; color: var(--tertiary); }
@media (min-width: 640px) { .cv-tag-label { width: 7rem; } }
.cv-tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.cv-tag {
  cursor: default;
  user-select: none;
  border: 1px solid color-mix(in srgb, var(--ink) 25%, transparent);
  border-radius: 0.375rem;
  padding: 2.5px 0.75rem;
  font-size: calc(var(--text-sm) * 0.95);
  line-height: 1.25rem;
  color: var(--ink);
  transition: background-color 150ms ease-out, scale 150ms ease-out;
}
.cv-tag:hover { background-color: color-mix(in srgb, var(--ink) 8%, transparent); }
.cv-tag:active { scale: 0.95; }

/* People */
.cv-people { margin-top: 1.25rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.cv-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  font-size: var(--text-sm);
  line-height: 1.25rem;
  background-color: color-mix(in srgb, var(--ink) 6%, transparent);
  transition: background-color 100ms;
}
a.cv-chip:hover { background-color: color-mix(in srgb, var(--ink) 10%, transparent); }
.cv-avatar { width: 1.25rem; height: 1.25rem; flex-shrink: 0; border-radius: 9999px; object-fit: cover; pointer-events: none; user-select: none; }
.cv-initials {
  display: grid;
  place-items: center;
  background: var(--zinc-800);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
}

/* Links */
.cv-links { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }

/* --- Text link (underlined, trailing icon) ----------------------------- */

.cv-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--ink) 20%, transparent);
  transition: color 100ms, text-decoration-color 100ms;
}
.cv-link--wide { gap: 0.375rem; }
.cv-link:hover { text-decoration-color: var(--ink); }
.cv-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
.cv-link svg { flex-shrink: 0; color: color-mix(in srgb, var(--ink) 30%, transparent); transition: color 100ms; }
.cv-link:hover svg { color: color-mix(in srgb, var(--ink) 80%, transparent); }

.cv-empty { color: var(--tertiary); }
`
