import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

//const baseURL = 'http://localhost:3000/tic';
/**
 * @service GameLogic
 *
 * Manages the state and logic of a Tic-Tac-Toe game.
 *
 * Responsibilities:
 * - Tracks the game board and markup
 * - Maintains reactive signals for board size and cells
 * - Synchronizes computed cells with a writable gameField signal
 */
@Injectable({
  providedIn: 'root',
})
export class GameLogic {
  /** Stores the current game board as a 2D string array (internal field) */
  #field?: string[][] = [];

  /** Stores optional markup or representation of the board */
  #markup?: string;

  /** Reactive signal storing the size of the game board */
  #size: WritableSignal<number> = signal(3);

  /**
   * Computed signal that generates an empty game board based on the `size` signal.
   * Each cell is represented by an empty string `''`.
   */
  #cells: Signal<string[][]> = computed(() => {
    return Array(this.#size())
      .fill(null)
      .map(() => Array(this.#size()).fill(''));
  });

  /**
   * Writable signal representing the actual game board state.
   * Initially undefined until the computed `cells` are initialized.
   */
  protected gameField: WritableSignal<string[][] | undefined> =
    signal(undefined);

  /**
   * Gets the current game board.
   *
   * @returns A 2D string array representing the board, or `undefined`.
   */
  get field(): string[][] | undefined {
    return this.#field;
  }

  /**
   * Updates the current game board.
   *
   * @param newField - A 2D string array representing the new board state.
   */
  set field(newField: string[][] | undefined) {
    this.#field = newField;
  }

  /**
   * Gets the current markup for the board (if any).
   *
   * @returns The markup string or `undefined`.
   */
  get markup(): string | undefined {
    return this.#markup;
  }

  /**
   * Sets the markup for the game board.
   *
   * @param newMarkup - A string containing markup for display purposes.
   */
  set markup(newMarkup: string | undefined) {
    this.#markup = newMarkup;
  }

  /**
   * Gets the reactive signal representing the board size.
   *
   * @returns Signal<number> representing the board size.
   */
  get size(): Signal<number> {
    return this.#size;
  }

  /**
   * Updates the size of the game board.
   *
   * @param newSize - New board size (e.g., 3 for 3x3).
   */
  set size(newSize: number) {
    this.#size.set(newSize);
  }

  /**
   * Gets the computed cells for the game board.
   * The array is automatically generated based on the current size signal.
   *
   * @returns Signal<string[][]> representing the empty board cells.
   */
  get cells(): Signal<string[][]> {
    return this.#cells;
  }

  /**
   * Initializes a new GameLogic instance.
   *
   * Responsibilities:
   * - Keeps the `gameField` signal in sync with the computed `cells`.
   * - Sets up a reactive effect to update `gameField` whenever `cells` changes.
   */
  constructor() {
    // Keep the gameField signal in sync with the computed cells.
    effect(() => {
      if (this.#cells()) {
        this.gameField?.set(this.#cells());
      }
    });
  }
}
