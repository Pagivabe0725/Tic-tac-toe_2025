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
import { GameOrder } from '../../../utils/types/order.type';
import { RouterService } from '../../../services/router.service';
import { Params, QueryParamsHandling } from '@angular/router';
import { SnackBarHandler } from '../../../services/snack-bar-handler.service';

@Component({
  selector: 'section[appOperations]',
  imports: [Filter, Paginator, Order],
  template: `
    <div
      appFilter
      [filter]="filter()"
      (changeParamsEvent)="navigate($event)"
      (errorEvent)="handleErrors($event)"
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
      (errorEvent)="handleErrors($event)"
    ></div>
  `,
  styleUrl: './operations.scss',
})
export class Operations {
  /** Manages navigation and provides reactive access to current route and query parameters */
  #router: RouterService = inject(RouterService);

  /** Snackbar service for showing feedback messages */
  #snackbar: SnackBarHandler = inject(SnackBarHandler);

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
  order: InputSignal<GameOrder> = input.required();

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
    // Delegate navigation to the centralized RouterService
    this.#router.navigateTo(
      value.path,
      value.queryParams,
      value.queryParamsHandling
    );
  }

  /**
   * Handles error messages propagated from child components.
   *
   * This method is responsible for:
   *  - Logging the error message to the console for debugging purposes
   *  - Displaying the error message to the user via a snackbar notification
   *
   * The incoming error message originates from child components
   * and represents a user-facing error state that requires feedback.
   *
   * @param errorMessage - The error message emitted by a child component.
   */
  protected handleErrors(errorMessage: string): void {
    console.error(errorMessage);
    this.#snackbar.addElement(errorMessage, true);
  }
}
