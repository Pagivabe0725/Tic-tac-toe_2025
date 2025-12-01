import { Component, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { order } from '../../../../utils/types/order.type';
import { Router } from '@angular/router';

@Component({
  selector: 'div[appOrder]',
  imports: [],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  /** Router instance used to update the sorting order through query parameters. */
  #router: Router = inject(Router);

  /**
   * The current ordering applied to the games list.
   * Provided by the parent component.
   */
  order: InputSignal<order> = input.required();

  /**
   * Updates the sorting order by modifying the `order` query parameter.
   * Existing query parameters are preserved.
   *
   * @param value - The new order value to apply.
   */
  changeOrder(value: order) {
    this.#router.navigate([], {
      queryParams: { order: value },
      queryParamsHandling: 'merge',
    });
  }
}
