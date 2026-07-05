'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import TopNav from './TopNav';
import RulesSidebar from './RulesSidebar';
import LogsSidebar, { LogEntry } from './LogsSidebar';
import QueensGrid, { QueensAction } from './QueensGrid';
import { createQueensType } from '../puzzles/queens/queens-type';
import { generateQueensPuzzle } from '../puzzles/queens/queens-generator';
import { PuzzleType } from '../puzzles/core/puzzle-type';
import { useCheckRevealHint } from './useCheckRevealHint';
import { useTimer } from './useTimer';

const DEFAULT_SIZE = 8;

function makeEmptyGrid(n: number): number[][] {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

const defaultRegionMap = makeEmptyGrid(DEFAULT_SIZE);
const defaultQueensType = createQueensType(defaultRegionMap, DEFAULT_SIZE);

export default function QueensPage() {
  const [gridSize, setGridSize] = useState(DEFAULT_SIZE);
  const [initialGrid, setInitialGrid] = useState<number[][]>(makeEmptyGrid(DEFAULT_SIZE));
  const [regionMap, setRegionMap] = useState<number[][]>(defaultRegionMap);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [snapshots, setSnapshots] = useState<Map<number, { grid: number[][] }>>(new Map());
  const queensTypeRef = useRef<PuzzleType<number>>(defaultQueensType);
  const [solutionPositions, setSolutionPositions] = useState<[number, number][]>([]);
  const [currentGrid, setCurrentGrid] = useState<number[][]>(makeEmptyGrid(DEFAULT_SIZE));

  const checkGrid = useMemo((): (number | null)[][] =>
    currentGrid.map(row => row.map(cell => cell === 2 ? 2 : null)),
    [currentGrid]
  );

  const solutionGrid = useMemo((): (number | null)[][] | null => {
    if (solutionPositions.length === 0) return null;
    const g: (number | null)[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(null)
    );
    for (const [r, c] of solutionPositions) g[r][c] = 2;
    return g;
  }, [solutionPositions, gridSize]);

  const [puzzleKey, setPuzzleKey] = useState(0);
  const { display: timerDisplay, start: startTimer, stop: stopTimer } = useTimer();

  const checkRevealHint = useCheckRevealHint(checkGrid, solutionGrid, [], logs, []);

  const isComplete = useMemo(() => {
    if (!solutionGrid) return false;
    return checkGrid.every((row, r) =>
      row.every((cell, c) => cell === solutionGrid[r][c])
    );
  }, [checkGrid, solutionGrid]);

  useEffect(() => {
    if (puzzleKey > 0) startTimer();
  }, [puzzleKey, startTimer]);

  useEffect(() => {
    if (isComplete) stopTimer();
  }, [isComplete, stopTimer]);

  const handleNewPuzzle = (size?: number) => {
    const n = size ?? gridSize;
    const result = generateQueensPuzzle(n);
    const qt = createQueensType(result.regionMap, n);
    queensTypeRef.current = qt;
    setGridSize(n);
    setRegionMap(result.regionMap);
    const empty = makeEmptyGrid(n);
    setInitialGrid(empty);
    setCurrentGrid(empty);
    setSolutionPositions(result.solution);
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    checkRevealHint.resetToCheck();
    setPuzzleKey(k => k + 1);
  };

  const handleReset = () => {
    const empty = makeEmptyGrid(gridSize);
    setInitialGrid(empty);
    setCurrentGrid(empty);
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    checkRevealHint.resetToCheck();
    startTimer();
  };

  const handleSizeChange = (newSize: number) => {
    handleNewPuzzle(newSize);
  };

  const handleAction = (action: QueensAction) => {
    const qt = queensTypeRef.current;
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
    const label = qt.formatMoveLabel(move);
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

  const qt = queensTypeRef.current;

  return (
    <div className="pq-page">
      <TopNav activeTab="play" />
      <div className="pq-puzzle-shell">
        <RulesSidebar rules={[...qt.rules]} />

        <main className={`pq-puzzle-main pq-puzzle-main--${qt.id}`}>
          <div className="pq-puzzle-header">
            <h1 className="pq-puzzle-title">{qt.name.toUpperCase()}</h1>
            <span className="pq-puzzle-timer">{timerDisplay}</span>
          </div>
          <hr className="pq-puzzle-divider" />
          {isComplete && <p className="pq-puzzle-complete">Puzzle Complete</p>}

          <div className="pq-puzzle-board">
            <QueensGrid
              initialGrid={initialGrid}
              regionMap={regionMap}
              puzzleType={qt}
              onAction={handleAction}
              revealCell={checkRevealHint.revealCell}
              hintCell={checkRevealHint.hintCell}
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
                {[5, 6, 7, 8, 9].map(n => (
                  <option key={n} value={n}>{n}×{n}</option>
                ))}
              </select>
            </label>
          </div>
        </main>

        <LogsSidebar entries={logs} onRevert={handleRevert} />
      </div>
    </div>
  );
}
