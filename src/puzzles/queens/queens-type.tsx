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

type QueensCell = number; // 0=empty, 1=dot, 2=queen

const BORDER_WIDTH = 2;
const BLACK = 'black';
const GRAY = '#BBBBBB';
const TARGET_GRID_PX = 468;

const REGION_COLORS: readonly string[] = [
  '#ff807d',
  'rgb(165, 165, 255)',
  'rgb(168, 255, 168)',
  'rgb(255, 255, 147)',
  'rgb(255, 138, 255)',
  'rgb(255, 219, 154)',
  'rgb(255, 168, 168)',
  'rgb(200, 200, 255)',
  'rgb(199, 255, 199)',
  '#BDBDBD',
];

function buildRegionPeers(regionMap: number[][], gridSize: number): Map<number, Coordinate[]> {
  const peers = new Map<number, Coordinate[]>();
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const id = regionMap[r][c];
      const list = peers.get(id) ?? [];
      list.push({ row: r, col: c });
      peers.set(id, list);
    }
  }
  return peers;
}

export function createQueensType(regionMap: number[][], gridSize: number): PuzzleType<QueensCell> {
  const regionPeers = buildRegionPeers(regionMap, gridSize);
  const cellSize = Math.floor(TARGET_GRID_PX / gridSize);

  function getTile(row: number, col: number): CssLayer {
    const regionId = regionMap[row][col];
    const same = (r: number, c: number) =>
      r >= 0 && r < gridSize && c >= 0 && c < gridSize && regionMap[r][c] === regionId;

    const cornerPatches: CornerPatch[] = [];
    const corners: [string, number, number, number, number][] = [
      ['top-left', row - 1, col, row, col - 1],
      ['top-right', row - 1, col, row, col + 1],
      ['bottom-left', row + 1, col, row, col - 1],
      ['bottom-right', row + 1, col, row, col + 1],
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
          color: row === gridSize - 1 || regionMap[row + 1][col] !== regionId ? BLACK : GRAY,
        },
        left: {
          width: BORDER_WIDTH,
          color: col === 0 || regionMap[row][col - 1] !== regionId ? BLACK : GRAY,
        },
        right: {
          width: BORDER_WIDTH,
          color: col === gridSize - 1 || regionMap[row][col + 1] !== regionId ? BLACK : GRAY,
        },
      },
      cornerPatches: cornerPatches.length > 0 ? cornerPatches : undefined,
    };
  }

  function validate(grid: Grid<QueensCell>): ValidationResult {
    const invalidCells: Coordinate[] = [];
    const queens: Coordinate[] = [];

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 2) queens.push({ row: r, col: c });
      }
    }

    for (const q of queens) {
      let isInvalid = false;

      for (const other of queens) {
        if (other.row === q.row && other.col === q.col) continue;
        if (other.row === q.row || other.col === q.col) { isInvalid = true; break; }
        if (Math.abs(other.row - q.row) === 1 && Math.abs(other.col - q.col) === 1) { isInvalid = true; break; }
        if (regionMap[other.row][other.col] === regionMap[q.row][q.col]) { isInvalid = true; break; }
      }

      if (isInvalid) invalidCells.push(q);
    }

    const uniqueInvalid = Array.from(
      new Map(invalidCells.map(c => [`${c.row},${c.col}`, c])).values()
    );

    return {
      invalidCells: uniqueInvalid,
      solved: queens.length === gridSize && uniqueInvalid.length === 0,
    };
  }

  function getRelatedCells(cell: Coordinate): readonly Coordinate[] {
    const related: Coordinate[] = [];
    const seen = new Set<string>();
    const add = (r: number, c: number) => {
      if (r === cell.row && c === cell.col) return;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
      const key = `${r},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        related.push({ row: r, col: c });
      }
    };

    for (let i = 0; i < gridSize; i++) {
      add(cell.row, i);
      add(i, cell.col);
    }

    add(cell.row - 1, cell.col - 1);
    add(cell.row - 1, cell.col + 1);
    add(cell.row + 1, cell.col - 1);
    add(cell.row + 1, cell.col + 1);

    const regionId = regionMap[cell.row][cell.col];
    const peers = regionPeers.get(regionId) ?? [];
    for (const { row, col } of peers) add(row, col);

    return related;
  }

  return {
    id: 'queens',
    name: 'Queens',
    category: 'line-logic' as Category,
    defaultSize: { rows: gridSize, cols: gridSize },
    cellSize,
    rules: [
      {
        icon: <img src="/queen.svg" alt="Queens" width={60} height={60} />,
        heading: 'QUEENS',
        body: 'Place exactly 1 queen in each row, column, and colored region. No two queens can touch each other, not even diagonally.',
      },
    ],

    getEmptyCell(): QueensCell {
      return 0;
    },

    getLockedCells(): readonly Coordinate[] {
      return [];
    },

    getTile(row: number, col: number): CssLayer {
      return getTile(row, col);
    },

    validate(grid: Grid<QueensCell>): ValidationResult {
      return validate(grid);
    },

    classifyMove(value: QueensCell, previousValue: QueensCell): string {
      if (value === 2) return 'place';
      if (previousValue === 2) return 'delete';
      return 'place';
    },

    formatMoveLabel(move: Move<QueensCell>): string {
      const coords = `(${move.cell.row + 1}, ${move.cell.col + 1})`;
      if (move.type === 'delete') return `♛ ${coords}`;
      return `♛ ${coords}`;
    },

    getRelatedCells,
  };
}
