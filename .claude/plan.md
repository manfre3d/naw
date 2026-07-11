# Portfolio Improvement Roadmap

Audit date: 2026-07-10 · Angular 22.0.1 · production build baseline below.
Method: full source review against current Angular/SCSS/Three.js best practices
(verified via angular.dev docs) + real production build measurements.

## Baseline (prod build, 2026-07-10)

| Chunk | Raw | Transfer |
|---|---|---|
| main | 456.82 kB | 128.72 kB |
| styles | 232.62 kB | 24.23 kB |
| polyfills (zone.js) | 34.59 kB | 11.33 kB |
| **Initial total** | **724.85 kB** | **165.12 kB** |
| three-module (lazy) | 730.02 kB | 153.48 kB |

Build warnings firing today:
- initial budget exceeded: 724.85 kB > 650 kB (by 74.85 kB)
- `hero.component.scss` 7.56 kB > 6 kB component-style budget

---

## Post-P0 baseline (prod build, 2026-07-10, after items 1–3)

| Chunk | Raw | Transfer |
|---|---|---|
| main | 456.82 kB | 128.72 kB |
| styles | **6.04 kB** | **1.70 kB** |
| polyfills (zone.js) | 34.59 kB | 11.33 kB |
| **Initial total** | **498.02 kB** | **142.54 kB** |

Initial-budget warning cleared; only the `hero.component.scss` 7.56 kB warning
remains (see P2-13). Also done in the same pass: removed the stale committed
`docs/` build output (3.2 MB, confirmed dead — Pages `build_type=workflow`),
rewrote the scaffold `app.component.spec.ts` that referenced a non-existent
`title` property and blocked the whole test bundle from compiling. Note:
Karma cannot launch on this machine (no Chrome installed) — one more reason
for P1-9.

## P0 — Quick wins (high value, low effort)

### 1. ✅ DONE (2026-07-10) — Remove Bootstrap (~-200 kB raw / ~-20 kB gz CSS)
`styles.scss:2` imports **all** of Bootstrap, but the only Bootstrap classes used
anywhere are `row gx-0` + `col-12` in `dynamic-single-container.component.html`
— a single full-width column, replaceable with `display:block` / a tiny custom
class. Everything else (`hero-badge`, `project-card`, …) is custom-prefixed.
- Replace `row gx-0`/`col-12` with a local class, drop the `@use 'bootstrap...'`,
  remove `bootstrap` from package.json.
- Clears most of the initial-budget overage on its own.

### 2. ✅ DONE (2026-07-10) — Delete dead assets (~7 MB deployed publicly)
Verified unreferenced in descriptors, templates, and index.html (2026-07-10):
`generated_work_image_mp.png` (2.7M), `py_tts_voice.png` (960K),
`project_builders.jpg` (808K), `aipocondriaco.png` (684K), `metadata_img.png`
(520K), `deliveboo.jpg` (512K), `profile_mp.png` (260K), `projects.jpg` (140K),
`project_work.png` (60K), and the old CVs `cv_Manfredi_Piraino_2024.pdf`,
`cv_Manfredi_Piraino_2025.pdf`, `cv_Manfredi_Piraino_2025_v1.pdf`.
- **Privacy**: the outdated CVs are publicly downloadable today.
- ⚠️ Keep `generated_work_image_mp.jpg` (the .jpg) — it is the og:image.
- Repo-only clutter (not deployed): `src/descriptor.json` (orphan, nothing
  imports it), `src/spring_sakura_icon.ico`.

### 3. ✅ DONE (2026-07-10) — Remove unused dependencies
Zero imports in source for: `font-awesome` (4.x — icons actually come from the
FA6 CDN kit), `@angular/forms`, `@angular/animations`,
`@angular/platform-browser-dynamic`, `@angular/localize` (drop the
`/// <reference types="@angular/localize" />` line in `main.ts` with it).

### 4. Self-host icons and fonts (remove render-blocking third parties)
`index.html` loads a Font Awesome 6 **kit script from CDN** (`kit.fontawesome.com`)
and Google Fonts CSS. Both are external runtime dependencies in `<head>`
(perf + GDPR concern for an EU-audience site).
- Icons: ~12 distinct icons used → replace with inline SVGs (preferred) or
  `@fortawesome/fontawesome-free` npm subset.
- Fonts: self-host Inter + Space Mono (e.g. `@fontsource/inter`,
  `@fontsource/space-mono`), keep `font-display: swap`, trim unused weights
  (6 Inter weights requested today).

