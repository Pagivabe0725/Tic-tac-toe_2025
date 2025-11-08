import { HttpClient } from '@angular/common/http';
import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { game } from '../utils/interfaces/game.interface';
import { BASE_URL } from '../utils/constants/base-URL.constant';
import { Auth } from './auth.service';
import { firstValueFrom, take } from 'rxjs';
import { Functions } from './functions.service';

//const BASE_URL = 'http://localhost:3000/tic';
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
  /**
   *placeholder
   */
  #http: HttpClient = inject(HttpClient);

  /**
   * placeholder
   */
  #lastMove: game['lastMove'] = undefined;

  /**
   * placeholder
   */

  #helperFunctions: Functions = inject(Functions);

  /**
   * placeholder
   */
  #auth: Auth = inject(Auth);

  /**
   * The difficulty level of the game.
   */
  #hardness: WritableSignal<number> = signal(1);


  /**
   * The opponent type, either computer or player.
   */
  #opponent: WritableSignal<'computer' | 'player'> = signal('player');

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
    const size = this.size();
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => '')
    );
  });

  /**
   * Writable signal representing the actual game board state.
   * Initially undefined until the computed `cells` are initialized.
   */
  protected gameField: WritableSignal<string[][] | undefined> =
    signal(undefined);

  gameRespones: game | undefined;

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
   * Updates the size of the game board and persists it to localStorage.
   *
   * @param newSize - The new board size (e.g., 3 for 3x3).
   */
  set size(newSize: number) {
    this.#size.set(newSize);
    localStorage.setItem('game_size', String(newSize));
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
   * Gets the current game difficulty.
   */
  get hardness(): Signal<number> {
    return this.#hardness;
  }

  /**
   * Sets the game difficulty and persists the value to localStorage.
   *
   * @param value - The new difficulty level (e.g., 'easy', 'medium', 'hard').
   */
  set hardness(value: number) {
    this.#hardness.set(value);
    localStorage.setItem('game_hardness', value.toString());
  }

  /**
   * Gets the current opponent type.
   */
  get opponent(): Signal<'computer' | 'player'> {
    return this.#opponent;
  }

  /**
   * Sets the opponent type (either 'computer' or 'player') and saves it to localStorage.
   *
   * @param value - The new opponent type.
   */
  set opponent(value: 'computer' | 'player') {
    this.#opponent.set(value);
    localStorage.setItem('game_opponent', value);
  }


  /**
   * Initializes a new GameLogic instance.
   *
   * Responsibilities:
   * - Restores saved settings (board size, difficulty, and opponent) from localStorage.
   * - Keeps the `gameField` signal in sync with the computed `cells`.
   * - Ensures that the reactive state reflects persisted user preferences immediately on load.
   */
  constructor() {
    /**
     * Restore persisted settings from localStorage if they exist.
     * Ensures that user preferences (size, hardness, opponent)
     * are consistent across sessions.
     */
    const storedSize = localStorage.getItem('game_size');
    const storedHardness = localStorage.getItem('game_hardness') as
      | game['hardness']
      | null;
    const storedOpponent = localStorage.getItem('game_opponent') as
      | 'computer'
      | 'player'
      | null;

    // Restore saved board size if valid
    if (storedSize) {
      const parsedSize = Number(storedSize);
      if (!isNaN(parsedSize)) {
        this.#size.set(parsedSize);
      }
    }

    // Restore saved difficulty level
    if (storedHardness) {
      this.hardness = parseInt(storedHardness);
    }

    // Restore saved opponent type
    if (storedOpponent) {
      this.#opponent.set(storedOpponent);
    }

    /**
     * Reactive effect:
     * Keeps the `gameField` signal automatically synchronized
     * with the computed `cells` whenever the board size changes.
     */
    effect(() => {
      if (this.#cells()) {
        console.log(this.size());
        console.log('cells: ', this.#cells());
        const newCells = this.#cells();
        this.gameField.set(newCells.map((row) => [...row]));
      }
    });
  }

  async ai() {
    try {
      const respones = await firstValueFrom(
        this.#http
          .post<game>(
            `${BASE_URL}/game/ai-move`,
            {
              board: this.gameField(),
              markup: 'x',
              hardness: this.#helperFunctions.numberToDifficulty(this.hardness()),
              lastMove: this.#lastMove,
            },
            {
              withCredentials: true,
              headers: {
                'X-CSRF-Token': this.#auth.csrf()!,
              },
            }
          )
          .pipe(take(1))
      );
      this.#lastMove = respones.lastMove;
      return respones;
    } catch (_) {
      return undefined;
    }
  }
}
