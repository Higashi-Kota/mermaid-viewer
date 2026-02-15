---
name: state-management
description: |
  React state integration patterns for immutable manager classes.
  Covers useSyncExternalStore, lazy snapshot caching, immutable value objects,
  store composition, and React bridge patterns.
  Auto-invoked for React-manager integration, state subscription, and store design.
---

# State Management & React Integration

Bridge framework-agnostic immutable manager classes to React via `useSyncExternalStore`. The parent store (MermaidStore) owns mutable references to immutable child managers, handles notification, and provides a lazy-cached snapshot for React. Child managers never import React; the store layer handles all synchronization.

For manager class fundamentals (private constructor, immutable state, guard conditions), see the **core-class** skill.

## Core Rules

1. **useSyncExternalStore as Default** -- All stores use `subscribe`/`getSnapshot` contract
2. **subscribe/getSnapshot as Arrow Fields** -- Both must be arrow function class fields (not methods) to preserve `this` binding when passed to `useSyncExternalStore`
3. **Thin Wrapper Hooks Only** -- `useMermaidStore` style thin wrappers around `useSyncExternalStore` are acceptable; hooks with complex internal state logic are discouraged
4. **useEffect for External Sync Only** -- useEffect is for DOM, browser APIs, subscriptions; not for data fetching or derived state. Always include cleanup functions
5. **Props over Context** -- Stores distributed via props, never via React Context for state distribution
6. **Lazy Snapshot Caching** -- Stores with many fields use lazy snapshot caching (null on notify, rebuild on getSnapshot access)

> **Constraint**: `useMemo` / `useCallback` are **PROHIBITED** per project design principles. Use manager classes, module-level caching, and `React.memo` with custom equality (ignoring callback references) instead.

---

## useSyncExternalStore Pattern

### Existing Pattern: MermaidStore

The canonical store in this project uses lazy snapshot caching with immutable child managers:

```typescript
export class MermaidStore {
  // Mutable references to immutable managers
  private _renderState: RenderStateManager
  private _panZoom: PanZoomManager
  private _stepZoom: StepZoomManager
  private _isFullscreen = false

  // Subscription
  private readonly _listeners = new Set<() => void>()

  // Lazy snapshot cache
  private _snapshot: MermaidSnapshot | null = null

  private constructor() {
    this._renderState = RenderStateManager.idle()
    this._panZoom = PanZoomManager.empty()
    this._stepZoom = StepZoomManager.inactive()
  }

  static create(): MermaidStore {
    return new MermaidStore()
  }

  // Arrow function fields for stable `this` binding
  subscribe = (listener: () => void): (() => void) => {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  }

  getSnapshot = (): MermaidSnapshot => {
    if (this._snapshot === null) {
      this._snapshot = this.createSnapshot()
    }
    return this._snapshot
  }

  private notify(): void {
    this._snapshot = null  // Invalidate BEFORE notifying
    for (const listener of this._listeners) {
      listener()
    }
  }

  private createSnapshot(): MermaidSnapshot {
    return {
      renderState: this._renderState,
      panZoom: this._panZoom,
      isFullscreen: this._isFullscreen,
      // Convenience getters delegated from child managers
      svgContent: this._renderState.svgContent,
      svgDimensions: this._renderState.svgDimensions,
      transformState: this._panZoom.transformState,
      isPanning: this._panZoom.isPanning,
      zoom: this._panZoom.zoom,
      stepZoom: this._stepZoom,
    }
  }
}
```

**Rules:**
- `_snapshot = null` in `notify()` -- invalidation before listener notification
- `createSnapshot()` is a private method assembling all fields from child managers
- Use this pattern when store aggregates multiple internal managers or state sources
- `subscribe` and `getSnapshot` are arrow function class fields -- not methods -- for stable `this`

### Simple Store Pattern

For stores with simple flat state:

```typescript
class SimpleStore {
  private _state: SimpleState
  private readonly _listeners = new Set<() => void>()

  private constructor(initial: SimpleState) {
    this._state = initial
  }

  subscribe = (listener: () => void): (() => void) => {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  }

  getSnapshot = (): SimpleState => {
    return this._state
  }

  private notify(): void {
    for (const listener of this._listeners) {
      listener()
    }
  }

  updateValue(value: string): void {
    this._state = { ...this._state, value }
    this.notify()
  }
}
```

For simple stores, the snapshot IS the state -- no caching layer needed.

---

## Store Methods: Delegating to Immutable Managers

The store holds mutable references to immutable managers. Each store method:
1. Calls a manager method (which returns a new instance)
2. Checks reference equality (`!==`)
3. Replaces the reference and calls `notify()` if changed

```typescript
// Manager returns new instance or `this`
endPan(): void {
  const newPanZoom = this._panZoom.endPan()
  if (newPanZoom !== this._panZoom) {
    this._panZoom = newPanZoom
    this.notify()
  }
}

// Manager always returns new instance
zoomIn(centerX: number, centerY: number): void {
  this._panZoom = this._panZoom.zoomIn(centerX, centerY)
  this.notify()
}

// Factory replacement
setLoading(): void {
  this._renderState = RenderStateManager.loading()
  this.notify()
}
```

**Rules:**
- When the manager's method may return `this` (guard condition), check `!==` before notifying
- When the manager's method always creates a new instance, skip the check
- When replacing with a static factory, always notify

---

## Immutable Value Object Pattern

For small, transient state with finite transitions. Every transition returns a new instance. Used by child managers consumed by the store.

### Existing Pattern: StepZoomManager

