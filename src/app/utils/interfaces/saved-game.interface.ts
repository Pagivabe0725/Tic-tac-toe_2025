import { savedGameStatus } from '../types/game-status.type';
import { Hardness } from '../types/hardness.type';
import { GameSettings } from './game-settings.interface';

/**
 * Represents a single game session.
 * Stores board state, last move, game status and ownership information.
 */
export interface SavedGame {
  /**
   * Unique identifier for the game.
   */
  gameId: string;

  /**
   * Name of the game.
   * This is the user-defined name for easier identification.
   */
  name: string;

  /**
   * 2D array representing the game board.
   * Each cell can contain a marker (e.g., "x", "o") or an empty string.
   * The array dimensions match the `size` property.
   */
  board: any[][];

  /**
   * Last move made in the game.
   * Contains row and column indexes, or undefined if no move has been played yet.
   */
  lastMove:
    | {
        row: number;
        column: number;
      }
    | undefined;

  /**
   * Current state of the game.
   * Matches the backend enum values (lowercase form):
   * - 'not_started': game has not begun
   * - 'in_progress': game is ongoing
   * - 'won': the user won
   * - 'lost': the user lost
   * - 'draw': the game ended in a draw
   */
  status: savedGameStatus;

  /**
   * Identifier of the user who owns this game.
   * Matches the `userId` in the Users table.
   */
  userId: string;

  /**
   * Game difficulty.
   * Maps to GameSettings['hardness'], e.g., 'easy', 'medium', 'hard', 'very_easy'.
   */
  difficulty: Hardness;

  /**
   * Board size (e.g., 3 for a 3x3 board).
   */
  size: number;

  /**
   * The opponent type.
   * Maps to GameSettings['opponent'], e.g., 'player' or 'computer'.
   */
  opponent: GameSettings['opponent'];

  /**
   * Timestamp of the last update performed on this game.
   * Usually generated automatically by Sequelize as a string (ISO or epoch).
   */
  updatedAt: string;

  /**
   * Timestamp indicating when this game entry was created.
   * Usually generated automatically by Sequelize as a string (ISO or epoch).
   */
  createdAt: string; // corrected from `createAt`
}
