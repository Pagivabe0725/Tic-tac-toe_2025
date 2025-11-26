/**
 * @interface aiMove
 *
 * Represents the result of an AI move in a Tic-Tac-Toe game.
 *
 * Properties:
 * - `winner` (optional): The winner after the move, either `'x'`, `'o'`, or `'draw'`.
 * - `region`: A 2D array of strings representing the specific region of the board affected by the move.
 * - `lastMove`: An object with the coordinates of the last move:
 *    - `row`: Row index of the move
 *    - `column`: Column index of the move
 * - `board`: The full current state of the game board as a 2D array of strings.
 */
export interface aiMove {
  winner?: 'x' | 'o' | 'draw';
  region: string[][];
  lastMove: { row: number; column: number };
  board: string[][];
}
