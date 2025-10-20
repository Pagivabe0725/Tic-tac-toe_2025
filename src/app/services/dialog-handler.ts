import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, Subject, take } from 'rxjs';

/**
 * A fixed list of available dialog content identifiers.
 * These represent the names of dialogs that can be opened through the service.
 */
export const DIALOG_CONTENT = [
  'game_setting',
  'save',
  'setting',
  'login',
  'registration',
  'info',
  undefined,
] as const;

/**
 * Type representing all valid dialog content names.
 */
export type DialogContent = (typeof DIALOG_CONTENT)[number];

/**
 * @service DialogHandler
 *
 * Centralized service responsible for managing modal dialogs in the application.
 *
 * This service provides:
 * - Reactive signal tracking the currently active dialog content
 * - A Subject-based mechanism for passing data to and from dialogs
 * - Methods for opening, closing, and emitting dialog results asynchronously
 *
 * Designed to integrate seamlessly with Angular Signals and RxJS.
 */
@Injectable({
  providedIn: 'root',
})
export class DialogHandler {
  /** Reactive signal storing the currently active dialog content. */
  #activeContent: WritableSignal<DialogContent> = signal(undefined);

  /**
   * Internal Subject instance for passing values between
   * dialog openers and listeners. Created per open dialog.
   */
  #dataSubject: Subject<any> | null = null;

  /**
   * Returns a read-only signal representing the currently active dialog.
   * If no dialog is open, the value is `undefined`.
   */
  get activeContent(): Signal<DialogContent > {
    return this.#activeContent.asReadonly();
  }

  /**
   * Updates the currently active dialog content.
   *
   * @param content - The new dialog identifier, or `undefined` to clear it.
   */
  set activeContent(content: DialogContent ) {
    this.#activeContent.set(content);
  }

  /**
   * Opens a dialog and waits for a single emitted result.
   *
   * - Sets the active dialog content.
   * - Initializes a new {@link Subject} for communication.
   * - Returns a Promise that resolves when the dialog emits a value.
   * - Automatically closes the dialog after resolving.
   *
   * @param content - The dialog content identifier to display.
   * @returns A promise resolving to the value emitted by the dialog.
   */
  public async openDialog(content: DialogContent) {
    this.#activeContent.set(content);
    this.#dataSubject = new Subject<any>();

    const result = await firstValueFrom(
      this.#dataSubject.asObservable().pipe(take(1))
    );

    this.close();
    return result;
  }

  /**
   * Closes the currently active dialog.
   *
   * - Emits `undefined` to complete the data flow.
   * - Completes and clears the {@link Subject}.
   * - Resets the `activeContent` signal to `undefined`.
   */
  close = () => {
    this.#dataSubject?.next(undefined);
    this.#dataSubject?.complete();
    this.#dataSubject = null;
    this.#activeContent.set(undefined);
  };

  /**
   * Emits a value to the currently open dialog.
   *
   * Used by dialog components to send data back
   * to the logic that opened them.
   *
   * @param value - The value to send through the Subject.
   */
  dailogEmitter(value: any) {
    this.#dataSubject?.next(value);
  }
}
