import { Component, computed, inject, Signal } from '@angular/core';
import { Theme } from '../../services/theme.service';
import { DialogHandler } from '../../services/dialog-handler.service';
import { Auth } from '../../services/auth.service';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { Store } from '@ngrx/store';
import { modifyGameSettings } from '../../store/actions/game-settings-modify.action';
import { SnackBarHandler } from '../../services/snack-bar-handler.service';
import {
  SNACKBAR_FAILED_MESSAGES,
  SNACKBAR_SUCCESS_MESSAGES,
} from '../../utils/constants/snackbar-message.constant';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';
import {  RouterLink } from '@angular/router';

/**
 * @component Header
 *
 * Represents the application's main header section.
 *
 * Responsibilities:
 *  - Controls the global theme (light/dark) using {@link Theme}.
 *  - Opens and manages dialog windows via {@link DialogHandler}.
 *  - Handles user authentication state and logout through {@link Auth}.
 *  - Updates global settings in the store when relevant.
 */
@Component({
  selector: 'header[appHeader]',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  /**
   * Injected {@link Theme} service that manages the current theme mode.
   * Can be read or updated to switch between 'light' and 'dark' modes.
   */
  #theme = inject(Theme);

  /** NgRx store instance for dispatching global state changes. */
  #store: Store = inject(Store);

  /**
   * Injected {@link DialogHandler} service responsible for
   * opening and managing application dialogs.
   */
  #dialog = inject(DialogHandler);

  /**
   * Injected {@link Auth} service for handling user authentication.
   * Provides the current user and logout functionality.
   */
  #auth = inject(Auth);

  /**
   * Injected {@link SnackBarHandler} service used for displaying
   * success and error feedback messages through snackbars.
   * Provides methods for adding, removing, and auto-expiring notifications.
   */
  #snackbarHamdler: SnackBarHandler = inject(SnackBarHandler);

  /**
   * Computed signal indicating whether a user is currently logged in.
   * Returns `true` if a user exists, `false` otherwise.
   */
  readonly logged: Signal<boolean> = computed(() => {
    return this.#auth.user() !== undefined;
  });

  /**
   * Gets the current theme mode.
   *
   * @returns {'dark' | 'light'} The current UI theme.
   */
  get mode(): 'dark' | 'light' {
    return this.#theme.mode!;
  }

  /**
   * Sets a new theme mode.
   *
   * @param newMode {'dark' | 'light'} The desired UI theme.
   */
  set mode(newMode: 'dark' | 'light') {
    this.#theme.mode = newMode;
  }


  get userId():string{

    return this.#auth.user()!.userId
  }

  /**
   * Opens a dialog based on the given content type and handles the result.
   *
   * Once the dialog is closed, it evaluates the returned boolean:
   * – `true` means the user confirmed the action → shows the corresponding success snackbar.
   * – `false` means the user rejected/cancelled the action → shows the corresponding failure snackbar.
   * – `undefined` means the dialog closed without a decisive user action → no snackbar is shown.
   *
   * @param content The dialog type to open (see {@link DialogContent}).
   * @returns A promise that resolves once the dialog has been processed.
   */
  protected async openDialogByContent(content: DialogContent): Promise<void> {
    const result = await this.#dialog.openDialog(content);

    if (result !== undefined && result) {
      this.#snackbarHamdler.addElement(
        SNACKBAR_SUCCESS_MESSAGES.get(this.#dialog.lastContent)!,
        !result
      );
    } else if (result !== undefined && !result) {
      this.#snackbarHamdler.addElement(
        SNACKBAR_FAILED_MESSAGES.get(this.#dialog.lastContent)!,
        !result
      );
    }
  }

  /**
   * Logs out the current user after confirmation.
   *
   * Steps:
   * 1. Opens a confirmation dialog using {@link DialogHandler}.
   * 2. If the user confirms, calls {@link Auth.logout} to clear authentication.
   * 3. Resets the opponent to 'player' in both sessionStorage and NgRx store.
   * 4. Clears the local user reference.
   */
  protected async logout() {
    const result = await this.#dialog.openCustomDialog(
      'message',
      'Do you want to log out?',
      'logout',
      true
    );

    if (result) {
      await this.#auth.logout();

      sessionStorage.clear();
      this.#store.dispatch(modifyGameSettings({ opponent: 'player' }));
      this.#store.dispatch(modifyGameInfo({ actualBoard: undefined }));
      this.#auth.user = undefined;
    }
  }


}
