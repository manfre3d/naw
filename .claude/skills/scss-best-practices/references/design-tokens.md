# Design Tokens Reference

## Token inventory (defined in `src/styles.scss`)

### Colors
| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#FAFAF8` | `#0D0D1A` | Page background |
| `--color-surface` | `#FFFFFF` | `#151523` | Cards, dialogs |
| `--color-surface-2` | `#F4F4F1` | `#1C1C2E` | Subtle inset areas |
| `--color-border` | `#E8E8E4` | `#2A2A42` | Dividers, borders |
| `--color-text` | `#1C1C2E` | `#EEEEF5` | Body copy |
| `--color-muted` | `#6B7280` | `#7A7A9A` | Secondary text, icons |
| `--color-accent` | `#D4668A` | `#E07899` | Sakura — primary brand |
| `--color-accent-hover` | `#B84E72` | `#C45E82` | Hover state for accent |
| `--color-accent-light` | `rgba(212,102,138,0.09)` | `rgba(224,120,153,0.12)` | Subtle accent fill |
| `--color-accent-border` | `rgba(212,102,138,0.30)` | `rgba(224,120,153,0.25)` | Accent outline |
| `--color-accent-border-strong` | `rgba(212,102,138,0.55)` | `rgba(224,120,153,0.50)` | Stronger accent outline |
| `--color-accent-glow` | `rgba(212,102,138,0.14)` | `rgba(224,120,153,0.25)` | Glow in box-shadow |
| `--color-footer-bg` | `#1C1C2E` | `#07070F` | Footer only |
| `--color-header-bg` | `rgba(250,250,248,0.82)` | `rgba(13,13,26,0.82)` | Frosted glass header |

### Radii
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `6px` | Chips, badges |
| `--radius-md` | `12px` | Buttons, cards |
| `--radius-lg` | `20px` | Large panels |

### Shadows
| Token | Use |
|---|---|
| `--shadow-sm` | Subtle lift (inputs, small cards) |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Modals, large overlays |

### Motion
| Token | Value | Use |
|---|---|---|
| `--transition-fast` | `150ms ease` | Hover micro-interactions |
| `--transition-base` | `300ms ease` | Theme switch, reveals |
| `--ease-out` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Entrances |

### Layout
| Token | Value | Use |
|---|---|---|
| `--content-max` | `960px` | Max width for content columns |
| `--header-h` | `56px` | Sticky header height |

## Adding a new token

1. Add to `:root` in `src/styles.scss` with a descriptive name
2. Add the dark-mode override in `[data-theme="dark"]` if the value differs
3. Use `var(--your-token)` everywhere — never reference the raw value directly in component files

## Dark mode mechanism

`ThemeService` toggles `data-theme="dark"` on `<html>`. No component stylesheet needs `@media (prefers-color-scheme: dark)` — the `[data-theme="dark"]` block in `styles.scss` overrides every token automatically.

```scss
// This is WRONG — will not respect the ThemeService toggle
@media (prefers-color-scheme: dark) {
  .my-block { background: #0D0D1A; }
}

// This is correct — use the token and it just works
.my-block { background: var(--color-bg); }
```
