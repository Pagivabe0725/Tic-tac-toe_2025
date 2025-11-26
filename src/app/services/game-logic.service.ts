import { inject, Injectable } from '@angular/core';
import { Functions } from './functions.service';
import { Http } from './http.service';
import { aiMove } from '../utils/interfaces/ai-move.interface';
import { LastMove } from '../utils/types/last-move.type';

/**
 * @service GameLogic
 *
 * Handles the core logic of a Tic-Tac-Toe game.
 * Responsibilities include:
 * - Interfacing with the backend for AI move computation
 * - Checking for a winner on the board
 * - Providing difficulty translation via helper functions
 */
@Injectable({
  providedIn: 'root',
})
export class GameLogic {
  /** Injected HTTP service used for sending requests to the backend API. */
  #httpHandler: Http = inject(Http);

  /** Injected helper service providing generic utility functions (e.g., difficulty conversion). */
  #helperFunctions: Functions = inject(Functions);

  /**
   * Requests the backend to calculate the AI's next move.
   *
   * @param board Current game board as a 2D array of strings
   * @param markup The AI's symbol ('x' or 'o')
   * @param hardness Difficulty level (numeric, e.g., 1–4)
   * @param lastMove The last move played in the game
   * @returns Promise resolving to an {@link aiMove} object or `undefined` if no move is possible
   */
  async aiMove(
    board: string[][],
    markup: 'x' | 'o',
    hardness: number,
    lastMove: LastMove
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

  /**
   * Checks the current board for a winner or draw.
   *
   * @param board Current game board as a 2D array of strings
   * @returns Promise resolving to an object containing:
   *  - `winner`: 'x', 'o', 'draw', or null if the game is ongoing
   */
  async hasWinner(board: string[][]) {
    return await this.#httpHandler.request<{
      winner: 'draw' | 'x' | 'o' | null;
    }>(
      'post',
      'game/check-board',
      { board },
      { maxRetries: 3, initialDelay: 200 }
    );
  }
}
