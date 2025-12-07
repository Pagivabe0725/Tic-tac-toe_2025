import { LastMove } from '../types/last-move.type';

/**
 * @interface GameInfo
 *
 * Represents the complete runtime state of a Tic-Tac-Toe game.
 * Contains both game progress indicators and cumulative statistics.
 *
 * All properties are optional to allow for partial updates, flexible patching,
 * and gradual initialization.
 */
export interface GameInfo {
  /**
   * Aggregated statistics for the players across multiple rounds.
   * Each property is optional to support partial updates.
   *
   *  - `player_X_Win`:   Total wins achieved by Player X
   *  - `player_O_Win`:   Total wins achieved by Player O
   *  - `draw`:           Total draws
   *  - `player_X_Lose`:  Total losses of Player X
   *  - `player_O_Lose`:  Total losses of Player O
   */
  results?: {
    player_X_Win?: number;
    player_O_Win?: number;
    draw?: number;
    player_X_Lose?: number;
    player_O_Lose?: number;
  };

  /**
   * The currently active player's markup.
   * Determines whose turn it is: 'x' or 'o'.
   */
  actualMarkup?: 'x' | 'o' ;

  /**
   * Sequential index of the current move.
   * Useful for tracking turn count, history, or pacing logic.
   */
  actualStep?: number;

  /**
   * Indicates whether the game session is active.
   * `false` if no game has started or after a reset.
   */
  started?: boolean;

  /**
   * Current state of the game board as a 2D array.
   * Each cell can contain:
   *  - 'x' for Player X
   *  - 'o' for Player O
   *  - '' (empty string) for unoccupied cells
   */
  actualBoard?: string[][];

  /**
   * Metadata of the most recent move.
   * Used for UI highlighting, animations, or region calculations.
   */
  lastMove?: LastMove;

  /**
   * Tracks cumulative thinking/decision time for each player in the current game.
   * Units can be seconds, milliseconds, or as defined by the app's timing logic.
   *
   *  - `player_X`: Total time spent by Player X
   *  - `player_O`: Total time spent by Player O
   */
  playerSpentTime?: {
    player_X?: number;
    player_O?: number;
  };

  /**
   * Winner of the current game.
   * Can be 'x', 'o', 'draw', or `null` if the game is ongoing.
   */
  winner?: 'x' | 'o' | 'draw' | null;
}
