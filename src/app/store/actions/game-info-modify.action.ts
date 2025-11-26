import { createAction, props } from "@ngrx/store";
import { GameInfo } from "../../utils/interfaces/game-info.interface";

/**
 * @action modifyGameInfo
 *
 * Action used to update the game's state in the NgRx store.
 *
 * Payload properties correspond to the {@link GameInfo} interface:
 * - `results?` ({@link GameInfo['results']}) — Optional cumulative game results.
 * - `actualMarkup?` ('x' | 'o') — Optional current player's markup.
 * - `actualStep?` ({@link number}) — Optional current step number.
 * - `started?` ({@link boolean}) — Optional flag indicating whether the game has started.
 * - `actualBoard?` ({@link string[][]}) — Optional 2D array representing the game board.
 * - `lastMove?` ({@link GameInfo['lastMove']}) — Optional last move coordinates.
 *
 * Usage example:
 * ```ts
 * store.dispatch(modifyGameInfo({
 *   actualMarkup: 'x',
 *   actualStep: 3,
 *   lastMove: { row: 1, column: 2 }
 * }));
 * ```
 */
export const modifyGameInfo = createAction(
  '[gameInfo] modifier',
  props<GameInfo>()
);
