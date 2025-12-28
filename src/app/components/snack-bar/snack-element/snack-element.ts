import {
  Component,
  EventEmitter,
  HostBinding,
  input,
  InputSignal,
  Output,
} from '@angular/core';
import { snackbarTemplate } from '../../../utils/interfaces/snackbar.interface';

/**
 * Single snackbar UI element responsible for rendering the visual appearance
 * and behavior of a single snackbar message.
 *
 * The component receives one snackbar item through a required InputSignal.
 * It applies conditional styling based on whether the snackbar represents
 * an error state, and exposes an event emitter allowing the parent
 * container to remove the snackbar when the user manually closes it.
 *
 * This component has no internal ticking logic. Its lifetime is fully
 * controlled by the parent `SnackBar` component and the `SnackBarHandler`
 * service.
 */

@Component({
  selector: 'app-snack-element',
  imports: [],
  templateUrl: './snack-element.html',
  styleUrl: './snack-element.scss',
})
export class SnackElement {
  /**
   * The snackbar item rendered by this component.
   * Delivered as an InputSignal so the template updates reactively
   * if the parent modifies the snackbar data.
   */
  SnackBarObject: InputSignal<snackbarTemplate> = input.required();

  /**
   * Event emitted when the user manually closes the snackbar.
   * Sends the id of the snackbar back to the parent component.
   */
  @Output() closeEvent = new EventEmitter<number>();

  /**
   * Optional interval reference should the component require
   * local timing logic in the future. Currently cleared when
   * the snackbar is manually closed.
   */
  #interval!: ReturnType<typeof setInterval>;

  /**
   * Applies dynamic inline styles to the component host element.
   * Error-type snackbars are visually emphasized using red text
   * and bold font weight.
   */
  @HostBinding('style')
  get color(): Partial<CSSStyleDeclaration> | null {
    if (this.SnackBarObject().error) {
      return {
        color: 'red',
        fontWeight: 'bolder',
      };
    }

    return null;
  }

  /**
   * Emits a close event to the parent and clears the internal interval,
   * allowing the parent component or service to remove the snackbar.
   */
  protected close(): void {
    clearInterval(this.#interval);
    this.closeEvent.emit(this.SnackBarObject().id);
  }
}
