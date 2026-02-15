---
name: design-tokens
description: |
  Design token architecture using Style Dictionary with two-tier CSS variables.
  Covers token workflow, naming conventions, OKLCH color system, dark mode strategy,
  and base CSS layer ordering.
  Reference for adding/modifying design tokens in the theme package.
---

# Design Tokens Skill

## Token Architecture

Two-tier CSS variable system built with Style Dictionary:

| Tier | Prefix | Purpose | Example |
|------|--------|---------|---------|
| Primitive | `--primitive-*` | Raw values, theme-independent | `--primitive-color-blue-500`, `--primitive-space-4` |
| Semantic | `--semantic-*` | Contextual aliases, theme-dependent | `--semantic-primary`, `--semantic-surface` |

## Token Workflow

```
Define in JSON → Build with Style Dictionary → Import generated CSS
```

1. **Define**: `frontend/packages/theme/src/tokens/**/*.json`
2. **Build**: `pnpm --filter @mermaid-demo/theme build` (runs `tsx src/build.ts`)
3. **Output**: `frontend/packages/theme/src/generated/tokens.css` (DO NOT EDIT)
4. **Import**: `@import "@mermaid-demo/theme/tokens.css"` in App.css

## Naming Convention

### Primitives (`--primitive-*`)

Theme-independent raw values. Never change between light/dark mode.

| Category | Pattern | Examples |
|----------|---------|----------|
| Colors | `--primitive-color-{palette}-{shade}` | `--primitive-color-gray-500`, `--primitive-color-blue-400` |
| Spacing | `--primitive-space-{scale}` | `--primitive-space-2`, `--primitive-space-8` |
| Typography | `--primitive-font-{name}` | `--primitive-font-body`, `--primitive-font-mono` |
| Text sizes | `--primitive-text-{size}` | `--primitive-text-sm`, `--primitive-text-2xl` |
| Weights | `--primitive-weight-{name}` | `--primitive-weight-medium`, `--primitive-weight-bold` |
| Line height | `--primitive-leading-{name}` | `--primitive-leading-tight`, `--primitive-leading-relaxed` |
| Letter spacing | `--primitive-tracking-{name}` | `--primitive-tracking-tight`, `--primitive-tracking-wide` |
| Radius | `--primitive-radius-{size}` | `--primitive-radius-sm`, `--primitive-radius-md` |
| Z-index | `--primitive-z-{name}` | `--primitive-z-controls`, `--primitive-z-fullscreen` |
| Duration | `--primitive-duration-{name}` | `--primitive-duration-fast`, `--primitive-duration-normal` |
| Sizing | `--primitive-size-{name}` | `--primitive-size-target-min` |

### Semantics (`--semantic-*`)

Contextual tokens that change between light/dark mode.

| Category | Pattern | Examples |
|----------|---------|----------|
| Surface | `--semantic-surface{-variant}` | `--semantic-surface`, `--semantic-surface-subtle` |
| Border | `--semantic-border{-variant}` | `--semantic-border`, `--semantic-border-subtle` |
| Foreground | `--semantic-fg{-variant}` | `--semantic-fg`, `--semantic-fg-muted` |
| Primary | `--semantic-primary{-variant}` | `--semantic-primary`, `--semantic-primary-hover` |
| Destructive | `--semantic-destructive{-variant}` | `--semantic-destructive`, `--semantic-destructive-subtle` |
| Shadow | `--semantic-shadow-{size}` | `--semantic-shadow-sm`, `--semantic-shadow-float` |
| Editor | `--semantic-editor-{name}` | `--semantic-editor-caret`, `--semantic-editor-gutter-bg` |
| Resizer | `--semantic-resizer-{name}` | `--semantic-resizer-bg`, `--semantic-resizer-indicator` |
| Toast | `--semantic-toast-{name}` | `--semantic-toast-info-bg`, `--semantic-toast-info-icon` |
| Other | `--semantic-{name}` | `--semantic-ring`, `--semantic-backdrop` |

## OKLCH Color System

All colors use OKLCH for perceptual uniformity:

```
oklch(lightness chroma hue)
oklch(0.55 0.18 250)  → blue-500
```

