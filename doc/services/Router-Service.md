## RouterService (Navigation + Reactive Route Tracking)

The `RouterService` centralizes Angular Router navigation and provides **reactive route state** via **Signals**.
It continuously tracks the currently active endpoint (path without query params) and the current query parameters, making them easily consumable across the application.

### Core idea

- Subscribes to Angular Router events and updates two internal signals:
  - `#currentEndpoint`: the current route path (without query params)
  - `#queryParams`: the active query parameter object
- Only reacts to `NavigationEnd` events to avoid intermediate states.
- Uses the _innermost_ (deepest) `ActivatedRoute` to read query parameters reliably.
- Ensures cleanup by unsubscribing using `DestroyRef.onDestroy(...)`.

---

## Public API (detailed)

### `currentEndpoint: Signal<string | undefined>` _(read-only)_

Provides the current endpoint (route path) as a signal.

**Behavior**

- Initially `undefined`.
- On every `NavigationEnd`:
  - reads `event.urlAfterRedirects`
  - strips query params (`split('?')[0]`)
  - removes the leading `/` (`slice(1)`)
  - stores the result in `#currentEndpoint`

**Example**

- URL: `/game?size=5`
- `currentEndpoint()` becomes: `"game"`

**Typical use case**

- Displaying or reacting to the active view without parsing the URL manually.

---

### `queryParams: Signal<Params>` _(read-only)_

Provides the current query parameters as a signal.

**Behavior**

- Initially `{}`.
- After each navigation:
  - finds the innermost `ActivatedRoute` (deepest child)
  - subscribes to its `queryParams`
  - stores the latest params in `#queryParams`

**Typical use case**

- Reactively responding to changes like `?size=5&mode=computer`.

---

### `navigateTo(path: string[], queryParams?: Params, queryParamsHandling?: QueryParamsHandling): void`

Navigates to a specific route with optional query parameters and merge/replace behavior.

**Parameters**

- `path`: route segments passed directly to `router.navigate(...)` (e.g. `['game']`)
- `queryParams` _(optional)_: object of query parameters to attach
- `queryParamsHandling` _(optional)_: Angular router query param strategy (e.g. `'merge'`, `'preserve'`)

**Behavior**

- Calls `router.navigate(path, { ...options })`.
- If `queryParams` is provided, it spreads them into a new object to avoid accidental mutation.
- If `queryParamsHandling` is provided, it is passed through to Angular Router.

**Typical use cases**

- Navigate with params:
  - `navigateTo(['game'], { size: 5, opponent: 'computer' })`
- Merge params with existing ones:
  - `navigateTo(['game'], { hardness: 3 }, 'merge')`

---

## Lifecycle & cleanup

- The service creates one subscription to `router.events`.
- It stores the subscription and unsubscribes automatically when the service is destroyed using `DestroyRef.onDestroy(...)`.
