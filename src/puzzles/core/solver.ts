import { Grid, GridSize, SolverStep } from './types';

export interface SolverResult<TCell> {
  readonly solved: boolean;
  readonly solution: TCell[][] | null;
  readonly solutionCount: number;
  readonly trace?: readonly SolverStep[];
}

export interface Solver<TCell> {
  solve(clues: Grid<TCell>, size: GridSize): SolverResult<TCell>;

  hasUniqueSolution(clues: Grid<TCell>, size: GridSize): boolean;
}
