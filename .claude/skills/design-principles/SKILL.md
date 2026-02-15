---
name: design-principles
description: |
  Enforce a precise, minimal design system inspired by Linear, Notion, and Stripe.
  Covers design direction, craft principles, typography, color philosophy,
  interaction states, and micro-interactions.
  Use when building UI that needs Jony Ive-level precision.
---

# Design Principles

This skill enforces precise, crafted design for web applications. The philosophy is Jony Ive-level precision with intentional personality.

> **Implementation**: See `styling` skill for CSS Grid patterns, design tokens, and CSS Modules. This skill covers the "why" and "what it should feel like"; the styling skill covers "how to implement it."

---

## 1. Design Direction (REQUIRED)

**Before writing any code, commit to a design direction.** Don't default. Think about what this specific product needs to feel like.

### Think About Context

- **What does this product do?** A finance tool needs different energy than a creative tool.
- **Who uses it?** Power users want density. Occasional users want guidance.
- **What's the emotional job?** Trust? Efficiency? Delight? Focus?
- **What would make this memorable?** Every product has a chance to feel distinctive.

### Choose a Personality

**Precision & Density** -- Tight spacing, monochrome, information-forward. For power users who live in the tool. Think Linear, Raycast, terminal aesthetics.

**Warmth & Approachability** -- Generous spacing, soft shadows, friendly colors. For products that want to feel human. Think Notion, Coda, collaborative tools.

**Sophistication & Trust** -- Cool tones, layered depth, financial gravitas. For products handling money or sensitive data. Think Stripe, Mercury, enterprise B2B.

**Boldness & Clarity** -- High contrast, dramatic negative space, confident typography. For products that want to feel modern and decisive. Think Vercel, minimal dashboards.

**Utility & Function** -- Muted palette, functional density, clear hierarchy. For products where the work matters more than the chrome. Think GitHub, developer tools.

**Data & Analysis** -- Chart-optimized, technical but accessible, numbers as first-class citizens. For analytics, metrics, business intelligence.

Pick one. Or blend two. But commit to a direction that fits the product.

### Choose a Color Foundation

**Don't default to warm neutrals.** Consider the product:

- **Warm foundations** (creams, warm grays) -- approachable, comfortable, human
- **Cool foundations** (slate, blue-gray) -- professional, trustworthy, serious
- **Pure neutrals** (true grays, black/white) -- minimal, bold, technical
- **Tinted foundations** (slight color cast) -- distinctive, memorable, branded

### Choose a Layout Approach

The content should drive the layout:

- **Dense grids** for information-heavy interfaces where users scan and compare
- **Generous spacing** for focused tasks where users need to concentrate
- **Sidebar navigation** for multi-section apps with many destinations
- **Top navigation** for simpler tools with fewer sections
- **Split panels** for list-detail patterns where context matters

### Choose Typography

Typography sets tone:

- **System fonts** -- fast, native, invisible (good for utility-focused products)
- **Geometric sans** (Geist, Inter) -- modern, clean, technical
- **Humanist sans** (SF Pro, Satoshi) -- warmer, more approachable
- **Monospace influence** -- technical, developer-focused, data-heavy

---

## 2. Core Craft Principles

These apply regardless of design direction. This is the quality floor.

### The 4px Grid

All spacing uses a 4px base grid:
- `4px` (`--space-2`) - micro spacing (icon gaps)
- `8px` (`--space-4`) - tight spacing (within components)
- `12px` (`--space-6`) - standard spacing (between related elements)
- `16px` (`--space-8`) - comfortable spacing (section padding)
- `20px` (`--space-10`) - generous spacing
- `24px` (`--space-12`) - major separation

> **Implementation**: Map to spacing tokens `var(--space-1)` through `var(--space-12)`. See `styling` skill for token definitions.

### Symmetrical Padding

**TLBR must match.** If top padding is 16px, left/bottom/right must also be 16px. Exception: when content naturally creates visual balance.

```css
/* Good */
padding: var(--space-8);
padding: var(--space-6) var(--space-8); /* Only when horizontal needs more room */

/* Bad */
padding: 24px 16px 12px 16px;
```

### Border Radius Consistency

Sharper corners feel technical, rounder corners feel friendly. Pick a system and commit:

- **Sharp**: Use `--mermaid-radius-sm` (4px)
- **Soft**: Use `--mermaid-radius-md` (8px)

Don't mix systems. Consistency creates coherence.

### Depth & Elevation Strategy

**Match your depth approach to your design direction.** Depth is a tool, not a requirement:

**Borders-only (flat)** -- Clean, technical, dense. Works for utility-focused tools. This isn't lazy; it's intentional restraint.

**Subtle single shadows** -- Soft lift without complexity. Works for approachable products that want gentle depth.

**Layered shadows** -- Rich, premium, dimensional. Multiple shadow layers create realistic depth.

