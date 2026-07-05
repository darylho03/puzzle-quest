import { Grid, GridSize } from './types';

export interface PuzzleEncoder<TCell> {
  encode(grid: Grid<TCell>): string;

  decode(encoded: string, size: GridSize): TCell[][];
}
