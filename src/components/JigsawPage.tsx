'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import TopNav from './TopNav';
import RulesSidebar from './RulesSidebar';
import LogsSidebar, { LogEntry } from './LogsSidebar';
import SudokuGrid, { SudokuAction } from './SudokuGrid';
import { createJigsawType } from '../puzzles/jigsaw/jigsaw-type';
import { generateRegionMap } from '../puzzles/jigsaw/region-generator';
import { generateJigsawPuzzle } from '../puzzles/jigsaw/jigsaw-generator';
import { PuzzleType } from '../puzzles/core/puzzle-type';
import { useCheckRevealHint } from './useCheckRevealHint';
import { buildJigsawGroups, solveWithTrace } from '../puzzles/sudoku/sudoku-solver';
import { Coordinate, SolverStep } from '../puzzles/core/types';
import { useTimer } from './useTimer';

const GRID_SIZE = 9;

const EMPTY_REGION_MAP: number[][] = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill(0)
);

const EMPTY_GRID: (number | null)[][] = Array.from(
  { length: GRID_SIZE },
  () => Array(GRID_SIZE).fill(null)
);

const defaultJigsawType = createJigsawType(EMPTY_REGION_MAP);

export default function JigsawPage() {
  const [pencilMode, setPencilMode] = useState(false);
  const [generatedPuzzle, setGeneratedPuzzle] = useState<(number | null)[][]>(EMPTY_GRID);
  const [lockedCells, setLockedCells] = useState<{ row: number; col: number }[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [snapshots, setSnapshots] = useState<Map<number, { grid: (number | null)[][]; notes: number[][][] }>>(new Map());
  const [notesGrid, setNotesGrid] = useState<number[][][] | undefined>(undefined);
  const jigsawTypeRef = useRef<PuzzleType<number | null>>(defaultJigsawType);
  const [currentGrid, setCurrentGrid] = useState<(number | null)[][]>(EMPTY_GRID);
  const [solution, setSolution] = useState<(number | null)[][] | null>(null);
  const solverTraceRef = useRef<SolverStep[]>([]);
  const [solvedCells, setSolvedCells] = useState<Set<string>>(new Set());
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [puzzleKey, setPuzzleKey] = useState(0);
  const { display: timerDisplay, start: startTimer, stop: stopTimer } = useTimer();

  const checkRevealHint = useCheckRevealHint(currentGrid, solution, solverTraceRef.current, logs, lockedCells);

  const isComplete = useMemo(() => {
    if (!solution) return false;
    return currentGrid.every((row, r) =>
      row.every((cell, c) => cell === solution[r][c])
    );
  }, [currentGrid, solution]);

  useEffect(() => {
    if (puzzleKey > 0) startTimer();
  }, [puzzleKey, startTimer]);

  useEffect(() => {
    if (isComplete) stopTimer();
  }, [isComplete, stopTimer]);

  const handleLogClick = (id: number) => {
    setSelectedLogId(prev => prev === id ? null : id);
  };

  const { logPrimaryCells, logHighlightCells, logErrorCells } = useMemo(() => {
    const empty = { logPrimaryCells: new Set<string>(), logHighlightCells: new Set<string>(), logErrorCells: new Set<string>() };
    if (selectedLogId === null) return empty;
    const entry = logs.find(e => e.id === selectedLogId);
    if (!entry) return empty;
    const primary = new Set<string>();
    if (entry.row >= 0 && entry.col >= 0) primary.add(`${entry.row},${entry.col}`);
    const highlights = new Set<string>();
    if (entry.relatedCoords) {
      for (const c of entry.relatedCoords) {
        const key = `${c.row},${c.col}`;
        if (!primary.has(key)) highlights.add(key);
      }
    }
    const errors = new Set<string>();
    if (entry.errorCoords) {
      for (const c of entry.errorCoords) errors.add(`${c.row},${c.col}`);
    }
    return { logPrimaryCells: primary, logHighlightCells: highlights, logErrorCells: errors };
  }, [selectedLogId, logs]);

  const handleNewPuzzle = () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const regionMap = generateRegionMap();
        const { puzzle, solution: sol } = generateJigsawPuzzle(regionMap);
        const jt = createJigsawType(regionMap);
        const groups = buildJigsawGroups(regionMap);
        const trace = solveWithTrace(puzzle, groups);
        jigsawTypeRef.current = jt;
        setGeneratedPuzzle(puzzle);
        setCurrentGrid(puzzle.map(r => [...r]));
        setSolution(sol);
        solverTraceRef.current = trace;
        setLockedCells([...jt.getLockedCells(puzzle)]);
        setLogs([]);
        setLogCounter(0);
        setSnapshots(new Map());
        setNotesGrid(undefined);
        setSolvedCells(new Set());
        setSelectedLogId(null);
        checkRevealHint.resetToCheck();
        setPuzzleKey(k => k + 1);
        return;
      } catch {
        continue;
      }
    }
  };

  const handleReset = () => {
    setGeneratedPuzzle(prev => {
      const reset = prev.map(row => row.slice());
      setCurrentGrid(reset.map(r => [...r]));
      return reset;
    });
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    setNotesGrid(undefined);
    setSolvedCells(new Set());
    setSelectedLogId(null);
    checkRevealHint.resetToCheck();
    startTimer();
  };

  const handleAction = (action: SudokuAction) => {
    checkRevealHint.resetToCheck();
    setCurrentGrid(action.gridSnapshot.map(r => [...r]));

    const jt = jigsawTypeRef.current;
    const last = logs[logs.length - 1];
    const isInverse = last
      && last.row === action.row
      && last.col === action.col
      && last.value === action.previousValue
      && last.previousValue === action.value;

    if (isInverse) {
      setLogs(prev => prev.slice(0, -1));
      setSnapshots(prev => {
        const next = new Map(prev);
        next.delete(last.id);
        return next;
      });
      return;
    }

    const id = logCounter;
    setLogCounter(c => c + 1);
    const move = {
      type: action.type,
      cell: { row: action.row, col: action.col },
      value: action.value,
      previousValue: action.previousValue,
    };
    const label = jt.formatMoveLabel(move);
    const errorLabels = action.errors.map(
      e => `Conflict at (${e.row + 1}, ${e.col + 1})`
    );

    setSnapshots(prev => {
      const next = new Map(prev);
      next.set(id, {
        grid: action.gridSnapshot,
        notes: action.notesSnapshot,
      });
      return next;
    });

    setLogs(prev => [
      ...prev,
      {
        id,
        label,
        actionType: action.type,
        row: action.row,
        col: action.col,
        value: action.value,
        previousValue: action.previousValue,
        errors: errorLabels,
        errorCoords: action.errors.map(e => ({ row: e.row, col: e.col })),
      },
    ]);
  };

  const handleRevert = (targetId: number) => {
    const snapshot = snapshots.get(targetId);
    if (!snapshot) return;

    checkRevealHint.resetToCheck();
    const grid = snapshot.grid.map(r => [...r]);
    setGeneratedPuzzle(grid);
    setCurrentGrid(grid.map(r => [...r]));
    setNotesGrid(snapshot.notes.map(r => r.map(c => [...c])));

    setLogs(prev => {
      const targetIndex = prev.findIndex(e => e.id === targetId);
      if (targetIndex === -1) return prev;
      return prev.slice(0, targetIndex + 1);
    });

    setSnapshots(prev => {
      const next = new Map<number, { grid: (number | null)[][]; notes: number[][][] }>();
      for (const [key, value] of prev) {
        if (key <= targetId) next.set(key, value);
      }
      return next;
    });
  };

  const handleSolveNext = () => {
    const step = checkRevealHint.getNextSolveStep();
    if (!step) return;

    const newGrid = currentGrid.map(r => [...r]);
    newGrid[step.cell.row][step.cell.col] = step.value;

    setGeneratedPuzzle(newGrid);
    setCurrentGrid(newGrid.map(r => [...r]));
    setLockedCells(prev => [...prev, step.cell]);
    setSolvedCells(prev => new Set(prev).add(`${step.cell.row},${step.cell.col}`));
    checkRevealHint.resetToCheck();

    const id = logCounter;
    setLogCounter(c => c + 1);
    const detailLines: string[] = [`Technique: ${step.technique}`];
    if (step.relatedCells.length > 0) {
      detailLines.push(`Related: ${step.relatedCells.map(c => `(${c.row + 1}, ${c.col + 1})`).join(', ')}`);
    }
    setLogs(prev => [...prev, {
      id,
      label: `\u{1F527} ${step.value} (${step.cell.row + 1}, ${step.cell.col + 1})`,
      row: step.cell.row,
      col: step.cell.col,
      value: step.value,
      previousValue: null,
      details: detailLines,
      relatedCoords: step.relatedCells as Coordinate[],
    }]);
  };

  const handleCheckRevealHint = () => {
    const result = checkRevealHint.handleClick();
    if (!result) return;

    const id = logCounter;
    setLogCounter(c => c + 1);

    if (result.action === 'check-clean') {
      setLogs(prev => [...prev, {
        id, label: '✓ No mistakes found', row: -1, col: -1, value: null, previousValue: null,
      }]);
    } else if (result.action === 'check-dirty') {
      setLogs(prev => [...prev, {
        id, label: `✗ ${result.mistakeCount} mistake(s) found`, row: -1, col: -1, value: null, previousValue: null,
      }]);
    } else if (result.action === 'reveal') {
      setLogs(prev => [...prev, {
        id, label: `⚑ Earliest mistake: (${result.cell.row + 1}, ${result.cell.col + 1})`, row: result.cell.row, col: result.cell.col, value: null, previousValue: null,
      }]);
    } else if (result.action === 'hint') {
      setLogs(prev => [...prev, {
        id, label: `\u{1F4A1} Hint: look at (${result.cell.row + 1}, ${result.cell.col + 1})`, row: result.cell.row, col: result.cell.col, value: null, previousValue: null,
      }]);
    }
  };

  const jt = jigsawTypeRef.current;

  return (
    <div className="pq-page">
      <TopNav activeTab="play" />
      <div className="pq-puzzle-shell">
        <RulesSidebar rules={[...jt.rules]} />

        <main className={`pq-puzzle-main pq-puzzle-main--${jt.id}`}>
          <div className="pq-puzzle-header">
            <h1 className="pq-puzzle-title">{jt.name.toUpperCase()}</h1>
            <span className="pq-puzzle-timer">{timerDisplay}</span>
          </div>
          <hr className="pq-puzzle-divider" />
          {isComplete && <p className="pq-puzzle-complete">Puzzle Complete</p>}

          <div className="pq-puzzle-board">
            <SudokuGrid
              pencilMode={pencilMode}
              generatedSudoku={generatedPuzzle}
              lockedCells={lockedCells}
              externalNotesGrid={notesGrid}
              onAction={handleAction}
              puzzleType={jt}
              revealCell={checkRevealHint.revealCell}
              hintCell={checkRevealHint.hintCell}
              solvedCells={solvedCells}
              logPrimaryCells={logPrimaryCells}
              logHighlightCells={logHighlightCells}
              logErrorCells={logErrorCells}
            />
          </div>

          <div className="pq-puzzle-actions">
            <button className="pq-btn" onClick={handleNewPuzzle}>New Puzzle</button>
            <button className="pq-btn" onClick={handleReset}>Reset Puzzle</button>
            <button className="pq-btn" onClick={() => setPencilMode(p => !p)}>
              {pencilMode ? 'Pencil: ON' : 'Pencil: OFF'}
            </button>
            <button
              className="pq-btn"
              onClick={handleCheckRevealHint}
              disabled={checkRevealHint.buttonDisabled}
            >
              {checkRevealHint.buttonLabel}
            </button>
            <button
              className="pq-btn pq-btn--dev"
              onClick={handleSolveNext}
              disabled={!solution}
            >
              Solve Next Cell
            </button>
          </div>
        </main>

        <LogsSidebar entries={logs} onRevert={handleRevert} selectedLogId={selectedLogId} onLogClick={handleLogClick} />
      </div>
    </div>
  );
}
