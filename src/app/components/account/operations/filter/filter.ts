import {
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { SAVED_GAME_STATUSES } from '../../../../utils/constants/saved-game-status.constant';
import { savedGameStatus } from '../../../../utils/types/game-status.type';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'div[appFilter]',
  imports: [FormsModule],
  // templateUrl: './filter.html',
  template: `
    <select
      #filter_select
      [ngModel]="filter()"
      (ngModelChange)="setFilter(filter_select.value)"
    >
      @for (status of options; track $index) {
      <option [value]="status">{{ status ?? 'none' }}</option>
      }
    </select>
  `,
  styleUrl: './filter.scss',
})
export class Filter {
  /** Router instance used to update the `filter` query parameter. */
  #router: Router = inject(Router);

  /**
   * The currently active saved-game status filter.
   * Provided by the parent component.
   */
  filter: InputSignal<savedGameStatus | null> = input.required();

  /**
   * List of allowed filter options.
   * Includes a `null` value representing "no filter".
   */
  protected options = [null, ...SAVED_GAME_STATUSES];

  /**
   * Validates and applies the selected filter value.
   * Converts string input into the appropriate `savedGameStatus` type.
   *
   * @param value - The raw filter value from the UI.
   * @throws Error if the value is not a valid status.
   */
  setFilter(value: string): void {
    if (value === 'null') {
      this.changeFilter(null);
    } else if (SAVED_GAME_STATUSES.includes(value as savedGameStatus)) {
      this.changeFilter(value as savedGameStatus);
    } else {
      throw new Error(`Invalid status value : ${value}`);
    }
  }

  /**
   * Updates the filter by modifying query parameters.
   * Resets pagination to page 1 whenever a new filter is applied.
   *
   * @param value - The new filter value (`null` means "no filter").
   */
  changeFilter(value: savedGameStatus | null) {
    this.#router.navigate([], {
      queryParams: { filter: value, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}