- **Lightness**: 0 (black) to 1 (white)
- **Chroma**: 0 (gray) to ~0.4 (vivid)
- **Hue**: 0-360 degrees (240-260 = blue, 25 = red)

## Dark Mode Strategy

Dark mode uses `[data-theme="dark"]` selector override with system preference fallback:

```css
/* Light mode (default in :root) */
:root {
  --semantic-surface: var(--primitive-color-white);
  --semantic-fg: var(--primitive-color-gray-950);
}

/* Manual toggle */
[data-theme="dark"] {
  --semantic-surface: var(--primitive-color-gray-850);
  --semantic-fg: var(--primitive-color-gray-100);
}

/* System preference fallback */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    --semantic-surface: var(--primitive-color-gray-850);
    --semantic-fg: var(--primitive-color-gray-100);
  }
}
```

### Adding Dark Overrides

In token JSON files, use `dark` or `*-dark` as the second path segment:

```json
{
  "semantic": {
    "surface": { "value": "{primitive.color.white}" },
    "dark": {
      "surface": { "value": "{primitive.color.gray.850}" }
    }
  }
}
```

For namespaced tokens (editor, shadow, toast):

```json
{
  "semantic": {
    "editor": {
      "caret": { "value": "{semantic.primary}" }
    },
    "editor-dark": {
      "caret": { "value": "{primitive.color.near-white}" }
    }
  }
}
```

## Base CSS Layer Order

Import order in App.css:

```css
@import "@mermaid-demo/theme/base/reset.css";   /* 1. CSS reset */
@import "@mermaid-demo/theme/tokens.css";        /* 2. Generated tokens */
@import "@mermaid-demo/theme/base/global.css";   /* 3. Body defaults */
```

## Adding New Tokens

### New Primitive

1. Add to appropriate file in `src/tokens/primitives/`
2. Run `pnpm --filter @mermaid-demo/theme build`
3. Reference as `var(--primitive-{category}-{name})`

### New Semantic Token

1. Add light value to `src/tokens/semantics/colors-light.json` (or appropriate file)
2. Add dark override to `src/tokens/semantics/colors-dark.json` (using `semantic.dark.*` path)
3. Run `pnpm --filter @mermaid-demo/theme build`
4. Reference as `var(--semantic-{name})`

## Rules

1. **NEVER edit `src/generated/tokens.css`** - it is auto-generated
2. **Components use semantic tokens**, not primitives (except for font/spacing/radius/z-index)
3. **No hardcoded colors** - use `var(--semantic-*)` or `var(--primitive-color-*)`
4. **No hardcoded spacing** - use `var(--primitive-space-*)`
5. **No hardcoded z-index** - use `var(--primitive-z-*)`
6. **Shadows are semantic** - they differ between light/dark mode
7. **Reference primitives in semantics** via `{primitive.color.blue.500}` syntax in JSON
8. **Reference semantics in semantics** via `{semantic.primary}` syntax in JSON

## File Structure

```
frontend/packages/theme/
├── package.json
├── src/
│   ├── build.ts                      # Style Dictionary build script
│   ├── base/
│   │   ├── reset.css                 # Modern CSS reset
│   │   └── global.css                # Body defaults (token references)
│   ├── generated/
│   │   └── tokens.css                # Auto-generated (DO NOT EDIT)
│   └── tokens/
│       ├── primitives/
│       │   ├── colors.json           # OKLCH color palette
│       │   ├── spacing.json          # 4px base scale
│       │   ├── sizing.json           # Touch targets
│       │   ├── radius.json           # Border radius
│       │   ├── z-index.json          # Stacking order
│       │   ├── typography.json       # Fonts, sizes, weights
│       │   └── animation.json        # Durations
│       └── semantics/
│           ├── colors-light.json     # Light theme colors
│           ├── colors-dark.json      # Dark theme overrides
│           ├── shadows-light.json    # Light shadows
│           ├── shadows-dark.json     # Dark shadows
│           ├── editor.json           # Editor tokens (light + dark)
│           └── component.json        # Resizer, toast tokens
```
