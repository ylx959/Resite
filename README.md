# Resite — Resume Website Builder

A resume website without writing code: edit on the left, watch the page take shape on the right, then download a static site that is yours to host. Sign in and your progress follows you from one computer to the next.

The design is [myResume](../myResume)'s, rewritten as a data-driven template — same type scale, spacing and chips, light theme only.

## Highlights

- One React template renders both the live preview and the exported site, so what you see is what you download
- The download is a finished static site in a ZIP, ready to drop on [Vercel Drop](https://vercel.com/drop)
- Progress saves itself — in the browser, and once signed in, to your account, so another computer opens where you stopped
- Every outside input is validated, and Row Level Security keeps each user to their own data

## Built with

- [Next.js 16](https://nextjs.org/) App Router — the editor runs in the browser; Server Actions handle every write, Route Handlers the reads
- [React 19](https://react.dev/) and TypeScript, strict
- [Tailwind CSS v4](https://tailwindcss.com/) — no config file; design tokens live in `globals.css`'s `@theme` block. The exported template does not use it.
- [GSAP](https://gsap.com/) with `useGSAP`, for editor motion only — it never ships in an exported site
- [JSZip](https://stuk.github.io/jszip/) to package the site in the browser
- [Supabase](https://supabase.com/) — Auth for passwords, sessions and rate limits; Postgres for profiles and drafts; [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side) to keep the session in cookies the server can read
- [Vitest](https://vitest.dev/), in node, over the modules rather than the components

## Local development

This project requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev        # http://localhost:3000
```

Create and inspect a production build:

```bash
npm run build
npm start -w @resite/web
```

```bash
npm run typecheck   # tsc --noEmit — the build checks types too, this is just faster
npm run test:run    # validation, editing, ZIP export, sign-up rules
```

`backend/` is a FastAPI placeholder (`GET /health`), kept for LLM work to come. The app does not need it; `npm run dev:backend` starts it on :8000.

### Supabase

Everything Supabase-side lives in `web/supabase/`, and the CLI is run from `web/`.

Keys go in `web/.env.local` (git-ignored), from **Project Settings → API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # never the secret key — nothing here needs it
```

Change a table:

```bash
supabase migration new <name>   # 1. creates a file in supabase/migrations/ — write the SQL there
                                #    e.g. supabase migration new add_template_choice
supabase db push                # 2. apply it to the database
```

Add an Edge Function:

```bash
supabase functions new <name>      # creates supabase/functions/<name>/index.ts — Deno, outside the Next.js build
supabase functions deploy <name>
```

First time only: `supabase login`, then `supabase link --project-ref <project-ref>`, then `supabase db push`.

In the dashboard, **Authentication → URL Configuration** needs the Site URL (`http://localhost:3000` locally) and `/auth/callback` under Redirect URLs, or the confirmation email has nowhere to land. While developing, turning off **Authentication → Sign In / Providers → Email → Confirm email** skips the email entirely.

## Using it

1. Edit the profile, then each section — hide, reorder or delete from the controls on its right; **Add section** for your own.
2. Write `[label](https://example.com)` anywhere in text for a link, and leave a blank line for a new paragraph.
3. Sign in to keep progress in your account, or close the sheet and stay a guest — guests save in this browser only. **Sign out** clears this browser's copy; the account keeps it.
4. **Save JSON** keeps a file backup, and **Import** loads one.
5. **Download website**, then drop `resume-website.zip` on [vercel.com/drop](https://vercel.com/drop). **How to publish** in the app walks through each step.

Resite never deploys anything for you. Each person hosts their own site.

## Deployment

The app needs a Node.js runtime — Server Actions and Route Handlers run on the server — but keeps no state of its own, so any host that runs Next.js will do, Vercel included. The build command is `npm run build`.

The host needs the two `NEXT_PUBLIC_SUPABASE_*` variables, and Supabase needs the production `/auth/callback` added to its Redirect URLs.

Every response is sent with `frame-ancestors 'none'` and `X-Frame-Options: DENY`, so no other site can frame the sign-in form. The preview's iframe is unaffected — it is a `srcDoc`, which those headers do not reach.

Sign-in and sign-up rate limits are Supabase Auth's, set under **Authentication → Rate Limits**. Saves are not rate-limited; RLS and the 8 MB size check bound what one account can store.

## Project structure

```text
.
├── CONTEXT.md                 # The terms used in the code — Resume, Section, Edit anchor, Draft
├── backend/                   # FastAPI placeholder, kept for LLM work to come
└── web/                       # The app: npm workspace @resite/web
    ├── next.config.ts         # Security headers, Server Action body limit
    ├── src/
    │   ├── App.tsx            # The shell: toolbar, editor, preview, notices, sign-in sheet
    │   ├── app/
    │   │   ├── actions/       # Server Actions — sign up, sign in, sign out, save progress
    │   │   ├── api/resume/    # Who is signed in, and their saved progress
    │   │   └── auth/callback/ # Where the confirmation email lands
    │   ├── lib/               # Server only — the Supabase client, sign-up rules, drafts
    │   ├── resume/            # Editing logic, no React — resumeReducer and the section kinds
    │   ├── templates/         # The resume design — one pure component for preview and export
    │   ├── components/        # Editor forms, the preview, toolbar, dialogs, UI parts
    │   ├── hooks/             # useResumeStore loads and autosaves; panel and focus state
    │   ├── utils/             # parseResume, storage, buildSite and the ZIP, URL safety
    │   └── types/             # The Resume shape, and the account as the browser sees it
    └── supabase/
        ├── migrations/        # The schema and its RLS policies, one SQL file per change — see Supabase above
        └── functions/         # Edge Functions, one folder each, when there are some
```

## Rights

© 2026 Yang Linxuan. Released under the [MIT License](LICENSE).
