## SnackBarHandler Service (Snackbar Lifecycle & State)

The `SnackBarHandler` service manages the lifecycle and state of snackbar messages in a centralized, reactive way.
It stores snackbar items in an Angular **Signal**, supports automatic expiration through a ticking mechanism, enforces a maximum capacity, and allows manual removal.

### Core idea

- Snackbars are stored as an array of `snackbarTemplate` items inside a private signal.
- Consumers can **observe** snackbar changes via a read-only `Signal`, but cannot mutate the list directly.
- Auto-dismiss behavior is implemented by calling `tick()` periodically (e.g. with `setInterval`).
- The list has a fixed maximum size (5 items); when adding a new snackbar to a full list, the oldest item is removed.

---

## Public API (detailed)

### `snackbarContent: Signal<snackbarTemplate[]>` _(read-only)_

Provides the current snackbar list as a reactive signal.

**Behavior**

- Initially an empty array `[]`.
- Updates whenever snackbars are added, deleted, or expire through ticking.
- Read-only exposure preserves encapsulation (external code cannot write to the signal directly).

**Typical use case**

- UI components subscribe to `snackbarContent()` to render snackbars.

---

### `tick(): void`

Decreases the lifetime of each snackbar item by 1 tick and removes expired items.

**Behavior**

- Iterates over all snackbar items:
  - if `duration > 0`, decreases it by `1`
- Filters out any snackbar whose `duration` reaches `0`
- Updates the signal immutably (via `.update(...)`) so the UI reacts.

**Typical use case**

- Called by a timer (e.g. once per second) to auto-dismiss snackbars.

**Important note**

- The actual “time” depends on how often `tick()` is called.  
  With the default `duration: 15`, calling `tick()` once per second makes snackbars last ~15 seconds.

---

### `deleteElement(id: number): void`

Manually removes a snackbar item by its unique id.

**Behavior**

- Filters the snackbar list and removes the item where `element.id === id`.

**Typical use case**

- User closes a snackbar manually (e.g. clicking an “X” button).

---

### `addElement(content: string, error: boolean): void`

Adds a new snackbar entry.

**Behavior**

- Checks whether the list is at capacity (max 5 items).
  - If full, removes the oldest snackbar before adding a new one.
- Appends a new snackbar object containing:
  - `id`: auto-incremented unique identifier
  - `content`: displayed text
  - `duration: 15` ticks (default lifespan)
  - `error`: boolean flag (for styling, e.g. red vs normal)
- Increments the internal `#globalId` counter after insertion.

**Typical use case**

- Show feedback messages:
  - success notifications
  - error messages (e.g. failed HTTP operations)

---

## Internal methods (implementation details)

### `isFull(): boolean` _(private)_

Determines whether adding a new snackbar would exceed the maximum capacity.

**Behavior**

- Returns `true` when `currentLength + 1 >= 5`.

---

### `deleteOldestElement(): void` _(private)_

Removes the oldest snackbar item (FIFO behavior).

**Behavior**

- Removes the first element using `shift()`.
- Returns a new array copy (`[...previous]`) to ensure Signals detect the update.

---

## Capacity & expiration rules (important)

- The snackbar list never grows beyond 5 items.
- Every snackbar starts with a `duration` of 15 ticks.
- `tick()` drives expiration:
  - When duration reaches 0, the snackbar is removed automatically.
