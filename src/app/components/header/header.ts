import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../services/theme';
import { dialogContent, DialogHandler } from '../../services/dialog-handler';

@Component({
  selector: 'header[appHeader]',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

/**
 * @component Header
 *
 * Represents the application's main header section.
 * This component is responsible for handling theme mode switching
 * between light and dark themes via the injected {@link Theme} service.
 *
 * The component acts as a wrapper for the visual header part of the UI,
 * while delegating theme state management to the global Theme service.
 */
export class Header {
  /**
   * Injected {@link Theme} service that manages the global theme state.
   * Used for reading and updating the current UI mode ('dark' or 'light').
   */
  #theme: Theme = inject(Theme);

  /**
   * placeholder
   */
  #dialog: DialogHandler = inject(DialogHandler);

  /**
   * Gets the current theme mode.
   *
   * @returns The current mode, either `'dark'` or `'light'`.
   */
  get mode(): 'dark' | 'light' {
    return this.#theme.mode!;
  }

  /**
   * Sets a new theme mode.
   *
   * @param newMode - The desired theme mode ('dark' or 'light').
   */
  set mode(newMode: 'dark' | 'light') {
    this.#theme.mode = newMode;
  }

  /**
   * placeholder
   * @param content
   */
  protected async openDialogByContent(content: dialogContent) {
    this.#dialog.openDialog(content).then((result) => {
      if (result) {
      }
    });
  }

  protected executableFunction = () => {
    console.log(Math.random());
  };
}
