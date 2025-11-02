import {
  Component,
  effect,
  inject,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { Theme } from '../../../services/theme.service';
import { FORM_FIELDS_MAP } from '../../../utils/constants/dialog-form-pattern.constant';
import {
  FieldKey,
  FormField,
  FormFieldModel,
} from '../../../utils/types/dialog-form-field-model.type';
import { Form } from '../../../services/form.service';

/**
 * Component representing a dynamic dialog form that adapts
 * its structure based on the currently active dialog content.
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
   * Service for managing the dialog state, content, and emission.
   */
  protected dialog: DialogHandler = inject(DialogHandler);

  /**
   * Service responsible for storing and applying theme colors.
   */
  protected theme: Theme = inject(Theme);

  /**
   * Map containing predefined form field configurations
   * for each dialog content type.
   */
  protected templates = FORM_FIELDS_MAP;

  /**
   * placeholder
   */

  protected formHandler: Form = inject(Form);

  /**
   * Signal storing the current hardness level.
   */
  #hardness: WritableSignal<number> = signal(1);

  /**
   * Signal storing the current primary color from the theme or default value.
   */
  #primaryColor: WritableSignal<string> = signal(
    this.theme.primaryColor ?? '#fff'
  );

  /**
   * Signal storing the current accent color from the theme or default value.
   */
  #accentColor: WritableSignal<string> = signal(
    this.theme.accentColor ?? '#fff'
  );

  /**
   * Signal storing the current game name entered by the user.
   */
  #gameName: WritableSignal<string> = signal('');

  /**
   * Signal storing the email address input by the user.
   */
  #email: WritableSignal<string> = signal('');

  /**
   * Signal storing the user’s password input.
   */
  #password: WritableSignal<string> = signal('');

  /**
   * Signal storing the repeated password value for confirmation.
   */
  #rePassword: WritableSignal<string> = signal('');

  /**
   * Signal storing the current opponent selection (e.g., computer or player).
   */
  #opponent: WritableSignal<string> = signal('computer');

  /**
   * Signal storing the selected game board size.
   */
  #size: WritableSignal<number> = signal(3);

  /**
   * Getter for the hardness signal.
   */
  protected get hardness(): WritableSignal<number> {
    return this.#hardness;
  }

  /**
   * Setter for updating the hardness signal value.
   * @param value - New numeric hardness value.
   */
  protected set hardness(value: number) {
    this.#hardness.set(value);
  }

  /**
   * Getter for the primary color signal.
   */
  protected get primaryColor(): WritableSignal<string> {
    return this.#primaryColor;
  }

  /**
   * Setter for updating the primary color signal.
   * @param value - New hexadecimal color value.
   */
  protected set primaryColor(value: string) {
    this.#primaryColor.set(value);
  }

  /**
   * Getter for the accent color signal.
   */
  protected get accentColor(): WritableSignal<string> {
    return this.#accentColor;
  }

  /**
   * Setter for updating the accent color signal.
   * @param value - New hexadecimal color value.
   */
  protected set accentColor(value: string) {
    this.#accentColor.set(value);
  }

  /**
   * Getter for the game name signal.
   */
  protected get gameName(): WritableSignal<string> {
    return this.#gameName;
  }

  /**
   * Setter for updating the game name signal.
   * @param value - New string representing the game name.
   */
  protected set gameName(value: string) {
    this.#gameName.set(value);
  }

  /**
   * Getter for the email signal.
   */
  protected get email(): WritableSignal<string> {
    return this.#email;
  }

  /**
   * Setter for updating the email signal.
   * @param value - New email string value.
   */
  protected set email(value: string) {
    this.#email.set(value);
  }

  /**
   * Getter for the password signal.
   */
  protected get password(): WritableSignal<string> {
    return this.#password;
  }

  /**
   * Setter for updating the password signal.
   * @param value - New password string value.
   */
  protected set password(value: string) {
    this.#password.set(value);
  }

  /**
   * Getter for the rePassword signal.
   */
  protected get rePassword(): WritableSignal<string> {
    return this.#rePassword;
  }

  /**
   * Setter for updating the rePassword signal.
   * @param value - New password confirmation string value.
   */
  protected set rePassword(value: string) {
    this.#rePassword.set(value);
  }

  /**
   * Getter for the opponent signal.
   */
  protected get opponent(): WritableSignal<string> {
    return this.#opponent;
  }

  /**
   * Setter for updating the opponent signal.
   * @param value - New string representing the selected opponent.
   */
  protected set opponent(value: string) {
    this.#opponent.set(value);
  }

  /**
   * Getter for the size signal.
   */
  protected get size(): WritableSignal<number> {
    return this.#size;
  }

  /**
   * Setter for updating the size signal.
   * @param value - New numeric size value.
   */
  protected set size(value: number) {
    this.#size.set(value);
  }

  /**
   * Signal referencing the current NgForm instance within the template.
   */
  protected form: Signal<NgForm | undefined> = viewChild('form', {
    read: NgForm,
  });

  /**
   * Initializes the component and sets up reactive effects to manage form state and validation.
   *
   * - The first effect monitors changes in the active dialog content.  
   *   When the content switches, it resets all signal-based values and clears validation errors.
   *
   * - The second effect watches the `password` and `rePassword` signals.  
   *   If both are defined and their values differ, it retrieves the corresponding form controls
   *   and calls `formHandler.markAsPasswordMismatch()` to register a mismatch error.
   */
  constructor() {
    let previousContent = this.dialog.activeContent();
    effect(() => {
      if (this.dialog.activeContent() !== previousContent) {
        this.resetSignals();
        this.clearFormErrors()
        previousContent = this.dialog.activeContent();
      }
    });

    effect(() => {
      const password = this.password();
      const rePassword = this.rePassword();

      if (password && rePassword && password !== rePassword) {
        const passwordControl = this.form()!.form.get('password') ?? undefined;
        const confirmControl = this.form()!.form.get('rePassword') ?? undefined;

        if (passwordControl && confirmControl)
          this.formHandler.markAsPasswordMismatch(
            passwordControl,
            confirmControl
          );
      }
    });
  }

  /**
   * Returns the currently active dialog key used to determine which form to render.
   * @returns The active FieldKey or undefined if no dialog is active.
   */
  protected getActualObject(): FieldKey | undefined {
    const actualContent = this.dialog.activeContent();
    return actualContent ? (actualContent as FieldKey) : undefined;
  }

  /**
   * Provides getter and setter accessors for dynamically manipulating
   * field values using their model names.
   * @param fieldName - Name of the form field model.
   * @returns An object containing get() and set(value) functions.
   */
  protected getterSetter(fieldName: FormFieldModel) {
    return {
      get: () => (this as any)[fieldName],
      set: (value: any) => ((this as any)[fieldName] = value),
    };
  }

  protected setErrors(controlName: string): void {
    const actualContol: AbstractControl | undefined =
      this.form()?.form.get(controlName) ?? undefined;
    const fieldTemplate: FormField[] | undefined =
      FORM_FIELDS_MAP.get(this.dialog.activeContent()!) ?? undefined;
    if (actualContol && fieldTemplate) {
      const templateOfActualField = fieldTemplate.find(
        (field) => field.field === controlName
      );
      if (templateOfActualField && templateOfActualField.errorKeys) {
        this.formHandler.checkErrors(
          actualContol,
          ...templateOfActualField.errorKeys
        );
      }
    }
  }

  /**
   * Resets all signal-based form data to their default values
   * using the component's setters to ensure consistency.
   *
   * This is typically used when closing or resetting a dialog form.
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
   * Clears validation errors from all existing form controls.
   * Iterates through each known field in the active form template
   * and resets its validation and visual state.
   */
  protected clearFormErrors(): void {
    const currentForm = this.form()?.form;
    const activeTemplate = FORM_FIELDS_MAP.get(this.dialog.activeContent()!);

    if (currentForm && activeTemplate) {
      for (const field of activeTemplate) {
        const control = currentForm.get(field.field);
        if (control) {
          if ('clearErrors' in this.formHandler) {
            (this.formHandler as any).clearErrors(control);
          } else {
            control.setErrors(null);
            control.markAsPristine();
            control.markAsUntouched();
          }
        }
      }
    }
  }


  
  
}
