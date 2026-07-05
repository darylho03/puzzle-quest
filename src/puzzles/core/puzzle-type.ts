import { ReactNode } from 'react';
import { CssLayer } from '../../components/PuzzleSquare';
import { Rule } from '../../components/RulesSidebar';
import { Category, Coordinate, Grid, GridSize, Move, ValidationResult } from './types';

export interface PuzzleType<TCell> {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  readonly defaultSize: GridSize;
  readonly cellSize: number;
  readonly rules: readonly Rule[];

  getEmptyCell(): TCell;

  getLockedCells(clues: Grid<TCell>): readonly Coordinate[];

  getTile(row: number, col: number, size: GridSize): CssLayer;

  validate(grid: Grid<TCell>, size: GridSize): ValidationResult;

  classifyMove(value: TCell, previousValue: TCell): string;

  formatMoveLabel(move: Move<TCell>): string;

  getRelatedCells(cell: Coordinate, size: GridSize): readonly Coordinate[];
}
