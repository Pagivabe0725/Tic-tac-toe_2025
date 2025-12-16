import { SavedGame } from '../../interfaces/saved-game.interface';
import { User } from '../../interfaces/user.interface';
import { savedGameStatus } from '../../types/game-status.type';

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
          ['x', 'o', ''],
          ['', 'x', ''],
          ['o', '', 'x'],
        ],
        lastMove: { row: 1, column: 1 },
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


