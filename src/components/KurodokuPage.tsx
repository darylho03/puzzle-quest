'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import TopNav from './TopNav';
import RulesSidebar from './RulesSidebar';
import LogsSidebar, { LogEntry } from './LogsSidebar';
import KurodokuGrid, { KurodokuAction } from './KurodokuGrid';
import { createKurodokuType } from '../puzzles/kurodoku/kurodoku-type';
import { generateKurodokuPuzzle } from '../puzzles/kurodoku/kurodoku-generator';
import { solveKurodokuWithTrace } from '../puzzles/kurodoku/kurodoku-solver';
import { PuzzleType } from '../puzzles/core/puzzle-type';
import { Coordinate, SolverStep } from '../puzzles/core/types';
import { useCheckRevealHint } from './useCheckRevealHint';
import { useTimer } from './useTimer';

const DEFAULT_SIZE = 5;

function makeEmptyGrid(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function buildInitialGrid(values: (number | null)[][]): number[][] {
  return values.map(row => row.map(v => v ? 2 : 0));
}

function buildLockedCells(values: (number | null)[][]): { row: number; col: number }[] {
  const locked: { row: number; col: number }[] = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[0].length; j++) {
      if (values[i][j]) locked.push({ row: i, col: j });
    }
  }
  return locked;
}

const emptyValues: (number | null)[][] = Array.from(
  { length: DEFAULT_SIZE },
  () => Array(DEFAULT_SIZE).fill(null),
);
const defaultKurodokuType = createKurodokuType(emptyValues, DEFAULT_SIZE, DEFAULT_SIZE);

