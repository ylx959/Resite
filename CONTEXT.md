# Resite — Domain Context

A browser-only tool that turns a **Resume** (JSON data) into a static resume website.
The design is the myResume site (`../myResume`), rewritten as a data-driven **Template**.

The exact data shape lives in `web/src/types/resume.ts`; this file defines the terms.

## Glossary

**Resume**: the whole document being edited. Profile + ordered Sections + Settings. Saved to localStorage, exported as JSON.

**Profile**: name, title, **Icon**, and the header **Links** beside the name.

**Icon**: the site's mark, shown beside the name and as the browser-tab favicon of the exported site. Empty → the default mark.

**Section**: a titled block of the page. Has a **kind**, a `visible` flag, and a position in `sections`. Hidden and empty sections are left out of the page.

**Section kind**: what a section holds. `text` (paragraphs), `timeline` (dated entries: Experience, Projects, Education), `tags` (labelled chip rows: Skills), `people` (Collaborations), `links` (Connect). Default and custom sections are the same thing; a custom section is just one the user added.

**Item**: one entry in a list section (a timeline entry, a tag group, a person, a link).

**Inline text**: plain text where `[label](url)` becomes a link and a blank line starts a paragraph.

**Template**: a design. A pure React component plus a plain-CSS stylesheet and a small script. One component feeds both the preview and the export.

**Preview**: the template rendered live, through a portal, into an iframe holding the template's CSS and script.

**Edit anchor**: a `data-edit` segment marking a region in both the editor and the template, nested section → item → field → line. The focused field's anchor path tells the Preview what is being edited. Stripped from the Site.

**EditorLine**: the accent rule with an "Editing" tag drawn over the Preview at the anchor being edited; the Preview scrolls to it and the line follows it.

**Site**: the exported files: `index.html`, `assets/style.css`, `assets/script.js`, `assets/images/*`, `README.md`.

## Modules

**`resumeReducer(resume, action)`** (`web/src/resume/reducer.ts`): every edit. Pure; ids are created by callers. List edits share one `ListOp` shape (add / update / remove / move).

**`parseResume(unknown)`** (`web/src/utils/validation.ts`): the only gate for untrusted data (imports, localStorage). Fills defaults, regenerates bad ids, rejects wrong types with a path-precise message.

**`buildSite(resume)` / `zipSite(files)`** (`web/src/utils/exportWebsite.ts`): Resume in, site files out; then the ZIP. `renderToStaticMarkup` of the template — no string templating of user content. Data-URL images become files.

**`safeHref` / `safeImageSrc`** (`web/src/utils/url.ts`): every URL the template renders passes through these.

**`anchor` / `anchorPathOf` / `findAnchor`** (`web/src/templates/anchors.ts`): Edit anchors — mark a region, read the focused field's path, resolve a path to the deepest rendered element.

**`getTemplate(id)`** (`web/src/templates/index.ts`): the template registry. Add a design by adding an entry.
