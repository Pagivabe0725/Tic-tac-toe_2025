import { Injectable, Signal, signal } from '@angular/core';
import { snackbarTemplate } from '../utils/interfaces/snackbar.interface';

/**
 * Service responsible for managing the lifecycle and state of snackbar messages.
 *
 * Maintains an internal list of snackbar items using Angular Signals.
 * Snackbars automatically expire over time through a ticking mechanism, and new
 * snackbars are appended while ensuring that the list never exceeds the defined
 * maximum capacity.
 *
 * Features:
 * - Stores snackbar messages as reactive signal data.
 * - Automatically decreases lifetime durations (`tick` method).
 * - Removes expired items when their duration reaches zero.
 * - Ensures the list never grows beyond the allowed limit by removing the oldest item.
 * - Allows manual removal of any snackbar by id.
 * - Provides a read-only signal view to consumers, preserving encapsulation.
 *
 * Intended usage:
 * - The `tick` method should normally be called by a periodic timer
 *   (for example, via `setInterval`) to implement auto-dismiss behavior.
 * - UI components can subscribe to the `snackbarContent` signal to stay updated.
 * - Components should call `addElement` when requesting a new message.
 */

@Injectable({
  providedIn: 'root',
})
export class SnackBarHandler {
  /**
   * Global incremental identifier assigned to snackbar items.
   * Ensures each item has a unique and stable id.
   */
  #globalId = 0;

  /**
   * Internal signal containing the current list of snackbar items.
   * Updated in an immutable fashion to ensure proper Angular reactivity.
   */
  #snackbarContent = signal<snackbarTemplate[]>([]);

  /**
   * Public read-only accessor for the snackbar content signal.
   * Consumers can listen for changes but cannot modify the data directly.
   */
  get snackbarContent(): Signal<snackbarTemplate[]> {
    return this.#snackbarContent;
  }

  /**
   * Decreases the duration of each snackbar item by 1 tick.
   * Items reaching a duration of 0 are removed automatically.
   *
   * This method is intended to be called periodically (for example,
   * by a timer) to implement automatic dismissal of snackbars.
   */
  tick(): void {
    this.#snackbarContent.update((previous) =>
      previous
        .map((element) =>
          element.duration > 0
            ? { ...element, duration: element.duration - 1 }
            : element
        )
        .filter((element) => element.duration > 0)
    );
  }

  /**
   * Removes a snackbar item identified by its unique id.
   *
   * @param id - The id of the snackbar element to delete.
   */
  deleteElement(id: number): void {
    this.#snackbarContent.update((previous) =>
      previous.filter((element) => element.id !== id)
    );
  }

  /**
   * Checks whether the snackbar list has reached its maximum allowed size.
   * If the list is full, adding a new element requires removing the oldest one.
   *
   * @returns True if the list is full, otherwise false.
   */
  private isFull(): boolean {
    return this.#snackbarContent().length + 1 >= 5;
  }

  /**
   * Removes the oldest snackbar element from the list.
   *
   * Internally performs a shift (which mutates the array) but then spreads
   * the result into a new array to ensure Angular Signals detect the change.
   */
  private deleteOldestElement(): void {
    this.#snackbarContent.update((previous) => {
      previous.shift();
      return [...previous];
    });
  }

  /**
   * Adds a new snackbar entry to the list.
   * If the list is already full, the oldest snackbar is removed first.
   *
   * @param content - Text content displayed inside the snackbar.
   * @param error - Whether the snackbar represents an error state.
   */
  addElement(content: string, error: boolean): void {
    if (this.isFull()) this.deleteOldestElement();

    this.#snackbarContent.update((previous) => [
      ...previous,
      {
        id: this.#globalId,
        content,
        duration: 15, // lifespan in ticks
        error,
      },
    ]);

    this.#globalId++;
  }
}
