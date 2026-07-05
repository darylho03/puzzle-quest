import React from 'react';
import { CssLayer } from '../../components/PuzzleSquare';
import { PuzzleType } from '../core/puzzle-type';
import {
  Category,
  Coordinate,
  Grid,
  GridSize,
  Move,
  ValidationResult,
} from '../core/types';

type SudokuCell = number | null;

const GRID_SIZE = 9;
const CELL_SIZE = 52;
const BORDER_WIDTH = 2;
const BLACK = 'black';
const GRAY = '#BBBBBB';

function getTile(row: number, col: number): CssLayer {
  return {
    borders: {
      top: { width: BORDER_WIDTH, color: row % 3 === 0 ? BLACK : GRAY },
      bottom: { width: BORDER_WIDTH, color: (row + 1) % 3 === 0 ? BLACK : GRAY },
      left: { width: BORDER_WIDTH, color: col % 3 === 0 ? BLACK : GRAY },
      right: { width: BORDER_WIDTH, color: (col + 1) % 3 === 0 ? BLACK : GRAY },
    },
  };
}

function validate(grid: Grid<SudokuCell>): ValidationResult {
  const invalidCells: Coordinate[] = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    const rowSeen = new Map<number, Coordinate[]>();
    const colSeen = new Map<number, Coordinate[]>();
    for (let j = 0; j < GRID_SIZE; j++) {
      const rowVal = grid[i][j];
      if (rowVal !== null) {
        const coords = rowSeen.get(rowVal) ?? [];
        coords.push({ row: i, col: j });
        rowSeen.set(rowVal, coords);
      }
      const colVal = grid[j][i];
      if (colVal !== null) {
        const coords = colSeen.get(colVal) ?? [];
        coords.push({ row: j, col: i });
        colSeen.set(colVal, coords);
      }
    }
    for (const coords of rowSeen.values()) {
      if (coords.length > 1) invalidCells.push(...coords);
    }
    for (const coords of colSeen.values()) {
      if (coords.length > 1) invalidCells.push(...coords);
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, Coordinate[]>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const r = boxRow * 3 + i;
          const c = boxCol * 3 + j;
          const val = grid[r][c];
          if (val !== null) {
            const coords = seen.get(val) ?? [];
            coords.push({ row: r, col: c });
            seen.set(val, coords);
          }
        }
      }
      for (const coords of seen.values()) {
        if (coords.length > 1) invalidCells.push(...coords);
      }
    }
  }

  const uniqueInvalid = Array.from(
    new Map(invalidCells.map(c => [`${c.row},${c.col}`, c])).values()
  );

  const allFilled = grid.every(row => row.every(cell => cell !== null));
  return {
    invalidCells: uniqueInvalid,
    solved: allFilled && uniqueInvalid.length === 0,
  };
}

export const sudokuType: PuzzleType<SudokuCell> = {
  id: 'sudoku',
  name: 'Sudoku',
  category: 'sudoku' as Category,
  defaultSize: { rows: GRID_SIZE, cols: GRID_SIZE },
  cellSize: CELL_SIZE,
  rules: [
    {
      icon: <img src="/rule_icons/sudoku.png" alt="Sudoku" width={60} height={60} />,
      heading: 'SUDOKU',
      body: 'Fill the grid such that each row, column, and 3x3 box has the numbers 1-9.',
    },
  ],

  getEmptyCell(): SudokuCell {
    return null;
  },

  getLockedCells(clues: Grid<SudokuCell>): readonly Coordinate[] {
    const locked: Coordinate[] = [];
    for (let row = 0; row < clues.length; row++) {
      for (let col = 0; col < clues[row].length; col++) {
        if (clues[row][col] !== null) locked.push({ row, col });
      }
    }
    return locked;
  },

  getTile(row: number, col: number): CssLayer {
    return getTile(row, col);
  },

  validate(grid: Grid<SudokuCell>): ValidationResult {
    return validate(grid);
  },

  classifyMove(value: SudokuCell, previousValue: SudokuCell): string {
    if (value === null) return 'delete';
    if (previousValue !== null) return 'replace';
    return 'place';
  },

  formatMoveLabel(move: Move<SudokuCell>): string {
    const coords = `(${move.cell.row + 1}, ${move.cell.col + 1})`;
    switch (move.type) {
      case 'delete':
        return `${move.previousValue} ${coords}`;
      case 'replace':
        return `${move.previousValue} → ${move.value} ${coords}`;
      default:
        return `${move.value} ${coords}`;
    }
  },

  getRelatedCells(cell: Coordinate, size: GridSize): readonly Coordinate[] {
    const related: Coordinate[] = [];
    const boxRow = Math.floor(cell.row / 3) * 3;
    const boxCol = Math.floor(cell.col / 3) * 3;
    for (let i = 0; i < size.rows; i++) {
      if (i !== cell.col) related.push({ row: cell.row, col: i });
      if (i !== cell.row) related.push({ row: i, col: cell.col });
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = boxRow + i;
        const c = boxCol + j;
        if (r !== cell.row || c !== cell.col) {
          if (!related.some(coord => coord.row === r && coord.col === c)) {
            related.push({ row: r, col: c });
          }
        }
      }
    }
    return related;
  },
};
