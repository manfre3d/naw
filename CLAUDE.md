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

### Styling

- Bootstrap 5 + Font Awesome 4 from `node_modules` (no CDN)
- SCSS throughout; global variables in `src/variables.scss`, global styles in `src/styles.scss`

### Subagents

- **`DocsExplorer`** (`.claude/agents/DocsExplorer.md`) — documentation lookup specialist. Use proactively when needing up-to-date docs for any library or framework used in this project (Angular, Bootstrap, etc.). Fetches via Context7 MCP first, falls back to web search.

### SSR / prerendering

The app uses `@angular/ssr` with prerendering enabled (`angular.json` → `prerender: true`). SSR-safe code must guard browser APIs with `isPlatformBrowser(PLATFORM_ID)` — both services already do this as reference examples.
