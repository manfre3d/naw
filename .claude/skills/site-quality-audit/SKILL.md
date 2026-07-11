---
name: site-quality-audit
description: Audit this portfolio's production quality — bundle size vs budgets, dead/oversized assets, accessibility invariants, SEO/i18n consistency. Use before deploys and after adding sections, projects, images, or dependencies.
references:
  - references/performance.md
  - references/a11y.md
  - references/seo-i18n.md
---

# Site Quality Audit

Repeatable audit for this repo (Angular 22 SSR portfolio, deployed to GitHub
Pages). Run it before a deploy, after content changes (new project, new image,
new CV), or after dependency changes. Findings are reported ranked by severity
with `file:line` references; the audit itself never edits code.

> **References** — load the one matching the audit area:
> - [[references/performance.md]] — budgets, baseline numbers, dead-asset scan, image/font pipeline
> - [[references/a11y.md]] — accessibility invariants this codebase already guarantees (don't regress them)
> - [[references/seo-i18n.md]] — meta/OG/JSON-LD/sitemap invariants and EN↔IT descriptor parity

## Workflow

1. **Build with real numbers** — `npm run build` and capture the size table
   and every budget warning. Compare against the baseline table in
   [[references/performance.md]]; any growth needs an explanation.
2. **Dead-asset scan** — cross-reference `src/assets/*` against references in
   `src/descriptor.*.json`, templates, and `src/index.html` (command in
   [[references/performance.md]]). Unreferenced files get deployed publicly.
3. **Image discipline** — every `<img>` in templates needs `width`/`height`
   (CLS) and `loading="lazy"` unless above the fold; new raster assets must be
   WebP at display size.
4. **A11y invariants** — walk the checklist in [[references/a11y.md]]. These
   are properties the code already has; the audit exists to catch regressions.
5. **SEO/i18n invariants** — walk [[references/seo-i18n.md]], including the
   EN/IT descriptor parity check.
6. **Report** — one ranked list: `severity · finding · file:line · suggested fix`.
   Separate "regressions" (was fine, now broken) from "pre-existing debt"
   (tracked in `.claude/plan.md`).

## Severity scale

- **P0** — user-visible or publicly-exposed problem (broken a11y path, private
  file deployed, budget error)
- **P1** — measurable degradation (bundle growth, CLS, missing lazy-loading)
- **P2** — consistency/polish (naming, doc drift, minor duplication)
