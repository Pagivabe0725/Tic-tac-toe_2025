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
  /** Service managing dialog visibility, state, and active content. */
  protected dialog: DialogHandler = inject(DialogHandler);

  /** Service responsible for managing and persisting theme colors. */
  protected theme: Theme = inject(Theme);

  /** Service handling form validation and error registration. */
  protected formErrorHandler: FormError = inject(FormError);

  /** Service providing predefined form field templates per dialog type. */
  #formTemplate: FormTemplate = inject(FormTemplate);

  /** Utility service with generic helper functions. */
  protected helperFunctions: Functions = inject(Functions);

  /** Mapping of available form field templates by dialog key. */
  protected templates = this.#formTemplate.formFieldMap;


  /** Output emitter sending the validated form result to the parent. */
  formResponse: OutputEmitterRef<object> = output();

  /** Input signal that triggers a rejection/reset of unsaved changes. */
  rejectChanges: InputSignal<boolean> = input.required();

  /**
   * placeholder
   */
  callback: InputSignal<Function | undefined> = input.required();

  /**
   * placeholder
   */
  disableCallback: OutputEmitterRef<void> = output()

  /** Reactive signal representing the current difficulty level (1–4). */
  #hardness: WritableSignal<number> = signal(1);

  /** Reactive signal for the current primary color. */
  #primaryColor: WritableSignal<string> = signal(
    this.theme.primaryColor ?? '#fff'
  );

  /** Stores the previous primary color for easy restoration. */
  private previousPrimaryColor = this.#primaryColor();

  /** Reactive signal for the current accent color. */
  #accentColor: WritableSignal<string> = signal(
    this.theme.accentColor ?? '#fff'
  );

  /** Stores the previous accent color for easy restoration. */
  private previousAccentColor = this.#accentColor();

  /** Reactive signal for the current game name. */
  #gameName: WritableSignal<string> = signal('');

  /** Reactive signal for the user’s email address. */
  #email: WritableSignal<string> = signal('');

  /** Reactive signal for the user's entered password. */
  #password: WritableSignal<string> = signal('');

  /** Reactive signal for the repeated password confirmation. */
  #rePassword: WritableSignal<string> = signal('');

  /** Reactive signal representing the selected opponent. */
  #opponent: WritableSignal<string> = signal('computer');

  /** Reactive signal representing the selected game board size. */
  #size: WritableSignal<number> = signal(3);

  /** Getter and setter for hardness level. */
  protected get hardness(): WritableSignal<number> {
    return this.#hardness;
  }
  protected set hardness(value: number) {
    this.#hardness.set(value);
  }

  /** Getter and setter for primary color. */
  protected get primaryColor(): WritableSignal<string> {
    return this.#primaryColor;
  }
  protected set primaryColor(value: string) {
    this.#primaryColor.set(value);
  }

  /** Getter and setter for accent color. */
  protected get accentColor(): WritableSignal<string> {
    return this.#accentColor;
  }
  protected set accentColor(value: string) {
    this.#accentColor.set(value);
  }

  /** Getter and setter for game name. */
  protected get gameName(): WritableSignal<string> {
    return this.#gameName;
  }
  protected set gameName(value: string) {
    this.#gameName.set(value);
  }

  /** Getter and setter for email. */
  protected get email(): WritableSignal<string> {
    return this.#email;
  }
  protected set email(value: string) {
    this.#email.set(value);
  }

  /** Getter and setter for password. */
  protected get password(): WritableSignal<string> {
    return this.#password;
  }
  protected set password(value: string) {
    this.#password.set(value);
  }

  /** Getter and setter for repeated password. */
  protected get rePassword(): WritableSignal<string> {
    return this.#rePassword;
  }
  protected set rePassword(value: string) {
    this.#rePassword.set(value);
  }

  /** Getter and setter for opponent. */
  protected get opponent(): WritableSignal<string> {
    return this.#opponent;
  }
  protected set opponent(value: string) {
    this.#opponent.set(value);
  }

  /** Getter and setter for game board size. */
  protected get size(): WritableSignal<number> {
    return this.#size;
  }
  protected set size(value: number) {
    this.#size.set(value);
  }

  /** References the form element from the template. */
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

    /*
    effect(() => {
      if (this.ngForm()) {
        this.#controls = [];
        for (const formField of this.#formTemplate.formFieldMap.get(
          this.dialog.activeContent()!
        )!) {
          const contol = this.ngForm()!.form.get(formField.field);
          if (contol) this.#controls.push(contol);
        }
         console.log(this.ngForm())
      console.log('Controls')
      console.log(this.#controls)
      }
     
    });
    */

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

  async handleCallback() {
    const formResult = this.getFormResult();
    if (!formResult) {
      return;
    }
    const result = await this.callback()!(formResult);
    console.log('form result: ', result);
    if (result) {
      this.dialog.dailogEmitter(true);
    } else {
      this.disableCallback.emit()
      for (const [control, value] of Object.entries(this.ngForm()!.controls)) {
        value.setErrors({ executeError: true });
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
        this.formErrorHandler.checkErrors(
          actualContol,
          ...templateOfActualField.errorKeys
        );
      }
    }
  }

  checkForm(): void {
    try {
      if (!this.ngForm()) throw new Error('ngForm is undefined');
      if ([undefined, 'error', 'message'].includes(this.dialog.activeContent()))
        throw new Error(
          `The content "${this.dialog.activeContent()}" should not be associated with a form-dialog template.`
        );

      for (const fieldTemplate of this.#formTemplate.formFieldMap.get(
        this.dialog.activeContent()!
      )!) {
        const control = this.ngForm()?.form.get(fieldTemplate.field);
        if (control && fieldTemplate.errorKeys) {
          this.formErrorHandler.checkErrors(
            control,
            ...fieldTemplate.errorKeys!
          );
        }
      }
    } catch (error) {
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
            (this.formErrorHandler as any).clearErrors(control);
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
    const previousObject: Record<string, any> = {};

    for (const [key, value] of Object.entries(this as any)) {
      if (key.includes('previous') && !key.includes('_')) {
        previousObject[key] = value;
      }
    }

    for (const [key, value] of Object.entries(previousObject)) {
      const currentKey = key.replace(/^previous/, '');
      const formattedKey =
        currentKey.charAt(0).toLowerCase() + currentKey.slice(1);
      if (formattedKey in (this as any)) {
        (this as any)[formattedKey] = value;
      } else {
        throw new Error(
          `resetProperties(): property "${formattedKey}" does not exist on DialogForm`
        );
      }
    }
    this.dialog.dailogEmitter(false);
  }
}
