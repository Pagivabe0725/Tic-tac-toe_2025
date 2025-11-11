/**
 * @interface GameState
 *
 * Represents the current settings of a Tic-Tac-Toe game.
 *
 * Properties:
 * - `size`: The board size (e.g., 3 for a 3x3 board)
 * - `opponent`: The type of opponent ('player' or 'computer')
 * - `hardness`: Difficulty level of the game (numeric, e.g., 1–4)
 *
 * This interface is used in the NgRx store to type the game state.
 * 
 */
export interface GameState {
  /** Board size (number of rows/columns) */
  size: number;

  /** Opponent type: human player or AI */
  opponent: 'player' | 'computer';

  /** Game difficulty level */
  hardness: number;
}
