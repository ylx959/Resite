# Resite — Resume Website Builder

Build a resume website without writing code: edit on the left, watch the page take shape on the right, then download a static site that is yours to host. Sign in, and your progress follows you from one computer to the next.

The design comes from [myResume](../myResume), rewritten as a data-driven template with the same type scale, spacing and chips, in a light theme only.

## Highlights

- Fully customizable content inside one fixed, carefully designed look
- One React template renders both the live preview and the exported site, so what you see is what you download
- The download is a finished static site in a ZIP, ready to drop on [Vercel Drop](https://vercel.com/drop)
- Progress saves itself: in the browser, and once you sign in, to your account, so another computer opens where you left off
- Every outside input is validated, and Row Level Security limits each user to their own data

## Built with

- [Next.js 16](https://nextjs.org/) App Router — the editor runs in the browser; Server Actions handle every write and Route Handlers handle the reads
- [React 19](https://react.dev/) and TypeScript in strict mode
- [Tailwind CSS v4](https://tailwindcss.com/) — no config file; design tokens live in the `@theme` block of `globals.css`. The exported template doesn't use it.
- [GSAP](https://gsap.com/) with `useGSAP`, for editor motion only — it never ships in an exported site
- [JSZip](https://stuk.github.io/jszip/) to package the site in the browser
- [Supabase](https://supabase.com/) — Auth for passwords, sessions and rate limits; Postgres for profiles and drafts; [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side) to keep the session in cookies the server can read
- [Resend](https://resend.com/) — Supabase Auth's custom SMTP provider, which delivers the sign-up confirmation emails
- [Vitest](https://vitest.dev/), running in Node and testing the modules rather than the components

## Local development

You need Node.js 20.9 or newer. Run every command from the repository root.

1. Clone the repository and install its dependencies:

   ```bash
   git clone https://github.com/ylx959/Resite.git
   cd Resite
   npm ci
   ```

2. Put your Supabase keys in `web/.env.local` (see [Supabase](#supabase) below). Without them, signing in and saving to an account will fail.

3. Start the dev server:

   ```bash
   npm run dev        # http://localhost:3000
   ```

4. Before you commit, check types and run the tests:

   ```bash
   npm run typecheck   # tsc --noEmit — the build checks types too, but this is faster
   npm run test:run    # validation, editing, ZIP export, sign-up rules
   ```

5. To try a production build locally:

   ```bash
   npm run build
   npm start -w @resite/web
   ```

`backend/` is a FastAPI placeholder (`GET /health`) kept for upcoming LLM work. The app doesn't need it; `npm run dev:backend` starts it on :8000.

### Supabase

Everything lives in `web/supabase/`; run the CLI from `web/`.

1. Copy the keys from **Project Settings → API** into `web/.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # never the secret key
   ```

2. Link the project and create the tables:

   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   supabase db push
   ```

3. Under **Authentication → URL Configuration**, set the Site URL (`http://localhost:3000`) and add `/auth/callback` to the Redirect URLs. To skip the confirmation email while developing, turn off **Email → Confirm email**.

To change a table, run `supabase migration new <name>`, write the SQL, then `supabase db push`. Never edit an applied migration. Edge Functions: `supabase functions new <name>`, then `supabase functions deploy <name>`.

## Using it

1. Edit the profile, then each section. Use the controls on the right of a section to hide, reorder or delete it, and **Add section** to create your own.
2. Write `[label](https://example.com)` anywhere in the text to add a link, and leave a blank line to start a new paragraph.
3. Sign in to keep your progress in your account, or close the sheet and stay a guest. Guests save in this browser only. **Sign out** clears this browser's copy, but the account keeps it.
4. **Save JSON** keeps a file backup, and **Import** loads one.
5. Click **Download website**, then drop `resume-website.zip` on [vercel.com/drop](https://vercel.com/drop). **How to publish** in the app walks you through each step.

Resite never deploys anything for you. Each person hosts their own site.

## Deployment

The app needs a Node.js runtime, because Server Actions and Route Handlers run on the server. It keeps no state of its own, though, so any host that runs Next.js will do, Vercel included. The build command is `npm run build`.

The host needs the two `NEXT_PUBLIC_SUPABASE_*` variables, and the production `/auth/callback` URL must be added to Supabase's Redirect URLs.

Every response is sent with `frame-ancestors 'none'` and `X-Frame-Options: DENY`, so no other site can frame the sign-in form. The preview's iframe is unaffected: it uses `srcDoc`, which those headers don't reach.

Sign-in and sign-up rate limits come from Supabase Auth and are set under **Authentication → Rate Limits**. Saves aren't rate-limited; RLS and the 8 MB size check limit what one account can store.

## Project structure

```text
.
├── CONTEXT.md                 # The terms used in the code — Resume, Section, Edit anchor, Draft
├── backend/                   # FastAPI placeholder, kept for upcoming LLM work
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
        └── functions/         # Edge Functions, one folder each, once there are any
```

## Rights

© 2026 Yang Linxuan. Released under the [MIT License](LICENSE).
