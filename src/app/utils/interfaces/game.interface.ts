export interface game {
  board: string[][];
  markup: 'x' | 'o';
  hardness: 'very-easy' | 'easy' | 'medium' | 'hard';
  startRow?: number;
  startColumn?: number;
  endRow?: number;
  endColumn?: number;
  lastMove?: { row: number; column: number };
}
