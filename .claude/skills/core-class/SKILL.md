---
name: core-class
description: |
  Framework-agnostic immutable manager class patterns for TypeScript codebases.
  Covers immutable state management, private constructor + static factory pattern,
  instance scoping, lifecycle phases, error modeling with discriminated unions,
  and ts-pattern exhaustive matching.
  Auto-invoked for new manager class implementation and core architecture decisions.
---

# Core Class Architecture

Design framework-agnostic immutable manager classes as single sources of truth for domain state. Managers own all state privately, expose typed public APIs, and produce new instances on every state change. The parent store (MermaidStore) handles React notification. For state-to-React integration, see the **state-management** skill.

## Core Rules

1. **Manager as Single Source of Truth** -- All domain state lives in a manager class with private fields and a typed public API; components never own domain state
2. **Framework-Agnostic Core** -- Manager classes must not import React, DOM APIs, or any framework; they are pure TypeScript located in `src/core/`
3. **Immutable State Updates** -- Every method returns a new instance via `new ClassName({...this._state, ...changes})`; never mutate existing state
4. **Private Constructor + Static Factory** -- All managers use `private constructor` with `static` factory methods (`empty()`, `create()`, `initial()`, etc.)
5. **Error States as Discriminated Unions** -- Model errors as state variants (e.g., `{ type: 'error'; message: string }`) rather than throwing exceptions
6. **Guard Conditions Return `this`** -- When a transition is invalid, return `this` (no-op) instead of throwing
7. **Initialize in App, Pass via Props** -- Instantiate stores at module level; distribute via props, not via React Context

---

## Immutable Manager Class Architecture

The canonical manager has private readonly state, a private constructor, and public methods that return new instances.

### Existing Pattern: PanZoomManager

```typescript
interface PanZoomState {
  readonly transform: TransformState
  readonly isPanning: boolean
  readonly panStart: { readonly x: number; readonly y: number }
  readonly viewportSize: { readonly width: number; readonly height: number }
  readonly initialTransform: TransformState | null
  readonly pinchGesture: PinchGestureState
}

const EMPTY_STATE: PanZoomState = {
  transform: { zoom: 1, panX: 0, panY: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  viewportSize: { width: 0, height: 0 },
  initialTransform: null,
  pinchGesture: IDLE_PINCH_STATE,
}

export class PanZoomManager {
  private constructor(private readonly _state: PanZoomState) {}

  static empty(): PanZoomManager {
    return new PanZoomManager(EMPTY_STATE)
  }

  static initial(
    svgDims: SvgDimensions,
    viewportWidth: number,
    viewportHeight: number,
  ): PanZoomManager {
    const transform = createInitialTransform(
      svgDims.width, svgDims.height, viewportWidth, viewportHeight,
    )
    return new PanZoomManager({
      transform,
      isPanning: false,
      panStart: { x: 0, y: 0 },
      viewportSize: { width: viewportWidth, height: viewportHeight },
      initialTransform: transform,
      pinchGesture: IDLE_PINCH_STATE,
    })
  }

  get transformState(): TransformState {
    return this._state.transform
  }

  zoomByFactor(
    factor: number,
    pivotX: number,
    pivotY: number,
    constraints: ZoomConstraints = DEFAULT_ZOOM_CONSTRAINTS,
  ): PanZoomManager {
    const newTransform = zoomAtPoint(this._state.transform, factor, pivotX, pivotY, constraints)
    return new PanZoomManager({
      ...this._state,
      transform: newTransform,
    })
  }

  updatePan(clientX: number, clientY: number): PanZoomManager {
    if (!this._state.isPanning) return this  // Guard: return this
    return new PanZoomManager({
      ...this._state,
      transform: {
        ...this._state.transform,
        panX: clientX - this._state.panStart.x,
        panY: clientY - this._state.panStart.y,
      },
    })
  }
}
```

**Rules:**
- `private constructor` -- only static factories can create instances
- `private readonly _state` -- single state container
- All getters expose data from `_state` without exposing the state object itself
- Every mutating method returns `new ClassName({...this._state, ...changes})`
- Guard conditions (e.g., `if (!this._state.isPanning)`) return `this` for no-op

### Module-Level Constants for Default State

Use frozen module-level constants for empty/default states to avoid per-creation allocations:

```typescript
const INACTIVE_STATE: StepZoomState = {
  mode: "inactive",
  currentIndex: 0,
  steps: [],
}

export class StepZoomManager {
  private constructor(private readonly _state: StepZoomState) {}

  static inactive(): StepZoomManager {
    return new StepZoomManager(INACTIVE_STATE)
  }
}
```

---

## Reference Equality for Change Detection

Since managers are immutable, the parent store can detect changes via reference comparison (`===`). When a manager method returns `this`, the store skips notification:

```typescript
// In MermaidStore
endPan(): void {
  const newPanZoom = this._panZoom.endPan()
  if (newPanZoom !== this._panZoom) {  // Reference equality check
    this._panZoom = newPanZoom
    this.notify()
  }
}
```

**Rules:**
- When a guard condition prevents a transition, return `this` to signal "no change"
- Parent store uses `!==` to decide whether to call `notify()`
- This avoids unnecessary React re-renders

---

## Equality Comparison

For cases where structural equality is needed (not just reference equality), implement an `equals()` method:

```typescript
equals(other: PanZoomManager): boolean {
  if (this === other) return true

  const s1 = this._state
  const s2 = other._state

  return (
    s1.transform.zoom === s2.transform.zoom &&
    s1.transform.panX === s2.transform.panX &&
    s1.transform.panY === s2.transform.panY &&
    s1.isPanning === s2.isPanning &&
    s1.viewportSize.width === s2.viewportSize.width &&
    s1.viewportSize.height === s2.viewportSize.height
  )
}
```

