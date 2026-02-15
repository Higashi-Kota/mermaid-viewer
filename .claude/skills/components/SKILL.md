---
name: components
description: |
  Reusable UI component design and implementation methodology.
  Covers component architecture, React 19 patterns, semantic HTML,
  modern Web Platform APIs, and CSS Modules integration.
  Reference for building accessible, theme-compliant React components.
---

# Components Skill

## Component Architecture

### Component Placement

Components live in `frontend/packages/mermaid/src/components/`. Each component has its own `.tsx` file and a co-located `.module.css` file:

```
frontend/packages/mermaid/src/components/
├── MermaidViewer.tsx
├── MermaidViewer.module.css        (typed-css-modules generates .css.d.ts)
├── ZoomControls.tsx
├── ZoomControls.module.css
├── StepZoomControls.tsx
├── StepZoomControls.module.css
├── Minimap.tsx
├── ExportControls.tsx
└── ...
```

App-specific components live in `frontend/apps/minimap-app/src/components/`.

---

## Component Design Principles

### 1. Design Token Integration (MANDATORY)

**All colors, spacing, and styling MUST use design tokens. No exceptions.**

> **Detailed rules**: See `styling` skill for comprehensive token usage enforcement, CSS Grid patterns, and CSS Modules conventions.

```css
/* Component.module.css */
.button {
  background: var(--mermaid-color-primary);
  color: white;
  padding: var(--space-4) var(--space-8);
  border-radius: var(--mermaid-radius-md);
}

.button:hover {
  background: var(--mermaid-color-primary-hover);
}
```

### 2. Composition over Configuration

Prefer composable components over complex prop APIs:

```tsx
// Composable
<Button iconBefore={<Plus />}>Add Item</Button>
<Button iconAfter={<ChevronRight />}>Next</Button>

// Over-configured (avoid)
<Button icon="plus" iconPosition="left" iconSize="sm">Add Item</Button>
```

### 3. Accessible by Default

Build accessibility into the component API:

```tsx
interface IconButtonProps {
  icon: ReactNode
  "aria-label": string  // Required, not optional
  pressed?: boolean     // Maps to aria-pressed
}

// Forces accessible usage
<IconButton icon={<X />} aria-label="Close" />
```

> **A11y requirements**: See `a11y` skill for WCAG compliance, WAI-ARIA patterns, touch targets, focus indicators, and contrast ratios.

---

## Component Template

React 19 では `forwardRef` は非推奨。`ref` を通常の props として受け取る。

```tsx
import type { ComponentProps, ReactNode, Ref } from "react"
import styles from "./Button.module.css"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  iconBefore?: ReactNode
  iconAfter?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    />
  )
}
```

```css
/* Button.module.css */
.button {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-medium);
  border-radius: var(--mermaid-radius-md);
  transition: background var(--duration-fast) ease-out;
}

.button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--mermaid-color-surface),
    0 0 0 4px var(--mermaid-color-ring);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background: var(--mermaid-color-primary);
  color: white;
}
.primary:hover:not(:disabled) {
  background: var(--mermaid-color-primary-hover);
}

.ghost {
  background: transparent;
  color: var(--mermaid-color-fg);
}
.ghost:hover:not(:disabled) {
  background: var(--mermaid-color-surface-hover);
}

.destructive {
  background: var(--mermaid-color-destructive);
  color: white;
}

/* Sizes */
.sm {
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  padding: var(--space-1) var(--space-6);
  font-size: var(--text-sm);
  gap: var(--space-1);
}

.md {
  min-height: 2.25rem;
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-sm);
  gap: var(--space-4);
}

.lg {
  min-height: 2.5rem;
  padding: var(--space-4) var(--space-10);
  font-size: var(--text-base);
  gap: var(--space-4);
}
```

---

## HTML Semantic Structure (WHATWG/W3C)

### Sectioning Elements

| Element | Purpose | Usage |
|---------|---------|-------|
| `<main>` | Primary content (one per page) | App main content area |
| `<nav>` | Navigation links | Menu bar, sidebar navigation |
| `<article>` | Self-contained content | Cards, posts, widgets |
| `<section>` | Thematic grouping with heading | Content sections |
| `<aside>` | Tangentially related content | Sidebars, tooltips |
| `<header>` | Introductory content | Page/section header |
| `<footer>` | Footer content | Page/section footer |

### DOM Structure Examples

