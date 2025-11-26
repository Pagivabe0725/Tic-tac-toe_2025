import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { SnackElement } from './snack-element/snack-element';
import { SnackBarHandler } from '../../services/snack-bar-handler.service';

/**
 * Visual container component responsible for displaying active snackbar messages.
 *
 * This component renders the list of snackbar items managed by the
 * SnackBarHandler service. It subscribes to the handler's reactive signal
 * and updates automatically when items are added, removed, or expired.
 *
 * The component also starts a periodic ticking mechanism on initialization,
 * calling the handler's `tick` method once per second to decrease each
 * snackbar's lifetime. Expired snackbars are removed automatically. The
 * interval is cleaned up on destruction to avoid memory leaks.
 *
 * Each snackbar element is rendered using the `SnackElement` component,
 * and users can manually dismiss a snackbar by invoking `closeElement`.
 */

@Component({
  selector: 'app-snack-bar',
  imports: [SnackElement],
  templateUrl: './snack-bar.html',
  styleUrl: './snack-bar.scss',
})
export class SnackBar implements OnInit, OnDestroy {
  /**
   * Injected service responsible for managing snackbar state.
   * Provides reactive data and mutation methods used by this component.
   */
  #snackbarHandler: SnackBarHandler = inject(SnackBarHandler);

  /**
   * Interval reference used to periodically trigger the snackbar
   * ticking mechanism. Cleared on component destruction.
   */
  #interval!: ReturnType<typeof setInterval>;

  /**
   * Reactive list of snackbar items retrieved from the handler service.
   * The template can subscribe to this signal to update the UI in real time.
   */
  protected content = this.#snackbarHandler.snackbarContent;

  /**
   * Starts the automatic ticking cycle when the component is initialized.
   * The handler's tick method is invoked once per second to decrease
   * snackbar lifetimes and remove expired entries.
   */
  ngOnInit(): void {
    this.#interval = setInterval(() => {
      this.#snackbarHandler.tick();
    }, 1000);
  }

  /**
   * Clears the interval and stops the ticking cycle when the component
   * is destroyed. Prevents memory leaks and unintended background updates.
   */
  ngOnDestroy(): void {
    clearInterval(this.#interval);
  }

  /**
   * Removes a snackbar item by its id.
   * Triggered when the user manually closes a snackbar element.
   *
   * @param id - The identifier of the snackbar to remove.
   */
  protected closeElement(id: number): void {
    this.#snackbarHandler.deleteElement(id);
  }
}
