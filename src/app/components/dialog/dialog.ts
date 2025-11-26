import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Signal,
  viewChild,
} from '@angular/core';
import { DialogHandler } from '../../services/dialog-handler.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { DialogForm } from './dialog-form/dialog-form';
import { Auth } from '../../services/auth.service';
import { modifyGameSettings } from '../../store/actions/game-settings-modify.action';
import { Store } from '@ngrx/store';
import { GameSettings } from '../../utils/interfaces/game-settings.interface';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';
import { storageCleaner } from '../../utils/functions/storage-cleaner.function';
import { selectGameInfo } from '../../store/selectors/game-info.selector';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

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
export class Dialog implements AfterViewInit {
  /**
   * {@link DialogHandler} manages the visibility and active content of dialogs.
   */
  #dialogHandler: DialogHandler = inject(DialogHandler);

  /**
   * {@link Auth} service used for login and registration operations.
   */
  #auth: Auth = inject(Auth);

  /**
   * {@link Store} used to dispatch game state modifications.
   */
  #store: Store = inject(Store);

  /**
   * Injected {@link FocusTrapFactory} service from Angular CDK.
   * Used to create a focus trap inside the dialog for accessibility purposes.
   */
  #focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);

  /**
   * Instance of {@link FocusTrap} that manages focus containment within the dialog.
   * Initialized when the dialog is opened and destroyed on close.
   */
  private focusTrap!: FocusTrap;

  /**
   * Query for the dialog container element in the template.
   * Required because the focus trap needs a reference to the actual DOM element.
   * Uses {@link viewChild.required} to guarantee the element exists.
   */
  private dialog = viewChild.required<ElementRef | null>('dialogContainer');

  /**
   * Signal representing the currently active dialog content type.
   * Example values: 'login', 'registration', 'game_setting', 'setting', etc.
   */
  protected dialogContent: Signal<DialogContent> =
    this.#dialogHandler.activeContent;

  /** Flag to notify DialogForm to reset or reject unsaved changes. */
  protected rejectEmitter = false;

  /** Callback function executed when the user accepts the dialog. */
  protected callback?: Function;

  /**
   * Dynamically computed dialog title based on the currently active content.
   * If the content is a message or error type, the title is provided by DialogHandler.
   */
  protected title = computed(() => {
    switch (this.#dialogHandler.activeContent() as DialogContent) {
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
        return this.#dialogHandler.title;
      case 'error':
        return this.#dialogHandler.title;
      default:
        return 'Title';
    }
  });

  /** Message to display inside the dialog, if applicable. */
  protected message = this.#dialogHandler.message;

  /**
   * Indicates whether the dialog requires explicit user confirmation.
   * Returns true if the dialog is in a state where a choice/confirmation
   * from the user is expected.
   */
  get chooeable(): boolean {
    return !!this.#dialogHandler.choosable;
  }

  /**
   * Host listener for the Escape key.
   *
   * - Listens to the 'keydown.escape' event on the document.
   * - Casts the incoming generic Event to a {@link KeyboardEvent}.
   * - Calls {@link KeyboardEvent.preventDefault()} to stop the browser's default Escape behavior.
   * - Invokes {@link closeDialog} to close the dialog programmatically.
   *
   * This ensures that pressing Escape always closes the dialog while keeping focus management intact,
   * without triggering any unwanted browser behavior.
   *
   * @param event The raw event object from the host listener, cast to {@link KeyboardEvent}.
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.closeDialog();
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   *
   * Initializes the {@link FocusTrap} for the dialog to ensure keyboard focus
   * remains trapped within the dialog while it is open.
   *
   * - Uses the {@link dialog} ViewChild to get the container element.
   * - Creates a focus trap using {@link #focusTrapFactory}.
   * - Immediately focuses the initial focusable element inside the dialog.
   */
  ngAfterViewInit() {
    const dialogElelement = this.dialog();
    if (dialogElelement) {
      console.log(dialogElelement); // Optional: debug the element reference
      this.focusTrap = this.#focusTrapFactory.create(
        dialogElelement.nativeElement
      );
      this.focusTrap.focusInitialElement();
    }
  }

  protected closeDialog(): void {
    this.emitData(undefined);
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
    this.#dialogHandler.dailogEmitter(value);
  }

  /** Toggles between login and registration dialogs. */
  protected toggleAuthMode(): void {
    this.#dialogHandler.activeContent =
      this.dialogContent() === 'login' ? 'registration' : 'login';
  }

  /**
   * Applies the provided rule changes to the game configuration and
   * simultaneously resets the entire GameInfo state.
   *
   * This method ensures that modifying any game rule results in a fully
   * reinitialized game environment by:
   *  - updating the GameSettings with the given rule values,
   *  - clearing the current board and gameplay metadata,
   *  - resetting turn counters, timers, last move, and winner status,
   *  - removing all relevant sessionStorage entries from the previous game.
   *
   * After this operation, the next game always starts from a clean,
   * well-defined baseline that reflects the newly applied rules.
   *
   * @param {Record<keyof GameSettings, string | number>} rules
   *        A rule object containing the GameSettings properties to update.
   * @returns {boolean} Always returns true after the state reset and settings update.
   */

  protected setGameRules(
    rules: Record<keyof GameSettings, string | number>
  ): boolean {
    console.log('clear');
    this.#store.dispatch(modifyGameSettings(rules as GameSettings));
    this.#store.dispatch(
      modifyGameInfo({
        actualBoard: undefined,
        actualStep: 0,
        actualMarkup: 'o',
        lastMove: undefined,
        started: false,
        playerSpentTime: { player_O: 0, player_X: 0 },
        winner: null,
      })
    );
    const actualGameInfo = this.#store.selectSignal(selectGameInfo)();
    if (actualGameInfo) {
      storageCleaner('sessionStorage', true, ...Object.keys(actualGameInfo));
    }

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
  protected async login(datas: {
    email: string;
    password: string;
  }): Promise<boolean> {
    const { email, password } = datas;
    let succsess;
    if (email && password) {
      succsess = await this.#auth.login(email, password);
    } else return false;

    console.log('succsess:', succsess);
    if (succsess) {
      this.#auth.user = succsess;
      console.log('IN AUTH: ', this.#auth.user() )

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
    switch (this.#dialogHandler.activeContent()) {
      case 'login':
        return this.login.bind(this);
      case 'registration':
        return this.registration.bind(this);
      case 'setting':
        return (datas: object) => {
          this.#dialogHandler.dailogEmitter(true);
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

  /** Called when the user rejects the dialog. Triggers rejectEmitter or emits undefined. */
  rejectButton() {
    if (![undefined, 'error', 'message'].includes(this.dialogContent())) {
      this.rejectEmitter = true;
    } else if (
      this.dialogContent() &&
      ['error', 'message'].includes(this.dialogContent()!)
    ) {
      this.emitData(undefined);
    }
  }
}
