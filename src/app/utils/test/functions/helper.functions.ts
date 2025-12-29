
import { GameInfo } from '../../interfaces/game-info.interface';
import { SavedGame } from '../../interfaces/saved-game.interface';
import { savedGameStatus } from '../../types/game-status.type';

/**
 * Flips a saved game's board by swapping 'x' <-> 'o' marks.
 *
 * Also flips the game status for finished outcomes:
 * - 'won'  -> 'lost'
 * - 'lost' -> 'won'
 *
 * Other statuses remain unchanged (e.g. 'draw', 'in_progress', 'not_started').
 *
 * @param game - The saved game to flip.
 * @returns A new SavedGame with flipped board and (possibly) flipped status.
 */
export function flipGame(game: SavedGame): SavedGame {
  /** Create a new board matrix where each cell is swapped ('x' <-> 'o'). */
  const flippedBoard = game.board.map((row) =>
    row.map((cell) => (cell === 'x' ? 'o' : cell === 'o' ? 'x' : cell))
  );

  /** Determine the mirrored status for finished games. */
  let flippedStatus: SavedGame['status'] = game.status;
  if (game.status === 'won') flippedStatus = 'lost';
  else if (game.status === 'lost') flippedStatus = 'won';

  return {
    ...game,
    board: flippedBoard,
    status: flippedStatus,
  };
}

/**
 * Determines the next markup ('x' or 'o') based on the current board.
 *
 * Rules:
 * - If the board is empty (no 'x' and no 'o'), next is 'o' (first move).
 * - Otherwise:
 *   - If there are more 'o' than 'x', next is 'o'
 *   - Else next is 'x'
 *
 * @param board - Current board state (2D array).
 * @returns The next markup to play ('x' or 'o').
 */
export function getNextMarkup(
  board: string[][]
): Exclude<GameInfo['actualMarkup'], undefined> {
  /** Count of 'x' cells found on the board. */
  let numbertOf_X = 0;
  /** Count of 'o' cells found on the board. */
  let numbertOf_O = 0;

  // Count marks on the board.
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      switch (board[i][j]) {
        case 'o':
          ++numbertOf_O;
          break;
        case 'x':
          ++numbertOf_X;
          break;
        default:
          break;
      }
    }
  }

  // If board is empty, 'o' starts.
  if (!numbertOf_O && !numbertOf_X) return 'o';

  // Otherwise decide based on counts.
  return numbertOf_O > numbertOf_X ? 'o' : 'x';
}

/**
 * Converts a saved game status into a winner representation.
 *
 * Mapping:
 * - 'in_progress' / 'not_started' -> undefined (no winner yet)
 * - 'draw' -> 'draw'
 * - 'lost' -> 'x'
 * - 'won'  -> 'o'
 *
 * @param status - Saved game status.
 * @returns Winner markup, 'draw', or undefined if ongoing/not started.
 */
export function getWinnerByGameStatus(
  status: savedGameStatus
): GameInfo['actualMarkup'] | 'draw' {
  switch (status) {
    case 'in_progress':
    case 'not_started':
      return undefined;

    case 'draw':
      return 'draw';

    case 'lost':
      return 'x';

    case 'won':
      return 'o';
  }
}

/**
 * Helper for test assertions: converts a spy call list into an array of first-argument payloads.
 *
 * Intended usage:
 * - When a spy was called multiple times and you want only the first argument of each call.
 *
 * @param call - A spy call collection (e.g. `spy.calls.all()` or similar structure).
 * @returns Array of captured first arguments.
 */
export function getCallsArray(call: any): object[] {
  /** Result list containing the first argument from each recorded call. */
  const result: object[] = [];

  call.forEach((element: any) => {
    result.push(element['args'][0]);
  });

  return result;
}
