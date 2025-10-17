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
import { GameLogic } from '../../services/game-logic';

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

  /** Reactive signal storing the size of the game board */
  protected size: WritableSignal<number> = signal(9);

  /**
   * Computed signal that generates an empty game field based on the `size` signal.
   * Each cell is represented by an empty string `''`.
   */
  protected cells: Signal<string[][]> = computed(() => {
    return Array(this.size())
      .fill(null)
      .map(() => Array(this.size()).fill(''));
  });

  /** Signal tracking the number of moves made in the game. */
  protected step: WritableSignal<number> = signal(0);

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

  /**
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
      if (this.step() % 2 !== 0 && this.gameField()) {
        console.log('step:');
       // this.enemyNextStep();
      }
    });
  }

  /**
   * Sets a cell on the game board for the current player.
   * Updates the board state and increases the step counter.
   *
   * @param coordinates - The x and y coordinates of the cell to update.
   */
  setCell(coordinates: { xCoordinate: number; yCoordinate: number }): void {
    const copiedFields: string[][] = [...this.gameField()!];
    copiedFields[coordinates.yCoordinate][coordinates.xCoordinate] =
      this.actualMarkup();
    this.gameField.set(copiedFields);
    this.step.update((previous) => previous + 1);
    this.#gameLogic.field = this.gameField();
  }
/* 
  async getAIStep(): Promise<{ xCoordinate: number; yCoordinate: number }> {
    const result = (await this.#gameLogic.getEnemyNextStep()) as {
      xCoordinate: number;
      yCoordinate: number;
    };
    console.log(result);
    return result;
  }

  async enemyNextStep() {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const copiedArray = [...this.gameField()!];
    console.log(copiedArray);
    const nextStep = await this.getAIStep();
    copiedArray[nextStep.xCoordinate][nextStep.yCoordinate] = 'x';
    this.gameField.set(copiedArray);
    this.step.update((previous) => previous + 1);
  } */
}
