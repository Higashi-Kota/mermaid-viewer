---
name: styling
description: |
  Modern CSS styling methodology prioritizing CSS Grid over Flexbox.
  Covers Grid layout patterns, Subgrid, Container Queries, Design Tokens, and maintainable CSS architecture.
  Reference for implementing scalable, responsive layouts with predictable behavior.
---

# Styling Skill

## Core Principles

1. **Grid-Only Layout** - Use CSS Grid for ALL layouts. **Flexbox is PROHIBITED.**
2. **Design Token System** - All values reference CSS variables (no hardcoded values)
3. **Semantic Colors** - Components use semantic tokens, not primitive colors
4. **Gap over Margin** - Use grid `gap` instead of margin utilities
5. **Data Attributes for States** - Use `data-*` attributes for state-based styling
6. **Minimal Inline Styles** - Only use inline styles for truly dynamic values

---

## Philosophy: Grid-Only Layout

**Why Grid over Flexbox?**

| Aspect | CSS Grid | Flexbox |
|--------|----------|---------|
| Dimensionality | 2D (rows + columns) | 1D (row OR column) |
| Track sizing | Explicit control | Content-driven |
| Alignment | Grid lines provide precise placement | Relies on order/flex properties |
| Nested alignment | Subgrid inherits parent tracks | No inheritance |
| Predictability | Deterministic track-based | Auto-distribution can surprise |

### Grid Can Do Everything Flexbox Does (Mostly)

Based on [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Relationship_of_grid_layout_with_other_layout_methods), many features previously thought to be Flexbox-only are supported by Grid:

| Feature | Grid Support | Flexbox |
|---------|-------------|---------|
| Baseline alignment | ✅ `align-items: baseline` | ✅ |
| Auto margin pushing | ✅ `margin-left: auto` | ✅ |
| Centering | ✅ `place-items: center` | ✅ |
| Proportional sizing | ✅ `fr` unit | ✅ `flex-grow` |

### Common Patterns (Grid Solutions)

```css
/* Centering */
.center {
  display: grid;
  place-items: center;
}

/* Horizontal list */
.horizontal-list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: center;
  gap: var(--space-2);
}

/* Space between (left/right) */
.space-between {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

/* Vertical stack */
.stack {
  display: grid;
  gap: var(--space-4);
}

/* Fill remaining space */
.fill-space {
  display: grid;
  grid-template-rows: auto 1fr auto;
}
```

## Core Grid Patterns

### 1. Intrinsic Responsive Grid (No Media Queries)

```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--spacing-4);
}
```

**Key techniques:**
- `auto-fit` collapses empty tracks; `auto-fill` preserves them
- `minmax()` sets flexible bounds
- `min(100%, 280px)` prevents overflow on narrow containers

### 2. Explicit Track Grid

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-4);
}

.span-6 { grid-column: span 6; }
.span-4 { grid-column: span 4; }
.col-start-2 { grid-column-start: 2; }
```

### 3. Named Template Areas

```css
.app-layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar content content"
    "footer  footer  footer";
  grid-template-columns: 240px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer  { grid-area: footer; }
```

**Advantages:**
- Visual layout definition in CSS
- Easy responsive redesign by redefining areas
- Self-documenting code

### 4. Dense Auto-Placement

```css
.masonry-like {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-flow: dense;
  gap: var(--spacing-2);
}
```

## Subgrid: Nested Alignment

Subgrid allows child grids to inherit parent track sizing.

### When to Use Subgrid

- Card layouts requiring header/footer alignment across cards
- Form layouts with consistent label/input alignment
- Nested components that must align with parent grid

### Syntax

```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

.card {
  display: grid;
  grid-template-columns: subgrid;  /* Inherit parent columns */
  grid-template-rows: auto 1fr auto;
  grid-column: span 3;
}

.card-header { grid-column: 1 / -1; }
.card-body   { grid-column: 1 / -1; }
.card-footer { grid-column: 1 / -1; }
```

### Subgrid in One Dimension

```css
.item {
  display: grid;
  grid-template-columns: subgrid;  /* Inherit columns */
  grid-template-rows: repeat(3, auto);  /* Custom rows */
}
```

### Gap Override in Subgrid

```css
.subgrid-item {
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  row-gap: 0;  /* Override parent gap */
}
```

## Container Queries: Component-Level Responsiveness

Container queries enable styles based on container size, not viewport.

### Basic Setup

```css
/* 1. Define container */
.card-container {
  container-type: inline-size;
  container-name: card;  /* Optional: named container */
}

