# SEO & i18n invariants

## Single source of truth pairs (must stay in sync)

| Where | What | Synced with |
|---|---|---|
| `src/index.html` | static `<title>`, description, OG/Twitter tags (EN defaults) | `META` const in `app.component.ts` (per-language runtime values) |
| `src/index.html` JSON-LD | `Person` schema: jobTitle, worksFor, knowsAbout, sameAs | reality (career changes) + skills section content |
| `src/index.html` og:image | `assets/generated_work_image_mp.jpg` | file must exist in `src/assets` — never delete without swapping the tag |
| `src/robots.txt` + `src/sitemap.xml` | canonical URLs | `https://manfre3d.github.io/naw/` base; both are deployed via `angular.json` assets |

When the job title/employer changes: update **index.html** (description, OG,
JSON-LD) *and* `META` in `app.component.ts` *and* both descriptors.

## EN ↔ IT descriptor parity

Both descriptor files must describe the same structure — same section types,
same ids, same item counts (only text differs). Check:

```bash
diff <(jq '[.sections[] | {type, id}]' src/descriptor.en.json) \
     <(jq '[.sections[] | {type, id}]' src/descriptor.it.json)
```

Non-empty diff = a section/nav drift; localized `cvPath` (eng/ita PDF) is the
one *expected* content difference for file references.

When adding a project or experience entry: add it to **both** files, with
translated copy, an `alt`-worthy `name`, and an optimized image (see
performance.md rules).

## Known architectural limits (tracked, don't re-flag)

- Crawlers only see the prerendered **English** page; Italian content is
  client-side. hreflang for both langs points at the same URL. The real fix is
  route-based i18n (`.claude/plan.md` P2-14). Until then: keep the hreflang
  block as-is (it is at least consistent), and keep EN as the content-complete
  default.
- GitHub Pages: no custom headers possible — skip header-based findings
  (CSP, HSTS…) as not actionable.

## Per-deploy checks

1. `<title>` and meta description still accurate (< ~160 chars).
2. JSON-LD parses: paste into https://validator.schema.org after changes.
3. og:image renders (1200×800, < 300 kB, committed).
4. New anchors/sections appear in header nav in **both** descriptors.
5. If any public URL changed: update `sitemap.xml` (and canonical/hreflang).
