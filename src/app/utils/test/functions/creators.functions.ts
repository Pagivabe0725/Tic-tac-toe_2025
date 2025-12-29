import { INITIAL_STATE, Store } from '@ngrx/store';
import { GameInfo } from '../../interfaces/game-info.interface';
import { SavedGame } from '../../interfaces/saved-game.interface';
import { User } from '../../interfaces/user.interface';
import { savedGameStatus } from '../../types/game-status.type';

import { GameSettings } from '../../interfaces/game-settings.interface';
import { randomBetween, randomNumber } from './random-values.function';

/**
 * Creates a test `User` object.
 * - If `fix` is true, returns stable values (useful for deterministic tests).
 * - Otherwise generates randomized values to broaden coverage.
 */
export function createUser(fix: boolean): User {
  /** Random digit used for non-fixed user generation. */
  const randomNumber = Math.floor(Math.random() * 10);

  return {
    /** Email is stable when `fix` is true, otherwise changes by random digit. */
    email: `test${fix ? 1 : randomNumber}@gmail.com`,
    /** Stable userId for fixed user, random otherwise. */
    userId: fix ? '1' : String(randomNumber),
    /** Stable win/lose counters for fixed user, random otherwise. */
    winNumber: fix ? 1 : randomNumber,
    loseNumber: fix ? 1 : randomNumber,
    /** Stable game count for fixed user, random-based otherwise. */
    game_count: fix ? 2 : randomNumber * 2,
  } as User;
}

/**
 * Creates a test `SavedGame` object in a given status.
 *
 * - Uses predefined board + lastMove pairs to represent each `savedGameStatus`
 *   (won/lost/draw/not_started/in_progress).
 * - Allows overriding opponent type (defaults to 'computer').
 *
 * @param id Unique game id to set on the object.
 * @param userId Owner user id to set on the object.
 * @param status Desired game status (determines board + lastMove).
 * @param opponent Optional opponent override.
 */
export function createGame(
  id: string,
  userId: string,
  status: savedGameStatus,
  opponent?: GameSettings['opponent']
): SavedGame {
  /**
   * Lookup table that maps each status to a representative board and last move.
   * Helps keep test data predictable and easy to reason about.
   */
  const boards: Map<
    savedGameStatus,
    { board: SavedGame['board']; lastMove: SavedGame['lastMove'] }
  > = new Map([
    [
      'won',
      {
        board: [
          ['o', 'x', ''],
          ['', 'o', ''],
          ['x', '', 'o'],
        ],
        lastMove: { row: 1, column: 1 },
      },
    ],
    [
      'lost',
      {
        board: [
          ['x', 'o', 'o'],
          ['', 'x', ''],
          ['o', '', 'x'],
        ],
        lastMove: { row: 1, column: 2 },
      },
    ],
    [
      'draw',
      {
        board: [
          ['x', 'o', 'x'],
          ['x', 'o', 'o'],
          ['o', 'x', 'o'],
        ],
        lastMove: { row: 2, column: 2 },
      },
    ],
    [
      'not_started',
      {
        board: [
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
        ],
        /** No move exists before the game starts. */
        lastMove: undefined,
      },
    ],
    [
      'in_progress',
      {
        board: [
          ['', '', ''],
          ['', 'o', 'x'],
          ['', '', ''],
        ],
        lastMove: { row: 1, column: 2 },
      },
    ],
  ]);

  /** Select the appropriate board/lastMove pair based on the requested status. */
  const actualBoard = boards.get(status);

  return {
    gameId: id,
    name: 'Test Game',
    board: actualBoard!.board,
    lastMove: actualBoard?.lastMove,
    status: status,
    userId: userId,

    /** Keep difficulty stable for predictable tests. */
    difficulty: 'medium',
    /** Default game size used in these fixtures. */
    size: 3,

    /** Defaults to 'computer' unless explicitly overridden. */
    opponent: opponent ?? 'computer',

    /** Timestamps kept as strings as in the original model. */
    updatedAt: Date.now().toString(),
    createdAt: Date.now().toString(),
  };
}

/**
 * Creates an empty NxN board filled with empty strings.
 *
 * Useful for tests that need a clean game board with a specific size.
 *
 * @param size Board side length.
 */
export function createBoard(
  size: number
): NonNullable<GameInfo['actualBoard']> {
  /** Resulting board matrix. */
  let result: string[][] = [];

  for (let i = 0; i < size; i++) {
    /** Row being built. */
    let element: string[] = [];

    for (let j = 0; j < size; j++) {
      element.push('');
    }
    result.push(element);
  }

  return result;
}

/**
 * Creates a randomized `GameInfo` object.
 *
 * Intended for tests where the exact values do not matter,
 * but realistic shapes and value ranges are useful.
 */
export function createGameInfo(): GameInfo {
  /** Randomized values for result counters. */
  const randomX = randomBetween(1, 10);
  const randomY = randomBetween(1, 10);

  return {
    results: {
      player_O_Win: randomX,
      player_X_Win: randomY,
      draw: 1,
      player_O_Lose: randomY,
      player_X_Lose: randomX,
    },

    actualMarkup: 'x',
    actualStep: 0,
    started: false,

    /** Random board size between 3 and 9 for broader coverage. */
    actualBoard: createBoard(randomBetween(3, 9)),

    lastMove: undefined,

    /** Random spent time values for both players. */
    playerSpentTime: {
      player_X: randomNumber(200),
      player_O: randomNumber(200),
    },

    winner: null,
    loadedGameName: `test-session-${randomNumber(1000)}`,
  };
}

/**
 * Creates an object matching the expected store slice shape for tests.
 *
 * - Derives `winner` from saved game status (null for in_progress/not_started).
 * - Allows overriding step, results, started, and spent times.
 *
 * @param game Saved game fixture used as base.
 * @param actualStep Optional override for step.
 * @param result Optional override for results.
 * @param started Optional override for started flag.
 * @param spentTimes Optional override for spent time counters.
 */
export function createStoreInitialState(
  game: SavedGame,
  actualStep?: number,
  result?: GameInfo['results'],
  started?: GameInfo['started'],
  spentTimes?: GameInfo['playerSpentTime']
): object {
  /** Winner is null while the game is not finished, otherwise equals the status. */
  const winner = (['in_progress', 'not_started'] as savedGameStatus[]).includes(
    game.status
  )
    ? null
    : game.status;

  return {
    gameInfo: {
      actualBoard: game.board,
      actualStep: actualStep ?? 0,
      lastMove: game.lastMove,
      started,
      results:
        result ?? {
          player_O_Lose: 0,
          player_X_Lose: 0,
          draw: 0,
          player_X_Win: 0,
          player_O_Win: 0,
        },
      playerSpentTime: spentTimes ?? { player_O: 0, player_X: 0 },
      winner,
    },

    gameSettings: {
      hardness: 2,
      size: 3,
      opponent: game.opponent,
    },
  };
}
