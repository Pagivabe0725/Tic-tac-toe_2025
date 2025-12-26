/**
 * @interface AiMoveResult
 *
 * Represents the result of an AI move in a Tic-Tac-Toe game.
 *
 * Properties:
 * - `winner`:
 *   The winner after the move.
 *   - `'x'` or `'o'` if a player has won
 *   - `'draw'` if the game ended in a draw
 *   - `null` if the game is still ongoing
 *
 * - `region`:
 *   Describes the rectangular region of the board that was evaluated
 *   and potentially modified by the AI.
 *   Contains absolute board coordinates (`startRow`, `endRow`,
 *   `startColumn`, `endColumn`), or `null` if no region logic was applied
 *   (e.g. first move or early termination).
 *
 * - `lastMove`:
 *   Coordinates of the last move made by the AI on the full board.
 *   - `row`: Row index of the move
 *   - `column`: Column index of the move
 *
 * - `board`:
 *   The full current state of the game board after the AI move,
 *   represented as a 2D array of strings.
 */
export interface AiMove {
  /**
   * The winner after the move.
   * - 'x' or 'o' if a player has won
   * - 'draw' if the game ended in a draw
   * - null if the game is still ongoing
   */
  winner: 'x' | 'o' | 'draw' | null;

  /**
   * The region of the board that was evaluated and modified by the AI.
   * Null if the move was made on an empty board or no region logic applied.
   */
  region: {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
  } | null;

  /**
   * Coordinates of the last move made by the AI on the full board.
   */
  lastMove: {
    row: number;
    column: number;
  };

  /**
   * The full current state of the game board after the AI move.
   */
  board: string[][];
}
