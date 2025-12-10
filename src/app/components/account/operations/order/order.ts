import {
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { order } from '../../../../utils/types/order.type';
import { Params, QueryParamsHandling, Router } from '@angular/router';

@Component({
  selector: 'div[appOrder]',
  imports: [],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {

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
  order: InputSignal<order> = input.required();

  /**
   * Applies a new ordering value and notifies the parent component
   * by emitting updated routing parameters.
   *
   * The method does not perform validation, assuming the value
   * is already a valid `order` type.
   *
   * @param value - The new order option to apply.
   */
  changeOrder(value: order) {
    this.changeParamsEvent.emit({
      path: ['account'],
      queryParams: { order: value },
      queryParamsHandling: 'merge',
    });
  }
}
