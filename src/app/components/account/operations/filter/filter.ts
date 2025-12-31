import {
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { SAVED_GAME_STATUSES } from '../../../../utils/constants/saved-game-status.constant';
import { savedGameStatus } from '../../../../utils/types/game-status.type';
import { FormsModule } from '@angular/forms';
import { Params, QueryParamsHandling } from '@angular/router';


@Component({
  selector: 'div[appFilter]',
  imports: [FormsModule],
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
   * Emits an error message to the parent component.
   *
   * The parent component is responsible for handling this message,
   * typically by displaying it in a snackbar notification.
   *
   */
  errorEvent: OutputEmitterRef<string> = output();

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
   * Validates and normalizes an incoming filter value.
   *
   * - Returns `null` if the value represents a null filter.
   * - Returns the value if it is a valid `savedGameStatus`.
   * - Throws an error if the value is invalid.
   *
   * @param value Incoming filter value as string.
   * @returns A valid `savedGameStatus` or `null`.
   * @throws Error If the value is not a valid filter option.
   */
  private checkFilter(value: string): savedGameStatus | null {
    if (value === 'null') {
      return null;
    } else if (SAVED_GAME_STATUSES.includes(value as savedGameStatus)) {
      return value as savedGameStatus;
    } else {
      throw new Error(`Invalid status value : ${value}`);
    }
  }

  /**
   * Applies a new filter value after validation.
   *
   * Uses `checkFilter` to validate the incoming value and updates
   * the filter state if valid. In case of failure, logs the error
   * and shows a snackbar notification.
   *
   * @param value Incoming filter value as string.
   */
  protected setFilter(value: string): void {
    try {
      const newValue = this.checkFilter(value);

      this.changeFilter(newValue);
    } catch (error) {
      console.error(error);
      this.errorEvent.emit('Filter action failed')
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
  private changeFilter(value: savedGameStatus | null):void {
    this.changeParamsEvent.emit({
      path: ['account'],
      queryParams: { filter: value, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}
