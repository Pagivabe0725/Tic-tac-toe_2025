import {
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { DialogHandler } from '../../services/dialog-handler.service';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { DialogContent } from '../../utils/types/dialog-content.type';

/**
 * Represents a reusable dialog component that handles different modal contents
 * such as login, registration, game settings, and others.
 *
 * @remarks
 * The component dynamically adapts its content and title
 * based on the active dialog type provided by `DialogHandler`.
 *
 * It also integrates the `Form` service for handling form validation logic
 * and error management for each dialog-specific form.
 */
@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  /**
   * Service responsible for managing dialog visibility, state, and active content.
   */
  #dialog: DialogHandler = inject(DialogHandler);

  /**
   * Represents the currently active dialog content type.
   * This determines which form fields and layout are rendered.
   */
  protected dialogContent: Signal<DialogContent> = this.#dialog.activeContent;

  /**
   * Dynamically computes the dialog title based on the current dialog content.
   * For example, if the content is `'login'`, the title will be `"Login"`.
   */
  protected title = computed(() => {
    switch (this.#dialog.activeContent() as DialogContent) {
      case 'game_setting':
        return 'Game Settings';
      case 'save':
        return 'Save';
      case 'setting':
        return 'Settings';
      case 'login':
        return 'Login';
      case 'registration':
        return 'Registration';
      case 'info':
        return 'Information';
      default:
        return 'Title';
    }
  });

  /**
   * Closes the currently active dialog using the `DialogHandler` service.
   */
  protected closeDialog(): void {
    this.#dialog.close();
  }

  /**
   * Extracts and logs all control keys from a given form or control object.
   *
   * @param controls - A `FormGroup` or an object containing form controls.
   *
   * @remarks
   * This utility helps inspect dynamic or nested form structures,
   * ensuring that all control keys can be accessed programmatically.
   */
  protected getControls(
    controls: { [key: string]: AbstractControl } | FormGroup
  ): void {
    let keys: string[] = [];

    if (controls instanceof FormGroup) {
      keys = Object.keys(controls.getRawValue());
    } else if (controls && typeof controls === 'object') {
      keys = Object.keys(controls);
      if (!keys.length) {
        keys = Object.getOwnPropertyNames(controls);
      }
    }
  }

  /**
   * Emits a data payload from the dialog to the parent or a listening service.
   *
   * @param value - The value or object to emit.
   *
   * @remarks
   * Typically used when a dialog form is submitted, allowing the
   * `DialogHandler` to propagate the data to other parts of the application.
   */
  protected emitData(value: any): void {
    this.#dialog.dailogEmitter(value);
  }

  /**
   * Toggles between the "Login" and "Registration" dialog modes.
   *
   * @remarks
   * Used when the user clicks a link like “Create an account” or “Back to login”.
   */
  protected toggleAuthMode(): void {
    this.#dialog.activeContent =
      this.dialogContent() === 'login' ? 'registration' : 'login';
  }
}
