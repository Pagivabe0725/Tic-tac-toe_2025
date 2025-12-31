## Auth Service (Authentication & User State)

The `Auth` service handles authentication workflows and manages the logged-in user state.
It relies on **Angular Signals** for reactive state and communicates with the backend via a custom `Http` service.

### Core idea

- The current user is stored in a private signal: `#user: WritableSignal<User | undefined>`.
- The service exposes a **read-only** signal through the `user` getter to prevent external direct mutation.
- Most requests use a retry strategy (`maxRetries`, `initialDelay`) to improve resilience.

---

## Public API (detailed)

### `login(email: string, password: string): Promise<User | undefined>`

Logs in a user by sending credentials to the backend (`users/login`).

**Behavior**

- Sends a `POST` request with `{ email, password }`.
- Uses retry settings (`maxRetries: 3`, `initialDelay: 200`).
- Returns the `User` object on success.
- Returns `undefined` if the request fails.

---

### `logout(): Promise<boolean | undefined>`

Logs out the current user (`users/logout`).

**Behavior**

- Sends a `POST` request.
- Expects a response like `{ result: boolean }`.
- Returns `true` if the backend confirms logout.
- Returns `undefined` if the request fails.

> Note: This method returns the backend result, but clearing the local user state is typically done by the caller (e.g. setting `user` to `undefined`) or as part of the logout flow elsewhere.

---

### `signup(email: string, password: string, rePassword: string): Promise<{ userId: string } | undefined>`

Registers a new user (`users/signup`).

**Behavior**

- Sends a `POST` request with:
  - `email`
  - `password`
  - `confirmPassword` (mapped from `rePassword`)
- Uses a stronger retry strategy (`maxRetries: 5`, `initialDelay: 200`).
- Returns `{ userId: string }` on success.
- Returns `undefined` if the request fails.

---

### `setCurrentUserIfExist(): Promise<void>`

Restores the current user if an authenticated session exists.

**Typical use case**

- Called during app initialization to rehydrate login state after refresh.

**Behavior**

- Internally calls `fetchCurrentSessionUser()`.
- Updates the local `user` signal with the returned user or `undefined`.

---

### `isUsedEmail(email: string): Promise<boolean>`

Checks whether an email is already registered (`users/is-used-email`).

**Behavior**

- Sends a `POST` request with `{ email }`.
- Uses retry settings (`maxRetries: 3`, `initialDelay: 300`).
- Returns:
  - `true` if the backend responds with `{ result: true }`
  - `false` if the backend responds with `{ result: false }` or if the request fails

---

### `updateUser(newUser: Partial<User>): Promise<void>`

Updates the current user on the backend and, on success, applies the provided changes to the local state.

**Behavior**

- Sends a `PATCH` request to `users/update-user`.
- The request body is built by merging:
  - current user fields (`this.#user()`)
  - `newUser` (partial update)
- If the request succeeds (returns a truthy response):
  - the local `user` signal is updated by merging:
    - previous user fields
    - `newUser`
  - the response payload is not used for the local merge
- If the request fails (or returns a falsy value):
  - the local `user` signal remains unchanged
  - a snackbar error appears: **"Failed to update user"**

**Important note**

- This method is intended to be used when a user is already loaded in local state.

---

### `setUserById(userId: string): Promise<void>`

Fetches a user by identifier and updates the local user signal (`users/get-user-by-identifier`).

**Behavior**

- Sends a `POST` request with `{ userId }`.
- If a user is returned, it overwrites the local user signal with the fetched user.

**Typical use case**

- Refresh user data from the backend when only an ID is known.

---

### `isCurrentUserPassword(password: string): Promise<boolean | undefined>`

Validates whether a password matches the currently loaded user (`users/check-password`).

**Behavior**

- If no user is loaded (`user()` is `undefined`), returns `undefined`.
- Otherwise sends a `POST` request with:
  - `userId` (from the current user)
  - `password`
- Uses retry settings (`maxRetries: 3`, `initialDelay: 100`).
- Expects a response like `{ isEqual: boolean }`.
- Returns `true` / `false` based on backend comparison.

---

## State access

### `user: Signal<User | undefined>` (read-only)

Read-only access to the current user state for components/services.

### `set user(newValue: User | undefined)`

Allows updating the current user state intentionally (e.g. on login success, logout, or session restore).
