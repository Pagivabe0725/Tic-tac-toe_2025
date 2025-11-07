import { Component, computed, inject, Signal } from '@angular/core';
import { DialogHandler } from '../../services/dialog-handler.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { DialogForm } from './dialog-form/dialog-form';
import { Functions } from '../../services/functions.service';
import { FormTemplate } from '../../services/form-template.service';
import { GameLogic } from '../../services/game-logic.service';
import { Auth } from '../../services/auth.service';

/**
 * Main dialog container component.
 *
 * This component renders and controls modal dialogs for:
 * – authentication (login / registration)
 * – game settings
 * – visual settings
 * – saving games
 * – informational sections
 *
 * It coordinates with:
 * – DialogHandler → manages dialog state
 * – DialogForm → handles dynamic form rendering
 * – FormTemplate → provides form metadata configuration
 * – Auth → login / registration handling
 * – GameLogic → updating game settings
 */
@Component({
  selector: 'app-dialog',
  imports: [DialogForm],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  /** DialogHandler controls visibility and active content type. */
  #dialog: DialogHandler = inject(DialogHandler);

  /** GameLogic updates gameplay settings. */
  #game: GameLogic = inject(GameLogic);

  /** Authentication API for login and registration. */
  #auth: Auth = inject(Auth);

  /**
   * Currently active dialog content (e.g., 'login', 'registration', 'game_setting').
   * Used to decide which form and which handler logic should run.
   */
  protected dialogContent: Signal<DialogContent> = this.#dialog.activeContent;

  /** Emits a reset/reject intention to the DialogForm child component. */
  protected rejectEmitter = false;

  protected callback?:Function

  /**
   * Dynamically computed dialog title based on active dialog content.
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

  protected message = this.#dialog.message;

  /** Closes the dialog by notifying DialogHandler. */
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
   * Utility method for introspecting the controls of a FormGroup or object.
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

  /**
   * Emits data from the dialog outward through DialogHandler.
   */
  protected emitData(value: any): void {
    this.#dialog.dailogEmitter(value);
  }



  /**
   * Toggles between login <-> registration dialogs.
   */
  protected toggleAuthMode(): void {
    this.#dialog.activeContent =
      this.dialogContent() === 'login' ? 'registration' : 'login';
  }

  /**
   * Applies game setting changes (board size, opponent, difficulty).
   * Object keys must match GameLogic service property names.
   */
  protected setGameRules(rules: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(rules)) {
      try {
        (this.#game as any)[key] = value;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    return true;
  }

  /**
   * Handles registration form submission.
   *
   * @returns `true` if registration succeeded, `false` otherwise.
   * NOTE:
   * - Signup returns userId (string) on success.
   * - undefined if backend rejects.
   */
  protected async registration(datas: any): Promise<boolean> {
    const { email, password, rePassword } = datas;

    if (email && password && rePassword) {
      const succsess = await this.#auth.signup(email, password, rePassword);
      if (succsess) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handles login form submission.
   *
   * - Auth service returns user data on success, or undefined on failure.
   */
  protected async login(datas: any): Promise<boolean> {
    const { email, password } = datas;
    let succsess;
    if (email && password) {
      succsess = await this.#auth.login(email, password);
    } else return false;

    console.log('succsess:', succsess)
    if (succsess) {
      this.#auth.user = succsess;
      return true;
    }
    return false;
  }

  /**
   * Selects the appropriate handler function based on active dialog type.
   *
   * NOTE: We bind `this` explicitly so that internal private fields (#auth, #game)
   * remain accessible inside the handler methods.
   */
  choseHandlerFunction(): Function | undefined {
    switch (this.#dialog.activeContent()) {
      case 'login':
        return this.login.bind(this);
      case 'registration':
        return this.registration.bind(this);
      case 'setting':
        return (datas:any)=>{this.#dialog.dailogEmitter(true)}
      case 'game_setting':
        return this.setGameRules.bind(this);
      default:
        return undefined;
    }
  }

  acceptButton() {
    if (![undefined, 'error', 'message'].includes(this.dialogContent())) {
      this.callback=this.choseHandlerFunction()
    } else if (
      this.dialogContent() &&
      ['error', 'message'].includes(this.dialogContent()!)
    ) {
      this.emitData(true);
    }
  }

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
