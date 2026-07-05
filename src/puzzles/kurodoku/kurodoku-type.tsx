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

type KurodokuCell = number; // 0=blank, 1=black, 2=white

const BORDER_WIDTH = 2;
const TARGET_GRID_PX = 468;
const MAX_CELL_SIZE = 64;

function countVisible(
  row: number, col: number,
  grid: Grid<KurodokuCell>,
  rows: number, cols: number,
): number {
  let count = 1;
  for (let i = row - 1; i >= 0; i--) { if (grid[i][col] === 1) break; count++; }
  for (let i = row + 1; i < rows; i++) { if (grid[i][col] === 1) break; count++; }
  for (let j = col - 1; j >= 0; j--) { if (grid[row][j] === 1) break; count++; }
  for (let j = col + 1; j < cols; j++) { if (grid[row][j] === 1) break; count++; }
  return count;
}

function countConnectedWhites(
  row: number, col: number,
  grid: Grid<KurodokuCell>,
  rows: number, cols: number,
): number {
  let count = 1;
  for (let i = row - 1; i >= 0; i--) { if (grid[i][col] !== 2) break; count++; }
  for (let i = row + 1; i < rows; i++) { if (grid[i][col] !== 2) break; count++; }
  for (let j = col - 1; j >= 0; j--) { if (grid[row][j] !== 2) break; count++; }
  for (let j = col + 1; j < cols; j++) { if (grid[row][j] !== 2) break; count++; }
  return count;
}

export function createKurodokuType(
  values: (number | null)[][],
  rows: number,
  cols: number,
): PuzzleType<KurodokuCell> {
  const cellSize = Math.min(MAX_CELL_SIZE, Math.floor(TARGET_GRID_PX / Math.max(rows, cols)));

  function getTile(row: number, col: number): CssLayer {
    return {
      borders: {
        top: { width: BORDER_WIDTH, color: row === 0 ? 'black' : '#999' },
        bottom: { width: BORDER_WIDTH, color: row === rows - 1 ? 'black' : '#999' },
        left: { width: BORDER_WIDTH, color: col === 0 ? 'black' : '#999' },
        right: { width: BORDER_WIDTH, color: col === cols - 1 ? 'black' : '#999' },
      },
    };
  }

  function validate(grid: Grid<KurodokuCell>): ValidationResult {
    const invalidCells: Coordinate[] = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === 1) {
          for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const ni = i + dr, nj = j + dc;
            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] === 1) {
              invalidCells.push({ row: i, col: j });
              break;
            }
          }
        } else if (grid[i][j] === 2 && values[i][j]) {
          const total = countVisible(i, j, grid, rows, cols);
          const whites = countConnectedWhites(i, j, grid, rows, cols);
          if (whites > values[i][j]! || total < values[i][j]!) {
            invalidCells.push({ row: i, col: j });
          }
        }
      }
    }

    const uniqueInvalid = Array.from(
      new Map(invalidCells.map(c => [`${c.row},${c.col}`, c])).values()
    );

    let solved = uniqueInvalid.length === 0;
    if (solved) {
      for (let i = 0; i < rows && solved; i++) {
        for (let j = 0; j < cols && solved; j++) {
          if (grid[i][j] === 0) solved = false;
        }
      }
    }
    if (solved) {
      const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
      let start: [number, number] | null = null;
      for (let i = 0; i < rows && !start; i++) {
        for (let j = 0; j < cols && !start; j++) {
          if (grid[i][j] === 2) start = [i, j];
        }
      }
      if (start) {
        const queue: [number, number][] = [start];
        visited[start[0]][start[1]] = true;
        let whiteCount = 1;
        while (queue.length) {
          const [r, c] = queue.shift()!;
          for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 2 && !visited[nr][nc]) {
              visited[nr][nc] = true;
              queue.push([nr, nc]);
              whiteCount++;
            }
          }
        }
        let totalWhite = 0;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 2) totalWhite++;
          }
        }
        if (whiteCount !== totalWhite) solved = false;
      }
    }
    if (solved) {
      for (let i = 0; i < rows && solved; i++) {
        for (let j = 0; j < cols && solved; j++) {
          if (values[i][j] && grid[i][j] === 2) {
            if (countVisible(i, j, grid, rows, cols) !== values[i][j]) solved = false;
          }
        }
      }
    }

    return { invalidCells: uniqueInvalid, solved };
  }

  function getRelatedCells(cell: Coordinate): readonly Coordinate[] {
    const related: Coordinate[] = [];
    for (let i = 0; i < rows; i++) {
      if (i !== cell.row) related.push({ row: i, col: cell.col });
    }
    for (let j = 0; j < cols; j++) {
      if (j !== cell.col) related.push({ row: cell.row, col: j });
    }
    return related;
  }

  return {
    id: 'kurodoku',
    name: 'Kurodoku',
    category: 'number-logic' as Category,
    defaultSize: { rows, cols },
    cellSize,
    rules: [
      {
        icon: <img src="/rule_icons/no_adj_black.png" alt="No adjacent black cells" width={60} height={60} />,
        heading: 'No Adjacent (Black)',
        body: 'No two black cells can be orthogonally adjacent.',
      },
      {
        icon: <img src="/rule_icons/connected_white.png" alt="Connected white cells" width={60} height={60} />,
        heading: 'Connected (White)',
        body: 'All white cells must be orthogonally connected.',
      },
      {
        icon: <img src="/rule_icons/viewpoint_white.png" alt="Clue numbers" width={60} height={60} />,
        heading: 'Viewpoint (White)',
        body: 'A number in a white cell shows how many white cells can be seen from it (including itself), looking in 4 directions until blocked by a black cell or edge.',
      },
    ],

    getEmptyCell(): KurodokuCell {
      return 0;
    },

    getLockedCells(): readonly Coordinate[] {
      const locked: Coordinate[] = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (values[i][j]) locked.push({ row: i, col: j });
        }
      }
      return locked;
    },

    getTile(row: number, col: number): CssLayer {
      return getTile(row, col);
    },

    validate(grid: Grid<KurodokuCell>): ValidationResult {
      return validate(grid);
    },

    classifyMove(value: KurodokuCell, previousValue: KurodokuCell): string {
      if (value === 0) return 'delete';
      if (previousValue === 0) return 'place';
      return 'replace';
    },

    formatMoveLabel(move: Move<KurodokuCell>): string {
      const coords = `(${move.cell.row + 1}, ${move.cell.col + 1})`;
      if (move.value === 1) return `■ ${coords}`;
      if (move.value === 2) return `□ ${coords}`;
      return `✕ ${coords}`;
    },

    getRelatedCells,
  };
}
