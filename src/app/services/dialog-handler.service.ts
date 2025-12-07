import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { DialogContent } from '../utils/types/dialog-content.type';
import { firstValueFrom, Observable, Subject, take } from 'rxjs';
import { DialogStructure } from '../utils/interfaces/dialog-structure.interface';

/**
 * @service DialogHandler
 *
 * Central service to manage modal dialogs.
 * Provides reactive signals and Subjects for dialog data flow and triggers.
 */
@Injectable({
  providedIn: 'root',
})
export class DialogHandler {
  /** Signal for the currently active dialog content. */
  #actualContent: WritableSignal<DialogContent> = signal(undefined);

  /** Subject to emit dialog results. */
  #dataSubject?: Subject<any | null> = undefined;

  /** Optional dialog metadata (title, buttons, etc.). */
  #dialogData?: DialogStructure;

  /** Subject to emit trigger events like 'form', 'reset', or 'change'. */
  #emitTrigger?: Subject<string> = undefined;

  /** Stores the last active dialog content. */
  #lastContent: DialogContent = undefined;

  /** Readonly signal of current dialog content. */
  get actualContent(): Signal<DialogContent> {
    return this.#actualContent;
  }

  /** Update the current dialog content. */
  set actualContent(content: DialogContent) {
    this.#actualContent.set(content);
  }

  /** Get last active dialog content. */
  get lastContent(): DialogContent {
    return this.#lastContent;
  }

  /** Set last active dialog content. */
  set lastContent(content: DialogContent) {
    this.#lastContent = content;
  }

  /** Get current dialog metadata. */
  get dialogData(): DialogStructure | undefined {
    return this.#dialogData;
  }

  /**
   * Emits data to the current dialog and closes it.
   * @param data Dialog result to emit.
   */
  emitData<T>(data: T): void {
    this.#dataSubject?.next(data);
    this.close();
  }

  /**
   * Returns an Observable to listen for dialog triggers (e.g., 'form', 'reset').
   */
  waitForTrigger(): Observable<string> {
    if (this.#emitTrigger === undefined) {
      this.#emitTrigger = new Subject<string>();
    }
    return this.#emitTrigger.asObservable();
  }

  /**
   * Triggers an event to all subscribers of waitForTrigger().
   * @param value Trigger name.
   */
  trigger(value: string): void {
    this.#emitTrigger?.next(value);
  }

  /**
   * Opens a dialog with optional metadata and waits for a result.
   * @param content Dialog type/content.
   * @param datas Optional dialog metadata.
   */
  async open<T>(
    content: DialogContent,
    datas?: DialogStructure
  ): Promise<T | null> {
    if (this.#dataSubject) {
      this.#dataSubject.next(null);
    }
    this.#dialogData = datas;
    this.#actualContent.set(content);
    this.#dataSubject = new Subject<any>();
    this.lastContent = content;

    const result = await firstValueFrom(
      this.#dataSubject.asObservable().pipe(take(1))
    );
    return result;
  }

  /**
   * Closes the current dialog.
   * - Emits null to complete the data flow.
   * - Completes and clears subjects.
   * - Resets current content and triggers.
   */
  close(): void {
    this.#dataSubject?.next(null);
    this.#dataSubject?.complete();
    this.#emitTrigger?.subscribe();
    this.#emitTrigger = undefined;
    this.#dataSubject = undefined;
    this.#actualContent.set(undefined);
  }
}