```typescript
export class StepZoomManager {
  private constructor(private readonly _state: StepZoomState) {}

  static inactive(): StepZoomManager {
    return new StepZoomManager(INACTIVE_STATE)
  }

  static create(steps: readonly StepInfo[]): StepZoomManager {
    if (steps.length === 0) return StepZoomManager.inactive()
    return new StepZoomManager({ mode: "active", currentIndex: 0, steps })
  }

  next(): StepZoomManager {
    if (!this.isActive) return this  // Guard
    const nextIndex = Math.min(this._state.currentIndex + 1, this._state.steps.length - 1)
    if (nextIndex === this._state.currentIndex) return this  // Guard: already at end
    return new StepZoomManager({ ...this._state, currentIndex: nextIndex })
  }

  deactivate(): StepZoomManager {
    if (!this.isActive) return this
    return StepZoomManager.inactive()
  }
}
```

**Rules:**
- `private constructor` + `static` factories
- Every transition returns a new instance -- never mutate
- `readonly` on all internal state fields
- Guard conditions: return `this` for invalid transitions
- No React imports -- pure TypeScript in `src/core/`

---

## React Hook Pattern

### Existing Pattern: useMermaidStore

```typescript
// Thin wrapper -- acceptable
export function useMermaidStore(store: MermaidStore): MermaidSnapshot {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
```

### Selector Pattern

For selective re-rendering when only part of the snapshot is needed:

```typescript
function useMermaidSelector<T>(
  store: MermaidStore,
  selector: (snapshot: MermaidSnapshot) => T,
): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()))
}
```

**Rules:**
- Selector return values must be referentially stable (primitives, or cached objects)
- These are thin wrappers, not hooks with internal state logic

---

## Store Composition

When a parent store aggregates child managers, it replaces child references and calls `notify()`:

```typescript
export class MermaidStore {
  private _panZoom: PanZoomManager
  private _renderState: RenderStateManager
  private _stepZoom: StepZoomManager

  // Store method delegates to child, replaces reference, notifies
  zoomIn(centerX: number, centerY: number): void {
    this._panZoom = this._panZoom.zoomIn(centerX, centerY)
    this.notify()
  }

  // Combined operations touch multiple children
  reset(): void {
    this._renderState = RenderStateManager.idle()
    this._panZoom = PanZoomManager.empty()
    this._stepZoom = StepZoomManager.inactive()
    this._isFullscreen = false
    this.notify()  // Single notification for all changes
  }
}
```

**Rules:**
- Child managers are immutable value objects -- no event subscription needed
- Parent store replaces child references on mutation
- Combined operations that touch multiple children call `notify()` once at the end
- Store's `createSnapshot()` reads from all child managers

---

## Module-Level Singleton Instantiation

```typescript
// GOOD: Module-level singleton, passed as props
const mermaidStore = MermaidStore.create()

export function App() {
  return <MermaidViewer store={mermaidStore} />
}
```

```typescript
// BAD: Store created inside component -- duplicated in StrictMode
function App() {
  const store = MermaidStore.create()
  return <MermaidViewer store={store} />
}
```

---

## Decision Matrix

| Need | Pattern | When to Apply |
|------|---------|---------------|
| Store with multiple child managers | useSyncExternalStore + lazy snapshot cache | MermaidStore pattern |
| Store with simple flat state | useSyncExternalStore + direct state | Single state object, few fields |
| Child manager state | Immutable value object | PanZoomManager, StepZoomManager, RenderStateManager |
| Change detection for child managers | Reference equality (`!==`) in store | Guard conditions that return `this` |
| Combined multi-child operations | Single `notify()` at end | `reset()`, initialization methods |
| React subscription | `useSyncExternalStore(store.subscribe, store.getSnapshot)` | All components consuming store |
| DOM lifecycle in React | `useEffect` with cleanup | ResizeObserver, MutationObserver, event listeners |

---

## Code Review Checklist

- [ ] `subscribe` and `getSnapshot` are arrow function class fields (not methods)
- [ ] Snapshot cache invalidated (`_snapshot = null`) before listener notification
- [ ] No `useMemo` / `useCallback` (PROHIBITED)
- [ ] Store instantiation at module level -- never inline in render
- [ ] Store distributed via props, not Context for state
- [ ] `useEffect` always returns cleanup function
- [ ] No derived state computed in `useEffect`
- [ ] Store methods check `!==` before `notify()` when manager may return `this`

## Validation Commands

```bash
# useMemo / useCallback usage (MUST be 0 -- PROHIBITED)
grep -rn 'useMemo\|useCallback' frontend/packages/*/src --include='*.ts' --include='*.tsx'

# useSyncExternalStore usage audit
grep -rn 'useSyncExternalStore' frontend --include='*.ts' --include='*.tsx'

# Manager core files importing React (should be 0)
grep -rn "from 'react'\|from \"react\"" frontend/packages/mermaid/src/core --include='*.ts'
```

## References

- `.claude/skills/core-class/SKILL.md` -- Immutable manager class architecture, guard conditions, error modeling
- `.claude/skills/performance/SKILL.md` -- Module-level constants, snapshot caching optimization
- `.claude/skills/state-modeling/SKILL.md` -- XOR discriminated unions for state types
- `frontend/packages/mermaid/src/store/MermaidStore.ts` -- Canonical store implementation
- `frontend/packages/mermaid/src/core/PanZoomManager.ts` -- Immutable manager consumed by store
- `frontend/packages/mermaid/src/core/StepZoomManager.ts` -- Step navigation value object
