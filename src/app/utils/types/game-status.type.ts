import { SAVED_GAME_STATUSES } from '../constants/saved-game-status.constant';

/**
 * Represents the valid status values of a saved game.
 *
 * This type is dynamically derived from `SAVED_GAME_STATUSES`,
 * meaning it will always stay in sync with the constant array.
 *
 * Equivalent to a union of:
 * 'not_started' | 'in_progress' | 'won' | 'lost' | 'draw'
 */
export type savedGameStatus = (typeof SAVED_GAME_STATUSES)[number];
