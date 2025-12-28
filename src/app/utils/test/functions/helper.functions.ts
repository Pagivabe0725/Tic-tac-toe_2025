import { SAVED_GAME_STATUSES } from '../../constants/saved-game-status.constant';
import { GameInfo } from '../../interfaces/game-info.interface';
import { SavedGame } from '../../interfaces/saved-game.interface';
import { savedGameStatus } from '../../types/game-status.type';

export function flipGame(game: SavedGame): SavedGame {
  const flippedBoard = game.board.map((row) =>
    row.map((cell) => (cell === 'x' ? 'o' : cell === 'o' ? 'x' : cell))
  );

  let flippedStatus: SavedGame['status'] = game.status;
  if (game.status === 'won') flippedStatus = 'lost';
  else if (game.status === 'lost') flippedStatus = 'won';

  return {
    ...game,
    board: flippedBoard,
    status: flippedStatus,
  };
}

export function getNextMarkup(
  board: string[][]
): Exclude<GameInfo['actualMarkup'], undefined> {
  let numbertOf_X = 0;
  let numbertOf_O = 0;

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

  if (!numbertOf_O && !numbertOf_X) return 'o';
  else {
    return numbertOf_O > numbertOf_X ? 'o' : 'x';
  }
}

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

export function getCallsArray(call: any): object[] {
  const result: object[] = [];
  call.forEach((element: any) => {
    result.push(element['args'][0]);
  });

  return result;
}
