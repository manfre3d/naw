---
name: scss-best-practices
description: Write clean, maintainable SCSS for Angular components — design tokens, BEM naming, modern Sass modules, responsive patterns, dark mode, and accessibility
references:
  - references/design-tokens.md
  - references/naming-and-nesting.md
  - references/responsive-and-motion.md
  - references/anti-patterns.md
---

# Writing SCSS

This project uses SCSS throughout, with a design-token system in `src/styles.scss` and per-component scoped stylesheets. Follow these practices for consistency, maintainability, and correctness.

> **References** — load for deeper coverage:
> - [[references/design-tokens.md]] — CSS custom properties, dark-mode tokens, theming contract
> - [[references/naming-and-nesting.md]] — BEM conventions, SCSS nesting rules, `&` usage
> - [[references/responsive-and-motion.md]] — `clamp()`, breakpoints, `prefers-reduced-motion`
> - [[references/anti-patterns.md]] — before/after for the most common mistakes

## Design Tokens  [[references/design-tokens.md]]

- **ALWAYS** use CSS custom properties (`var(--color-*)`, `var(--radius-*)`, etc.) for color, spacing tokens, shadows, and transitions — never hard-code raw values in component files
- All tokens are defined in `src/styles.scss` under `:root` (light) and `[data-theme="dark"]` (dark override)
- **AVOID** duplicating a token value — if you need a new shade, add a new token to `src/styles.scss`

```scss
// PREFER
color: var(--color-text);
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);

// AVOID
color: #1C1C2E;
border-radius: 12px;
```

## Naming & Structure  [[references/naming-and-nesting.md]]

- Use flat, descriptive BEM-style class names: `.block`, `.block__element`, `.block--modifier`
- In this project the convention is shorter: `.block-element` and `.block--modifier` (double-dash for modifiers only)
- Keep component stylesheets to the classes that component owns — no reaching into child components
- **PREFER** `&--modifier` and `&:hover` nesting over separate rules at the top level

```scss
// PREFER
.badge-chip {
  padding: 0.2rem 0.6rem;

  &--accent {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
  }

  &--muted {
    color: var(--color-muted);
  }
}

// AVOID
.badge-chip { padding: 0.2rem 0.6rem; }
.badge-chip--accent { background-color: var(--color-accent-light); }
```

## Sass Module System

- **PREFER** `@use` over `@import` — `@import` is deprecated in Dart Sass
- Side-effect-only imports need no namespace (`@use 'some/library'`); shared mixins/functions use `@use '../partial' as name`
- **AVOID** `@import` for project partials
- No CSS framework: the base element reset lives at the top of `src/styles.scss` — don't reintroduce framework-wide imports for single utilities

## Responsive Design  [[references/responsive-and-motion.md]]

- **PREFER** `clamp(min, preferred, max)` for fluid typography and spacing over hard breakpoints
- Use `max-width` breakpoints matching the project's established values (`860px` for two-column → single-column collapse)
- Write media queries **inside** the rule they modify using SCSS nesting — not at the file bottom

```scss
// PREFER
.hero-bio {
  font-size: 0.975rem;
  max-width: 400px;

  @media (max-width: 860px) {
    max-width: 100%;
  }
}

// AVOID
.hero-bio { font-size: 0.975rem; max-width: 400px; }
@media (max-width: 860px) { .hero-bio { max-width: 100%; } }
```

## Dark Mode

- Dark mode is applied via `[data-theme="dark"]` on `<html>` — component styles need **no** dark-mode logic
- As long as you use token variables, dark mode is automatic
- **AVOID** `@media (prefers-color-scheme: dark)` in component files — the `ThemeService` controls the active theme via the `data-theme` attribute

## Motion & Accessibility  [[references/responsive-and-motion.md]]

- **ALWAYS** include a `@media (prefers-reduced-motion: reduce)` block for any animation or transition that is non-trivial
- The global `styles.scss` already sets `transition-duration: 0.001ms` on all elements under `prefers-reduced-motion` — component-level animations (`@keyframes`, `animation:`) must be explicitly suppressed
- For scroll-reveal, the `ScrollAnimationService` respects `prefers-reduced-motion` — don't add per-component overrides for that

```scss
// PREFER
.my-element {
  animation: slide-in 0.5s var(--ease-out) both;
}

@media (prefers-reduced-motion: reduce) {
  .my-element { animation: none; }
}
```

## Layout Primitives

- **PREFER** CSS Grid and Flexbox over Bootstrap grid classes in component stylesheets
- Use the `inset` shorthand (`inset: 0`) instead of four separate `top/right/bottom/left: 0` declarations
- Use `gap` instead of margins between flex/grid children

## Performance

- **AVOID** universal selectors (`*`) and deep descendant selectors in component styles — they escape `ViewEncapsulation.Emulated`
- Keep `z-index` values meaningful and documented; use a consistent scale (0, 1, 10, 100, 200)
- **AVOID** `!important` — if you need it, the specificity architecture is wrong

## General Principles  [[references/anti-patterns.md]]

- Component stylesheets own only what they render — global utilities live in `styles.scss`
- Theming = tokens; layout = component styles; no overlap
- When in doubt, use a token rather than a raw value