**Surface color shifts** -- Background tints establish hierarchy without any shadows. A card on a subtle background already feels elevated.

Choose ONE approach and commit.

### Card Layouts Vary, Surface Treatment Stays Consistent

Monotonous card layouts are lazy design. Design each card's internal structure for its specific content -- but keep the surface treatment consistent: same border weight, shadow depth, corner radius, padding scale, typography.

---

## 3. Typography System

### Typography Hierarchy

- Headlines: 600 weight (`--font-semibold`), tight letter-spacing (`--tracking-tight`)
- Body: 400-500 weight (`--font-normal` / `--font-medium`), standard tracking
- Labels: 500 weight (`--font-medium`), slight positive tracking for uppercase
- Scale: 11px (`--text-xs`), 12px (`--text-sm`), 13px (`--text-base`), 14px (`--text-md`), 16px (`--text-lg`), 18px (`--text-xl`), 20px (`--text-2xl`)

### Font Families

| Purpose | Token | Font | Character |
|---------|-------|------|-----------|
| Display/Headings | `--font-display` | Manrope | Modern, geometric, distinctive |
| Body text | `--font-body` | Source Sans 3 | Clean, readable, compact |
| Code/Data | `--font-mono` | JetBrains Mono | Ligatures, clear digits |

### Monospace for Data

Numbers, IDs, codes, timestamps belong in monospace. Use `tabular-nums` for columnar alignment. Mono signals "this is data."

### Line-height & Descenders

Descenders (`g`, `y`, `p`, `q`, `j`) clip with tight line-height. Use `--leading-normal` (1.5) for small text, `--leading-tight` (1.25) minimum for larger headings.

**Font testing:** Use `"gggjjjyyyqqqppp"` to verify descenders aren't clipped.

---

## 4. Color System

### Color Philosophy

Colors should convey:
- **Trust and stability** through deep, saturated primary colors
- **Clear hierarchy** via consistent lightness relationships
- **Accessible contrast** meeting WCAG 2.2 AA

> **Contrast ratios & WCAG requirements**: See `a11y` skill for specific SC requirements (4.5:1 text, 3:1 UI).
> **OKLCH implementation**: See `styling` skill for OKLCH color space usage.

### Contrast Hierarchy

Build a four-level system:
- **Foreground (primary)** -- Main text, important content (`--mermaid-color-fg`)
- **Muted** -- Supporting text, less emphasis (`--mermaid-color-fg-muted`)
- **Surface** -- Backgrounds (`--mermaid-color-surface`)
- **Border** -- Dividers, subtle separators (`--mermaid-color-border`, `--mermaid-color-border-subtle`)

### Color for Meaning Only

Gray builds structure. Color only appears when it communicates: status, action, error, success. Decorative color is noise.

### Dark Mode Strategy

Dark interfaces have different needs:

- **Borders over shadows** -- Shadows are less visible on dark backgrounds
- **Adjust semantic colors** -- Status colors may need desaturation for dark backgrounds
- **Same structure, different values** -- The hierarchy system still applies, just with inverted values

> **Implementation**: Dark mode overrides `--mermaid-color-*` variables via `[data-theme="dark"]` with `@media (prefers-color-scheme: dark)` system fallback. See `frontend/packages/mermaid/src/styles/tokens.css`.

---

## 5. Interaction States

### State Design Principles

| State | Change | Notes |
|-------|--------|-------|
| Default | Base | Starting point |
| Hover | Subtle background shift | `--mermaid-color-surface-hover` |
| Active/Pressed | Darker from hover | `--mermaid-color-primary-active` |
| Focus | Ring indicator only | `--mermaid-color-ring` |
| Disabled | Faded appearance | 50% opacity, `not-allowed` cursor |

### State Reference Examples

#### Icon Buttons (Toolbar Actions)

```css
.iconButton {
  background: transparent;
  color: var(--mermaid-color-fg-muted);
  cursor: pointer;
}

.iconButton:hover {
  background: var(--mermaid-color-surface-hover);
  color: var(--mermaid-color-fg);
}

.iconButton:active {
  transform: scale(0.95);
}
```

#### Primary Actions

```css
.btnPrimary {
  background: var(--mermaid-color-primary);
  color: white;
}

.btnPrimary:hover {
  background: var(--mermaid-color-primary-hover);
}

.btnPrimary:active {
  background: var(--mermaid-color-primary-active);
}
```

#### Destructive Actions

```css
.btnDestructive {
  background: var(--mermaid-color-destructive);
}
```

### Cursor Best Practices

| Element Type | Cursor | Notes |
|--------------|--------|-------|
| Drag handle | `grab` / `grabbing` | Shows draggability |
| Resize divider | `col-resize` / `row-resize` | Directional hint |
| Clickable button | `pointer` | Standard convention |
| Disabled | `not-allowed` | Clear feedback |
| Text input | `text` | Default, don't override |
| Pan/drag area | `grab` / `grabbing` | Map/diagram interaction |

