import {
  Component,
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

@Component({
  selector: 'section[appOperations]',
  imports: [Filter, Paginator, Order],
  template: `
    <div appFilter [filter]="filter()"></div>

    <div appPaginator [page]="page()" [pageCount]="pageCount()"></div>

    <div appOrder [order]="order()"></div>
  `,
  styleUrl: './operations.scss',
})
export class Operations {
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
}
