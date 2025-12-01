import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'div[appPaginator]',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
})
export class Paginator {
  /** Router instance used to update the page through query parameters. */
  #router: Router = inject(Router);

  /**
   * The currently active page.
   * Provided by the parent component.
   */
  page: InputSignal<number> = input.required();

  /**
   * Total number of pages available.
   * Determines valid pagination boundaries.
   */
  pageCount: InputSignal<number> = input.required();

  /**
   * Attempts to update the current page.
   * The update happens only if the given value is within valid bounds.
   *
   * @param value - The target page number.
   */
  setPage(value: number) {
    if (value >= 1 && value <= this.pageCount()) {
      this.changePage(value);
    }
  }

  /**
   * Navigates to the specified page by updating the `page`
   * query parameter, while keeping existing parameters intact.
   *
   * @param value - The page number to navigate to.
   */
  changePage(value: number) {
    this.#router.navigate([], {
      queryParams: { page: value },
      queryParamsHandling: 'merge',
    });
  }
}
