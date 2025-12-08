/**
 * Defines all form validation error messages used throughout the application.
 *
 * Each key represents a specific validation error type and must follow
 * a strict naming convention:
 *
 * The key name must correspond to the suffix of its related validation method.
 * For example:
 *  - `"invalidEmail"` → `markAsInvalidEmail()`
 *  - `"shortPassword"` → `markAsShortPassword()`
 *
 * This consistency allows the `Form.checkErrorByName()` method
 * to dynamically call the appropriate validator function
 * based on the provided error key.
 *
 * Changing a key here requires updating its related validation method name.
 *
 * ---
 * **Order sensitivity**
 *
 * The insertion order of keys in this `Map` is **preserved** and also **functionally important**:
 * the keys are evaluated **in the same order they are declared here**.
 * This means the validation process will respect this order when sequentially
 * checking and assigning errors.
 *
 * If a validation rule depends on another (for example, "required" should
 * always be checked before "invalidEmail"), make sure to keep them in the correct order.
 *
 * ---
 * @example
 * ```ts
 * // Adding a new validation error type:
 * export const ERROR_MESSAGES = new Map([
 *   ...,
 *   ['usernameTaken', 'This username is already taken.'],
 * ] as const);
 *
 * // The corresponding validator method must be named:
 * markAsUsernameTaken(control: AbstractControl): void {
 *   this.addErrorToControl(control, 'usernameTaken');
 * }
 *
 * // Then it can be checked dynamically:
 * await form.checkErrorByName(control, 'usernameTaken');
 * // → automatically calls markAsUsernameTaken(control)
 * ```
 */
export const ERROR_MESSAGES = new Map([
  ['required', 'This field is required.'],
  ['invalidEmail', 'The provided email address is invalid.'],
  ['emailInUse', 'This email address is already in use.'],
  ['emailDoesNotExist', 'This email is not exist'],
  ['passwordMismatch', 'The passwords do not match.'],
  ['shortPassword', 'The password must be at least 6 characters long.'],
  ['longPassword', 'The password cannot exceed 20 characters.'],
  [
    'notCurrentUserEmail',
    'The provided email does not match the currently logged in user’s email.',
  ],
  [
    'notCurrentUserPassword',
    "The provided password does not match the current user's password.",
  ],
] as const);
