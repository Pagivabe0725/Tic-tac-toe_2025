import { inject, Injectable } from '@angular/core';
import { game } from '../utils/interfaces/game.interface';

import { Functions } from './functions.service';
import { Http } from './http.service';
import { aiMove } from '../utils/interfaces/ai-move.interface';

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
  /** {@link Http} service used for sending requests to the backend API. */
  #httpHandler: Http = inject(Http);

  /** {@link Functions} service providing generic helper functions, e.g., numberToDifficulty conversion. */
  #helperFunctions: Functions = inject(Functions);

  /**
   * Sends a request to the backend to compute the AI's next move.
   *
   * @param board - Current game board as a 2D array of strings
   * @param markup - AI's symbol ('x' or 'o')
   * @param hardness - Difficulty level (numeric 1–4)
   * @param lastMove - Last move made in the game
   * @returns A Promise resolving to the AI's move (`aiMove`) or `undefined` if no move is available
   */
  async aiMove(
    board: string[][],
    markup: 'x' | 'o',
    hardness: number,
    lastMove: game['lastMove']
  ): Promise<aiMove | undefined> {
    return await this.#httpHandler.request<aiMove>(
      'post',
      'game/ai-move',
      {
        board,
        markup,
        hardness: this.#helperFunctions.numberToDifficulty(hardness),
        lastMove,
      },
      { maxRetries: 5, initialDelay: 700 }
    );
  }
}
