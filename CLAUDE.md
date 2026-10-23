# Resite

Monorepo: `web/` (Next.js, npm workspace `@resite/web`) and `backend/` (Python FastAPI + uvicorn; `backend/dev.sh` creates `.venv`, installs `requirements.txt`, runs with reload on :8000). Run commands from the root.

Web: Next.js 16 full-stack (App Router; the editor runs client-side, accounts and saved progress run on the server), React 19, TypeScript strict, Tailwind CSS v4 (tokens in `web/src/app/globals.css`), JSZip, GSAP (`@gsap/react` `useGSAP`, editor UI only — never in templates), Vitest.

- Domain terms: CONTEXT.md. Data shape: `web/src/types/resume.ts`.
- Use `type`, not `interface`. No new dependencies without a strong reason.
- The template (`web/src/templates/minimal/`) is plain CSS with `cv-` classes, not Tailwind — it ships as-is in the export. Keep its components pure (no hooks, no browser APIs): they run in the preview and in `renderToStaticMarkup`.
- Every URL in the template goes through `safeHref` / `safeImageSrc`. Never use `dangerouslySetInnerHTML` for user content.
- Editor state changes only via `resumeReducer`; components get `dispatch` from `useDispatch()`.
- Untrusted JSON goes through `parseResume` before use.
- Server code: `web/src/lib/` (`supabase.ts` = per-request `@supabase/ssr` client, `auth.ts`, `drafts.ts`). Data lives in Supabase (Auth + Postgres); everything Supabase-side lives in `web/supabase/`: schema and RLS as migrations in `migrations/` (apply with `supabase db push` from `web/`; change the schema with a new migration, never by editing an applied one), Edge Functions (Deno) in `functions/<name>/index.ts`, keys in `web/.env.local` (publishable key only, never the secret key). Mutations are Server Actions in `web/src/app/actions/`; reads that need an endpoint are Route Handlers in `web/src/app/api/`. Keep Supabase calls out of client components.
- Test through module interfaces (`buildSite`, `parseResume`, `resumeReducer`, storage, `checkSignup`, `prepareDraft`) in node; Supabase calls are not unit-tested; no component tests.

Commands: `npm run dev`, `npm run dev:backend`, `npm run build`, `npm run typecheck`, `npm run test:run`.
