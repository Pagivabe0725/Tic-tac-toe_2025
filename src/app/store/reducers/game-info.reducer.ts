import { createReducer, on } from '@ngrx/store';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';
import { parseFromStorage } from '../../utils/functions/parser.function';
import { GameInfo } from '../../utils/interfaces/game-info.interface';
import { modifyGameInfo } from '../actions/game-info-modify.action';

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

  playerSpentTime: parseFromStorage<GameInfo['playerSpentTime']>(
    `${STORAGE_PREFIX}playerSpentTime`,
    'sessionStorage'
  ) ?? { player_X: 0, player_O: 0 },

  winner: parseFromStorage<GameInfo['winner']>( `${STORAGE_PREFIX}winner`,'sessionStorage') ?? null
};

/**
 * Reducer for the GameInfo feature.
 * Updates the state based on the `modifyGameInfo` action.
 * Merges incoming properties with the current state.
 */
export const gameInfoReducer = createReducer(
  INITIAL_STATE,

  /**
   * Handles the `modifyGameInfo` action.
   * Spreads the existing state and overrides properties provided in the action.
   */
  on(modifyGameInfo, (state, action) => {
    const { type, ...properties } = action;
    return {
      ...state,
      ...properties,
    };
  })
);
