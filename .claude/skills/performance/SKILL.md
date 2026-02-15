---
name: performance
description: |
  Systematic performance optimization patterns for TypeScript/React codebases.
  Covers module-level constants, WeakMap/LRU caching, Object.freeze immutability,
  batched state updates, and React.memo component optimization.
---

# Performance Optimization

Eliminate unnecessary allocations, computations, and re-renders through systematic caching and batching patterns.

## Core Rules

1. **Module-Level Constants** -- Static data lives at module scope, never inside functions or components
2. **WeakMap for Derived Data** -- Cache derived structures keyed by source object identity
3. **LRU Map for Utility Results** -- Bounded caches for repeated string/value transformations
4. **Object.freeze for Immutability** -- Freeze cache outputs and constants for JIT optimization and safety
5. **Batch State Updates** -- Coalesce multiple store notifications into one
6. **React.memo for List Items** -- Extract and memoize list children with custom equality

> **Constraint**: `useMemo` / `useCallback` are **PROHIBITED** per project design principles. Use module-level caching, `React.memo` with custom equality, and arrow functions in JSX instead.

---

## Module-Level Constants

Move static allocations out of function/render scope to avoid per-call or per-render object creation.

```typescript
// BAD: Object allocated on every call
function getFileType(ext: string): string {
  const types: Record<string, string> = {
    png: "Image", jpg: "Image", svg: "Vector",
  }
  return types[ext] ?? "File"
}

// GOOD: Module-level frozen constant
const FILE_TYPE_MAP: Readonly<Record<string, string>> = Object.freeze({
  png: "Image", jpg: "Image", svg: "Vector",
})

function getFileType(ext: string): string {
  return FILE_TYPE_MAP[ext] ?? "File"
}
```

```tsx
// BAD: Array created every render
function ContextMenu() {
  const actions = [
    { id: "rename", label: "Rename" },
    { id: "delete", label: "Delete" },
  ]
  return <Menu items={actions} />
}

// GOOD: Module-level frozen array
const MENU_ACTIONS = Object.freeze([
  Object.freeze({ id: "rename", label: "Rename" }),
  Object.freeze({ id: "delete", label: "Delete" }),
] as const)

function ContextMenu() {
  return <Menu items={MENU_ACTIONS} />
}
```

**Rules:**
- Constant arrays/objects that never change: move to module scope
- Always freeze with `Object.freeze()`
- Use `as const` for literal type narrowing when applicable
- Name with UPPER_SNAKE_CASE to signal immutability

### Existing Pattern: Default Manager States

```typescript
// PanZoomManager.ts
const EMPTY_STATE: PanZoomState = {
  transform: { zoom: 1, panX: 0, panY: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  viewportSize: { width: 0, height: 0 },
  initialTransform: null,
  pinchGesture: IDLE_PINCH_STATE,
}

// StepZoomManager.ts
const INACTIVE_STATE: StepZoomState = {
  mode: "inactive",
  currentIndex: 0,
  steps: [],
}
```

---

## Caching Derived Data

### WeakMap for Identity-Keyed Caching

When derived data depends on a source object/array, cache the result keyed by source identity. When the source is garbage-collected, the cache entry is automatically freed.

```typescript
// BAD: O(n) lookup on every call
function getNodeByDomId(steps: StepInfo[], domId: string): StepInfo | undefined {
  return steps.find(s => s.domId === domId)
}

// GOOD: WeakMap caches domId->StepInfo index, rebuilds only when source changes
const domIdIndexCache = new WeakMap<readonly StepInfo[], ReadonlyMap<string, StepInfo>>()

function getDomIdIndex(steps: readonly StepInfo[]): ReadonlyMap<string, StepInfo> {
  const cached = domIdIndexCache.get(steps)
  if (cached) return cached

  const index = new Map<string, StepInfo>()
  for (const step of steps) {
    index.set(step.domId, step)
  }
  const frozen = Object.freeze(index)
  domIdIndexCache.set(steps, frozen)
  return frozen
}

function getNodeByDomId(steps: readonly StepInfo[], domId: string): StepInfo | undefined {
  return getDomIdIndex(steps).get(domId)
}
```

**Nested cache pattern** -- when derivation depends on two keys (source + parameter):

