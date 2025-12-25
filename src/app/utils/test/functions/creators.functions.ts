import { GameInfo } from '../../interfaces/game-info.interface';
import { SavedGame } from '../../interfaces/saved-game.interface';
import { User } from '../../interfaces/user.interface';
import { savedGameStatus } from '../../types/game-status.type';
import { randomBetween, randomNumber } from './random-values.function';

export function createUser(fix: boolean): User {
  const randomNumber = Math.floor(Math.random() * 10);

  return {
    email: `test${fix ? 1 : randomNumber}@gmail.com`,
    userId: fix ? '1' : String(randomNumber),
    winNumber: fix ? 1 : randomNumber,
    loseNumber: fix ? 1 : randomNumber,
    game_count: fix ? 2 : randomNumber * 2,
  } as User;
}

export function createGame(
  id: string,
  userId: string,
  status: savedGameStatus
): SavedGame {
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

  const actualBoard = boards.get(status);

  return {
    gameId: id,
    name: 'Test Game',
    board: actualBoard!.board,
    lastMove: actualBoard?.lastMove,
    status: status,
    userId: userId,
    difficulty: 'medium',
    size: 3,
    opponent: 'computer',
    updatedAt: Date.now().toString(),
    createdAt: Date.now().toString(),
  };
}

export function createBoard(
  size: number
): NonNullable<GameInfo['actualBoard']> {
  let result: string[][] = [];

  for (let i = 0; i < size; i++) {
    let element: string[] = [];

    for (let j = 0; j < size; j++) {
      element.push('');
    }
    result.push(element);
  }
  return result;
}

export function createGameInfo(): GameInfo {
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

    actualBoard: createBoard(randomBetween(3, 9)),

    lastMove: undefined,

    playerSpentTime: {
      player_X: randomNumber(200),
      player_O: randomNumber(200),
    },

    winner: null,
    loadedGameName: `test-session-${randomNumber(1000)}`,
  };
}
