## FormError Service (Form Validation & Error Messaging)

The `FormError` service centralizes **form validation logic** and **error message handling** for Angular reactive forms.
It provides small, reusable helpers to apply/clear validation errors on `AbstractControl` instances, and it can also perform **async checks** through the `Auth` service (e.g. email availability and password verification).

### Core idea

- Errors are added to controls using predefined `ErrorKeys`.
- Human-readable messages are resolved via the `ERROR_MESSAGES` map.
- `getPrimaryError(...)` returns the _first_ known error message based on the **order** of `ERROR_MESSAGES`.
- The service contains both:
  - **utility helpers** (add/clear/check errors)
  - **marker functions** (validation rules that set a specific error when a condition is met)
- Some validations are **async** and rely on `Auth`:
  - email existence / email already in use
  - current user password validation
  - current user email validation (via `Auth.user` signal)

---

## Public API (detailed)

### `addErrorToControl(control: AbstractControl, errorKey: ErrorKeys): void`

Adds a specific error key to the given form control.

**Behavior**

- Applies the error key to the control’s error map.
- Intended to be used by marker functions and helpers.
- Works together with `getPrimaryError(...)` to display the correct message.

**Typical use case**

- Manually force an error state when custom validation fails.

---

### `hasErrors(control: AbstractControl): boolean`

Checks whether the control currently has any error keys.

**Behavior**

- Returns `true` if `control.errors` exists and contains at least one key.
- Returns `false` if there are no errors.
- Treats an error key as “present” even if its value is falsy (because the check is key-based).

---

### `getPrimaryError(control: AbstractControl): string | undefined`

Returns the most important error message for a control.

**Behavior**

- If the control has no errors → returns `undefined`.
- Iterates through `ERROR_MESSAGES` in insertion order.
- Returns the first message where the corresponding error key exists on the control.
- Ignores unknown error keys.

**Why it matters**

- Ensures consistent “top error” selection when multiple validations fail.

---

### `clearErrors(control: AbstractControl): void`

Clears all errors from the given control.

**Behavior**

- Resets `control.errors` to `null`.

---

### `checkErrorByName(control: AbstractControl, errorKey: ErrorKeys): Promise<void>`

Applies a specific validation rule by name.

**Behavior**

- Dispatches to the matching marker function for the provided `errorKey`.
- Supports both sync and async marker functions.
- After execution, the control may or may not have the error set depending on the rule outcome.

**Typical use case**

- Run one validation rule explicitly (e.g. on blur).

---

### `checkErrors(control: AbstractControl, ...errorKeys: ErrorKeys[]): Promise<void>`

Runs multiple validation rules in order, stopping when the first error is applied.

**Behavior**

- Iterates through the provided `errorKeys` sequentially.
- Calls `checkErrorByName(...)` for each key.
- After each validation, checks `hasErrors(control)`:
  - if `true`, the method stops early (no further validations are executed)
  - if `false`, it continues to the next error key

**Why it matters**

- Keeps validation efficient and ensures the UI focuses on the first relevant error.

---

## Marker functions (validation helpers)

Marker functions apply a specific error key to a control if a condition is met.

### `markAsRequired(control: AbstractControl): void`

Adds `required` if the control value is empty.

**Behavior**

- Empty/undefined value → sets `required`
- Non-empty value → does not set the error (or leaves control clean)

---

### `markAsInvalidEmail(control: AbstractControl): void`

Adds `invalidEmail` if the value does not match a valid email format.

**Behavior**

- Invalid email → sets `invalidEmail`
- Valid email → no error

---

### `markAsShortPassword(control: AbstractControl): void`

Adds `shortPassword` if the password is shorter than the minimum length.

---

### `markAsLongPassword(control: AbstractControl): void`

Adds `longPassword` if the password exceeds the maximum length.

---

### `markAsPasswordMismatch(reference: AbstractControl, confirm: AbstractControl): void`

Adds `passwordMismatch` to the **confirm** control if it differs from the reference control.

**Behavior**

- The _second_ parameter is always the one receiving the error.
- Different values → sets `passwordMismatch` on confirm
- Matching values → no error

---

### `markAsEmailInUse(control: AbstractControl): Promise<void>`

Async validation: adds `emailInUse` if the email is already registered.

**Behavior**

- Calls `Auth.isUsedEmail(email)`
- If `true` → sets `emailInUse`
- If `false` → no error

---

### `markAsEmailDoesNotExist(control: AbstractControl): Promise<void>`

Async validation: adds `emailDoesNotExist` if the email is **not** registered.

**Behavior**

- Calls `Auth.isUsedEmail(email)`
- If `false` → sets `emailDoesNotExist`
- If `true` → no error

---

### `markAsNotCurrentUserEmail(control: AbstractControl): void`

Adds `notCurrentUserEmail` if the entered email does not match the currently loaded user.

**Behavior**

- Reads current user via `Auth.user` signal.
- If control value !== current user email → sets `notCurrentUserEmail`
- If it matches → no error

---

### `markAsNotCurrentUserPassword(control: AbstractControl): Promise<void>`

Async validation: adds `notCurrentUserPassword` if the entered password is not the current user’s password.

**Behavior**

- Calls `Auth.isCurrentUserPassword(password)`
- If `false` → sets `notCurrentUserPassword`
- If `true` → no error

---

## Error messages

- Error keys are mapped to display strings via `ERROR_MESSAGES`.
- The UI can use `getPrimaryError(control)` to display a single, consistent message per field.
