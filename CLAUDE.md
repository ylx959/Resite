# Resite

Next.js 16 (App Router, `output: 'export'`, client-only), React 19, TypeScript strict, Tailwind CSS v4 (tokens in `src/app/globals.css`), JSZip, GSAP (`@gsap/react` `useGSAP`, editor UI only — never in templates), Vitest.

- Domain terms: CONTEXT.md. Data shape: `src/types/resume.ts`.
- Use `type`, not `interface`. No new dependencies without a strong reason.
- The template (`src/templates/minimal/`) is plain CSS with `cv-` classes, not Tailwind — it ships as-is in the export. Keep its components pure (no hooks, no browser APIs): they run in the preview and in `renderToStaticMarkup`.
- Every URL in the template goes through `safeHref` / `safeImageSrc`. Never use `dangerouslySetInnerHTML` for user content.
- Editor state changes only via `resumeReducer`; components get `dispatch` from `useDispatch()`.
- Untrusted JSON goes through `parseResume` before use.
- Test through module interfaces (`buildSite`, `parseResume`, `resumeReducer`, storage) in node; no component tests.

Commands: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run test:run`.
