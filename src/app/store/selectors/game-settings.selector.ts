import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameSettings } from '../../utils/interfaces/game-settings.interface';

/**
 * Feature selector for the 'gameSettings' slice of the store.
 * Provides access to the general settings of the game.
 */
export const selectGameSettings =
  createFeatureSelector<GameSettings>('gameSettings');

/**
 * Selector for the size of the game board.
 * Returns a number indicating the board dimension (e.g., 3 for 3x3 board).
 */
export const selectGameSize = createSelector(
  selectGameSettings,
  (state) => state.size
);

/**
 * Selector for the opponent type.
 * Returns either 'player' for human opponent or 'computer' for AI.
 */
export const selectGameOpponent = createSelector(
  selectGameSettings,
  (state) => state.opponent
);

/**
 * Selector for the AI hardness/difficulty level.
 * Returns a number indicating how strong the AI is.
 */
export const selectGameHardness = createSelector(
  selectGameSettings,
  (state) => state.hardness
);
