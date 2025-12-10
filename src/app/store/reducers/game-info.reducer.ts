import { createReducer, on } from '@ngrx/store';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';
import { parseFromStorage } from '../../utils/functions/parser.function';
import { GameInfo } from '../../utils/interfaces/game-info.interface';
import { modifyGameInfo } from '../actions/game-info-modify.action';
import { reserGameInfo } from '../actions/game-info-reset.action';
import { storageCleaner } from '../../utils/functions/storage-cleaner.function';
import { resetGameInfoResults } from '../actions/game-info-results-reset.action';

/**
 * Initial state for the GameInfo feature.
 * It attempts to restore values from sessionStorage using `parseFromStorage`.
 * If no values exist in sessionStorage, defaults are used.
 */
const INITIAL_STATE: GameInfo = {
  /**
   * Game results: wins, losses, and draws for both players.
   * Attempt to restore from sessionStorage, otherwise defaults to 0.
   */
  results: parseFromStorage<GameInfo['results']>(
    `${STORAGE_PREFIX}results`,
    'sessionStorage'
  ) ?? {
    player_O_Lose: 0,
    player_X_Lose: 0,
    draw: 0,
    player_X_Win: 0,
    player_O_Win: 0,
  },

  /**
   * Current step number of the game.
   * Restored from sessionStorage if available.
   */
  actualStep:
    parseFromStorage<GameInfo['actualStep']>(
      `${STORAGE_PREFIX}actualStep`,
      'sessionStorage'
    ) ?? 0,

  /**
   * Current player's markup ('x' or 'o').
   * Restored from sessionStorage if available.
   */
  actualMarkup:
    parseFromStorage<GameInfo['actualMarkup']>(
      `${STORAGE_PREFIX}actualMarkup`,
      'sessionStorage'
    ) ?? 'o',

  /**
   * Indicates whether the game has started.
   * Defaults to false.
   */
  started: false,

  /**
   * Last move made in the game.
   * Restored from sessionStorage if available.
   */
  lastMove: parseFromStorage<GameInfo['lastMove']>(
    `${STORAGE_PREFIX}lastMove`,
    'sessionStorage'
  ),

  /**
   * Current state of the game board (2D array).
   * Restored from sessionStorage if available.
   */
  actualBoard: parseFromStorage<GameInfo['actualBoard']>(
    `${STORAGE_PREFIX}actualBoard`,
    'sessionStorage'
  ),

  /**
   * Stores the total time spent by each player.
   * Restored from sessionStorage if available, otherwise defaults to 0.
   */
  playerSpentTime: parseFromStorage<GameInfo['playerSpentTime']>(
    `${STORAGE_PREFIX}playerSpentTime`,
    'sessionStorage'
  ) ?? { player_X: 0, player_O: 0 },

  /**
   * Stores the winner of the current game ('x', 'o', or null if no winner).
   * Restored from sessionStorage if available.
   */
  winner:
    parseFromStorage<GameInfo['winner']>(
      `${STORAGE_PREFIX}winner`,
      'sessionStorage'
    ) ?? null,

  /**
   * Name of the loaded/saved game.
   * Used when restoring a previously saved game from storage.
   */
  loadedGameName: parseFromStorage<GameInfo['loadedGameName']>(
    `${STORAGE_PREFIX}loadedGameName`,
    'sessionStorage'
  ),
};

/**
 * Reducer for the GameInfo feature.
 * Manages all state updates related to the dynamic, in-game information
 * such as the board, turns, winner, timers, and last move.
 */
export const gameInfoReducer = createReducer(
  INITIAL_STATE,

  /**
   * Handles the `modifyGameInfo` action.
   * This action can partially update any number of fields in the GameInfo state.
   *
   * The reducer extracts every field from the action except the mandatory `type`,
   * and merges them with the existing state.
   * This makes the action "generic" and capable of updating multiple fields at once.
   */
  on(modifyGameInfo, (state, action) => {
    const { type, ...properties } = action;
    return {
      ...state,
      ...properties, // overrides only the provided properties
    };
  }),

  /**
   * Resets all in-game, mutable fields to their initial state.
   * Only gameplay-related properties are cleared; persistent settings are untouched.
   */
  on(reserGameInfo, (state) => {
    // Remove gameplay-related values from sessionStorage
    // to prevent old data from reloading after a reset.
    storageCleaner(
      'sessionStorage',
      true,
      'actualBoard',
      'actualStep',
      'actualMarkup',
      'lastMove',
      'playerSpentTime',
      'results',
      'started',
      'winner',
      'loadedGameName'
    );

    // Return the cleared game state (fresh, pre-game state)
    return {
      ...state,
      actualBoard: undefined,
      actualMarkup: 'o' as const,
      actualStep: 0,
      started: false,
      winner: undefined,
      playerSpentTime: { player_X: 0, player_O: 0 },
      lastMove: undefined,
    };
  }),

  /**
   * Resets only the game result statistics.
   * Clears stored win/lose/draw counters both from the state and from sessionStorage.
   *
   * This action does NOT affect the current game board, steps, or winner state,
   * only the historical results data.
   */
  on(resetGameInfoResults, (state) => {
    // Clean related values from sessionStorage to prevent stale data after reset
    storageCleaner('sessionStorage', true, 'playerSpentTime');

    // Return state with reset results but keep all other game state intact
    return {
      ...state,
      results: {
        player_O_Lose: 0,
        player_X_Lose: 0,
        draw: 0,
        player_X_Win: 0,
        player_O_Win: 0,
      },
    };
  })
);