### 5. Image discipline on what remains
- `projects.component.html:9` — `<img>` without `width`/`height` → CLS risk.
- Convert remaining raster images to WebP sized to display dimensions.
- Adopt `NgOptimizedImage` (`ngSrc`, `priority` on the hero photo) — the
  Angular-idiomatic way and a good showcase signal.

### 6. Kill the theme/language flash (FOUC)
Prerendered HTML ships light theme + `lang="en"`; a dark-theme/IT visitor sees
a flash before hydration applies `data-theme`/lang. Add a tiny inline script in
`index.html` `<head>` that reads `localStorage.theme` / `prefers-color-scheme`
and sets `data-theme` (and `lang`) before first paint.

---

## P1 — Framework modernization (the "portfolio signal" tier)

### 7. Go zoneless (default since Angular v21 — this app opts *out* today)
`main.ts`/`main.server.ts` explicitly add `provideZoneChangeDetection()` and
ship the zone.js polyfill (34.6 kB raw / 11.3 kB gz). With zone.js, the GSAP
ticker, the three.js `requestAnimationFrame` loop, the hero typing `setTimeout`
loop and `mousemove` handlers each trigger app-wide change detection —
continuously, at animation frequency. The app is already 100 % signals +
OnPush, i.e. zoneless-ready.
- Add `provideZonelessChangeDetection()` in `app.config.ts` (once), remove the
  zone providers from both mains, remove `zone.js` from `polyfills` in
  `angular.json` (build **and** test), verify all interactions.

### 8. Modern hydration + `@defer` below-the-fold
`app.config.ts` uses `provideClientHydration(withNoIncrementalHydration())`,
which also forfeits event replay. Default `provideClientHydration()` enables
incremental hydration + event replay (recommended set).
- Minimum: switch to the default (or `withEventReplay()`).
- Better: wrap below-fold sections (PROJECTS, EDUCATION, CONTACTS, FOOTER) in
  `@defer (hydrate on viewport)` — less initial JS work, flagship SSR feature.
- Fix the language hydration mismatch: server always renders `en`, but
  `LanguageService` resolves `it` at construction on the client → mismatched
  hydration for IT visitors. Resolve the saved/browser language in
  `afterNextRender` and switch after hydration completes.

### 9. Karma → Vitest (stable default since v21)
Migrate `test` target to `@angular/build:unit-test`, run
`ng g @schematics/angular:refactor-jasmine-vitest`, drop the 6 karma/jasmine
dev-deps. Faster, CI-friendly (no Chrome/Karma plumbing).

### 10. Close the test gaps
8 spec files exist; missing entirely: `LanguageService`, `ThemeService`,
`ScrollAnimationService`, `ActiveSectionService`, both directives,
`education`, `experience`, `skills`, `scene-background` components.
Services first — pure logic, cheapest to test, highest regression value.

### 11. CI quality gate
`deploy.yaml` builds and deploys on push to master — no test, no lint, and
budget **warnings** don't fail anything. Add a job (or pre-deploy step): tests
(post-Vitest) + build with budgets treated as errors.

### 12. Add ESLint (angular-eslint)
No linting exists in the repo. `ng add @angular-eslint/schematics`, enable
template accessibility rules (the codebase already has strong a11y — lint
locks it in), add to CI.

---

## P2 — Strategic / larger efforts

### 13. Tighten budgets after P0+P1
Post-cleanup initial should land ≈ 490 kB raw / ≈ 134 kB transfer. Set budgets
to warn 550 kB / error 700 kB so regressions surface in CI. Address the
`hero.component.scss` (7.56 kB) overage by moving shared pieces to global scss.

### 14. Route-based i18n for real Italian SEO
Today crawlers only ever see the prerendered **English** page; the `it`
content is client-side only, and hreflang points both languages at the same
URL. If Italian discoverability matters: prerender `/en` + `/it` routes,
per-URL hreflang/canonical, language toggle becomes navigation. Largest item
here — decide intentionally.

### 15. Optional polish
- `three.js` scene: cap `devicePixelRatio` already done; consider pausing when
  canvas fully scrolled past (IntersectionObserver) in addition to
  `visibilitychange`.
- Consider dropping the express server if local SSR testing isn't used
  (GH Pages serves only the prerendered output).

---

## Explicitly healthy (leave alone)
Signals + `input.required` + OnPush everywhere · dynamic `import('three')`
already lazy · reduced-motion respected in typing/GSAP/three/scroll-reveal ·
skip-nav, `aria-pressed`, `aria-expanded`, `inert` mobile menu · design tokens
with documented AA contrast picks · SSR guards via `isPlatformBrowser` ·
sitemap/robots/JSON-LD/OG present · hero image has explicit dimensions +
`fetchpriority="high"`.
