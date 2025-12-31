import {
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { GameOrder } from '../../../../utils/types/order.type';
import { Params, QueryParamsHandling } from '@angular/router';
import { ORDERS } from '../../../../utils/constants/order.constant';

@Component({
  selector: 'div[appOrder]',
  imports: [],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  /**
   * Emits an error message to the parent component.
   *
   * The parent component is responsible for handling this message,
   * typically by displaying it in a snackbar notification.
   *
   */
  errorEvent: OutputEmitterRef<string> = output();

  /**
   * Emits navigation-related parameter changes to the parent component.
   *
   * Triggered exclusively when the sorting order is changed
   * by the user through this component.
   *
   * The emitted object can contain:
   * - path: Target route segments
   * - queryParams: Updated query parameters
   * - queryParamsHandling: Strategy for query parameter merging
   */
  changeParamsEvent: OutputEmitterRef<{
    path: string[];
    queryParams?: Params;
    queryParamsHandling?: QueryParamsHandling;
  }> = output();

  /**
   * The currently active ordering option for the games list.
   *
   * This value is provided by the parent component
   * through a required signal-based input.
   */
  order: InputSignal<GameOrder> = input.required();

  /**
   * Validates whether the provided value is a valid order option.
   *
   * The method checks the given string against the predefined `ORDERS` list.
   * If the value is not included, an error is thrown to indicate
   * an invalid ordering option.
   *
   * @param value - The order value to validate.
   * @throws Error if the value is not a valid element of `ORDERS`.
   */
  checkOrder(value: string): void {
    let valid = false;

    for (const order of ORDERS) {
      if (String(order) === value) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      throw new Error(`Invalid order value: ${value}`);
    }
  }

  /**
   * Applies a new ordering value and notifies the parent component
   * by emitting updated routing parameters.
   *
   * If an error occurs during the emission process,
   * the error message is propagated to the parent component
   * through the `errorEvent` output, allowing centralized
   * error handling (e.g. displaying a snackbar notification).
   *
   * @param value - The new order option to apply.
   */
  protected changeOrder(value: GameOrder): void {
    try {
      this.checkOrder(value);
      this.changeParamsEvent.emit({
        path: ['account'],
        queryParams: { order: value },
        queryParamsHandling: 'merge',
      });
    } catch (error) {
      this.errorEvent.emit((error as Error).message);
    }
  }
}
