'use client';

import { useState, useEffect } from 'react';
import SudokuSquare from './SudokuSquare';
import { PuzzleType } from '../puzzles/core/puzzle-type';
import { sudokuType } from '../puzzles/sudoku/sudoku-type';

export interface SudokuAction {
  type: 'place' | 'replace' | 'delete';
  value: number | null;
  previousValue: number | null;
  row: number;
  col: number;
  errors: { row: number; col: number }[];
  gridSnapshot: (number | null)[][];
  notesSnapshot: number[][][];
}

interface Props {
  pencilMode: boolean;
  generatedSudoku: (number | null)[][];
  lockedCells: { row: number; col: number }[];
  externalNotesGrid?: number[][][];
  onAction?: (action: SudokuAction) => void;
  puzzleType?: PuzzleType<number | null>;
  revealCell?: { row: number; col: number } | null;
  hintCell?: { row: number; col: number } | null;
  solvedCells?: Set<string>;
  logPrimaryCells?: Set<string>;
  logHighlightCells?: Set<string>;
  logErrorCells?: Set<string>;
}

function checkNotes(
  row: number,
  col: number,
  value: number | null,
  tlnotesgrid: number[][][],
  pt: PuzzleType<number | null>
): number[][][] {
  if (value === null) return tlnotesgrid;

  const related = pt.getRelatedCells({ row, col }, pt.defaultSize);
  for (const { row: r, col: c } of related) {
    if (tlnotesgrid[r][c].includes(value)) {
      tlnotesgrid[r][c] = tlnotesgrid[r][c].filter(n => n !== value);
    }
  }
  return tlnotesgrid;
}

export default function SudokuGrid({ pencilMode, generatedSudoku, lockedCells, externalNotesGrid, onAction, puzzleType, revealCell, hintCell, solvedCells, logPrimaryCells, logHighlightCells, logErrorCells }: Props) {
  const pt = puzzleType ?? sudokuType;
  const GRID_SIZE = pt.defaultSize.rows;
  const CELL_SIZE = pt.cellSize;
  const [grid, setGrid] = useState<(number | null)[][]>(generatedSudoku);
  const [tlnotesgrid, setTlnotesgrid] = useState<number[][][]>(
    Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => [])
    )
  );
  const [invalidCells, setInvalidCells] = useState<{ row: number; col: number }[]>([]);
  const [relatedCells, setRelatedCells] = useState<{ row: number; col: number }[]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setGrid(generatedSudoku);
    const result = pt.validate(generatedSudoku, pt.defaultSize);
    setInvalidCells([...result.invalidCells]);
    setSolved(result.solved);
  }, [generatedSudoku, pt]);

  useEffect(() => {
    if (externalNotesGrid) {
      setTlnotesgrid(externalNotesGrid.map(r => r.map(c => [...c])));
    } else {
      setTlnotesgrid(Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => [])
      ));
    }
  }, [generatedSudoku, externalNotesGrid]);

  const handleSquareClick = (row: number, col: number) => {
    const newSelected = { row, col };
    if (newSelected.row === selected?.row && newSelected.col === selected?.col) {
      setSelected(null);
      setRelatedCells([]);
    } else {
      setSelected(newSelected);
      setRelatedCells([...pt.getRelatedCells({ row, col }, pt.defaultSize)]);
    }
  };

  const handleSquareChange = (row: number, col: number, value: number | null, tlnotes: number[] | null) => {
    const previous = grid[row][col];
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? value : cell))
    );
    const newTlnotesgrid = tlnotesgrid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? (tlnotes ?? []) : cell))
    );
    const updatedNotes = checkNotes(row, col, value, newTlnotesgrid, pt);
    const result = pt.validate(newGrid, pt.defaultSize);
    setGrid(newGrid);
    setTlnotesgrid(updatedNotes);
    setInvalidCells([...result.invalidCells]);
    setSolved(result.solved);

    if (onAction && previous !== value) {
      const type = pt.classifyMove(value, previous) as 'place' | 'replace' | 'delete';
      onAction({
        type,
        value,
        previousValue: previous,
        row,
        col,
        errors: [...result.invalidCells],
        gridSnapshot: newGrid.map(r => [...r]),
        notesSnapshot: updatedNotes.map(r => r.map(c => [...c])),
      });
    }
  };

  return (
    <div
        className="sudoku-grid"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gap: 0,
        background: solved ? '#3cff00ff' : '#fff',
        padding: 0,
        width: GRID_SIZE * CELL_SIZE,
      }}
    >
      {grid.map((row, i) =>
        row.map((value, j) => (
          <SudokuSquare
            key={`${i}-${j}`}
            value={value}
            tlnotes={tlnotesgrid[i][j]}
            isSelected={selected?.row === i && selected?.col === j}
            onClick={() => handleSquareClick(i, j)}
            onChange={(val, tlnotes) => handleSquareChange(i, j, val, tlnotes)}
            pencilMode={pencilMode}
            invalid={invalidCells.some(cell => cell.row === i && cell.col === j)}
            related={relatedCells.some(cell => cell.row === i && cell.col === j)}
            tile={pt.getTile(i, j, pt.defaultSize)}
            selectedValue={selected ? grid[selected.row][selected.col] : null}
            locked={lockedCells.some(cell => cell.row === i && cell.col === j)}
            cellSize={CELL_SIZE}
            reveal={revealCell?.row === i && revealCell?.col === j}
            hint={hintCell?.row === i && hintCell?.col === j}
            solved={solvedCells?.has(`${i},${j}`) ?? false}
            logPrimary={logPrimaryCells?.has(`${i},${j}`) ?? false}
            logHighlight={logHighlightCells?.has(`${i},${j}`) ?? false}
            logError={logErrorCells?.has(`${i},${j}`) ?? false}
          />
        ))
    )}
    </div>
  );
}