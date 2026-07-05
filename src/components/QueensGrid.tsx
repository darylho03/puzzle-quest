'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QueensSquare from './QueensSquare';
import { PuzzleType } from '../puzzles/core/puzzle-type';

export interface QueensAction {
  type: 'place' | 'delete';
  row: number;
  col: number;
  value: number;
  previousValue: number;
  errors: { row: number; col: number }[];
  gridSnapshot: number[][];
}

interface Props {
  initialGrid: number[][];
  regionMap: number[][];
  puzzleType: PuzzleType<number>;
  onAction?: (action: QueensAction) => void;
  revealCell?: { row: number; col: number } | null;
  hintCell?: { row: number; col: number } | null;
}

function computeAutoDots(grid: number[][], regionMap: number[][], gridSize: number): Set<string> {
  const dots = new Set<string>();

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === 2) continue;

      let blocked = false;
      for (let i = 0; i < gridSize && !blocked; i++) {
        if (i !== col && grid[row][i] === 2) blocked = true;
        if (i !== row && grid[i][col] === 2) blocked = true;
      }

      if (!blocked) {
        const region = regionMap[row][col];
        for (let r = 0; r < gridSize && !blocked; r++) {
          for (let c = 0; c < gridSize && !blocked; c++) {
            if (r === row && c === col) continue;
            if (grid[r][c] === 2) {
              if (Math.abs(r - row) === 1 && Math.abs(c - col) === 1) blocked = true;
              if (regionMap[r][c] === region) blocked = true;
            }
          }
        }
      }

      if (blocked) dots.add(`${row},${col}`);
    }
  }

  return dots;
}

export default function QueensGrid({ initialGrid, regionMap, puzzleType, onAction, revealCell, hintCell }: Props) {
  const pt = puzzleType;
  const gridSize = pt.defaultSize.rows;
  const cellSize = pt.cellSize;

  const [grid, setGrid] = useState<number[][]>(initialGrid);
  const [invalidCells, setInvalidCells] = useState<{ row: number; col: number }[]>([]);
  const [relatedCells, setRelatedCells] = useState<{ row: number; col: number }[]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [autoDots, setAutoDots] = useState<Set<string>>(new Set());

  const gridRef = useRef(initialGrid);
  const isDraggingRef = useRef(false);
  const draggedCellsRef = useRef<{ row: number; col: number }[]>([]);
  const startDragStateRef = useRef(0);
  const autoDotsRef = useRef<Set<string>>(new Set());

  const [, forceRender] = useState(0);

  useEffect(() => {
    gridRef.current = initialGrid;
    setGrid(initialGrid);
    autoDotsRef.current = new Set();
    setAutoDots(new Set());
    setSolved(false);
    setInvalidCells([]);
    setSelected(null);
    setRelatedCells([]);
  }, [initialGrid]);

  const updateValidation = useCallback((newGrid: number[][]) => {
    const result = pt.validate(newGrid, pt.defaultSize);
    setInvalidCells([...result.invalidCells]);
    setSolved(result.solved);
    const dots = computeAutoDots(newGrid, regionMap, gridSize);
    autoDotsRef.current = dots;
    setAutoDots(dots);
    return result;
  }, [pt, regionMap, gridSize]);

  const updateGrid = useCallback((newGrid: number[][]) => {
    gridRef.current = newGrid;
    setGrid(newGrid);
  }, []);

  const handleMouseDown = useCallback((row: number, col: number) => {
    const currentGrid = gridRef.current;
    const currentValue = currentGrid[row][col];
    startDragStateRef.current = currentValue;
    isDraggingRef.current = true;
    draggedCellsRef.current = [{ row, col }];

    const isAutoDot = currentValue === 0 && autoDotsRef.current.has(`${row},${col}`);

    if (currentValue === 0 && !isAutoDot) {
      const newGrid = currentGrid.map(r => [...r]);
      newGrid[row][col] = 1;
      updateGrid(newGrid);
    } else if (currentValue !== 0) {
      const newGrid = currentGrid.map(r => [...r]);
      newGrid[row][col] = 0;
      updateGrid(newGrid);
    }

    setSelected({ row, col });
    setRelatedCells([...pt.getRelatedCells({ row, col }, pt.defaultSize)]);
  }, [pt, updateGrid]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isDraggingRef.current) return;

    const currentGrid = gridRef.current;
    const startState = startDragStateRef.current;
    const dragged = draggedCellsRef.current;

    if (currentGrid[row][col] === 0 && startState === 0 && !autoDotsRef.current.has(`${row},${col}`)) {
      if (!dragged.some(c => c.row === row && c.col === col)) {
        const newGrid = currentGrid.map(r => [...r]);
        newGrid[row][col] = 1;
        updateGrid(newGrid);
        draggedCellsRef.current = [...dragged, { row, col }];
      }
    } else if (currentGrid[row][col] === 1 && startState === 1) {
      if (!dragged.some(c => c.row === row && c.col === col)) {
        const newGrid = currentGrid.map(r => [...r]);
        newGrid[row][col] = 0;
        updateGrid(newGrid);
        draggedCellsRef.current = [...dragged, { row, col }];
      }
    }
  }, [updateGrid]);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    const dragged = draggedCellsRef.current;
    const startState = startDragStateRef.current;
    const currentGrid = gridRef.current;

    let finalGrid = currentGrid.map(r => [...r]);

    if (dragged.length === 1 && startState === 1) {
      const { row, col } = dragged[0];
      finalGrid[row][col] = 2;
      updateGrid(finalGrid);

      const result = updateValidation(finalGrid);
      if (onAction) {
        onAction({
          type: 'place',
          row,
          col,
          value: 2,
          previousValue: 0,
          errors: [...result.invalidCells],
          gridSnapshot: finalGrid.map(r => [...r]),
        });
      }
    } else if (dragged.length === 1 && startState === 2) {
      const { row, col } = dragged[0];
      const result = updateValidation(finalGrid);
      if (onAction) {
        onAction({
          type: 'delete',
          row,
          col,
          value: 0,
          previousValue: 2,
          errors: [...result.invalidCells],
          gridSnapshot: finalGrid.map(r => [...r]),
        });
      }
    } else {
      updateValidation(finalGrid);
    }

    isDraggingRef.current = false;
    draggedCellsRef.current = [];
    forceRender(c => c + 1);
  }, [onAction, updateGrid, updateValidation]);

  const displayValue = (row: number, col: number): number => {
    if (grid[row][col] !== 0) return grid[row][col];
    if (autoDots.has(`${row},${col}`)) return 1;
    return 0;
  };

  return (
    <div
      className="queens-grid-new"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gap: 0,
        background: solved ? '#3cff00ff' : '#fff',
        padding: 0,
        width: gridSize * cellSize,
        userSelect: 'none',
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDraggingRef.current) {
          handleMouseUp();
        }
      }}
    >
      {Array.from({ length: gridSize }, (_, row) =>
        Array.from({ length: gridSize }, (_, col) => (
          <QueensSquare
            key={`${row}-${col}`}
            value={displayValue(row, col)}
            tile={pt.getTile(row, col, pt.defaultSize)}
            isSelected={selected?.row === row && selected?.col === col}
            related={relatedCells.some(c => c.row === row && c.col === col)}
            invalid={invalidCells.some(c => c.row === row && c.col === col)}
            reveal={revealCell?.row === row && revealCell?.col === col}
            hint={hintCell?.row === row && hintCell?.col === col}
            cellSize={cellSize}
            onMouseDown={() => handleMouseDown(row, col)}
            onMouseEnter={() => handleMouseEnter(row, col)}
          />
        ))
      )}
    </div>
  );
}
