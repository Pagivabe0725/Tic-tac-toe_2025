import { createAction, props } from "@ngrx/store";

/**
 * @action modifyGameState
 *
 * Action used to update the game's settings in the NgRx store.
 *
 * Payload properties:
 * - `size?` ({@link number}) — Optional board size.
 * - `hardness` ({@link number}) — The AI difficulty level.
 * - `opponent` ({@link 'player' | 'computer'}) — Type of opponent.
 *
 * Usage example:
 * ```ts
 * store.dispatch(modifyGameState({ size: 5, hardness: 2, opponent: 'computer' }));
 * ```
 */
export const modifyGameState = createAction(
    '[gameState] modifier',
    props<{ size?: number; hardness?: number; opponent?: 'player' | 'computer' }>()
);
