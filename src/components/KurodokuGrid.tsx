'use client';

import { useState, useEffect, useCallback } from 'react';
import KurodokuSquare from './KurodokuSquare';
import { PuzzleType } from '../puzzles/core/puzzle-type';

export interface KurodokuAction {
  type: 'place' | 'replace' | 'delete';
  row: number;
  col: number;
  value: number;
  previousValue: number;
  errors: { row: number; col: number }[];
  gridSnapshot: number[][];
}

interface Props {
  initialGrid: number[][];
  values: (number | null)[][];
  lockedCells: { row: number; col: number }[];
  puzzleType: PuzzleType<number>;
  onAction?: (action: KurodokuAction) => void;
  revealCell?: { row: number; col: number } | null;
  hintCell?: { row: number; col: number } | null;
  solvedCells?: Set<string>;
  logPrimaryCells?: Set<string>;
  logHighlightCells?: Set<string>;
  logErrorCells?: Set<string>;
}

export default function KurodokuGrid({
  initialGrid,
  values,
  lockedCells,
  puzzleType,
  onAction,
  revealCell,
  hintCell,
  solvedCells,
  logPrimaryCells,
  logHighlightCells,
  logErrorCells,
}: Props) {
  const pt = puzzleType;
  const cellSize = pt.cellSize;

  const [grid, setGrid] = useState<number[][]>(initialGrid);
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const [invalidCells, setInvalidCells] = useState<{ row: number; col: number }[]>([]);
  const [relatedCells, setRelatedCells] = useState<{ row: number; col: number }[]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setGrid(initialGrid);
    setSolved(false);
    setInvalidCells([]);
    setSelected(null);
    setRelatedCells([]);
  }, [initialGrid]);

  const isLocked = useCallback((row: number, col: number) =>
    lockedCells.some(c => c.row === row && c.col === col),
    [lockedCells]
  );

  const handleClick = useCallback((row: number, col: number, reverse: boolean) => {
    if (isLocked(row, col)) return;

    const previousValue = grid[row][col];
    const newValue = reverse
      ? (previousValue + 2) % 3
      : (previousValue + 1) % 3;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = newValue;

    setGrid(newGrid);
    setSelected({ row, col });
    setRelatedCells([...pt.getRelatedCells({ row, col }, pt.defaultSize)]);

    const result = pt.validate(newGrid, pt.defaultSize);
    setInvalidCells([...result.invalidCells]);
    setSolved(result.solved);

    if (onAction) {
      onAction({
        type: pt.classifyMove(newValue, previousValue) as KurodokuAction['type'],
        row,
        col,
        value: newValue,
        previousValue,
        errors: [...result.invalidCells],
        gridSnapshot: newGrid.map(r => [...r]),
      });
    }
  }, [grid, isLocked, pt, onAction]);

  const handleSelect = useCallback((row: number, col: number) => {
    setSelected({ row, col });
    setRelatedCells([...pt.getRelatedCells({ row, col }, pt.defaultSize)]);
  }, [pt]);

  return (
    <div
      className="kurodoku-grid"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap: 0,
        background: solved ? '#3cff00ff' : 'transparent',
        padding: 0,
        width: cols * cellSize,
        userSelect: 'none',
      }}
    >
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => (
          <KurodokuSquare
            key={`${row}-${col}`}
            cellState={grid[row][col]}
            clueValue={values[row][col]}
            tile={pt.getTile(row, col, pt.defaultSize)}
            isSelected={selected?.row === row && selected?.col === col}
            related={relatedCells.some(c => c.row === row && c.col === col)}
            invalid={invalidCells.some(c => c.row === row && c.col === col)}
            reveal={revealCell?.row === row && revealCell?.col === col}
            hint={hintCell?.row === row && hintCell?.col === col}
            solved={solvedCells?.has(`${row},${col}`) ?? false}
            logPrimary={logPrimaryCells?.has(`${row},${col}`) ?? false}
            logHighlight={logHighlightCells?.has(`${row},${col}`) ?? false}
            logError={logErrorCells?.has(`${row},${col}`) ?? false}
            cellSize={cellSize}
            onClick={() => handleClick(row, col, false)}
            onRightClick={() => handleClick(row, col, true)}
          />
        ))
      )}
    </div>
  );
}
