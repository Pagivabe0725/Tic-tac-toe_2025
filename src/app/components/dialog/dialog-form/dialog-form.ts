import {
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { Theme } from '../../../services/theme.service';
import {
  FieldKey,
  FormFieldModel,
} from '../../../utils/types/dialog-form-field-model.type';
import { FormError } from '../../../services/form-error.service';
import { FormTemplate } from '../../../services/form-template.service';
import { Functions } from '../../../services/functions.service';

/**
 * Component representing a fully reactive dialog form.
 *
 * This form dynamically adjusts its fields, validation, and appearance
 * based on the active dialog content and user interaction.
 * It integrates Angular signals for fine-grained reactivity without subscriptions.
 */
@Component({
  selector: 'app-dialog-form',
  imports: [FormsModule],
  templateUrl: './dialog-form.html',
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        display: block;
      }

      .own-error-span {
        width: 85%;
        font-weight: 100;
        color: red;
        transition: all ease-in 0.3s;
      }

      .own-error-fieldset {
        border: 2px outset red;
        legend {
          color: red;
          font-style: italic;
        }
        input {
          color: red;
          border: 2px solid red;
          font-style: italic;
        }
      }
    `,
  ],
})
export class DialogForm {
  /**
   * {@link DialogHandler} manages dialog visibility, active content type, and dialog state.
   */
  protected dialog: DialogHandler = inject(DialogHandler);

  /**
   * {@link Theme} manages theme colors and applies them to the UI.
   */
  protected theme: Theme = inject(Theme);

  /**
   * {@link FormError} handles form validation, error registration, and marking invalid fields.
   */
  protected formErrorHandler: FormError = inject(FormError);

  /**
   * {@link FormTemplate} provides predefined form field templates for each dialog type.
   */
  #formTemplate: FormTemplate = inject(FormTemplate);

  /**
   * {@link Functions} utility service with helper functions for field manipulation and type inference.
   */
  protected helperFunctions: Functions = inject(Functions);

  /** Map storing form field templates indexed by the dialog key. */
  protected templates = this.#formTemplate.formFieldMap;

  /** Input signal triggering a rejection/reset of unsaved changes in the form. */
  rejectChanges: InputSignal<boolean> = input.required();

  /** Input signal holding an optional callback function to execute on form submission. */
  callback: InputSignal<Function | undefined> = input.required();

  /** Output emitter triggered when the callback execution fails or is disabled. */
  disableCallback: OutputEmitterRef<void> = output();

  /** Writable signal representing the current difficulty level of the game (1–4). */
  #hardness: WritableSignal<number> = signal(1);

  /** Writable signal for the primary theme color. */
  #primaryColor: WritableSignal<string> = signal(
    this.theme.primaryColor ?? '#fff'
  );

  /** Stores the previous primary color for restoring when cancelling changes. */
  private previousPrimaryColor = this.#primaryColor();

  /** Writable signal for the accent theme color. */
  #accentColor: WritableSignal<string> = signal(
    this.theme.accentColor ?? '#fff'
  );

  /** Stores the previous accent color for restoring when cancelling changes. */
  private previousAccentColor = this.#accentColor();

  /** Writable signal representing the current game name entered by the user. */
  #gameName: WritableSignal<string> = signal('');

  /** Writable signal for the user's email input. */
  #email: WritableSignal<string> = signal('');

  /** Writable signal for the user's password input. */
  #password: WritableSignal<string> = signal('');

  /** Writable signal for repeated password confirmation. */
  #rePassword: WritableSignal<string> = signal('');

  /** Writable signal representing the selected opponent type (e.g., 'computer' or 'human'). */
  #opponent: WritableSignal<string> = signal('computer');

  /** Writable signal representing the selected game board size (e.g., 3x3, 4x4). */
  #size: WritableSignal<number> = signal(3);

  /** Getter and setter for the difficulty level signal. */
  protected get hardness(): WritableSignal<number> {
    return this.#hardness;
  }
  protected set hardness(value: number) {
    this.#hardness.set(value);
  }

  /** Getter and setter for the primary color signal. */
  protected get primaryColor(): WritableSignal<string> {
    return this.#primaryColor;
  }
  protected set primaryColor(value: string) {
    this.#primaryColor.set(value);
  }

  /** Getter and setter for the accent color signal. */
  protected get accentColor(): WritableSignal<string> {
    return this.#accentColor;
  }
  protected set accentColor(value: string) {
    this.#accentColor.set(value);
  }

  /** Getter and setter for the game name signal. */
  protected get gameName(): WritableSignal<string> {
    return this.#gameName;
  }
  protected set gameName(value: string) {
    this.#gameName.set(value);
  }

  /** Getter and setter for the email signal. */
  protected get email(): WritableSignal<string> {
    return this.#email;
  }
  protected set email(value: string) {
    this.#email.set(value);
  }

  /** Getter and setter for the password signal. */
  protected get password(): WritableSignal<string> {
    return this.#password;
  }
  protected set password(value: string) {
    this.#password.set(value);
  }

  /** Getter and setter for the repeated password signal. */
  protected get rePassword(): WritableSignal<string> {
    return this.#rePassword;
  }
  protected set rePassword(value: string) {
    this.#rePassword.set(value);
  }

  /** Getter and setter for the opponent signal. */
  protected get opponent(): WritableSignal<string> {
    return this.#opponent;
  }
  protected set opponent(value: string) {
    this.#opponent.set(value);
  }

  /** Getter and setter for the board size signal. */
  protected get size(): WritableSignal<number> {
    return this.#size;
  }
  protected set size(value: number) {
    this.#size.set(value);
  }

  /** Signal referencing the template form element (NgForm) for reactive access. */
  protected ngForm: Signal<NgForm | undefined> = viewChild('form', {
    read: NgForm,
  });

  /**
   * Initializes the component and sets up reactive effects for:
   * - syncing theme colors,
   * - validating password match,
   * - resetting fields when dialog content changes,
   * - restoring colors on reject,
   * - and sending form data when requested.
   */
  constructor() {
    let _previousContent = this.dialog.activeContent();

    // Initialize base field values when form opens
    if (this.getActualObject()) {
      for (const field of this.templates.get(this.getActualObject()!)!) {
        if (field.baseValue) {
          console.log('base:', field.baseValue);
          this.getterSetter(field.model).set(field.baseValue);
        }
      }
    }

    // Revert unsaved changes if rejection triggered
    effect(() => {
      if (this.rejectChanges()) {
        this.resetProperties();
      }
    });

    // Sync color signals with global theme
    effect(() => {
      if (this.primaryColor()) this.theme.primaryColor = this.primaryColor();
      if (this.accentColor()) this.theme.accentColor = this.accentColor();
    });

    // Reset form when dialog content changes
    effect(() => {
      if (this.dialog.activeContent() !== _previousContent) {
        this.resetSignals();
        this.clearFormErrors();
        _previousContent = this.dialog.activeContent();
      }
    });

    // Validate password confirmation in real-time
    effect(() => {
      const password = this.password();
      const rePassword = this.rePassword();

      if (password && rePassword && password !== rePassword) {
        const passwordControl = this.ngForm()!.form.get('password');
        const confirmControl = this.ngForm()!.form.get('rePassword');

        if (passwordControl && confirmControl) {
          this.formErrorHandler.markAsPasswordMismatch(
            passwordControl,
            confirmControl
          );
        }
      }
    });

    // Reactive effect: whenever the callback signal is set, validate the form and, if valid, execute the callback.
    effect(() => {
      if (this.callback()) {
        this.checkForm();
        if (!this.ngForm()?.valid) {
          return;
        }

        this.handleCallback();
      }
    });
  }

  /**
   * Executes the callback function passed from the parent component when the form is submitted.
   *
   * Steps:
   * 1. Retrieves the current form data in a type-safe object.
   * 2. If the form data is invalid or undefined, it exits early.
   * 3. Calls the parent-provided callback function asynchronously with the form data.
   * 4. Logs the callback result for debugging purposes.
   * 5. If the callback succeeds (returns `true`):
   *    - Emits `true` via the DialogHandler to close the dialog.
   * 6. If the callback fails (returns `false`):
   *    - Emits an event to notify the parent that the callback was disabled.
   *    - Marks all form controls with an execution error to visually indicate the failure.
   */
  async handleCallback() {
    // Step 1: Get structured form data from the form signals
    const formResult = this.getFormResult();

    // Step 2: Exit early if form is invalid or empty
    if (!formResult) {
      return;
    }

    // Step 3: Execute the callback function with the form result
    const result = await this.callback()!(formResult);

    // Step 4: Debug log of the callback result
    console.log('form result: ', result);

    // Step 5: Handle success case
    if (result) {
      // Notify DialogHandler to close the dialog
      this.dialog.dailogEmitter(true);
    } else {
      // Step 6: Handle failure case
      // Notify parent that the callback failed
      this.disableCallback.emit();

      // Mark all form controls with an error so user sees validation feedback
      for (const [controlName, control] of Object.entries(
        this.ngForm()!.controls
      )) {
        control.setErrors({ executeError: true });
      }
    }
  }

  /** Returns the current active dialog key used to determine form structure. */
  protected getActualObject(): FieldKey | undefined {
    const actualContent = this.dialog.activeContent();
    return actualContent ? (actualContent as FieldKey) : undefined;
  }

  /**
   * Dynamically generates getter and setter accessors for form signals.
   * Useful for programmatically reading or updating signal-based fields.
   */
  protected getterSetter(fieldName: FormFieldModel) {
    return {
      get: () => (this as any)[fieldName],
      set: (value: any) => ((this as any)[fieldName] = value),
    };
  }

  /**
   * Applies error checking for a given form control,
   * using the corresponding template-defined validation keys.
   */

  protected setErrorsOnOneField(controlName: string): void {
    const actualContol = this.ngForm()?.form.get(controlName);
    const fieldTemplate = this.templates.get(this.dialog.activeContent()!);

    if (actualContol && fieldTemplate) {
      const templateOfActualField = fieldTemplate.find(
        (field) => field.field === controlName
      );
      if (templateOfActualField?.errorKeys) {
        //console.log( ...templateOfActualField.errorKeys)
        this.formErrorHandler.checkErrors(
          actualContol,
          ...templateOfActualField.errorKeys
        );
      }
    }
  }

  /**
   * Validates all form controls against their predefined error keys.
   *
   * Steps:
   * 1. Ensures that the form reference (`ngForm`) exists. If not, throws an error.
   * 2. Checks that the current dialog content is associated with a form.
   *    - If the content is `undefined`, `error`, or `message`, it throws an error
   *      because these dialog types should not use a form template.
   * 3. Iterates over each field template for the active dialog content:
   *    - Retrieves the corresponding form control from the `ngForm`.
   *    - If the control exists and there are validation keys defined in the template,
   *      it delegates the error checking to the `formErrorHandler` service.
   * 4. Catches any runtime errors during validation and logs them for debugging.
   */
  checkForm(): void {
    try {
      // Step 1: Verify that the form exists
      if (!this.ngForm()) throw new Error('ngForm is undefined');

      // Step 2: Ensure the dialog content is associated with a form template
      if ([undefined, 'error', 'message'].includes(this.dialog.activeContent()))
        throw new Error(
          `The content "${this.dialog.activeContent()}" should not be associated with a form-dialog template.`
        );

      // Step 3: Iterate over each field template and validate corresponding control
      for (const fieldTemplate of this.#formTemplate.formFieldMap.get(
        this.dialog.activeContent()!
      )!) {
        const control = this.ngForm()?.form.get(fieldTemplate.field);

        if (control && fieldTemplate.errorKeys) {
          // Delegate error checking to the formErrorHandler service
          this.formErrorHandler.checkErrors(
            control,
            ...fieldTemplate.errorKeys!
          );
        }
      }
    } catch (error) {
      // Step 4: Log any errors encountered during form validation
      console.log(error);
    }
  }

  /**
   * Resets all signal-based values to their defaults.
   * Typically triggered when the form is closed or switched.
   */
  protected resetSignals(): void {
    this.hardness = 1;
    this.primaryColor = this.theme.primaryColor ?? '#fff';
    this.accentColor = this.theme.accentColor ?? '#fff';
    this.gameName = '';
    this.email = '';
    this.password = '';
    this.rePassword = '';
    this.opponent = 'computer';
    this.size = 3;
  }

  /**
   * Clears all validation errors in the current form.
   * Restores each field’s pristine and untouched state.
   */
  protected clearFormErrors(): void {
    const currentForm = this.ngForm()?.form;
    const activeTemplate = this.templates.get(this.dialog.activeContent()!);

    if (currentForm && activeTemplate) {
      for (const field of activeTemplate) {
        const control = currentForm.get(field.field);
        if (control) {
          if ('clearErrors' in this.formErrorHandler) {
            this.formErrorHandler.clearErrors(control);
          } else {
            control.setErrors(null);
            control.markAsPristine();
            control.markAsUntouched();
          }
        }
      }
    }
  }

  /**
   * Emits a structured, type-safe form result when validation passes.
   * Uses the helper service to infer expected field types dynamically.
   */
  protected getFormResult(): Record<string, string | number> | undefined {
    if (this.ngForm()?.valid) {
      const type = this.helperFunctions.specificFieldTypeByName(
        this.getActualObject()!,
        this.#formTemplate.formFieldMap.get(this.getActualObject()!)!
      );

      const result: typeof type = {};

      for (const key of Object.keys(type)) {
        result[key] = this.getterSetter(key as FormFieldModel).get()();
      }

      return result;
    }

    return undefined;
  }

  /**
   * Restores previous values for all properties prefixed with "previous".
   *
   * Example:
   * - previousPrimaryColor → primaryColor
   * - previousAccentColor → accentColor
   *
   * Throws an error if a matching target property does not exist.
   */
  protected resetProperties(): void {
    const previousObject: Partial<Record<keyof this, unknown>> = {};

    for (const key of Object.keys(this) as (keyof this)[]) {
      if (String(key).startsWith('previous') && !String(key).includes('_')) {
        previousObject[key] = this[key];
      }
    }

    for (const key of Object.keys(
      previousObject
    ) as (keyof typeof previousObject)[]) {
      const currentKey = String(key).replace(/^previous/, '');
      const formattedKey =
        currentKey.charAt(0).toLowerCase() + currentKey.slice(1);

      if (formattedKey in this) {
        (this as any)[formattedKey] = previousObject[key];
      } else {
        throw new Error(
          `resetProperties(): property "${formattedKey}" does not exist on DialogForm`
        );
      }
    }

    this.dialog.dailogEmitter(false);
  }
}
