import { Component, computed, inject, Signal } from '@angular/core';
import { DialogHandler } from '../../services/dialog-handler.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { DialogForm } from './dialog-form/dialog-form';
import { Functions } from '../../services/functions.service';
import { FormTemplate } from '../../services/form-template.service';
import { DIALOG_CONTENT } from '../../utils/constants/dialog-content.constant';
import { FieldKey } from '../../utils/types/dialog-form-field-model.type';
import { GameLogic } from '../../services/game-logic.service';

/**
 * Represents a reusable dialog component that manages modal windows
 * for various application contexts such as authentication, settings,
 * and game configuration.
 *
 * @remarks
 * - The dialog dynamically updates its title and content based on the
 *   current active state managed by `DialogHandler`.
 * - It serves as a container and event bridge for the `DialogForm` component.
 */
@Component({
  selector: 'app-dialog',
  imports: [DialogForm],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  /**
   * Service responsible for managing dialog visibility, state, and active content.
   */
  #dialog: DialogHandler = inject(DialogHandler);

  /**
   * placeholder
   */

  #game: GameLogic = inject(GameLogic);

  /**
   * Utility service providing helper functions for data manipulation and conversions.
   */
  private helperFunctions: Functions = inject(Functions);

  /**
   * placeholder
   */
  #formTemplate: FormTemplate = inject(FormTemplate);

  /**
   * Signal representing the currently active dialog content type.
   * Determines which form configuration and UI layout are rendered.
   */
  protected dialogContent: Signal<DialogContent> = this.#dialog.activeContent;

  /**
   * Flag controlling whether a form request should be emitted.
   * When `true`, the form submission process is triggered.
   */
  protected requestEmitter = false;

  /**
   * Flag controlling whether a rejection/reset action should be emitted.
   * Typically used when the user declines changes or cancels an operation.
   */
  protected rejectEmitter = false;

  /**
   * Computed property dynamically generating the dialog’s title
   * based on the current active content type.
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
   * Closes the active dialog window by calling the `DialogHandler` service.
   */
  protected closeDialog(): void {
    this.rejectEmitter = true;
  }

  /**
   * Extracts and logs all control keys from a given form or control object.
   *
   * @param controls - A `FormGroup` instance or a plain object containing form controls.
   *
   * @remarks
   * Useful for debugging or introspection of dynamically generated forms.
   */
  protected getControls(
    controls: Record<string, AbstractControl> | FormGroup
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
   * Emits a payload (data or state) from the dialog to the parent component or service.
   *
   * @param value - Any value to emit, commonly form data or action results.
   */
  protected emitData(value: any): void {
    this.#dialog.dailogEmitter(value);
  }

  /**
   * Handles form submission results received from the child `DialogForm` component.
   *
   * @param result - The emitted form data object.
   *
   * @remarks
   * After logging or processing the result, the `requestEmitter`
   * flag is reset to prevent redundant emissions.
   */
  clickEvent(result: object): void {
    const type = this.getCurrentFieldType()!;
    const game = result as typeof type;
    this.setGameRules(game);
    this.requestEmitter = false;
  }

  /**
   * Switches between login and registration dialogs.
   *
   * @remarks
   * Triggered by a “Create an account” or “Back to login” link click.
   */
  protected toggleAuthMode(): void {
    this.#dialog.activeContent =
      this.dialogContent() === 'login' ? 'registration' : 'login';
  }

  protected getCurrentFieldType() {
    return this.helperFunctions.specificFieldTypeByName(
      this.dialogContent()!,
      this.#formTemplate.formFieldMap.get(this.dialogContent()!)!
    );
  }
  
  protected setGameRules(rules:any): void {
    
    console.log(rules);
    for (const [key, value] of Object.entries(rules)) {
      try {
        (this.#game as any)[key] = value;
      } catch (error) {
        console.error(error)
      }
    }
    this.emitData(true)
  }
}
