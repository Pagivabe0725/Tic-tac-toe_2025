## DialogHandler Service (Dialog State & Events)

The `DialogHandler` service is responsible for managing application dialogs and their lifecycle.
It centralizes dialog state (what is currently open, what was opened last, and optional dialog data), provides a Promise-based API for returning results from dialogs, and also exposes a lightweight event mechanism for triggering UI actions.

### Core idea

- Dialog visibility/content is controlled through an internal state (exposed via getters like `actualContent()` and properties like `lastContent`).
- Dialogs can optionally receive metadata (`dialogData`) such as title/content.
- `open(...)` returns a **Promise** that resolves when:
  - the dialog emits a result via `emitData(...)`, or
  - the dialog is closed / replaced (resolved with `null`).
- A trigger system (`trigger(...)` + `waitForTrigger()`) provides a simple way to broadcast dialog-related events to subscribers.

---

## Public API (detailed)

### `actualContent(): DialogContent | undefined` _(getter signal)_

Returns the currently active dialog identifier (or `undefined` if no dialog is open).

**Behavior**

- Initially `undefined`.
- Updated when `open(...)` is called.
- Reset to `undefined` when the dialog is closed (directly or after `emitData(...)`).

---

### `lastContent: DialogContent | undefined`

Stores the last opened dialog identifier.

**Behavior**

- Updated whenever `open(...)` is called.
- Remains set even after the dialog is closed (useful for “reopen last dialog” or tracking history).

---

### `dialogData: unknown | undefined`

Optional payload attached to the currently opened dialog (e.g. title/content).

**Behavior**

- Set by `open(content, data)` when `data` is provided.
- Stays available even after the dialog closes (as reflected by tests), which can be useful for rendering or post-close UI logic.

---

### `open(content: DialogContent, data?: unknown): Promise<unknown | null>`

Opens a dialog and returns a Promise that resolves with the dialog result.

**Behavior**

- Sets:
  - `actualContent` to the provided `content`
  - `lastContent` to the provided `content`
  - `dialogData` to the provided `data` (if any)
- Returns a Promise that resolves when:
  - `emitData(result)` is called → resolves with `result`
  - `close()` is called → resolves with `null`
- If `open(...)` is called while another dialog is already open:
  - the previous Promise is resolved with `null`
  - the new dialog becomes the active one

**Typical use case**

- `const result = await dialog.open('save', { title: '...', content: '...' })`

---

### `emitData(result: unknown): void`

Emits a dialog result and closes the dialog.

**Behavior**

- Resolves the Promise created by the latest `open(...)` call with the provided `result`.
- Calls `close()` internally to reset the active dialog state.
- After emitting, `actualContent()` becomes `undefined`.

**Typical use case**

- Called from a dialog component when the user clicks “Confirm”, “Save”, etc.

---

### `close(): void`

Closes the currently opened dialog.

**Behavior**

- Resets the active dialog state (e.g. `actualContent()` becomes `undefined`).
- Resolves any pending Promise from `open(...)` with `null` (so awaiting callers can continue safely).
- Also performs internal cleanup (subjects/reset) to ensure the next dialog works correctly.

**Typical use case**

- Called when the user cancels the dialog or clicks outside.

---

### `trigger(event: string): void`

Broadcasts a dialog/UI-related event to all current subscribers.

**Behavior**

- Emits the provided `event` value to subscribers returned by `waitForTrigger()`.

**Typical use case**

- Trigger form reset, validation, or other dialog-driven UI actions.

---

### `waitForTrigger(): Observable<string>`

Returns an Observable that emits values whenever `trigger(...)` is called.

**Behavior**

- Subscribers receive all subsequent triggered events.
- Multiple subscribers can listen simultaneously; all will receive the same triggered values.

**Typical use case**

- `dialog.waitForTrigger().subscribe(v => { ... })`

---

## Promise resolution rules (important)

- `emitData(value)` → resolves `open(...)` Promise with `value`, then closes the dialog.
- `close()` → resolves `open(...)` Promise with `null`.
- `open(...)` called while another dialog is open → previous Promise resolves with `null` automatically.
