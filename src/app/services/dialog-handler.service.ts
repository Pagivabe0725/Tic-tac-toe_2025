import {
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { firstValueFrom, Subject, take } from 'rxjs';
import { DialogContent } from '../utils/types/dialog-content.type';


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
  /** Reactive signal storing the currently active dialog content. `undefined` if no dialog is open. */
  #activeContent: WritableSignal<DialogContent> = signal(undefined);

  /**
   * Internal Subject instance for passing values between
   * dialog openers and listeners. Created per open dialog.
   */
  #dataSubject: Subject<any> | null = null;

  /** Optional title to display in the dialog. */
  #title?: string;

  /** Optional message or body content to display in the dialog. */
  #message?: string;

  /** Flag indicating if the dialog presents a choice (e.g., yes/no buttons). */
  #choosable?: boolean;

  /**
   * Stores the last active dialog content.
   *
   * Since the dialog service’s `actualContent` value changes dynamically
   * and resets to `undefined` when the dialog closes, this property
   * preserves the most recent dialog type even after the dialog has
   * disappeared. This is useful whenever post-dialog logic requires
   * knowledge of what was previously opened.
   */
  #lastContent: DialogContent = undefined;

  /** Returns a read-only signal representing the currently active dialog. */
  get activeContent(): Signal<DialogContent> {
    return this.#activeContent.asReadonly();
  }

  /** Updates the currently active dialog content. */
  set activeContent(content: DialogContent) {
    this.#activeContent.set(content);
  }

  /** Returns the dialog's title if set. */
  get title(): string | undefined {
    return this.#title;
  }

  /** Returns the dialog's message/body content if set. */
  get message(): string | undefined {
    return this.#message;
  }

  /** Returns whether the current dialog is choosable (requires user confirmation). */
  get choosable(): boolean | undefined {
    return this.#choosable;
  }

  get lastContent(): DialogContent {
    return this.#lastContent;
  }

  /**
   * Tracks the last non-empty `activeContent()` value.
   * This ensures the previously used active content remains available,
   * for example when displaying messages.
   */
  constructor() {
    effect(() => {
      const actualContent = this.activeContent();
      if (actualContent) {
        this.#lastContent = actualContent;
      }
    });
  }

  /**
   * Opens a dialog and waits for a single emitted result.
   *
   * @param content - The dialog content identifier to display.
   * @returns A promise resolving to the value emitted by the dialog.
   */
  public async openDialog(content: DialogContent): Promise<boolean> {
    this.#choosable = true;
    this.#activeContent.set(content);
    this.#dataSubject = new Subject<any>();

    const result = await firstValueFrom(
      this.#dataSubject.asObservable().pipe(take(1))
    );

    this.close();
    return result;
  }

  /**
   * Opens a custom dialog with title, message, and optional choice buttons.
   *
   * @param content - Type of the dialog ('message' or 'error').
   * @param message - The message text to display.
   * @param title - The dialog title.
   * @param choosable - Whether the dialog requires user confirmation.
   * @returns A promise resolving to the value emitted by the dialog.
   */
  public async openCustomDialog(
    content: 'message' | 'error',
    message: string,
    title: string,
    choosable: boolean
  ): Promise<boolean> {
    this.#activeContent.set(content);
    this.#dataSubject = new Subject<any>();

    this.#message = message;
    this.#choosable = choosable;
    this.#title = title;

    const result = await firstValueFrom(
      this.#dataSubject.asObservable().pipe(take(1))
    );

    this.close();

    console.log(result);
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
    this.#choosable = undefined;
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
    this.#message = undefined;
    this.#choosable = undefined;
    this.#title = undefined;
  }
}
