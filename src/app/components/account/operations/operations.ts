import {
  Component,
  inject,
  Input,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
} from '@angular/core';
import { savedGameStatus } from '../../../utils/types/game-status.type';
import { Filter } from './filter/filter';
import { Paginator } from './paginator/paginator';
import { Order } from './order/order';
import { order } from '../../../utils/types/order.type';
import { RouterService } from '../../../services/router.service';
import { Params, QueryParamsHandling } from '@angular/router';

@Component({
  selector: 'section[appOperations]',
  imports: [Filter, Paginator, Order],
  template: `
    <div
      appFilter
      [filter]="filter()"
      (changeParamsEvent)="navigate($event)"
    ></div>

    <div
      appPaginator
      [page]="page()"
      [pageCount]="pageCount()"
      (changeParamsEvent)="navigate($event)"
    ></div>

    <div
      appOrder
      [order]="order()"
      (changeParamsEvent)="navigate($event)"
    ></div>
  `,
  styleUrl: './operations.scss',
})
export class Operations {
  #router: RouterService = inject(RouterService);

  /**
   * Current page number used for pagination.
   * Provided by the parent component.
   */
  page: InputSignal<number> = input.required();

  /**
   * Total number of pages.
   * Determines the paginator's upper bound.
   */
  pageCount: InputSignal<number> = input.required();

  /**
   * Game status filter applied to the list (e.g., 'ongoing', 'finished').
   * Null means no filter is active.
   */
  filter: InputSignal<savedGameStatus | null> = input.required();

  /**
   * Sorting order for the game list
   * (e.g., 'time-asc', 'time-desc', 'name-asc', 'name-desc').
   */
  order: InputSignal<order> = input.required();

   /**
   * Handles navigation requests emitted by child components (Filter, Paginator, Order).
   *
   * Triggered whenever the user:
   * - changes the active game status filter,
   * - selects a different page in the paginator, or
   * - changes the sorting order.
   *
   * The method delegates the actual navigation to the RouterService,
   * preserving existing query parameters if specified.
   *
   * @param value - Object containing navigation details:
   *   - path: Target route segments
   *   - queryParams: Optional updated query parameters
   *   - queryParamsHandling: Optional strategy for merging query params
   */
  protected navigate(value: {
    path: string[];
    queryParams?: Params;
    queryParamsHandling?: QueryParamsHandling;
  }) {
    console.log('NAVIGATE');
    console.log(value);

    // Delegate navigation to the centralized RouterService
    this.#router.navigateTo(
      value.path,
      value.queryParams,
      value.queryParamsHandling
    );
  }

}
