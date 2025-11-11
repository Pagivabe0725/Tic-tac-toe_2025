import { Component, computed, inject, Signal } from '@angular/core';
import { DialogHandler } from '../../services/dialog-handler.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { DialogForm } from './dialog-form/dialog-form';
import { Auth } from '../../services/auth.service';
import { modifyGameState } from '../../store/actions/game-modify.action';
import { Store } from '@ngrx/store';
import { GameState } from '../../utils/interfaces/game-state.interface';

/**
 * Main dialog container component.
 *
 * This component manages and renders modal dialogs for various purposes:
 * - Authentication: login or registration
 * - Game settings
 * - Visual settings
 * - Saving games
 * - Informational messages
 *
 * It coordinates with:
 * - DialogHandler → manages dialog state and visibility
 * - DialogForm → handles dynamic form rendering
 * - Auth → authentication actions (login/registration)
 * - Store → updates game state for game settings
 */
@Component({
  selector: 'app-dialog',
  imports: [DialogForm],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
/** 
 * {@link DialogHandler} manages the visibility and active content of dialogs.
 */
#dialog: DialogHandler = inject(DialogHandler);

/** 
 * {@link Auth} service used for login and registration operations.
 */
#auth: Auth = inject(Auth);

/** 
 * {@link Store} used to dispatch game state modifications.
 */
#store: Store = inject(Store);


  /**
   * Signal representing the currently active dialog content type.
   * Example values: 'login', 'registration', 'game_setting', 'setting', etc.
   */
  protected dialogContent: Signal<DialogContent> = this.#dialog.activeContent;

  /** Flag to notify DialogForm to reset or reject unsaved changes. */
  protected rejectEmitter = false;

  /** Callback function executed when the user accepts the dialog. */
  protected callback?: Function;

  /**
   * Dynamically computed dialog title based on the currently active content.
   * If the content is a message or error type, the title is provided by DialogHandler.
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
      case 'message':
        return this.#dialog.title;
      case 'error':
        return this.#dialog.title;
      default:
        return 'Title';
    }
  });

  /** Message to display inside the dialog, if applicable. */
  protected message = this.#dialog.message;

  /** Closes the dialog or triggers a reject event depending on dialog type. */
  protected closeDialog(): void {
    if (!['error', 'message', undefined].includes(this.dialogContent()))
      this.rejectEmitter = true;
    else if (
      this.dialogContent() &&
      ['error', 'message'].includes(this.dialogContent()!)
    )
      this.emitData(false);
  }

  /**
   * Utility function for inspecting the keys of a FormGroup or plain object.
   * Useful for debugging dynamically generated forms.
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

  /** Emits a value outward through DialogHandler to notify parent components. */
  protected emitData(value: unknown): void {
    this.#dialog.dailogEmitter(value);
  }

  /** Toggles between login and registration dialogs. */
  protected toggleAuthMode(): void {
    this.#dialog.activeContent =
      this.dialogContent() === 'login' ? 'registration' : 'login';
  }

  /**
   * Applies new game rules by dispatching a modification to the store.
   * @param rules Key-value mapping of game state properties to update.
   * @returns Always returns true.
   */
  protected setGameRules(
    rules: Record<keyof GameState, string | number>
  ): boolean {
    this.#store.dispatch(modifyGameState(rules as GameState));
    return true;
  }

  /**
   * Handles registration form submission.
   * Calls the Auth service to register a new user.
   * @param datas Object containing email, password, and repeated password.
   * @returns True if registration succeeds, false otherwise.
   */
  protected async registration(datas: {
    email: string;
    password: string;
    rePassword: string;
  }): Promise<boolean> {
    const { email, password, rePassword } = datas;

    if (email && password && rePassword) {
      const success = await this.#auth.signup(email, password, rePassword);
      if (success) return true;
    }

    return false;
  }

  /**
   * Handles login form submission.
   * Calls the Auth service to authenticate a user.
   * @param datas Object containing email and password.
   * @returns True if login succeeds, false otherwise.
   */
  protected async login(datas: { email: string; password: string }): Promise<boolean> {
    const { email, password } = datas;
    let succsess;
    if (email && password) {
      succsess = await this.#auth.login(email, password);
    } else return false;

    console.log('succsess:', succsess);
    if (succsess) {
      this.#auth.user = succsess;
      return true;
    }
    return false;
  }

  /**
   * Selects the appropriate handler function based on the active dialog content.
   * Each handler is bound to `this` to maintain access to private fields.
   * @returns Function to handle dialog acceptance, or undefined if none.
   */
  choseHandlerFunction(): Function | undefined {
    switch (this.#dialog.activeContent()) {
      case 'login':
        return this.login.bind(this);
      case 'registration':
        return this.registration.bind(this);
      case 'setting':
        return (datas: object) => {
          this.#dialog.dailogEmitter(true);
        };
      case 'game_setting':
        return this.setGameRules.bind(this);
      default:
        return undefined;
    }
  }

  /** Called when the user accepts the dialog. Assigns the callback function. */
  acceptButton() {
    if (![undefined, 'error', 'message'].includes(this.dialogContent())) {
      this.callback = this.choseHandlerFunction();
    } else if (
      this.dialogContent() &&
      ['error', 'message'].includes(this.dialogContent()!)
    ) {
      this.emitData(true);
    }
  }

  /** Called when the user rejects the dialog. Triggers rejectEmitter or emits false. */
  rejectButton() {
    if (![undefined, 'error', 'message'].includes(this.dialogContent())) {
      this.rejectEmitter = true;
    } else if (
      this.dialogContent() &&
      ['error', 'message'].includes(this.dialogContent()!)
    ) {
      this.emitData(false);
    }
  }
}
