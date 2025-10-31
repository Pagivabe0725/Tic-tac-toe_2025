import { Component, computed, inject, signal, Signal } from '@angular/core';
import { Theme } from '../../services/theme.service';
import { DialogHandler } from '../../services/dialog-handler.service';
import { Auth } from '../../services/auth.service';
import { DialogContent } from '../../utils/types/dialog-content.type';

/**
 * @component Header
 * @description
 * Represents the application's main header section.
 *
 * This component manages high-level UI interactions related to:
 * - Theme mode switching between light and dark themes (via {@link Theme}).
 * - Opening dialog windows with contextual content (via {@link DialogHandler}).
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

  /**
   * Injected {@link DialogHandler} service responsible for
   * opening and managing application dialogs.
   */
  #dialog = inject(DialogHandler);

  /**
   * placeholder
   */
  #auth = inject(Auth);


  readonly logged: Signal<boolean> = signal(this.#auth.user() !==undefined);
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
   * Opens a dialog window with the specified content.
   *
   * @param content The type of dialog to open (see {@link dialogContent}).
   * @returns A promise resolving with the dialog result, if any.
   */
  protected async openDialogByContent(content: DialogContent): Promise<void> {
    const result = await this.#dialog.openDialog(content);
    if (result) {
      console.log(result);
    }
  }
}
