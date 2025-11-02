import { inject, Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Auth } from './auth.service';
import { ErrorKeys, ErrorValues } from '../utils/types/error-messages.type';
import { ERROR_MESSAGES } from '../utils/interfaces/error-message.interface';

/**
 * A service for managing and applying form validation errors.
 *
 * @remarks
 * This service relies on custom types and the ERROR_MESSAGES Map, which are defined
 * in the `interfaces` and `types` folders of the project:
 * - `types/error-messages.type.ts` → defines ErrorKeys and ErrorValues types
 * - `interfaces/error-message.interface.ts` → defines the ERROR_MESSAGES Map
 *
 * Each validator method follows a strict naming convention:
 * - The method name **must start with** `markAs`
 * - The rest of the name **must exactly match** the error key in `ERROR_MESSAGES`,
 *   but written in PascalCase.
 *
 * For example:
 * - Error key: `"invalidEmail"` → Method name: `markAsInvalidEmail`
 * - Error key: `"shortPassword"` → Method name: `markAsShortPassword`
 *
 * This convention allows dynamic method resolution inside `checkErrorByName()`.
 */
@Injectable({
  providedIn: 'root',
})
export class Form {
  #auth: Auth = inject(Auth);

  /**
   * Adds a specific validation error to a control.
   *
   * @param control - The form control to attach the error to.
   * @param errorName - The name of the error to add.
   */
  addErrorToControl(control: AbstractControl, errorName: ErrorKeys): void {
    const existingErrors = control.errors ?? {};
    control.setErrors({
      ...existingErrors,
      [errorName]: ERROR_MESSAGES.get(errorName),
    });
  }

  /**
   * Marks a control as required if it has no value.
   */
  markAsRequired(control: AbstractControl): void {
    if (!control.value) {
      this.addErrorToControl(control, 'required');
    }
  }

  /**
   * Marks a control as invalid if its value is not a valid email format.
   */
  markAsInvalidEmail(control: AbstractControl): void {
    const value = control.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (value && !emailRegex.test(value)) {
      this.addErrorToControl(control, 'invalidEmail');
    }
  }

  /**
   * Marks a control as invalid if its password is too short.
   */
  markAsShortPassword(control: AbstractControl): void {
    const value = control.value;
    if (value && value.length < 6) {
      this.addErrorToControl(control, 'shortPassword');
    }
  }

  /**
   * Marks a control as invalid if its password is too long.
   */
  markAsLongPassword(control: AbstractControl): void {
    const value = control.value;
    if (value && value.length > 20) {
      this.addErrorToControl(control, 'longPassword');
    }
  }

  /**
   * Marks a confirmation control as invalid if the two password fields do not match.
   */
  markAsPasswordMismatch(
    passwordControl: AbstractControl,
    confirmControl: AbstractControl
  ): void {
    const password = passwordControl.value;
    const confirm = confirmControl.value;
    console.log('meghívva');
    if (password && confirm && password !== confirm) {
      this.addErrorToControl(confirmControl, 'passwordMismatch');
    }
  }

  /**
   * Marks a control as invalid if the email is already used (checked via async call).
   */
  async markAsEmailInUse(control: AbstractControl): Promise<void> {
    const value = control.value;
    if (this.#auth.csrf() && value && (await this.#auth.isUsedEmail(value))) {
      this.addErrorToControl(control, 'emailInUse');
    }
  }

  /**
   * Asynchronously validates whether the given email exists in the system.
   *
   * If a CSRF token is available and the email value is defined,
   * the method checks the existence of the email through the Auth service.
   * If the email **does not exist**, an `emailDoesNotExist` validation error
   * is added to the specified form control.
   *
   * @param control - The form control whose value is to be validated.
   */
  async markAsEmailDoesNotExist(control: AbstractControl): Promise<void> {
    const value = control.value;
    if (this.#auth.csrf() && value && !(await this.#auth.isUsedEmail(value))) {
      this.addErrorToControl(control, 'emailDoesNotExist');
    }
  }

  /**
   * Dynamically finds and calls the corresponding validation method
   * based on the provided error key.
   *
   * @param control - The form control to validate.
   * @param errorName - The validation key (must match the naming convention).
   *
   * @example
   * ```ts
   * await form.checkErrorByName(control, 'invalidEmail');
   * // Dynamically calls form.markAsInvalidEmail(control)
   * ```
   *
   * @remarks
   * The method name is built dynamically as:
   * `markAs${errorName[0].toUpperCase()}${errorName.slice(1)}`
   *
   * Therefore, for an error key `"shortPassword"`,
   * the method `markAsShortPassword()` must exist.
   */
  async checkErrorByName(
    control: AbstractControl,
    errorName: ErrorKeys
  ): Promise<void> {
    const fn = (this as any)[
      `markAs${errorName[0].toUpperCase()}${errorName.slice(1)}`
    ];
    if (fn) await fn.call(this, control);
  }

  /**
   * Runs multiple validations sequentially on the same control,
   * but stops at the first validation that produces an error.
   *
   * @param control - The form control to validate.
   * @param errors - A list of validation keys to check.
   *
   * @example
   * ```ts
   * // Only the first failing validation will be applied
   * await form.checkErrors(control, 'required', 'invalidEmail', 'emailInUse');
   * ```
   *
   * @remarks
   * This method iterates through the provided error keys in order and
   * applies the corresponding validation using `checkErrorByName`.
   * If any validation adds an error to the control, the loop breaks immediately,
   * preventing subsequent validations from running.
   */
  async checkErrors(
    control: AbstractControl,
    ...errors: ErrorKeys[]
  ): Promise<void> {
    for (const error of errors) {
      await this.checkErrorByName(control, error);
      if (this.hasErrors(control)) break;
    }
  }

  /**
   * Returns the first matching error message from the control's current errors,
   * according to the order defined in ERROR_MESSAGES.
   *
   * @param control - The form control to check.
   * @returns The first error message, or undefined if there are no errors.
   */
  getPrimaryError(control: AbstractControl): ErrorValues | undefined {
    const errorKeys = control.errors ? Object.keys(control.errors) : [];
    return [...ERROR_MESSAGES.entries()].find(([key]) =>
      errorKeys.includes(key)
    )?.[1];
  }

  /**
   * Checks whether the given control has any validation errors.
   *
   * @param control - The form control to check.
   * @returns True if the control has one or more errors, false otherwise.
   */
  hasErrors(control: AbstractControl): boolean {
    const errorKeys = control.errors ? Object.keys(control.errors) : [];
    return errorKeys.length > 0;
  }

  /**
   * Clears all validation errors from the given control.
   *
   * @param control - The form control to reset errors for.
   *
   * @example
   * ```ts
   * // Remove all errors from the email control
   * form.clearErrors(emailControl);
   * ```
   */
  clearErrors(control: AbstractControl): void {
    control.setErrors(null);
  }
}
