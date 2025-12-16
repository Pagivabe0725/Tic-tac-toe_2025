import { SavedGame } from "../../interfaces/saved-game.interface";

export function flipGame(game: SavedGame): SavedGame {
  const flippedBoard = game.board.map(row =>
    row.map(cell =>
      cell === 'x'
        ? 'o'
        : cell === 'o'
        ? 'x'
        : cell
    )
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
