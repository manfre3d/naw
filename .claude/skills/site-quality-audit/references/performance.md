# Performance: budgets, assets, fonts

## Baseline (prod build, 2026-07-10 post-P0 — update after each optimization pass)

| Chunk | Raw | Transfer |
|---|---|---|
| main | 456.82 kB | 128.72 kB |
| styles | 6.04 kB | 1.70 kB |
| polyfills (zone.js) | 34.59 kB | 11.33 kB |
| **Initial total** | **498.02 kB** | **142.54 kB** |
| three-module (lazy) | 730.02 kB | 153.48 kB |

(Pre-P0 initial was 724.85 kB raw — Bootstrap removal + dep cleanup.)
Known-overage today: `hero.component.scss` > 6 kB component-style budget.
Planned fixes live in `.claude/plan.md` (P0/P1) — don't re-report those as new
findings, report *changes* relative to this table.

## Commands

Production build with size table:

```bash
npm run build
```

Bundle composition (what is inside `main`):

```bash
npm run build -- --stats-json
npx esbuild-visualizer --metadata dist/naw/stats.json --open
```

Dead-asset scan — every deployed asset must be referenced somewhere:

```bash
for f in src/assets/*; do
  n=$(basename "$f")
  grep -rq "$n" src/descriptor.en.json src/descriptor.it.json src/app src/index.html \
    || echo "UNREFERENCED: $f ($(du -h "$f" | cut -f1))"
done
```

⚠️ `generated_work_image_mp.jpg` is referenced only by `index.html` (og:image)
— the scan covers index.html precisely so it is not flagged. Never delete it
without updating the og/twitter image tags.

Local Lighthouse against the prerendered output:

```bash
npx http-server dist/naw/browser -p 8080 --silent &
npx lighthouse http://localhost:8080 --view --preset=desktop
```

## Rules for new assets

- Raster images: WebP (or AVIF), resized to the largest rendered dimension
  (project cards render ≤ ~640 px wide). Convert with e.g.
  `npx sharp-cli --input in.png --output out.webp resize 640`.
- Every `<img>` gets explicit `width`/`height`. Above the fold:
  `fetchpriority="high"` (or `NgOptimizedImage` `priority`); below: `loading="lazy"`.
- CVs: only the current year's EN + IT PDFs live in `src/assets` — assets are
  public. Generation happens via `cv/generate-pdf.sh` (the `cv/` folder is
  git-ignored).
- New npm dependency? Re-run the build and justify the initial-size delta.

## Zone / animation footguns (until zoneless migration lands)

While `zone.js` is active, any `setTimeout`/`requestAnimationFrame`/`mousemove`
loop triggers app-wide change detection. New animation code must either use
GSAP/three inside `NgZone.runOutsideAngular`, or wait for the zoneless
migration (plan.md P1-7) which removes the issue class entirely.
