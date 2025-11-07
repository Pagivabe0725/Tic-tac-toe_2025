import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { GameField } from './game-field/game-field';
import { GameDisplayPart } from './game-display-part/game-display-part';
import { GameFieldCell } from './game-field-cell/game-field-cell';
import { GameLogic } from '../../services/game-logic.service';
import { CellCoordinate } from '../../utils/interfaces/celll-coordinate.interface';

/**
 * @component Game
 *
 * Represents the main controller for the game board.
 * This component manages the current game state, handles player and AI moves,
 * and connects the UI with the {@link GameLogic} service.
 *
 * It uses Angular signals to track reactive state such as the board,
 * the active player, and the game step count.
 */

@Component({
  selector: 'app-game',
  imports: [GameField, GameDisplayPart, GameFieldCell],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game {
  /** Reference to the injected game logic service. */
  #gameLogic: GameLogic = inject(GameLogic);

  /**
   * Signal representing the current size of the game board.
   * This is a reactive signal coming from the `gameLogic` service.
   */
  protected size: Signal<number> = this.#gameLogic.size;

  /**
   * Computed signal generating an empty game board based on the `size` signal from the `gameLogic` service.
   * Each cell in the board is represented by an empty string `''`.
   */
  protected cells: Signal<string[][]> = this.#gameLogic.cells;

  /** Signal tracking the number of moves made in the game. */
  protected step: WritableSignal<number> = signal(0);

  private previousStep: WritableSignal<number> = signal(0);

  /**
   * Computed signal that determines the current player's mark ('o' or 'x').
   * The player alternates based on the `step` count.
   */
  protected actualMarkup: Signal<'o' | 'x'> = computed(() => {
    return this.step() % 2 === 0 ? 'o' : 'x';
  });

  /**
   * Writable signal representing the actual game board state.
   * Initially undefined until the computed `cells` are initialized.
   */
  protected gameField: WritableSignal<string[][] | undefined> =
    signal(undefined);

  protected clickPermission: WritableSignal<boolean> = signal(true);

  /**
   * @constructor
   * Initializes the game component, setting up the initial field,
   * the player's mark, and reactive effects for updating the field
   * and triggering AI moves.
   */
  constructor() {
    this.#gameLogic.field = this.cells();
    this.#gameLogic.markup = 'o';

    // Keep the gameField signal in sync with the computed cells.
    effect(() => {
      if (this.cells()) {
        this.gameField?.set(this.cells());
      }
    });

    // Automatically trigger the enemy move on odd steps.
    effect(() => {
      if (this.step() % 2 !== 0 && this.gameField() && this.#gameLogic.opponent()==='computer') {
        console.log('step:' + this.step());

        //this.aiMove();
      }
    });
  }

  async aiMove() {
    const startTime = performance.now();
    const result = await this.#gameLogic.ai();
    const endTime = performance.now();

    const elapsed = endTime - startTime;
    const minDuration = 1000;
    const remaining = minDuration - elapsed;

    if (result?.lastMove) {
      const cellCoordinates = {
        xCoordinate: result.lastMove.row,
        yCoordinate: result.lastMove.column,
      };

      if (remaining > 0) {
        console.log('váratva');
        await new Promise((resolve) => setTimeout(resolve, remaining));
      } else {
        console.error('nincs váratva');
      }

      console.log(remaining);

      this.setCell(cellCoordinates);
    }
  }

  /**
   * Sets a cell on the game board for the current player.
   * Updates the board state and increases the step counter.
   *
   * @param coordinates - The x and y coordinates of the cell to update.
   */
  setCell(coordinates: CellCoordinate): void {
    const copiedFields: string[][] = [...this.gameField()!];
    copiedFields[coordinates.xCoordinate][coordinates.yCoordinate] =
      this.actualMarkup();
    this.gameField.set(copiedFields);
    this.step.update((previous) => previous + 1);
    this.#gameLogic.field = this.gameField();
  }
}
