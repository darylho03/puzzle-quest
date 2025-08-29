'use client';

import { useState, useEffect } from 'react';
import SudokuSquare from './SudokuSquare';

const GRID_SIZE = 9;

interface Props {
  pencilMode: boolean;
  generatedSudoku: (number | null)[][];
  lockedCells: { row: number; col: number }[];
}

// function checkSameNumber(row: number, col: number, grid: (number | null)[][]): { row: number; col: number }[] {
//   const sameNumber: { row: number; col: number }[] = [];
//   const value = grid[row][col];
//   if (value === null) return sameNumber;

//   for (let i = 0; i < GRID_SIZE; i++) {
//     for (let j = 0; j < GRID_SIZE; j++) {
//       if (i !== row && j !== col && grid[i][j] === value) {
//         sameNumber.push({ row: i, col: j });
//       }
//     }
//   }
//   return sameNumber;
// }

function checkRelated(row: number, col: number): { row: number; col: number }[] {
  const related: { row: number; col: number }[] = [];
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== col) {
      related.push({ row, col: i });
    }
    if (i !== row) {
      related.push({ row: i, col });
    }
    const boxRowOffset = boxRow + Math.floor(i / 3);
    const boxColOffset = boxCol + (i % 3);
    if (boxRowOffset !== row && boxColOffset !== col) {
      related.push({ row: boxRowOffset, col: boxColOffset });
    }
  }
  return related;
}

function checkNotes(row: number, col: number, value: number | null, tlnotesgrid: number[][][]): number[][][] {
  if (value === null) {
    return tlnotesgrid;
  }

  // Rows
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== row && tlnotesgrid[i][col].includes(value)) {
      tlnotesgrid[i][col] = tlnotesgrid[i][col].filter(n => n !== value);
    }
  }
  // Columns
  for (let j = 0; j < GRID_SIZE; j++) {
    if (j !== col && tlnotesgrid[row][j].includes(value)) {
      tlnotesgrid[row][j] = tlnotesgrid[row][j].filter(n => n !== value);
    }
  }

  // 3x3 Boxes
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (tlnotesgrid[boxRow + i][boxCol + j].includes(value)) {
        tlnotesgrid[boxRow + i][boxCol + j] = tlnotesgrid[boxRow + i][boxCol + j].filter(n => n !== value);
      }
    }
  }
  return tlnotesgrid;
}

function checkInvalidCells(grid: (number | null)[][]): { row: number; col: number }[] {
  const invalid: { row: number; col: number }[] = [];
  // Check for invalid numbers in rows
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = new Array<Set<([number, number])>>(9);
    for (let j = 0; j < GRID_SIZE; j++) {
      const cellValue = grid[i][j];
      if (cellValue !== null) {
        if (!row[cellValue - 1]) {
          row[cellValue - 1] = new Set();
        }
        row[cellValue - 1].add([i, j]);
      }
    }
    for (let k = 0; k < 9; k++) {
        if (row[k] && row[k].size > 1) {
            invalid.push(...Array.from(row[k]).map(([r, c]) => ({ row: r, col: c })));
        }
    }
  }
  // Check for invalid numbers in columns
  for (let j = 0; j < GRID_SIZE; j++) {
    const col = new Array<Set<([number, number])>>(9);
    for (let i = 0; i < GRID_SIZE; i++) {
      const cellValue = grid[i][j];
      if (cellValue !== null) {
        if (!col[cellValue - 1]) {
          col[cellValue - 1] = new Set();
        }
        col[cellValue - 1].add([i, j]);
      }
    }
    for (let k = 0; k < 9; k++) {
      if (col[k] && col[k].size > 1) {
        invalid.push(...Array.from(col[k]).map(([r, c]) => ({ row: r, col: c })));
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = new Array<Set<([number, number])>>(9);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const cellValue = grid[boxRow * 3 + i][boxCol * 3 + j];
          if (cellValue !== null) {
            if (!box[cellValue - 1]) {
              box[cellValue - 1] = new Set();
            }
            box[cellValue - 1].add([boxRow * 3 + i, boxCol * 3 + j]);
          }
        }
      }
      for (let k = 0; k < 9; k++) {
        if (box[k] && box[k].size > 1) {
          invalid.push(...Array.from(box[k]).map(([r, c]) => ({ row: r, col: c })));
        }
      }
    }
  }

  // Remove Duplicates from invalid
  const uniqueInvalid = Array.from(new Set(invalid.map(cell => JSON.stringify(cell)))).map(cell => JSON.parse(cell));
  console.log('Invalid cells:', uniqueInvalid);
  return uniqueInvalid;
}

export default function SudokuGrid({ pencilMode, generatedSudoku, lockedCells }: Props) {
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

  // Sync grid state with generatedSudoku prop
  useEffect(() => {
    setGrid(generatedSudoku);
  }, [generatedSudoku]);

  useEffect(() => {
    setTlnotesgrid(Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => [])
    ));
  }, [generatedSudoku]);

  const handleSquareClick = (row: number, col: number) => {
    const newSelected = { row, col };
    if (newSelected.row === selected?.row && newSelected.col === selected?.col) {
      setSelected(null);
      setRelatedCells([]);
    } else {
      setSelected(newSelected);
      setRelatedCells(checkRelated(row, col));
    }
  };

  const handleSquareChange = (row: number, col: number, value: number | null, tlnotes: number[] | null) => {
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? value : cell))
    );
    const newTlnotesgrid = tlnotesgrid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? (tlnotes ?? []) : cell))
    );
    setGrid(newGrid);
    setTlnotesgrid(checkNotes(row, col, value, newTlnotesgrid));
    setInvalidCells(checkInvalidCells(newGrid));
    setSolved(newGrid.flat().every(cell => cell !== null) && checkInvalidCells(newGrid).length === 0);
  };

  return (
    <div
        className="sudoku-grid"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${GRID_SIZE}, 80px)`,
        gridTemplateColumns: `repeat(${GRID_SIZE}, 80px)`,
        gap: 2,
        background: solved ? '#3cff00ff' : '#000',
        padding: 10,
        width: GRID_SIZE * 82,
      }}
    >
      {grid.map((row, i) =>
        row.map((value, j) => {
          const boxBorderClass =
            `${i % 3 === 0 ? ' top-box-border' : ''}` +
            `${j % 3 === 0 ? ' left-box-border' : ''}` +
            `${i === 8 ? ' bottom-box-border' : ''}` +
            `${j === 8 ? ' right-box-border' : ''}`;
        return (
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
            borderClass={boxBorderClass}
            selectedValue={selected ? grid[selected.row][selected.col] : null}
            locked={lockedCells.some(cell => cell.row === i && cell.col === j)}
          />
        );
      })
    )}
    </div>
  );
}