/* 2. Query container */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr 1fr;
  }
}
```

### Range Syntax (Modern)

```css
/* Cleaner range queries */
@container (width >= 300px) { }
@container (200px <= width <= 500px) { }
```

### Container Query Units

```css
.responsive-text {
  font-size: clamp(1rem, 4cqi, 2rem);  /* 4% of container inline size */
}

.container-relative {
  padding: 5cqw;  /* 5% of container width */
}
```

| Unit | Description |
|------|-------------|
| `cqw` | 1% of container width |
| `cqh` | 1% of container height |
| `cqi` | 1% of container inline size |
| `cqb` | 1% of container block size |

### Container Types

```css
/* Width queries only (most common) */
container-type: inline-size;

/* Width AND height queries (requires defined height) */
container-type: size;
```

## Design Token System

### No Hardcoded Values Rule

**Every numeric value in CSS must reference a design token (CSS variable).**

```css
/* ❌ BAD: Hardcoded values */
.button {
  min-width: 1.5rem;
  min-height: 1.5rem;
  padding: 0.25rem;
  border: 1px solid #e0e0e0;
  z-index: 50;
}

/* ✅ GOOD: Design tokens */
.button {
  min-width: var(--size-icon-btn);
  min-height: var(--size-icon-btn);
  padding: var(--spacing-1);
  border: var(--spacing-px) solid var(--color-border);
  z-index: var(--z-index-modal-backdrop);
}
```

### Token Categories

| Category | Prefix | Examples |
|----------|--------|----------|
| Colors | `--color-` | `--color-primary`, `--color-background`, `--color-border` |
| Spacing | `--spacing-` | `--spacing-1`, `--spacing-2`, `--spacing-px` |
| Size | `--size-` | `--size-icon-btn`, `--size-panel-min`, `--size-scrollbar` |
| Z-Index | `--z-index-` | `--z-index-dropdown`, `--z-index-modal`, `--z-index-tooltip` |
| Radius | `--radius-` | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Duration | `--duration-` | `--duration-fast`, `--duration-normal`, `--duration-slow` |
| Easing | `--easing-` | `--easing-default`, `--easing-in-out`, `--easing-spring` |
| Shadow | `--shadow-` | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Font | `--font-` | `--font-family-sans`, `--font-weight-bold` |

### Semantic vs Primitive Colors

```css
/* ❌ BAD: Primitive color in component */
.panel-preview {
  background: #d1d5db;
  color: #1f2937;
}

/* ✅ GOOD: Semantic color tokens */
.panel-preview {
  background: var(--color-popover);
  color: var(--color-popover-foreground);
}
```

**Semantic color examples:**
- `--color-background` / `--color-foreground` (base)
- `--color-card` / `--color-card-foreground`
- `--color-popover` / `--color-popover-foreground`
- `--color-primary` / `--color-primary-foreground`
- `--color-muted` / `--color-muted-foreground`
- `--color-destructive` / `--color-destructive-foreground`
- `--color-border` / `--color-border-subtle`

---

## Gap over Margin

### Replace Margin with Grid Gap

**Never use margin for spacing between elements. Use grid `gap` instead.**

```css
/* ❌ BAD: Margin for spacing */
.container > * + * {
  margin-top: var(--space-2);
}

.title {
  margin-bottom: var(--space-2);
}

/* ✅ GOOD: Grid with gap */
.container {
  display: grid;
  gap: var(--space-2);
}

.list {
  display: grid;
  gap: var(--space-1);
}
```

### Conversion Table

| Layout Need | CSS Grid Solution |
|-------------|-------------------|
| Vertical stack with spacing | `display: grid; gap: var(--space-*);` |
| Horizontal list with spacing | `display: grid; grid-auto-flow: column; gap: var(--space-*);` |
| Horizontal with center alignment | `display: grid; grid-auto-flow: column; align-items: center; gap: var(--space-*);` |
| Space between items | `display: grid; grid-template-columns: 1fr auto;` |
| Centering | `display: grid; place-items: center;` |

### Padding is Still Acceptable

Padding remains valid for internal spacing within a component.

```css
/* ✅ OK: Padding for internal spacing */
.button {
  padding: var(--space-2) var(--space-4);
}

.panel {
  padding: var(--space-3);
}
```

---

## State Management with Data Attributes

### Use Data Attributes for State-Based Styling

```tsx
/* ❌ BAD: Inline styles for state */
<article
  className={styles.dockPanel}
  style={{
    opacity: state.type === "dragging" ? 0.5 : 1,
    zIndex: isPanelMaximized ? "var(--z-index-modal-backdrop)" : undefined
  }}
