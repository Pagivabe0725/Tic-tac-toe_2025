import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameInfo } from '../../utils/interfaces/game-info.interface';

/**
 * @selector selectGameInfo
 * Root-level selector for the `gameInfo` feature slice.
 * Serves as the main entry point for accessing all state fragments
 * related to the current game session.
 */
export const selectGameInfo = createFeatureSelector<GameInfo>('gameInfo');

/**
 * @selector selectGameResults
 * Extracts the cumulative game results from the store.
 *
 * Returns an object containing:
 * - wins, losses for both players
 * - total draws across all sessions
 *
 * Useful for scoreboard diplays and statistics overview panels.
 */
export const selectGameResults = createSelector(
  selectGameInfo,
  (state) => state.results
);

/**
 * @selector selectActualMarkup
 * Returns the player markup ('x' or 'o') that is currently active.
 * Effectively determines whose turn it is.
 *
 * This selector is frequently used by game logic,
 * move validation, and UI components that highlight active players.
 */
export const selectActualMarkup = createSelector(
  selectGameInfo,
  (state) => state.actualMarkup
);

/**
 * @selector selectActualStep
 * Retrieves the current step index of the ongoing match.
 * Used for pacing logic, move counters, and timing functionality.
 */
export const selectActualStep = createSelector(
  selectGameInfo,
  (state) => state.actualStep
);

/**
 * @selector selectStarted
 * Boolean selector indicating whether a game is currently active.
 * Useful for enabling/disabling UI buttons, overlays, or for routing guards.
 */
export const selectStarted = createSelector(
  selectGameInfo,
  (state) => state.started
);

/**
 * @selector selectActualBoard
 * Returns the 2D array structuring the game board.
 *
 * Each cell contains:
 * - 'x' for Player X
 * - 'o' for Player O
 * - '' for an empty position
 *
 * Used by render components, AI helpers, and validation tools.
 */
export const selectActualBoard = createSelector(
  selectGameInfo,
  (state) => state.actualBoard
);

/**
 * @selector selectLastMove
 * Returns metadata describing the most recent move performed.
 *
 * Typically contains:
 * - row index
 * - column index
 *
 * Used for animations, highlighting, and region-based board updates.
 */
export const selectLastMove = createSelector(
  selectGameInfo,
  (state) => state.lastMove
);

/**
 * @selector selectPlayersSpentTimes
 * Retrieves the cumulative time spent by each player during the current match.
 *
 * Returns an object:
 * {
 *   player_X: number,
 *   player_O: number
 * }
 *
 * This selector supports timer displays, analytics, and turn-duration features.
 */
export const selectPlayersSpentTimes = createSelector(
  selectGameInfo,
  (state) => state.playerSpentTime
);

/**
 * @selector selectGameWinner
 * Returns the winner of the current game: 'x', 'o', 'draw', or null if no winner yet.
 */
export const selectGameWinner = createSelector(
  selectGameInfo,
  (state) => state.winner
);

/**
 * @selector selectLoadedGameName
 * Returns the name of a loaded/saved game session, if any.
 *
 * This value is set when a saved game is loaded.
 * It will be `undefined` when the current game was not loaded.
 */
export const selectLoadedGameName = createSelector(
  selectGameInfo,
  (state) => state.loadedGameName
);


