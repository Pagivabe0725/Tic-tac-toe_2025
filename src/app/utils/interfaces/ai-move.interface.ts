
export interface aiMove {
  winner: 'x' | 'o';
  region: string[][];
  lastMove: { row: number; column: number };
  board: string[][];
}
