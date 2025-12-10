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
import { RouterService } from '../../../../services/router.service';
import { Params, QueryParamsHandling } from '@angular/router';

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

  /**
   * Event emitter used to notify the parent component about changes
   * in routing-related parameters caused by filter updates.
   *
   * Emits an object containing:
   * - path: The target route segments
   * - queryParams: Updated query parameters
   * - queryParamsHandling: Strategy for merging query params
   */
  changeParamsEvent: OutputEmitterRef<{
    path: string[];
    queryParams?: Params;
    queryParamsHandling?: QueryParamsHandling;
  }> = output();

  /**
   * The currently active saved-game status filter.
   * Provided by the parent component through a signal-based input.
   */
  filter: InputSignal<savedGameStatus | null> = input.required();

  /**
   * List of selectable filter values.
   *
   * - Contains all valid `savedGameStatus` values.
   * - Explicitly includes `null` to represent the "no filter" state.
   */
  protected options = [null, ...SAVED_GAME_STATUSES];

  /**
   * Validates and applies the selected filter value.
   *
   * Handles the string-based values coming from the `<select>` element
   * and converts them into the appropriate strongly-typed
   * `savedGameStatus | null` value before delegating to `changeFilter`.
   *
   * @param value - The raw filter value from the UI element.
   *
   * @throws Error
   * Thrown when the value does not match any known `savedGameStatus`
   * and is not the special `null` marker.
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
   * Emits a route update event based on the selected filter.
   *
   * - Resets the `page` query parameter to `1` whenever the filter changes.
   * - Uses `merge` query params handling to preserve unrelated parameters.
   *
   * @param value - The validated filter value or `null` for no filter.
   */
  changeFilter(value: savedGameStatus | null) {
    console.log('SOMETHING')
    this.changeParamsEvent.emit({
      path: ['account'],
      queryParams: { filter: value, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}
