import { useState, useCallback, useMemo } from 'react';
import { Coordinate, SolverStep } from '../puzzles/core/types';
import { LogEntry } from './LogsSidebar';

export type CheckAction =
  | { action: 'check-clean' }
  | { action: 'check-dirty'; mistakeCount: number }
  | { action: 'reveal'; cell: Coordinate }
  | { action: 'hint'; cell: Coordinate };

export interface UseCheckRevealHintResult {
  buttonState: 'check' | 'reveal' | 'hint';
  buttonLabel: string;
  buttonDisabled: boolean;
  revealCell: Coordinate | null;
  hintCell: Coordinate | null;
  handleClick: () => CheckAction | null;
  resetToCheck: () => void;
  getNextSolveStep: () => SolverStep | null;
}

function findMistakes(
  grid: (number | null)[][],
  solution: (number | null)[][],
  lockedCells: Coordinate[],
): Coordinate[] {
  const locked = new Set(lockedCells.map(c => `${c.row},${c.col}`));
  const mistakes: Coordinate[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (locked.has(`${r},${c}`)) continue;
      const val = grid[r][c];
      if (val !== null && val !== solution[r][c]) {
        mistakes.push({ row: r, col: c });
      }
    }
  }
  return mistakes;
}

function findEarliestIncorrect(
  grid: (number | null)[][],
  solution: (number | null)[][],
  logs: LogEntry[],
): Coordinate | null {
  const seen = new Set<string>();
  for (const entry of logs) {
    if (entry.row < 0 || entry.col < 0) continue;
    const key = `${entry.row},${entry.col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const val = grid[entry.row][entry.col];
    if (val !== null && val !== solution[entry.row][entry.col]) {
      return { row: entry.row, col: entry.col };
    }
  }
  return null;
}

function findNextHint(
  grid: (number | null)[][],
  solverTrace: SolverStep[],
  solution: (number | null)[][],
): Coordinate | null {
  for (const step of solverTrace) {
    if (grid[step.cell.row][step.cell.col] === null) {
      return step.cell;
    }
  }
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === null && solution[r][c] !== null) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function useCheckRevealHint(
  grid: (number | null)[][],
  solution: (number | null)[][] | null,
  solverTrace: SolverStep[],
  logs: LogEntry[],
  lockedCells: Coordinate[],
): UseCheckRevealHintResult {
  const [buttonState, setButtonState] = useState<'check' | 'reveal' | 'hint'>('check');
  const [revealCell, setRevealCell] = useState<Coordinate | null>(null);
  const [hintCell, setHintCell] = useState<Coordinate | null>(null);

  const resetToCheck = useCallback(() => {
    setButtonState('check');
    setRevealCell(null);
    setHintCell(null);
  }, []);

  const buttonDisabled = useMemo(() => {
    if (!solution) return true;
    if (buttonState !== 'check') return false;
    const lastLog = logs[logs.length - 1];
    return !!(lastLog?.errors && lastLog.errors.length > 0);
  }, [solution, logs, buttonState]);

  const buttonLabel = buttonState === 'check' ? 'Check'
    : buttonState === 'reveal' ? 'Reveal'
    : 'Hint';

  const handleClick = useCallback((): CheckAction | null => {
    if (!solution) return null;

    if (buttonState === 'check') {
      const mistakes = findMistakes(grid, solution, lockedCells);
      if (mistakes.length > 0) {
        setButtonState('reveal');
        return { action: 'check-dirty', mistakeCount: mistakes.length };
      } else {
        setButtonState('hint');
        return { action: 'check-clean' };
      }
    }

    if (buttonState === 'reveal') {
      const cell = findEarliestIncorrect(grid, solution, logs);
      if (cell) {
        setRevealCell(cell);
        setButtonState('check');
        return { action: 'reveal', cell };
      }
      setButtonState('check');
      return null;
    }

    if (buttonState === 'hint') {
      const cell = findNextHint(grid, solverTrace, solution);
      if (cell) {
        setHintCell(cell);
        setButtonState('check');
        return { action: 'hint', cell };
      }
      setButtonState('check');
      return null;
    }

    return null;
  }, [buttonState, grid, solution, solverTrace, logs, lockedCells]);

  const getNextSolveStep = useCallback((): SolverStep | null => {
    if (!solution) return null;
    for (const step of solverTrace) {
      if (grid[step.cell.row][step.cell.col] === null) {
        return step;
      }
    }
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === null && solution[r][c] !== null) {
          return {
            cell: { row: r, col: c },
            value: solution[r][c] as number,
            technique: 'Solution',
            relatedCells: [],
          };
        }
      }
    }
    return null;
  }, [grid, solution, solverTrace]);

  return {
    buttonState,
    buttonLabel,
    buttonDisabled,
    revealCell,
    hintCell,
    handleClick,
    resetToCheck,
    getNextSolveStep,
  };
}
