## Csrf Service (CSRF Token Management)

The `Csrf` service is responsible for retrieving, caching, and invalidating the CSRF token used for secure backend requests.
It prevents redundant token fetches by **caching** the token and **queuing concurrent callers** while a token request is already in progress.

### Core idea

- The service fetches the token from the backend endpoint: `GET/POST {BASE_URL}/csrf-token` (as used in tests).
- Requests are sent with `withCredentials: true` to include cookies/session data.
- The token is **cached** after the first successful fetch.
- If `ensureToken()` is called multiple times while a request is pending, subsequent calls are **queued** and resolved together once the token arrives.
- `invalidate()` clears the cached token so the next `ensureToken()` call will fetch a fresh one.

---

## Public API (detailed)

### `ensureToken(): Promise<string | undefined>`
Ensures that a valid CSRF token is available and returns it.

**Behavior**
- If no token is cached, it requests one from `${BASE_URL}/csrf-token` with `withCredentials: true`.
- If the backend responds with a valid payload (e.g. `{ csrfToken: string }`), it:
  - stores the token internally (cache)
  - resolves all pending callers with the same token
  - returns the token
- If the request fails (e.g. network/server error), it returns `undefined` and queued callers also resolve to `undefined`.
- If the token is already cached, it returns the cached token immediately **without sending a new HTTP request**.
- If multiple calls happen while the token is loading, they are queued and resolved once the in-flight request completes.

**Typical use case**
- Call `await csrf.ensureToken()` before making a request that requires a CSRF token header.

---

### `invalidate(): void`
Invalidates (clears) the currently cached CSRF token.

**Behavior**
- Removes the cached token value.
- After invalidation, the next `ensureToken()` call will trigger a fresh request to `${BASE_URL}/csrf-token`.

**Typical use case**
- After logout, session changes, or when the backend signals the token is no longer valid.

---

## Internal flow (as verified by unit tests)

### Concurrent requests
- If `ensureToken()` is called twice while the first request is still pending:
  - only **one** HTTP call is made
  - both promises resolve to the same token once the request finishes

### Caching
- After a successful token fetch:
  - subsequent `ensureToken()` calls return immediately from cache
  - no additional request is made until `invalidate()` is called

### Error handling
- If the token request fails:
  - `ensureToken()` resolves to `undefined`

---

## State access

### `token(): string | undefined`
The service exposes the current cached token (as used in tests).  
If the token is invalidated, this returns `undefined`.


