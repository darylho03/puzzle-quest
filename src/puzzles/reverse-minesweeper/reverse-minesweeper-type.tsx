import React from 'react';
import { PuzzleType } from '../core/puzzle-type';
import { Category, Coordinate, GridSize, Move, ValidationResult } from '../core/types';
import { CssLayer } from '../../components/PuzzleSquare';

type RMCell = number;

const CELL_SIZE = 64;

export function createReverseMinesweeperType(rows: number, cols: number): PuzzleType<RMCell> {
  return {
    id: 'reverse-minesweeper',
    name: 'Reverse Minesweeper',
    category: 'number-logic' as Category,
    defaultSize: { rows, cols },
    cellSize: CELL_SIZE,
    rules: [
      {
        icon: <img src="/rule_icons/sudoku.png" alt="Numbers" width={60} height={60} />,
        heading: 'NUMBERS',
        body: 'Each number must see exactly that many mines in its own cell and all 8 adjacent cells.',
      },
      {
        icon: <img src="/rule_icons/sudoku.png" alt="Drag" width={60} height={60} />,
        heading: 'DRAG & DROP',
        body: 'Drag mines between cells to rearrange them. Mines can only move to cells with matching color planes.',
      },
      {
        icon: <img src="/rule_icons/sudoku.png" alt="Walls" width={60} height={60} />,
        heading: 'WALLS',
        body: "Colored walls restrict where mines can go. A mine must match the wall's plane to enter.",
      },
    ],

    getEmptyCell(): RMCell { return 0; },
    getLockedCells(): readonly Coordinate[] { return []; },
    getTile(): CssLayer { return {}; },
    validate(): ValidationResult { return { invalidCells: [], solved: false }; },
    classifyMove(): string { return 'swap'; },
    formatMoveLabel(move: Move<RMCell>): string {
      return `(${move.cell.row + 1}, ${move.cell.col + 1})`;
    },
    getRelatedCells(cell: Coordinate, size: GridSize): readonly Coordinate[] {
      const related: Coordinate[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = cell.row + dr, c = cell.col + dc;
          if (r >= 0 && r < size.rows && c >= 0 && c < size.cols) {
            related.push({ row: r, col: c });
          }
        }
      }
      return related;
    },
  };
}