### Component State Checklist

When designing interactive components, ensure:

- [ ] **Default**: Clear, readable, appropriate contrast
- [ ] **Hover**: Visible change (background, color, or shadow)
- [ ] **Focus**: 2px+ visible ring, offset from element
- [ ] **Active/Pressed**: Darker/inset appearance
- [ ] **Disabled**: 50% opacity, `not-allowed` cursor

---

## 6. Micro-interactions & Animation

### Timing Reference

| Interaction | Duration | Token |
|-------------|----------|-------|
| Hover color | 150ms | `--duration-fast` |
| Button press | 100ms | -- |
| Panel slide | 200ms | `--duration-normal` |
| Drawer transition | 350ms | `--duration-drawer` |
| Focus ring | 0ms (instant) | -- |

### Transform Patterns

```css
/* Press feedback */
.button:active {
  transform: scale(0.95);
}

/* Hover lift (cards, elevated elements) */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mermaid-shadow-hover);
}
```

### Guidelines

- 150ms for micro-interactions, 200-250ms for larger transitions
- No spring/bouncy effects in enterprise UI
- Always respect `prefers-reduced-motion`

> **Reduced motion implementation**: See `a11y` skill for `prefers-reduced-motion` media query and `styling` skill for CSS patterns.

---

## 7. Isolated Controls

UI controls deserve container treatment. Date pickers, filters, dropdowns -- these should feel like crafted objects sitting on the page.

**Never use native form elements for styled UI.** Native `<select>`, `<input type="date">`, and similar elements render OS-native dropdowns and pickers that cannot be styled. Build custom components instead.

---

## 8. Navigation & Context

Screens need grounding. A data table floating in space feels like a component demo, not a product. Consider including:

- **Navigation** -- sidebar or top nav showing where you are in the app
- **Location indicator** -- breadcrumbs, page title, or active nav state
- **User context** -- who's logged in, what workspace/org

---

## 9. Iconography

Use **Lucide React** (`lucide-react`). Icons clarify, not decorate -- if removing an icon loses no meaning, remove it.

Give standalone icons presence with subtle background containers.

> **Icon sizes and component conventions**: See `components` skill for the icon size table (xs=14, sm=16, md=20, lg=24) and Lucide usage patterns.

### Compact UI with Accessibility

**Visual size and interactive area are separate concerns.** Design for density, implement for accessibility.

**Icon to button edge: minimum 4px padding.** This ensures visual breathing room.

| Icon Size | Min Padding | Button Size | Notes |
|-----------|-------------|-------------|-------|
| 14px | 4px | 22px -> 24px | Round up for touch target |
| 16px | 4px | 24px | Exact touch target minimum |
| 20px | 4px | 28px -> 32px | Round to 4px grid |

> **Touch target requirements**: See `a11y` skill for WCAG 2.5.8 (24x24 minimum) and `--touch-target-min` (44px AAA).

---

## 10. Anti-Patterns

### Never Do This

- Dramatic drop shadows (`box-shadow: 0 25px 50px...`)
- Large border radius (16px+) on small elements
- Asymmetric padding without clear reason
- Pure white cards on colored backgrounds
- Thick borders (2px+) for decoration
- Excessive spacing (margins > 48px between sections)
- Spring/bouncy animations
- Gradients for decoration
- Multiple accent colors in one interface

### Always Question

- "Did I think about what this product needs, or did I default?"
- "Does this direction fit the context and users?"
- "Does this element feel crafted?"
- "Is my depth strategy consistent and intentional?"
- "Are all elements on the grid?"

---

## 11. Quality Checklist

Before finalizing UI changes:

- [ ] Design direction chosen and committed
- [ ] All interactive states defined (hover, focus, active, disabled)
- [ ] Cursor changes appropriately for element type
- [ ] Design tokens used (no hardcoded values) -- see `styling` skill
- [ ] Line-height adequate for descenders (1.5 for small text)
- [ ] All elements on the 4px grid
- [ ] Dark mode considerations addressed
- [ ] Color contrast meets WCAG AA -- see `a11y` skill
- [ ] Touch targets minimum 24x24px -- see `a11y` skill
- [ ] Transitions respect `prefers-reduced-motion` -- see `a11y` skill

---

## The Standard

Every interface should look designed by a team that obsesses over 1-pixel differences. Not stripped -- *crafted*. And designed for its specific context.

The goal: intricate minimalism with appropriate personality. Same quality bar, context-driven execution.

---

## Cross-References

- **Styling**: See `styling` skill for design token definitions, CSS variable usage rules, CSS Grid patterns, OKLCH implementation
- **A11y**: See `a11y` skill for WCAG compliance requirements (contrast ratios, touch targets, focus indicators, reduced motion)
- **Components**: See `components` skill for component templates, icon sizing conventions, and Lucide usage patterns
