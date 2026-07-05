import React from 'react';
import { CornerPatch, CssLayer } from '../../components/PuzzleSquare';
import { PuzzleType } from '../core/puzzle-type';
import {
  Category,
  Coordinate,
  Grid,
  GridSize,
  Move,
  ValidationResult,
} from '../core/types';

type JigsawCell = number | null;

const GRID_SIZE = 9;
const CELL_SIZE = 52;
const BORDER_WIDTH = 2;
const BLACK = 'black';
const GRAY = '#BBBBBB';

const REGION_COLORS: readonly string[] = [
  '#e8d0d0',
  '#d0e0e8',
  '#d8e8d0',
  '#e8e0d0',
  '#d8d0e8',
  '#e8d8d0',
  '#d0e8e0',
  '#e0d0e0',
  '#d0d8e8',
];

function buildRegionPeers(regionMap: number[][]): Map<number, Coordinate[]> {
  const peers = new Map<number, Coordinate[]>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const id = regionMap[r][c];
      const list = peers.get(id) ?? [];
      list.push({ row: r, col: c });
      peers.set(id, list);
    }
  }
  return peers;
}

export function createJigsawType(regionMap: number[][]): PuzzleType<JigsawCell> {
  const regionPeers = buildRegionPeers(regionMap);

  function getTile(row: number, col: number): CssLayer {
    const regionId = regionMap[row][col];
    const same = (r: number, c: number) =>
      r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && regionMap[r][c] === regionId;

    const cornerPatches: CornerPatch[] = [];
    const corners: [string, number, number, number, number][] = [
      ['top-left',     row - 1, col,     row,     col - 1],
      ['top-right',    row - 1, col,     row,     col + 1],
      ['bottom-left',  row + 1, col,     row,     col - 1],
      ['bottom-right', row + 1, col,     row,     col + 1],
    ];
    for (const [corner, adjR, adjC, sideR, sideC] of corners) {
      const diagR = adjR;
      const diagC = sideC;
      if (same(adjR, adjC) && same(sideR, sideC) && !same(diagR, diagC)) {
        cornerPatches.push({
          corner: corner as CornerPatch['corner'],
          size: BORDER_WIDTH,
          color: BLACK,
        });
      }
    }

    return {
      background: REGION_COLORS[regionId % REGION_COLORS.length],
      borders: {
        top: {
          width: BORDER_WIDTH,
          color: row === 0 || regionMap[row - 1][col] !== regionId ? BLACK : GRAY,
        },
        bottom: {
          width: BORDER_WIDTH,
          color: row === GRID_SIZE - 1 || regionMap[row + 1][col] !== regionId ? BLACK : GRAY,
        },
        left: {
          width: BORDER_WIDTH,
          color: col === 0 || regionMap[row][col - 1] !== regionId ? BLACK : GRAY,
        },
        right: {
          width: BORDER_WIDTH,
          color: col === GRID_SIZE - 1 || regionMap[row][col + 1] !== regionId ? BLACK : GRAY,
        },
      },
      cornerPatches: cornerPatches.length > 0 ? cornerPatches : undefined,
    };
  }

  function validate(grid: Grid<JigsawCell>): ValidationResult {
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

    for (const [, cells] of regionPeers) {
      const seen = new Map<number, Coordinate[]>();
      for (const { row, col } of cells) {
        const val = grid[row][col];
        if (val !== null) {
          const coords = seen.get(val) ?? [];
          coords.push({ row, col });
          seen.set(val, coords);
        }
      }
      for (const coords of seen.values()) {
        if (coords.length > 1) invalidCells.push(...coords);
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

  function getRelatedCells(cell: Coordinate, size: GridSize): readonly Coordinate[] {
    const related: Coordinate[] = [];
    const seen = new Set<string>();
    const add = (r: number, c: number) => {
      if (r === cell.row && c === cell.col) return;
      const key = `${r},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        related.push({ row: r, col: c });
      }
    };

    for (let i = 0; i < size.cols; i++) add(cell.row, i);
    for (let i = 0; i < size.rows; i++) add(i, cell.col);

    const regionId = regionMap[cell.row][cell.col];
    const peers = regionPeers.get(regionId) ?? [];
    for (const { row, col } of peers) add(row, col);

    return related;
  }

  return {
    id: 'jigsaw',
    name: 'Jigsaw Sudoku',
    category: 'sudoku' as Category,
    defaultSize: { rows: GRID_SIZE, cols: GRID_SIZE },
    cellSize: CELL_SIZE,
    rules: [
      {
        icon: <img src="/rule_icons/jigsaw.png" alt="Jigsaw Sudoku" width={60} height={60} />,
        heading: 'JIGSAW SUDOKU',
        body: 'Fill the grid such that each row, column, and colored region has the numbers 1–9.',
      },
    ],

    getEmptyCell(): JigsawCell {
      return null;
    },

    getLockedCells(clues: Grid<JigsawCell>): readonly Coordinate[] {
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

    validate(grid: Grid<JigsawCell>): ValidationResult {
      return validate(grid);
    },

    classifyMove(value: JigsawCell, previousValue: JigsawCell): string {
      if (value === null) return 'delete';
      if (previousValue !== null) return 'replace';
      return 'place';
    },

    formatMoveLabel(move: Move<JigsawCell>): string {
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

    getRelatedCells,
  };
}