```tsx
// Card with semantic structure
<article className={styles.card}>
  <header className={styles.cardHeader}>
    <h2>{title}</h2>
  </header>
  <div className={styles.cardBody}>{content}</div>
  <footer className={styles.cardFooter}>{actions}</footer>
</article>

// Page layout
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    {content}
  </section>
</main>
```

---

## Modern Web Platform APIs

### Popover API (Native Popovers)

Use native popover for tooltips, menus, and dialogs without JS positioning:

```tsx
<button popovertarget="my-popover">Open Menu</button>
<div id="my-popover" popover>
  <p>Popover content here</p>
</div>
```

**Attributes:**
- `popover` / `popover="auto"`: Light-dismiss (click outside closes)
- `popover="manual"`: Requires explicit close
- `popovertarget`: Links button to popover

### inert Attribute

Disable all interactions and remove from accessibility tree:

```tsx
<div inert={isModalOpen}>
  {/* Main content - disabled when modal is open */}
</div>
{isModalOpen && <dialog open>{/* Only this is interactive */}</dialog>}
```

### `<dialog>` Element

Native modal with proper focus management:

```tsx
function Dialog({ open, onClose, children }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open) {
      dialog?.showModal()
    } else {
      dialog?.close()
    }
    return () => { dialog?.close() }
  }, [open])

  return (
    <dialog ref={dialogRef} onClose={onClose} onCancel={onClose}>
      {children}
    </dialog>
  )
}
```

```css
dialog::backdrop {
  background: oklch(0% 0 0 / 50%);
  backdrop-filter: blur(4px);
}
```

---

## Icon Sizes

Minimum icon size is 14px. Use Lucide icons with `size` prop:

```tsx
import { ChevronLeft } from "lucide-react"

const iconSizes = {
  xs: 14,  // 14px minimum
  sm: 16,  // 16px
  md: 20,  // 20px (default)
  lg: 24,  // 24px
} as const

<ChevronLeft size={14} />  // Minimum size
<ChevronLeft size={16} />  // Small
<ChevronLeft size={20} />  // Default
```

> **Touch targets & a11y**: See `a11y` skill for WCAG 2.5.8 touch target requirements (24x24 minimum) and icon button accessible name requirements.

---

## Disabled Cursor Style

Use `cursor: not-allowed` instead of `pointer-events: none` for disabled interactive elements.

`pointer-events: none` hides cursor feedback, preventing users from understanding why the element is unclickable.

```css
/* Good */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bad */
.button:disabled {
  pointer-events: none;
}
```

---

## Export Pattern

```tsx
// components/index.ts
export { Button } from "./Button"
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button"

// package index.ts
export * from "./components"
```

---

## Component Checklist

**Design & Structure:**
- [ ] Uses design tokens (no hardcoded colors/spacing) -- see `styling` skill
- [ ] Uses semantic HTML elements
- [ ] Accepts `ref` as a prop (React 19 pattern, not forwardRef)
- [ ] Exports types alongside component

**Accessibility:**
- [ ] Follows W3C APG pattern for component type -- see `a11y` skill
- [ ] Required ARIA attributes in props interface
- [ ] Has visible focus ring
- [ ] Works with keyboard navigation
- [ ] Touch target minimum 44px (`--touch-target-min`) -- see `a11y` skill

**Hooks:**
- [ ] No `useMemo` / `useCallback` (PROHIBITED) -- see `performance` skill

**CSS:**
- [ ] CSS Grid only (no Flexbox) -- see `styling` skill
- [ ] CSS Module with typed-css-modules
- [ ] `prefers-reduced-motion` respected -- see `a11y` skill

## Biome Lint Suppression for WAI-ARIA APG Patterns

W3C APG patterns that assign interactive roles to `<ul>` conflict with Biome `noNoninteractiveElementToInteractiveRole`. Do NOT replace with `<div>` as it violates APG. Suppress with `biome-ignore`:

```tsx
{/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA APG pattern */}
<ul role="tree" aria-label="Step list">...</ul>
```

## Cross-References

- **Styling**: See `styling` skill for CSS Grid layout patterns, design token usage, data-attribute state styling, and CSS Modules conventions
- **A11y**: See `a11y` skill for WCAG compliance requirements, WAI-ARIA patterns, touch targets, focus indicators, contrast ratios, and reduced motion
- **Performance**: See `performance` skill for module-level constants, React.memo for list item components
- **Core Class**: See `core-class` skill for manager class patterns that components consume via props
- **Design Principles**: See `design-principles` skill for interaction states, typography, and micro-interactions

## References

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/)
- [W3C ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs - Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN Web Docs - dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
