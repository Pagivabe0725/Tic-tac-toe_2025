## Theme Service (Theme State, CSS Sync & Viewport Tracking)

The `Theme` service manages the global visual appearance of the application.
It stores theme values in **Angular Signals**, synchronizes them with **CSS variables** and **localStorage**, and tracks the current viewport size.

### Core idea

- Theme values are stored in private signals:
  - `#primaryColor`, `#accentColor`
  - `#mode` (`'light' | 'dark'`)
  - `#width`, `#height` (viewport size in pixels)
- The service initializes its state from:
  - CSS variables (`--theme-primary`, `--theme-accent`)
  - persisted values in `localStorage`
  - a derived fallback for the `color-scheme` (based on background lightness)
- Uses `effect(...)` to keep CSS + `localStorage` in sync whenever a signal changes.
- Adds a `resize` listener to keep viewport `width` / `height` up to date.

> Note: This service stores width as a **pixel value**, not as a breakpoint label (e.g. `md`, `xl`).

---

## Public API (detailed)

### `width: Signal<number | undefined>` _(read-only signal)_

Reactive signal representing the current viewport width in pixels.

**Behavior**

- Initialized from `window.innerWidth`.
- Updated on every resize event by `onResize`.
- Exposed as a `Signal` so the UI can react to changes.

---

### `height: number | undefined`

Returns the current viewport height in pixels.

**Behavior**

- Initialized from `window.innerHeight`.
- Updated on every resize event by `onResize`.

---

### `mode: 'light' | 'dark' | undefined`

Gets/sets the active color scheme.

**Behavior**

- When set:
  - updates the internal `#mode` signal
  - an effect updates the `color-scheme` property on `document.body`
  - persists the value to `localStorage` under `color-scheme`
- When initialized:
  - uses `localStorage` if available
  - otherwise infers the scheme from the current background lightness threshold

---

### `modeSignal: Signal<string | undefined>`

Exposes the mode as a reactive signal.

**Behavior**

- Returns the internal signal (`#mode`) for reactive consumption.

> Note: The underlying value is `'light' | 'dark' | undefined`, but the exposed type is `Signal<string | undefined>`.

---

### `primaryColor: string | undefined`

Gets/sets the primary theme color.

**Behavior**

- When set:
  - updates the `#primaryColor` signal
  - an effect writes the value to:
    - `--theme-primary` CSS variable on the body
    - `localStorage` under `--theme-primary`

---

### `accentColor: string | undefined`

Gets/sets the accent theme color.

**Behavior**

- When set:
  - updates the `#accentColor` signal
  - an effect writes the value to:
    - `--theme-accent` CSS variable on the body
    - `localStorage` under `--theme-accent`

---

## Initialization flow

On service construction:

1. Reads initial viewport size from `window.innerWidth` and `window.innerHeight`.
2. Registers a `resize` event listener to keep size updated.
3. Calls `setBasicState()` to load theme settings from CSS variables and/or `localStorage`.
4. Registers `effect(...)` blocks to automatically keep CSS variables and `localStorage` synchronized.

---

## Internal methods (implementation details)

### `onResize(): void` _(private)_

Resize handler that updates:

- `height` from `window.innerHeight`
- `width` from `window.innerWidth`

---

### `setBasicState(): void` _(private)_

Initializes theme state from CSS variables and `localStorage`.

**Behavior**

- Reads CSS variables from the document:
  - `--theme-primary`
  - `--theme-accent`
- Loads saved values from `localStorage` (if present):
  - `--theme-primary`
  - `--theme-accent`
  - `color-scheme`
- Sets:
  - `primaryColor` and `accentColor` from saved values (fallback to CSS defaults)
  - `mode` from saved `color-scheme`, otherwise inferred from background lightness

---

### `getLigthnessFromOKLCH(oklch: string): number` _(private)_

Extracts the lightness component (`L`) from an `oklch(...)` string.

**Behavior**

- Example: `oklch(0.75 0.1 120)` → returns `0.75`

**Important note**

- This assumes the input is an `oklch(...)` string.
- If the browser returns `background-color` as `rgb(...)`/`rgba(...)`, this parsing will not be valid and scheme inference may be inaccurate.

---

## Persistence rules (important)

- When `primaryColor` changes:
  - updates `--theme-primary` CSS variable
  - writes `--theme-primary` to `localStorage`
- When `accentColor` changes:
  - updates `--theme-accent` CSS variable
  - writes `--theme-accent` to `localStorage`
- When `mode` changes:
  - updates `color-scheme` on the document body
  - writes `color-scheme` to `localStorage`
