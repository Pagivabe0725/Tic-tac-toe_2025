import { createAction } from "@ngrx/store";

/**
 * Resets the game results state.
 * This action is used to clear wins, losses and draw counters
 * in the gameInfo store slice and restore them to their initial values.
 */
export const resetGameInfoResults = createAction(
  '[gameInfo] result resetter',
);
