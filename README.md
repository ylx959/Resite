# Resite

Make a personal resume website without writing code. Edit on the left, watch the
live preview on the right, then download a ready-to-host website as a ZIP.

The design comes from [myResume](../myResume): same type scale, spacing and chips.
Light theme only.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
./backend/dev.sh   # http://localhost:8000 (creates .venv, installs deps, runs uvicorn)
```

Other commands:

| Command               | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `npm run dev:backend` | FastAPI backend via `backend/dev.sh` (:8000)          |
| `npm run build`       | Static build of the creator into `web/out/`      |
| `npm run typecheck`   | TypeScript check (all workspaces)                     |
| `npm run test:run`    | Unit tests (validation, editing, ZIP export)          |

## Repository layout

npm workspaces monorepo:

```
web/       @resite/web — the Next.js creator (everything below lives here)
backend/   FastAPI API server (placeholder: GET /health, docs at /docs)
```

## Use it

1. **Edit.** Fill in your name and title, then open each section to edit it.
   Use the controls on a section's right to hide, reorder or delete it.
   Choose **Add section** to add a custom one.
2. **Links in text.** Write `[label](https://example.com)` in any summary, highlight
   or paragraph. Leave a blank line between paragraphs.
3. **Your work saves itself** in this browser. Choose **Save JSON** to keep a backup,
   and **Import** to load it again (on any computer).
4. **Download website.** You get `resume-website.zip`:

   ```
   resume-website/
   ├── index.html
   ├── assets/
   │   ├── style.css
   │   ├── script.js
   │   └── images/
   └── README.md
   ```

5. **Publish.** Go to [vercel.com/drop](https://vercel.com/drop), sign in to your own
   free Vercel account, drop the ZIP in, and choose **Deploy**. You get an address
   like `your-name.vercel.app`. The **How to publish** button in the app walks
   through every step.

Resite never deploys anything for you. Each person hosts their own site.

## Your own resume

`web/examples/raymond-yang.resume.json` is the myResume content in this format.
Choose **Import** in the app to load it.

## How it's built

Next.js (static export), React, TypeScript, Tailwind CSS, JSZip. The creator runs
entirely in the browser. Paths below are relative to `web/`.

- `src/types/resume.ts`: the resume data shape
- `src/resume/`: editing logic (pure reducer, section kinds, sample data)
- `src/templates/`: the resume design. One React component renders both the
  live preview and the exported `index.html`, so they always match.
- `src/utils/exportWebsite.ts`: builds the site files and the ZIP
- `src/utils/validation.ts`: checks imported JSON before using it
- `src/components/`: the editor UI

See `CONTEXT.md` for the terms used in the code.

## Project architecture

One resume object drives everything. The editor changes it, the preview and the
download both render it with the same template.

```
          Import JSON ──► parseResume ──┐
          localStorage ─► parseResume ──┤
                                        ▼
  Editor ──dispatch──► resumeReducer ──► Resume ──► Template (React)
                                          │              │
                                          ▼              ├──► Live preview (iframe)
                                    localStorage         └──► buildSite ──► ZIP
                                   (autosave, 300ms)
```

```
src/
├── app/              Next.js entry: layout, page, global styles and color tokens
├── App.tsx           The shell: toolbar, editor panel, preview, notices
├── types/resume.ts   The Resume data shape (profile, sections, settings)
├── resume/           Editing logic, no React
│   ├── reducer.ts      resumeReducer: every change to the resume
│   ├── listOps.ts      add / update / remove / move for any list
│   ├── sectionKinds.ts the section kinds (text, timeline, tags, people, links)
│   └── sample.ts       the sample resume shown on first visit and after Reset
├── templates/        The resume design
│   ├── index.ts        template registry (getTemplate)
│   ├── content.ts      which sections and links are shown
│   ├── SiteDocument.tsx the full <html> page for the export
│   └── minimal/        the Minimal template: React component + plain CSS
├── utils/
│   ├── validation.ts   parseResume: checks imported or saved JSON
│   ├── storage.ts      load, save and clear in localStorage
│   ├── exportWebsite.ts buildSite and zipSite: resume in, ZIP out
│   ├── url.ts          safeHref / safeImageSrc: blocks unsafe links
│   ├── inline.ts       [label](url) links and paragraphs in text
│   └── images.ts       shrinks uploaded photos before saving
├── hooks/
│   ├── useResumeStore.ts loads the saved resume and autosaves it
│   ├── useEditorPanel.ts editor width and collapsed state
│   └── EditorContext.tsx gives components dispatch
├── components/
│   ├── editor/         the section forms, lists and Add section
│   ├── preview/        ResumePreview: renders the template in an iframe
│   ├── app/            Toolbar, panel resizer, How to publish sheet
│   └── ui/             Button, fields, icons, confirm-to-delete button
└── content/
    └── deployGuide.ts  publishing steps, used in the app and in the ZIP README
```

A few rules keep it simple and safe:

- **Changes go through `resumeReducer`.** Components never edit the resume
  directly; they call `dispatch` from `useDispatch()`.
- **Outside data goes through `parseResume`.** Imported files and saved data are
  checked and repaired before the app uses them.
- **Preview and download share one template.** The template components are pure
  (no hooks, no browser APIs), so they render the same in the iframe and in
  `renderToStaticMarkup` for the export.
- **No unsafe HTML.** User text is rendered by React, never as raw HTML, and every
  link and image goes through `safeHref` / `safeImageSrc`.
- **The export stands alone.** The template uses plain CSS with `cv-` classes, not
  Tailwind, so `style.css` works without a build step. GSAP is only for editor
  animations and never ships in the export.
- **Adding a template** means adding a folder under `src/templates/` and an
  entry in `src/templates/index.ts`.
