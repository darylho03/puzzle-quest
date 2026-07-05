export interface Coordinate {
  readonly row: number;
  readonly col: number;
}

export interface GridSize {
  readonly rows: number;
  readonly cols: number;
}

export type Category = 'sudoku' | 'number-logic' | 'shape-logic' | 'line-logic';

export type Grid<T> = readonly (readonly T[])[];

export interface PuzzleMeta {
  readonly id: string;
  readonly puzzleTypeId: string;
  readonly size: GridSize;
  readonly difficulty?: number;
}

export interface ValidationResult {
  readonly invalidCells: readonly Coordinate[];
  readonly solved: boolean;
}

export interface Move<TCell> {
  readonly type: string;
  readonly cell: Coordinate;
  readonly value: TCell;
  readonly previousValue: TCell;
}

export interface SolverStep {
  readonly cell: Coordinate;
  readonly value: number;
  readonly technique: string;
  readonly relatedCells: readonly Coordinate[];
}
