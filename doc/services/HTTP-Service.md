## Http Service (Backend Requests + Retry Strategy)

The `Http` service is a thin wrapper around Angular’s `HttpClient` that standardizes how the application communicates with the backend.
It supports all common HTTP methods, optional query parameters, generic response typing, and an **exponential backoff retry strategy**. It also centralizes error logging and converts observables into Promise-based calls.

### Core idea

- Uses Angular `HttpClient` for network requests.
- Builds a request as an `Observable<T>` and converts it into a `Promise<T>` using `firstValueFrom(...)`.
- Adds a configurable **exponential backoff** retry mechanism:
  - delay grows as `initialDelay * 2^attempt`
- Provides a single public entry point: `request<T>(...)`, which returns `T | undefined` instead of throwing.

---

## Public API (detailed)

### `request<T>(method, URL, body?, retryConfig?, queryParams?): Promise<T | undefined>`
Sends an HTTP request and returns the typed response (or `undefined` if the request fails).

**Parameters**
- `method`: `'post' | 'get' | 'put' | 'delete' | 'patch'`
- `URL`: backend endpoint path relative to `BASE_URL`
- `body` *(optional)*: request payload (default: `null`)
- `retryConfig` *(optional)*:
  - `maxRetries?: number` (default: `5`)
  - `initialDelay?: number` in ms (default: `200`)
- `queryParams` *(optional)*: key-value pairs appended as query parameters

**Behavior**
- Creates the request against: `${BASE_URL}/${URL}`.
- If `queryParams` are provided:
  - builds an `HttpParams` instance and attaches it to the request.
- Applies:
  - exponential backoff retry (configurable per request)
  - centralized error logging
- Returns:
  - the response typed as `T` on success
  - `undefined` if the request ultimately fails (after retries)

**Typical use case**
- All application services (Auth, GameLogic, etc.) call `http.request<T>(...)` to keep networking consistent.

---

## Internal methods (implementation details)

### `setupRequest<T>(method, URL, body?, retryConfig?, queryParams?): Observable<T>` *(private)*
Prepares the `HttpClient` call as an observable, attaches query params, and pipes in retry + error handling.

**Behavior**
- Selects the correct `HttpClient` method based on `method`.
- Builds query params via `HttpParams` if provided.
- Pipes:
  - `exponentialBackoffRetry(...)`
  - `catchError(...)` to log and rethrow (so the retry/outer layer can handle it)

---

### `sendRequest<T>(method, URL, body?, retryConfig?, queryParams?): Promise<T>` *(private)*
Converts the prepared observable into a Promise.

**Behavior**
- Uses `firstValueFrom(...)` and `take(1)` to await the first emission and complete.

---

### `exponentialBackoffRetry<T>(maxRetries = 5, initialDelay = 200): OperatorFunction<T, T>` *(private)*
Creates the exponential backoff retry operator for request observables.

**Behavior**
- Retries failed requests up to `maxRetries`.
- Waits before each retry using:
  - `delayTime = initialDelay * 2^i`
- If retries are exhausted, rethrows the original error.

**Why it matters**
- Prevents immediate repeated retries that could overload the server or fail due to temporary network issues.
- Allows per-request tuning (e.g. longer delays for AI endpoints).

---

## Error handling rules

- Errors are logged in two places:
  - `setupRequest(...)` logs `"Request error: ..."` and rethrows
  - `request(...)` catches failures and logs `"HTTP request failed: ..."`
- `request(...)` never throws — it returns `undefined` on failure, letting callers decide how to react.