```typescript
const derivedCache = new WeakMap<readonly Node[], Map<string, readonly Node[]>>()

function getDerived(source: readonly Node[], filterKey: string): readonly Node[] {
  let inner = derivedCache.get(source)
  if (!inner) {
    inner = new Map()
    derivedCache.set(source, inner)
  }
  const cached = inner.get(filterKey)
  if (cached) return cached

  const result = Object.freeze(source.filter(n => n.type === filterKey))
  inner.set(filterKey, result)
  return result
}
```

**Rules:**
- WeakMap key must be the source object/array (reference identity)
- Freeze cache outputs with `Object.freeze()`
- WeakMap is for object/array keys only -- use LRU Map for primitive keys

### LRU Map for Value-Keyed Caching

For pure functions with primitive keys called repeatedly with the same inputs. Bounded to prevent memory leaks.

```typescript
const parentPathCache = new Map<string, string | null>()
const PARENT_PATH_CACHE_MAX = 500

function getParentPath(path: string): string | null {
  const cached = parentPathCache.get(path)
  if (cached !== undefined) return cached

  const lastSlash = path.lastIndexOf("/")
  const result = lastSlash <= 0 ? null : path.slice(0, lastSlash)

  if (parentPathCache.size >= PARENT_PATH_CACHE_MAX) {
    const firstKey = parentPathCache.keys().next().value
    if (firstKey !== undefined) parentPathCache.delete(firstKey)
  }
  parentPathCache.set(path, result)
  return result
}
```

**Singleton pattern** for expensive constructors:

```typescript
// BAD: Creates new formatter every call
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date)
}

// GOOD: Singleton instance
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" })

function formatDate(date: Date): string {
  return dateFormatter.format(date)
}
```

**Rules:**
- Always set a `_CACHE_MAX` to bound memory
- Evict oldest entry (FIFO via Map insertion order)
- Use for pure functions with string/number keys
- Singleton pattern for stateless expensive constructors (Intl, RegExp)

---

## Object.freeze for Reference Stability

`Object.freeze()` signals immutability to the JIT compiler, enables reference-equality checks, and prevents accidental mutation of cached values.

**Where to apply:**
- Cache outputs (WeakMap values, LRU Map values)
- Module-level constants
- Empty sentinel values

```typescript
// Frozen sentinels avoid allocating new empty arrays/maps on every access
const EMPTY_ARRAY: readonly never[] = Object.freeze([])
const EMPTY_MAP: ReadonlyMap<string, never> = Object.freeze(new Map())
```

---

## Batch State Updates

When multiple state mutations trigger individual notifications/re-renders, batch them into a single notification.

```typescript
class Store {
  private batchDepth = 0
  private pendingNotify = false

  batch(fn: () => void): void {
    this.batchDepth++
    try {
      fn()
    } finally {
      this.batchDepth--
      if (this.batchDepth === 0 && this.pendingNotify) {
        this.pendingNotify = false
        this.notify()
      }
    }
  }

  private maybeNotify(): void {
    if (this.batchDepth > 0) {
      this.pendingNotify = true
      return
    }
    this.notify()
  }
}
```

**Rules:**
- Use `batch()` for operations that trigger multiple notifications
- Nestable via depth counter
- Always use `try/finally` to ensure depth decrements on error

### Existing Pattern: Combined Operations

MermaidStore's `reset()` method touches multiple child managers and calls `notify()` once:

```typescript
reset(): void {
  this._renderState = RenderStateManager.idle()
  this._panZoom = PanZoomManager.empty()
  this._stepZoom = StepZoomManager.inactive()
  this._isFullscreen = false
  this.notify()  // Single notification
}
```

---

## Two-Tier Cache

When expensive operations have an intermediate resolved form and a final consumer form, cache both tiers separately.

```typescript
// Tier 1: Parsed/resolved data from source
private readonly parsedCache = new Map<string, ParsedDiagram>()
// Tier 2: Derived consumer form (e.g., node positions, layout)
private readonly layoutCache = new Map<string, LayoutResult>()

private cacheDiagram(source: string): void {
  const parsed = parseDiagram(source)           // Tier 1
  this.parsedCache.set(source, parsed)
  this.layoutCache.set(source, computeLayout(parsed))  // Tier 2
}
```

**Rules:**
- Tier 1 stores resolved/parsed data; Tier 2 stores derived/transformed data
- Both tiers cleared together in reset/dispose
- Check Tier 2 first (fast path), then populate both tiers on miss

