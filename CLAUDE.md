# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # dev server at http://localhost:4200
npm run build        # production build → dist/naw/
ng test              # Karma/Jasmine unit tests (all)
ng test --include='**/foo.spec.ts'  # single spec file
```

Deployment is automatic: push to `master` triggers the GitHub Actions workflow, which builds with `--base-href=/naw/` and deploys to GitHub Pages.

## Architecture

This is an Angular 22 SSR portfolio site with **no routing** — the entire page is one scroll-based SPA.

### Data-driven rendering

All content lives in two JSON descriptor files at `src/`:
- `descriptor.en.json` — English content
- `descriptor.it.json` — Italian content

Each file contains a `sections` array. Every section has a `type` field (`HERO`, `SKILLS`, `EXPERIENCE`, `EDUCATION`, `PROJECTS`, `CONTACTS`, `HEADER`, `FOOTER`) that maps to a section component. To add, remove, or reorder sections, edit these JSON files — no component wiring required.

The TypeScript interfaces for each section type live in `src/app/models/descriptor.model.ts`.

### Rendering pipeline

```
AppComponent
  → reads descriptor JSON via computed() from LanguageService
  → DynamicContainerComponent (loops over sections[])
      → DynamicSingleContainerComponent (per section)
          → renders the matching section component via @switch on section.type
```

`DynamicSingleContainerComponent` also registers each section with `ScrollAnimationService` for scroll-reveal via `IntersectionObserver`.

### Key services

- **`LanguageService`** (`src/app/services/language.service.ts`) — signal-based `en`/`it` language switch, persisted to `localStorage`. Initial lang auto-detected from `navigator.language`.
- **`ThemeService`** (`src/app/services/theme.service.ts`) — signal-based `light`/`dark` theme toggle, persisted to `localStorage`. Initial theme resolved from `localStorage` → `prefers-color-scheme`. Applies theme via `data-theme` attribute on `<html>` and updates the `theme-color` meta tag.
- **`ScrollAnimationService`** (`src/app/services/scroll-animation.service.ts`) — registers sections with `IntersectionObserver`; respects `prefers-reduced-motion`.
- **`ActiveSectionService`** (`src/app/services/active-section.service.ts`) — tracks which section dominates the viewport (signal), drives the three.js background's per-section visual params.

### Styling

- SCSS throughout; design tokens (CSS custom properties, light + `[data-theme="dark"]` blocks) and global styles live in `src/styles.scss`
- No CSS framework — `styles.scss` opens with a minimal reset (Bootstrap-reboot essentials); layout is plain flex/grid
- Icons: Font Awesome 6 via CDN kit script in `src/index.html`; fonts: Google Fonts (Space Grotesk, Inter, JetBrains Mono) via CDN, exposed as `--font-display` / `--font-body` / `--font-mono`
- Accent used as text must be `--color-accent-text` (AA contrast), never raw `--color-accent`
- Shared primitives in `styles.scss`: `.tile` (bento surface, + `.tile--hover`), `.btn-primary` / `.btn-outline`, `.badge-chip`, `.section-label` / `.section-title`, `.spotlight-glow`, `.shine-sweep` — reuse these before writing new component styles
- `src/index.html` carries a pre-paint theme script (sets `data-theme` before hydration to avoid a flash) and a localized landing preloader — keep both in sync with `ThemeService` / `LanguageService`

### 3D assets

The hero portrait (`src/assets/models/portrait.glb`) is lazy-loaded and decoded with `MeshoptDecoder` + `KHR_mesh_quantization` + `EXT_texture_webp` (all supported by the pinned three.js). Optimize any new/replacement model before committing — keep the geometry, shrink the textures:

```bash
npx @gltf-transform/cli optimize in.glb out.glb \
  --compress meshopt --texture-compress webp --texture-size 2048 --no-simplify
```

`--no-simplify` preserves fine detail (face/hair); the size win comes from texture resize + WebP + Meshopt. The model is lazy-loaded, so it never counts against the `initial` bundle budget — but keep it lean.

### Subagents

- **`DocsExplorer`** (`.claude/agents/DocsExplorer.md`) — documentation lookup specialist. Use proactively when needing up-to-date docs for any library or framework used in this project (Angular, Bootstrap, etc.). Fetches via Context7 MCP first, falls back to web search.
- **`SiteAuditor`** (`.claude/agents/SiteAuditor.md`) — read-only quality audit (bundle budgets, dead assets, a11y/SEO invariants). Use before deploys or after UI/content/dependency changes; checklists live in the `site-quality-audit` skill.

### Skills

Invoke the matching skill before the work it covers.

Project skills (`.claude/skills/`):
- **`modern-best-practice-angular-components`** — writing or refactoring components (signals, `input()`/`output()`, native control flow, `afterNextRender`, no needless lifecycle hooks). The codebase is already fully on these patterns; match them.
- **`scss-best-practices`** — component SCSS and `styles.scss` tokens (naming, token discipline, dark mode, responsive, a11y). Colour stays in tokens; components never hard-code it.
- **`threejs-3d-animations`** — the `scene-background` and `hero-portrait-3d` components (scene setup, RAF loops, SSR guards, GPU disposal, reduced-motion bails).
- **`site-quality-audit`** — before deploys / after UI/content/dependency changes (bundle budgets, dead or oversized assets, a11y/SEO/i18n). Backs the `SiteAuditor` subagent.

Built-in skills that fit this repo:
- **`frontend-design`** — before any visual redesign or new UI direction (palette, type, layout, one signature element). Ground choices in the subject; avoid templated defaults.
- **`artifact-design`** — when producing a self-contained HTML preview/mockup as an Artifact (e.g. comparing palettes or hero layouts before touching component code).
- **`run`** / **`verify`** — drive the running app (dev server on `:4200`) to confirm a change works, not just that it compiles.

### Improvement roadmap

Prioritized, measured improvement backlog: `.claude/plan.md` (baseline bundle numbers, P0–P2 items). Check it before starting optimization or modernization work.

### SSR / prerendering

The app uses `@angular/ssr` with prerendering enabled (`angular.json` → `prerender: true`). SSR-safe code must guard browser APIs with `isPlatformBrowser(PLATFORM_ID)` — both services already do this as reference examples.
