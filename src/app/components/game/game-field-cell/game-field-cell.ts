import {
  Component,
  computed,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  input,
  InputSignal,
  Output,
  Signal,
  ViewEncapsulation,
} from '@angular/core';
import { CellCoordinate } from '../game';

/**
 * Maps grid sizes to their corresponding icon and cover font sizes.
 * Used to dynamically scale cell content based on the game field size.
 */
const sizeMap = new Map<number, { icon: string; cover: string }>([
  [3, { icon: '10vw', cover: '8vw' }],
  [4, { icon: '8vw', cover: '6vw' }],
  [5, { icon: '6.5vw', cover: '4.5vw' }],
  [6, { icon: '4.5vw', cover: '2.5vw' }],
  [7, { icon: '3.5vw', cover: '2.5vw' }],
  [8, { icon: '2.5 vw', cover: '1.5vw' }],
  [9, { icon: '2vw', cover: '1.5vw' }],
]);

/**
 * @component GameFieldCell
 *
 * Represents a single cell in the game field grid.
 * Each cell is responsible for displaying its current state (`'x'`, `'o'`, or empty`)
 * and for emitting click events when selected.
 *
 * The component uses Angular’s `signals` API for reactivity and binds dynamic styles
 * based on the cell’s content and game configuration.
 */
@Component({
  selector: 'div[appGameFieldCell]',
  imports: [],
  templateUrl: './game-field-cell.html',
  styleUrl: './game-field-cell.scss',
  host: {
    class: 'own-animated-border own-field',
  },
  encapsulation: ViewEncapsulation.None,
})
export class GameFieldCell {
  /**
   * The current markup symbol in the cell.
   * Possible values:
   * - `'x'`
   * - `'o'`
   * - `undefined` (empty cell)
   */
  markup: InputSignal<string | undefined> = input.required();

  /** The Y coordinate of the cell within the game grid. */
  @Input({ required: true }) yCoordinate!: number;

  /** The X coordinate of the cell within the game grid. */
  @Input({ required: true }) xCoordinate!: number;

  /** The total game board size (e.g., 3×3, 9×9). Used to scale cell visuals. */
  size: InputSignal<number> = input.required();

  /**
   * Event emitter fired when a cell is clicked.
   * Emits an object containing both X and Y coordinates of the clicked cell.
   */
  @Output() setPosition = new EventEmitter<{
    yCoordinate: number;
    xCoordinate: number;
  }>();

  /**
   * Reactive computation of icon and cover font sizes
   * based on the current board size.
   */
  protected fontSize: Signal<{ icon: string; cover: string }> = computed(() => {
    return sizeMap.get(this.size()) ?? { icon: '1vw', cover: '0.8vw' };
  });

  /**
   * Dynamically controls the cursor style depending on cell state.
   * Returns `'pointer'` if the cell is empty, `'default'` if already filled.
   */
  @HostBinding('style.cursor')
  get cursor() {
    return this.markup() ? 'default' : 'pointer';
  }

  /**
   * Dynamically applies a CSS class to the cell.
   * Adds hover animation only if the cell is empty.
   */
  @HostBinding('class')
  get scale() {
    return this.markup() ? '' : 'own-cell-hover';
  }

  /**
   * Handles cell click events.
   * Emits the cell’s coordinates if it is not yet filled.
   *
   * @event
   */
  @HostListener('click')
  fill(): void {
    if (!this.markup()) {
      this.setPosition.emit({
        xCoordinate: this.xCoordinate,
        yCoordinate: this.yCoordinate,
      } as CellCoordinate);
    }
  }
}