---

## React.memo for List Items

Extract list child components and wrap with `React.memo` + custom equality. This is the project's alternative to the prohibited `useMemo` / `useCallback`.

```tsx
// BAD: Inline rendering -- every item re-renders on any parent state change
function StepList({ steps }: Props) {
  return (
    <ul>
      {steps.map((step, i) => (
        <li key={step.nodeId}>
          <span>{step.nodeId}</span>
          <button onClick={() => onSelect(i)}>Go</button>
        </li>
      ))}
    </ul>
  )
}

// GOOD: Extracted memoized component with custom equality
interface StepItemProps {
  readonly step: StepInfo
  readonly isActive: boolean
  readonly onSelect: (index: number) => void
  readonly index: number
}

function areStepItemPropsEqual(prev: StepItemProps, next: StepItemProps): boolean {
  return (
    prev.step === next.step &&
    prev.isActive === next.isActive &&
    prev.index === next.index
    // Intentionally ignore onSelect -- callback reference changes per render (useCallback is PROHIBITED; use custom equality to skip callbacks instead)
  )
}

const StepItemMemo = React.memo(function StepItem({
  step, isActive, onSelect, index,
}: StepItemProps) {
  return (
    <li aria-selected={isActive}>
      <span>{step.nodeId}</span>
      <button type="button" onClick={() => onSelect(index)}>Go</button>
    </li>
  )
}, areStepItemPropsEqual)
```

**Rules:**
- Extract list items to separate components -- do not inline render in `.map()`
- Custom `arePropsEqual` must **ignore callback references** (callbacks are recreated per render)
- Compare only: data identity (`===`) and visual/boolean state
- Named function inside `React.memo()` for DevTools readability
- **Never** use `useMemo` or `useCallback`

---

## Decision Matrix

| Need | Pattern | When to Apply |
|------|---------|---------------|
| Static config/data in function body | Module-level constant + freeze | Always |
| Derived index from object/array | WeakMap cache | Source changes infrequently |
| Repeated string/value computation | LRU Map cache (bounded) | Pure function, primitive keys |
| Expensive constructor (Intl, RegExp) | Module-level singleton | Stateless constructor |
| Return values from caches | `Object.freeze()` | Always |
| Multiple state updates in one op | `batch()` wrapper or combined method | N updates -> 1 notification |
| List items re-rendering | `React.memo` + custom equality | Lists with >10 items |
| Empty array/map sentinels | Frozen module constant | Avoid `[]`/`new Map()` allocation |
| Two-stage expensive transformation | Two-tier Map cache (resolved + derived) | Parse + layout, theme + extension |
| Default manager state | Module-level frozen constant | Immutable managers (PanZoomManager, StepZoomManager) |

---

## Code Review Checklist

- [ ] No object/array literals inside function bodies that could be module constants
- [ ] No repeated derivation of the same index/lookup from unchanged source data
- [ ] All Map-based caches have a `_CACHE_MAX` bound
- [ ] All cache outputs frozen with `Object.freeze()`
- [ ] No `useMemo` / `useCallback` (PROHIBITED)
- [ ] List items extracted to `React.memo` components with custom equality
- [ ] Batch operations coalesce notifications (N -> 1)
- [ ] No `new Intl.*` or `new RegExp()` inside loops or frequently-called functions
- [ ] Two-tier caches clear both tiers together

## Validation Commands

```bash
# useMemo / useCallback usage (MUST be 0 -- PROHIBITED)
grep -rn 'useMemo\|useCallback' frontend --include='*.ts' --include='*.tsx'

# new Intl/RegExp inside functions (should be singletons)
grep -rn 'new Intl\.\|new RegExp(' frontend --include='*.ts' --include='*.tsx'

# React.memo usage audit (verify custom equality exists)
grep -rn 'React\.memo' frontend --include='*.tsx'

# Object literals inside components (potential module constants)
grep -rn 'const .* = \[{' frontend --include='*.tsx' | grep -v 'Object\.freeze\|UPPER'
```

## References

- `.claude/skills/core-class/SKILL.md` -- Immutable manager lifecycle, module-level default states
- `.claude/skills/state-management/SKILL.md` -- Snapshot caching, batch notifications
- [WeakMap -- MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [Object.freeze -- MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
- [React.memo -- react.dev](https://react.dev/reference/react/memo)
