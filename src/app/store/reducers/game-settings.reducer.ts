import { createReducer, on } from '@ngrx/store';
import { modifyGameSettings } from '../actions/game-settings-modify.action';
import { GameSettings } from '../../utils/interfaces/game-settings.interface';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';
import { parseFromStorage } from '../../utils/functions/parser.function';

/**
 * Initial state for the game's settings.
 *
 * Values are loaded from `localStorage` if present, otherwise defaults are used:
 * - `size`: number (default 3)
 * - `opponent`: 'player' | 'computer' (default 'player')
 * - `hardness`: number (default 1)
 *
 * @see {@link GameState}
 */

const INITIAL_STATE: GameSettings = {
  size:
    parseFromStorage<number>(`${STORAGE_PREFIX}size`, 'sessionStorage') ?? 3,
  opponent:
    parseFromStorage<'player' | 'computer'>(
      `${STORAGE_PREFIX}opponent`,
      'sessionStorage'
    ) ?? 'player',
  hardness:
    parseFromStorage<number>(`${STORAGE_PREFIX}hardness`, 'sessionStorage') ??
    1,
};

/**
 * Reducer handling updates to the game state.
 *
 * Uses the `modifyGameState` action to update one or more properties of the state.
 * Other actions can be added to this reducer as needed.
 *
 * @param state Current game state
 * @param action Action dispatched, typically {@link modifyGameState}
 * @returns Updated {@link GameState}
 *
 * Usage example:
 * ```ts
 * store.dispatch(modifyGameState({ size: 5, hardness: 2, opponent: 'computer' }));
 * ```
 */
export const gameSettingsReducer = createReducer(
  INITIAL_STATE,
  on(modifyGameSettings, (state, action) => {
    const { type, ...properties } = action;
    return {
      ...state,
      ...properties,
    };
  })
);
