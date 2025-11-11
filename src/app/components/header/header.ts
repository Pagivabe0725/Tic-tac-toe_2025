import { Component, computed, inject, signal, Signal } from '@angular/core';
import { Theme } from '../../services/theme.service';
import { DialogHandler } from '../../services/dialog-handler.service';
import { Auth } from '../../services/auth.service';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';
import { Store } from '@ngrx/store';
import { modifyGameState } from '../../store/actions/game-modify.action';

/**
 * @component Header
 * @description
 * Represents the application's main header section.
 *
 * This component manages high-level UI interactions related to:
 * - Theme mode switching between light and dark themes (via {@link Theme}).
 * - Opening dialog windows with contextual content (via {@link DialogHandler}).
 * - User authentication status and logout functionality (via {@link Auth}).
 *
 * It serves as a controller for the visual header, delegating persistent state
 * management to the injected global services.
 */
@Component({
  selector: 'header[appHeader]',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  /**
   * Injected {@link Theme} service that manages the global theme state.
   * Used for reading and updating the current UI mode (`'dark'` or `'light'`).
   */
  #theme = inject(Theme);

  #store:Store = inject(Store)

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
   * Computed signal indicating whether a user is currently logged in.
   * `true` if user data exists, `false` otherwise.
   */
  readonly logged: Signal<boolean> = computed(() => {
    return this.#auth.user() !== undefined;
  });

  /**
   * Gets the current theme mode.
   *
   * @returns {'dark' | 'light'} The current mode.
   */
  get mode(): 'dark' | 'light' {
    return this.#theme.mode!;
  }

  /**
   * Sets a new theme mode.
   *
   * @param newMode {'dark' | 'light'} - The desired theme mode.
   */
  set mode(newMode: 'dark' | 'light') {
    this.#theme.mode = newMode;
  }

  /**
   * Opens a dialog window with the specified content type.
   *
   * @param content The type of dialog to open (see {@link DialogContent}).
   * @returns A promise resolving when the dialog is closed.
   */
  protected async openDialogByContent(content: DialogContent): Promise<void> {
    const result = await this.#dialog.openDialog(content);

    console.log(result);
  }

  /**
   * Logs out the current user after showing a confirmation dialog.
   *
   * - Opens a custom confirmation dialog.
   * - If confirmed, calls the {@link Auth.logout} method and clears the user data.
   */
  async logout() {
    const result = await this.#dialog.openCustomDialog(
      'message',
      'Do you want to log out?',
      'logout',
      true
    );

    if (result) {
      await this.#auth.logout();
      sessionStorage.setItem(`${STORAGE_PREFIX}opponent`,JSON.stringify('player'))
      this.#store.dispatch(modifyGameState({opponent:'player'}))
      this.#auth.user = undefined;
    }
  }
}
