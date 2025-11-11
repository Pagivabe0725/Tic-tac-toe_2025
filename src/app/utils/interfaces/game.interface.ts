/**
 * @interface game
 *
 * Represents the state of a Tic-Tac-Toe game, including the board,
 * current player, difficulty, optional active region, and the last move.
 */
export interface game {
  /** 2D array representing the board cells. Each cell can be 'x', 'o', or empty. */
  board: string[][];

  /** Current player's symbol ('x' or 'o'). */
  markup: 'x' | 'o';

  /** Difficulty level for AI moves. */
  hardness: 'very-easy' | 'easy' | 'medium' | 'hard';

  /** Optional top-left row index of the active region. */
  startRow?: number;

  /** Optional top-left column index of the active region. */
  startColumn?: number;

  /** Optional bottom-right row index of the active region. */
  endRow?: number;

  /** Optional bottom-right column index of the active region. */
  endColumn?: number;

  /** Optional last move played, represented by row and column indices. */
  lastMove?: { row: number; column: number };
}