---

## Error Modeling with Discriminated Unions

Instead of throwing exceptions, model errors as variants of a discriminated union:

### Existing Pattern: RenderStatus

```typescript
export type RenderStatus =
  | { readonly type: "idle" }
  | { readonly type: "loading" }
  | { readonly type: "success"; readonly svgContent: string; readonly svgDimensions: SvgDimensions }
  | { readonly type: "error"; readonly message: string }
```

Error is just another state variant. The manager provides typed access:

```typescript
export class RenderStateManager {
  private constructor(private readonly _status: RenderStatus) {}

  static idle(): RenderStateManager {
    return new RenderStateManager({ type: "idle" })
  }

  static error(message: string): RenderStateManager {
    return new RenderStateManager({ type: "error", message })
  }

  get errorMessage(): string | null {
    return match(this._status)
      .with({ type: "error" }, (s) => s.message)
      .otherwise(() => null)
  }
}
```

**Rules:**
- Error states carry domain context (`message`, `code`, etc.)
- Use ts-pattern `.with()` / `.otherwise()` for typed access to variant-specific data
- No exceptions thrown from public methods

---

## Discriminated Unions

All tree and node types use discriminated unions with a `type` string literal field. Pattern match with `ts-pattern` `match().exhaustive()` for compile-time completeness.

### Existing Pattern: PinchGestureState

```typescript
export type PinchGestureState =
  | { readonly type: "idle" }
  | {
      readonly type: "singleTouch"
      readonly touch: TouchPoint
      readonly panStartX: number
      readonly panStartY: number
    }
  | {
      readonly type: "pinch"
      readonly touches: readonly [TouchPoint, TouchPoint]
      readonly prevDistance: number
      readonly prevCenter: { readonly x: number; readonly y: number }
    }
```

Each variant carries only the properties meaningful in that state. `touch` only exists during `singleTouch`. `touches` and `prevDistance` only exist during `pinch`.

### ts-pattern Exhaustive Match

```typescript
import { match } from "ts-pattern"

function renderStatus(status: RenderStatus): string {
  return match(status)
    .with({ type: "idle" }, () => "Ready")
    .with({ type: "loading" }, () => "Loading...")
    .with({ type: "success" }, (s) => `Rendered: ${s.svgContent.length} chars`)
    .with({ type: "error" }, (s) => `Error: ${s.message}`)
    .exhaustive()
}
```

**Rules:**
- Discriminant field is always `type` (string literal)
- Use `ReadonlyArray` / `readonly` for all state properties
- `ts-pattern` `.exhaustive()` for all branching on unions
- Prefer `.exhaustive()` over `switch` + `default`

---

## Decision Matrix

| Need | Pattern | When to Apply |
|------|---------|---------------|
| Domain state ownership | Immutable manager with private constructor | PanZoomManager, RenderStateManager, StepZoomManager |
| Multiple factory methods | `static empty()`, `static create(args)`, `static initial(args)` | Different initialization contexts |
| Change detection | Reference equality (`!==`) in parent store | Store methods that delegate to managers |
| Structural equality | `equals()` method comparing fields | Optimization, deduplication |
| Error representation | Discriminated union variant `{ type: 'error'; ... }` | Render failures, validation errors |
| Type-safe branching | `ts-pattern` `.exhaustive()` | All branching on discriminated unions |
| Default/empty state | Module-level frozen constant | Avoid per-creation allocations |
| Invalid transition | Return `this` (guard condition) | State-dependent operations |

---

## Code Review Checklist

- [ ] Manager class has `private constructor` -- no `public` or default constructor
- [ ] Manager files in `src/core/` do not import React, DOM, or framework modules
- [ ] Every mutating method returns a new instance -- never `this._state.x = y`
- [ ] Guard conditions return `this` for no-op transitions
- [ ] Parent store checks `newManager !== this._manager` before calling `notify()`
- [ ] Default state constants are module-level (not created per factory call)
- [ ] Discriminated unions use `type` literal discriminant with `ts-pattern` `.exhaustive()`
- [ ] All state interface fields are `readonly`

## Validation Commands

```bash
# Manager core files importing React (should be 0)
grep -rn "from 'react'\|from \"react\"" frontend/packages/mermaid/src/core --include='*.ts'

# Mutable state assignment in manager classes (check for direct mutation)
grep -rn 'this\._state\s*=' frontend/packages/mermaid/src/core --include='*.ts'

# ts-pattern exhaustive usage audit
grep -rn '\.exhaustive()' frontend/packages/mermaid/src --include='*.ts' --include='*.tsx'
```

## References

- `.claude/skills/state-management/SKILL.md` -- MermaidStore patterns, useSyncExternalStore, snapshot caching
- `.claude/skills/state-modeling/SKILL.md` -- XOR discriminated unions, immutable state machine patterns
- `.claude/skills/performance/SKILL.md` -- Module-level constants, Object.freeze, caching
- [ts-pattern](https://github.com/gvergnaud/ts-pattern) -- Exhaustive pattern matching for TypeScript
- `frontend/packages/mermaid/src/core/PanZoomManager.ts` -- Canonical immutable manager
- `frontend/packages/mermaid/src/core/RenderStateManager.ts` -- Error-as-state-variant pattern
- `frontend/packages/mermaid/src/core/StepZoomManager.ts` -- Step navigation state machine
