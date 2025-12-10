import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { Params, QueryParamsHandling, Router } from '@angular/router';
import { RouterService } from '../../../../services/router.service';

@Component({
  selector: 'div[appPaginator]',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
})
export class Paginator {
  /**
   * Emits navigation-related parameter changes to the parent component.
   *
   * Triggered exclusively when the current page is changed
   * by user interaction through this component.
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
   * The currently active page number.
   *
   * This value is provided by the parent component
   * through a required signal-based input.
   */
  page: InputSignal<number> = input.required();

  /**
   * Total number of available pages.
   *
   * Used to determine valid upper bounds for pagination
   * and to prevent navigation to non-existing pages.
   */
  pageCount: InputSignal<number> = input.required();

  /**
   * Validates and attempts to update the current page.
   *
   * Ensures the new page number is:
   * - greater than or equal to 1
   * - less than or equal to the maximum page count
   *
   * Only valid values trigger an actual page change.
   *
   * @param value - The target page number selected by the user.
   */
  setPage(value: number) {
    if (value >= 1 && value <= this.pageCount()) {
      this.changePage(value);
    }
  }

  /**
   * Emits a navigation event that updates the `page` query parameter.
   *
   * Uses `merge` query params handling to preserve
   * any existing, unrelated query parameters.
   *
   * @param value - The validated page number to navigate to.
   */
  changePage(value: number) {
    this.changeParamsEvent.emit({
      path: ['account'],
      queryParams: { page: value },
      queryParamsHandling: 'merge',
    });
  }
}