>

/* ✅ GOOD: Data attributes */
<article
  className={styles.dockPanel}
  data-dragging={state.type === "dragging" ? "" : undefined}
  data-maximized={isPanelMaximized ? "" : undefined}
>
```

### CSS for Data Attributes

```css
.dockPanel {
  /* Base styles */

  &[data-dragging] {
    opacity: 0.5;
  }

  &[data-maximized] {
    z-index: var(--z-index-modal-backdrop);
  }
}
```

### Benefits

1. **Clean JSX** - No inline style objects for states
2. **CSS Ownership** - Style logic stays in CSS, not JS
3. **Performance** - Attribute selectors are efficient
4. **Debugging** - Data attributes visible in DevTools
5. **Type Safety** - Boolean presence, not string comparison

---

## Inline Style Guidelines

### When Inline Styles Are Acceptable

Only use inline `style` for **truly dynamic values** that cannot be expressed as design tokens or CSS.

```tsx
/* ✅ ACCEPTABLE: Dynamic DOM rect values */
<div
  className={styles.dropIndicator}
  style={{
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }}
/>

/* ✅ ACCEPTABLE: Dynamic grid template from runtime calculation */
<div
  className={styles.grid}
  style={{
    gridTemplateColumns: `${size * 100}% auto ${(1 - size) * 100}%`,
  }}
/>
```

### When NOT to Use Inline Styles

```tsx
/* ❌ BAD: Static dimensions */
<div style={{ width: "100%", height: "100%" }}>

/* ✅ GOOD: CSS class */
<div className={styles.fullSize}>
/* .fullSize { width: 100%; height: 100%; } */

/* ❌ BAD: Conditional styling */
<div style={{ opacity: isDragging ? 0.5 : 1 }}>

/* ✅ GOOD: Data attribute + CSS */
<div data-dragging={isDragging ? "" : undefined}>
```

### Remove Unnecessary Style Props

If a component accepts a `style` prop only for `width: 100%` / `height: 100%`, remove it:

```tsx
/* ❌ BAD: Unnecessary style prop */
interface Props {
  style?: React.CSSProperties
}

const Panel = ({ style }: Props) => (
  <div style={style}>...</div>
)

// Usage
<Panel style={{ width: "100%", height: "100%" }} />

/* ✅ GOOD: Built-in full size in CSS */
const Panel = () => (
  <div className={styles.panel}>...</div>
)
/* .panel { width: 100%; height: 100%; } */

// Usage
<Panel />
```

---

## CSS Architecture Principles

### 1. Specificity Management

```css
/* ❌ High specificity, hard to override */
.sidebar .nav .nav-item.active a { }

/* ✅ Flat specificity, composable */
.nav-item { }
.nav-item--active { }
```

### 2. Naming Convention (BEM-inspired)

```css
/* Block */
.panel { }

/* Element (part of block) */
.panel__header { }
.panel__content { }
.panel__footer { }

/* Modifier (variation) */
.panel--compact { }
.panel--elevated { }
```

### 3. Layer Organization (CSS Cascade Layers)

```css
@layer reset, tokens, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
}