export default function KurodokuPage() {
  const [gridSize, setGridSize] = useState(DEFAULT_SIZE);
  const [values, setValues] = useState<(number | null)[][]>(emptyValues);
  const [initialGrid, setInitialGrid] = useState<number[][]>(makeEmptyGrid(DEFAULT_SIZE, DEFAULT_SIZE));
  const [lockedCells, setLockedCells] = useState<{ row: number; col: number }[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [snapshots, setSnapshots] = useState<Map<number, { grid: number[][] }>>(new Map());
  const kurodokuTypeRef = useRef<PuzzleType<number>>(defaultKurodokuType);
  const solverTraceRef = useRef<SolverStep[]>([]);
  const [solvedCells, setSolvedCells] = useState<Set<string>>(new Set());
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [currentGrid, setCurrentGrid] = useState<number[][]>(makeEmptyGrid(DEFAULT_SIZE, DEFAULT_SIZE));

  const checkGrid = useMemo((): (number | null)[][] =>
    currentGrid.map(row => row.map(cell => cell === 0 ? null : cell)),
    [currentGrid]
  );

  const solutionGrid = useMemo((): (number | null)[][] | null => {
    if (!solution) return null;
    return solution.map(row => row.map(cell => cell as (number | null)));
  }, [solution]);

  const [puzzleKey, setPuzzleKey] = useState(0);
  const { display: timerDisplay, start: startTimer, stop: stopTimer } = useTimer();

  const checkRevealHint = useCheckRevealHint(checkGrid, solutionGrid, solverTraceRef.current, logs, lockedCells);

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

  const handleNewPuzzle = (size?: number) => {
    const n = size ?? gridSize;
    const result = generateKurodokuPuzzle(n, n);
    const kt = createKurodokuType(result.values, n, n);
    const trace = solveKurodokuWithTrace(result.values, n, n);
    kurodokuTypeRef.current = kt;
    solverTraceRef.current = trace;
    setGridSize(n);
    setValues(result.values);
    setSolution(result.solution);
    const grid = buildInitialGrid(result.values);
    setInitialGrid(grid);
    setCurrentGrid(grid.map(r => [...r]));
    setLockedCells(buildLockedCells(result.values));
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    setSolvedCells(new Set());
    setSelectedLogId(null);
    checkRevealHint.resetToCheck();
    setPuzzleKey(k => k + 1);
  };

  const handleReset = () => {
    const grid = buildInitialGrid(values);
    setInitialGrid(grid);
    setCurrentGrid(grid.map(r => [...r]));
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    setSolvedCells(new Set());
    setSelectedLogId(null);
    checkRevealHint.resetToCheck();
    startTimer();
  };

  const handleSizeChange = (newSize: number) => {
    handleNewPuzzle(newSize);
  };

  const handleAction = (action: KurodokuAction) => {
    const kt = kurodokuTypeRef.current;
    checkRevealHint.resetToCheck();
    setCurrentGrid(action.gridSnapshot.map(r => [...r]));

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
    const label = kt.formatMoveLabel(move);
    const errorLabels = action.errors.map(
      e => `Conflict at (${e.row + 1}, ${e.col + 1})`
    );

    setSnapshots(prev => {
      const next = new Map(prev);
      next.set(id, { grid: action.gridSnapshot });
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
    const reverted = snapshot.grid.map(r => [...r]);
    setInitialGrid(reverted);
    setCurrentGrid(reverted);

    setLogs(prev => {
      const targetIndex = prev.findIndex(e => e.id === targetId);
      if (targetIndex === -1) return prev;
      return prev.slice(0, targetIndex + 1);
    });

    setSnapshots(prev => {
      const next = new Map<number, { grid: number[][] }>();
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

    setInitialGrid(newGrid);
    setCurrentGrid(newGrid.map(r => [...r]));
    setLockedCells(prev => [...prev, step.cell]);
    setSolvedCells(prev => new Set(prev).add(`${step.cell.row},${step.cell.col}`));
    checkRevealHint.resetToCheck();

    const id = logCounter;
    setLogCounter(c => c + 1);
    const valueLabel = step.value === 1 ? '■' : '□';
    const detailLines: string[] = [`Technique: ${step.technique}`];
    if (step.relatedCells.length > 0) {
      detailLines.push(`Related: ${step.relatedCells.map(c => `(${c.row + 1}, ${c.col + 1})`).join(', ')}`);
    }
    setLogs(prev => [...prev, {
      id,
      label: `\u{1F527} ${valueLabel} (${step.cell.row + 1}, ${step.cell.col + 1})`,
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

  const kt = kurodokuTypeRef.current;

  return (
    <div className="pq-page">
      <TopNav activeTab="play" />
      <div className="pq-puzzle-shell">
        <RulesSidebar rules={[...kt.rules]} />

        <main className={`pq-puzzle-main pq-puzzle-main--${kt.id}`}>
          <div className="pq-puzzle-header">
            <h1 className="pq-puzzle-title">{kt.name.toUpperCase()}</h1>
            <span className="pq-puzzle-timer">{timerDisplay}</span>
          </div>
          <hr className="pq-puzzle-divider" />
          {isComplete && <p className="pq-puzzle-complete">Puzzle Complete</p>}

          <div className="pq-puzzle-board">
            <KurodokuGrid
              initialGrid={initialGrid}
              values={values}
              lockedCells={lockedCells}
              puzzleType={kt}
              onAction={handleAction}
              revealCell={checkRevealHint.revealCell}
              hintCell={checkRevealHint.hintCell}
              solvedCells={solvedCells}
              logPrimaryCells={logPrimaryCells}
              logHighlightCells={logHighlightCells}
              logErrorCells={logErrorCells}
            />
          </div>

          <div className="pq-puzzle-actions">
            <button className="pq-btn" onClick={() => handleNewPuzzle()}>New Puzzle</button>
            <button className="pq-btn" onClick={handleReset}>Reset Puzzle</button>
            <button
              className="pq-btn"
              onClick={handleCheckRevealHint}
              disabled={checkRevealHint.buttonDisabled}
            >
              {checkRevealHint.buttonLabel}
            </button>
            <label className="pq-size-selector">
              Size:
              <select
                value={gridSize}
                onChange={e => handleSizeChange(Number(e.target.value))}
                className="pq-size-select"
              >
                {[5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n}x{n}</option>
                ))}
              </select>
            </label>
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