@layer tokens {
  :root { --color-primary: #0891b2; }
}

@layer base {
  body { font-family: var(--font-sans); }
}

@layer components {
  .btn { /* component styles */ }
}

@layer utilities {
  .sr-only { /* utility overrides */ }
}
```

### 4. Custom Properties Strategy

```css
/* Component-scoped defaults */
.card {
  --card-padding: var(--spacing-4);
  --card-radius: var(--radius-md);

  padding: var(--card-padding);
  border-radius: var(--card-radius);
}

/* Override via inline or parent */
.compact-layout .card {
  --card-padding: var(--spacing-2);
}
```

## Alignment Reference

### Grid Alignment Properties

```css
.grid {
  /* Align entire grid within container */
  justify-content: center;  /* Horizontal */
  align-content: center;    /* Vertical */

  /* Align all items within cells */
  justify-items: stretch;   /* Horizontal */
  align-items: stretch;     /* Vertical */

  /* Shorthand */
  place-content: center;    /* justify + align content */
  place-items: center;      /* justify + align items */
}

.item {
  /* Individual item alignment */
  justify-self: start;
  align-self: end;
  place-self: start end;
}
```

### Alignment Values

| Value | Behavior |
|-------|----------|
| `start` | Align to start edge |
| `end` | Align to end edge |
| `center` | Center alignment |
| `stretch` | Fill available space (default) |
| `space-between` | Distribute with edges flush |
| `space-around` | Equal space around items |
| `space-evenly` | Equal space including edges |

## Responsive Patterns

### Without Media Queries

```css
/* Fluid grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

/* Fluid typography */
.heading {
  font-size: clamp(1.5rem, 1rem + 2vw, 3rem);
}

/* Fluid spacing */
.section {
  padding: clamp(var(--spacing-4), 5vw, var(--spacing-12));
}
```

### With Container Queries (Preferred)

```css
.widget-container {
  container-type: inline-size;
}

.widget {
  display: grid;
}

@container (width < 300px) {
  .widget { grid-template-columns: 1fr; }
}

@container (width >= 300px) {
  .widget { grid-template-columns: auto 1fr; }
}
```

### Media Queries (When Necessary)

```css
/* Viewport-dependent layout only */
@media (min-width: 768px) {
  .app-layout {
    grid-template-areas:
      "sidebar header"
      "sidebar content";
    grid-template-columns: 240px 1fr;
  }
}
```

## Performance Guidelines

1. **Avoid layout thrashing**: Batch DOM reads/writes
2. **Minimize repaints**: Use `transform` and `opacity` for animations
3. **Contain layouts**: Use `contain: layout` for isolated components
4. **Reduce specificity**: Flat selectors parse faster

```css
/* Layout containment for performance */
.card {
  contain: layout style;
}
```

## Accessibility Considerations

### Visual vs DOM Order

```css
/* ⚠️ Grid can reorder visually but not in DOM */
.item { order: -1; }  /* Keyboard/screen reader order unchanged */
```

**Rule:** Never use CSS ordering to restructure content meaning.

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Decision Matrix

### Layout Decisions

| Layout Need | Grid Solution |
|-------------|---------------|
| Page structure | Grid with template areas |
| Card grid | `auto-fit` + `minmax()` |
| Aligned nested content | Subgrid |
| Component responsiveness | Container queries |
| Single-axis distribution | `grid grid-flow-col auto-cols-max` |
| Centering | `grid place-items-center` |
| Complex alignment | Grid with line placement |
| Vertical stack | `display: grid` (implicit rows) |
| Horizontal list | `grid-auto-flow: column; auto-cols: max-content` |
| Space between (left/right) | `grid-template-columns: 1fr auto` |
| Fill remaining space | `grid-template-rows: auto 1fr auto` |
| Wrap items | `grid-template-columns: repeat(auto-fill, minmax(...))` |

**Flexbox is NEVER allowed.** All layouts must use CSS Grid.

### Styling Decisions

| Need | Solution |
|------|----------|
| Numeric value (size, spacing) | CSS variable from design tokens (`var(--space-*)`, `var(--size-*)`) |
| Color value | Semantic color token (`var(--color-*)`) |
| Spacing between siblings | CSS Grid `gap` property |
| Internal padding | CSS `padding` property with CSS variables |
| Conditional state styling | `data-*` attribute + CSS selector |
| Dynamic position/size | Inline `style` (only option) |
| Static dimensions | CSS class (`width: 100%; height: 100%;`) |
| Component style prop | Remove if only used for `100%` dimensions |

## Modern CSS Features (2024+)

### CSS Anchor Positioning

Position elements relative to other elements without JavaScript:

```css
/* Define anchor */
.trigger {
  anchor-name: --tooltip-anchor;
}

/* Position relative to anchor */
.tooltip {
  position: fixed;
  position-anchor: --tooltip-anchor;

  /* Position below the anchor */
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;

  /* Fallback positioning */
  position-try-fallbacks: flip-block, flip-inline;
}
```

**Use cases:** Tooltips, popovers, dropdown menus, annotations

### CSS @scope

Scoped styling without Shadow DOM:

```css
@scope (.card) to (.card__content) {
  /* Styles apply to .card but not descendants inside .card__content */
  p { margin-block: 0.5em; }
  a { color: var(--color-primary); }
}

/* Scoped to component boundary */
@scope (.component) {
  :scope { display: grid; }  /* Targets .component itself */
  .header { grid-area: header; }
}
```

### light-dark() Function

Automatic dark mode with single declaration:

```css
:root {
  color-scheme: light dark;
}

.card {
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#1a1a1a, #ffffff);
  border: 1px solid light-dark(#e0e0e0, #333333);
}
```

### @property (Typed Custom Properties)

Enable animation of CSS custom properties:

```css
@property --gradient-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.animated-gradient {
  background: conic-gradient(from var(--gradient-angle), red, blue, red);
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  to { --gradient-angle: 360deg; }
}
```

### color-mix()

Mix colors in any color space:

```css
.button {
  --base-color: oklch(50% 0.2 240);

  background: var(--base-color);

  &:hover {
    /* 20% lighter */
    background: color-mix(in oklch, var(--base-color), white 20%);
  }

  &:active {
    /* 20% darker */
    background: color-mix(in oklch, var(--base-color), black 20%);
  }
}
```

### OKLCH Color Space

Perceptually uniform color space for consistent lightness:

```css
:root {
  /* OKLCH: lightness (0-100%), chroma (0-0.4), hue (0-360) */
  --color-primary: oklch(55% 0.25 240);     /* Vibrant blue */
  --color-primary-light: oklch(75% 0.15 240);
  --color-primary-dark: oklch(35% 0.25 240);

  /* Generate consistent palette by varying lightness */
  --gray-50: oklch(97% 0 0);
  --gray-100: oklch(93% 0 0);
  --gray-500: oklch(55% 0 0);
  --gray-900: oklch(15% 0 0);
}
```

**Benefits:**
- Consistent perceived brightness across hues
- Predictable color manipulation
- Better for accessibility (contrast calculations)

## Browser Support Strategy

```css
/* Progressive enhancement pattern */
.component {
  /* Baseline: Grid */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  /* Modern enhancement */
  @supports (grid-template-columns: subgrid) {
    grid-template-columns: subgrid;
  }

  @supports (anchor-name: --test) {
    /* Use anchor positioning */
  }
}
```

## Border-Radius and Padding Alignment

**Rule: `padding >= border-radius` to prevent text clipping at corners.**

Descenders (`g`, `y`, `p`, `q`, `j`) clip when padding is less than border-radius.

| Border Radius | Min Padding | Example |
|---------------|-------------|---------|
| `var(--radius-sm)` (4px) | `var(--space-1)` (4px) | `padding: var(--space-1); border-radius: var(--radius-sm);` ✅ |
| `var(--radius-md)` (8px) | `var(--space-2)` (8px) | `padding: var(--space-2); border-radius: var(--radius-md);` ✅ |

---

## Code Review Checklist

### Before Committing CSS/TSX Changes

- [ ] **No hardcoded px/rem values** - All sizes use `var(--space-*)`, `var(--size-*)` etc.
- [ ] **No hardcoded colors** - All colors use semantic tokens like `var(--color-*)`
- [ ] **No hardcoded z-index** - Use `var(--z-index-*)` tokens
- [ ] **No margin for spacing** - Use grid `gap` property for spacing between elements
- [ ] **Grid-Only Layout** - **Flexbox is PROHIBITED.** All layouts must use CSS Grid.
- [ ] **No unnecessary inline styles** - Move static dimensions to CSS classes
- [ ] **Data attributes for states** - Not inline style objects for conditional styling
- [ ] **No unnecessary style props** - Remove `style?: React.CSSProperties` if only used for full dimensions
- [ ] **CSS owns styling logic** - State-based styles defined in CSS via `&[data-*]`, not in JSX
- [ ] **Padding >= Border-radius** - Ensure padding is at least equal to border-radius to prevent text clipping

### Grep Commands for Validation

```bash
# Find hardcoded rem/px in CSS (excluding CSS variable definitions)
grep -rE '\d+(\.\d+)?(rem|px)' frontend --include='*.css' | grep -v 'var(--'

# Find inline styles in TSX
grep -rE 'style=\{\{' frontend --include='*.tsx'

# Find hardcoded z-index in CSS
grep -rE 'z-index:\s*\d+' frontend --include='*.css'

# Find hardcoded colors (hex values not in variable definitions)
grep -rE '#[0-9a-fA-F]{3,6}' frontend --include='*.css' --include='*.tsx' | grep -v ':root' | grep -v '\[data-theme'

# Find ANY flex usage (MUST be 0 results - Flexbox is prohibited)
grep -rE 'flex:|flex-|display:\s*flex' frontend --include='*.css' --include='*.tsx'

# Find margin properties (should use grid gap instead)
grep -rE 'margin(-top|-bottom|-left|-right)?:' frontend --include='*.css'
```

---

## References

### Grid Layout
- [MDN CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout)
- [MDN Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid)
- [CSS-Tricks Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Josh W. Comeau - Subgrid](https://www.joshwcomeau.com/css/subgrid/)

### Modern CSS
- [MDN Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [MDN CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN @scope](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope)
- [OKLCH Color Picker](https://oklch.com/)
