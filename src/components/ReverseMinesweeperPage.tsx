'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import TopNav from './TopNav';
import RulesSidebar from './RulesSidebar';
import LogsSidebar, { LogEntry } from './LogsSidebar';
import ReverseMinesweeperGrid, { RMAction, RMSnapshot } from './ReverseMinesweeperGrid';
import { createReverseMinesweeperType } from '../puzzles/reverse-minesweeper/reverse-minesweeper-type';
import { PuzzleType } from '../puzzles/core/puzzle-type';
import { useTimer } from './useTimer';
import { useUser } from '../UserContext';
import { markLevelCompleted } from '../firebaseUser';
import puzzlesData from '../data/puzzles.json';
import puzzleOrder from '../data/reverse_minesweeper_puzzle_order.json';

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#22aa22',
  2: '#ccaa00',
  3: '#dd2222',
  4: '#bc00ac',
};

interface PuzzleLevel {
  id: string;
  name: string;
  difficulty: number;
  unlocks?: string[];
}

function parseBlockInput(blocks: string[][], i: number, j: number): number[][] | null {
  const block = blocks[i][j];
  if (block === ' ') return null;
  return block.split('&').map(b => b.split('|').map(Number));
}

function parseOperationsInput(blocks: string[][], operations: string[][], i: number, j: number): string[][] | null {
  const operation = operations[i][j];
  if (operation === ' ' && blocks[i][j]) {
    return blocks[i][j].split('&').map(b => b.split('|').map(() => '+'));
  }
  return operation.split('&').map(op => op.split('|'));
}

function parsePuzzle(name: string): RMSnapshot | null {
  const puzzle = (puzzlesData as any[]).find((p: any) => p.name === name);
  if (!puzzle) return null;
  const rows = puzzle.walls.length;
  const cols = puzzle.walls[0].length;

  const walls: number[][] = [];
  const blocks: (number[][] | null)[][] = [];
  const values: (number | 'NaN' | null)[][] = [];
  const operations: (string[][] | null)[][] = [];
  const blockTypes: (number | null)[][] = [];
  const blockPlanes: (number | null)[][] = [];

  for (let i = 0; i < rows; i++) {
    walls[i] = [];
    blocks[i] = [];
    values[i] = [];
    operations[i] = [];
    blockTypes[i] = [];
    blockPlanes[i] = [];
    for (let j = 0; j < cols; j++) {
      walls[i][j] = puzzle.walls[i][j] === ' ' ? 0 : Number(puzzle.walls[i][j]);
      blocks[i][j] = parseBlockInput(puzzle.blocks, i, j);
      values[i][j] = puzzle.values[i][j] === ' '
        ? null
        : (puzzle.values[i][j] === 'NaN' ? ('NaN' as const) : Number(puzzle.values[i][j]));

      if (puzzle.operations) {
        operations[i][j] = parseOperationsInput(puzzle.blocks, puzzle.operations, i, j);
      } else {
        operations[i][j] = blocks[i][j] ? blocks[i][j]!.map((b: number[]) => b.map(() => '+')) : null;
      }

      if (puzzle.block_types) {
        blockTypes[i][j] = puzzle.block_types[i][j] === ' '
          ? (blocks[i][j] !== null ? 0 : null)
          : Number(puzzle.block_types[i][j]);
      } else {
        blockTypes[i][j] = blocks[i][j] !== null ? 0 : null;
      }

      if (puzzle.block_planes) {
        blockPlanes[i][j] = puzzle.block_planes[i][j] === ' '
          ? (blocks[i][j] !== null ? 0 : null)
          : Number(puzzle.block_planes[i][j]);
      } else {
        blockPlanes[i][j] = blocks[i][j] !== null ? 0 : null;
      }
    }
  }

  return { walls, blocks, values, operations, blockTypes, blockPlanes };
}

function deepCopy(state: RMSnapshot): RMSnapshot {
  return {
    walls: state.walls.map(r => [...r]),
    blocks: state.blocks.map(r => r.map(b => b ? b.map(row => [...row]) : null)),
    values: state.values.map(r => [...r] as (number | 'NaN' | null)[]),
    operations: state.operations.map(r => r.map(o => o ? o.map(row => [...row]) : null)),
    blockTypes: state.blockTypes.map(r => [...r]),
    blockPlanes: state.blockPlanes.map(r => [...r]),
  };
}

export default function ReverseMinesweeperPage() {
  const { user } = useUser();
  const levels = puzzleOrder.puzzles as PuzzleLevel[];
  const [levelIndex, setLevelIndex] = useState(-1);
  const [puzzleState, setPuzzleState] = useState<RMSnapshot | null>(null);
  const originalStateRef = useRef<RMSnapshot | null>(null);
  const [mode, setMode] = useState<string>('Normal');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [snapshots, setSnapshots] = useState<Map<number, RMSnapshot>>(new Map());
  const [solved, setSolved] = useState(false);
  const [puzzleKey, setPuzzleKey] = useState(0);
  const rmTypeRef = useRef<PuzzleType<number>>(createReverseMinesweeperType(5, 5));

  const { display: timerDisplay, start: startTimer, stop: stopTimer } = useTimer();

  useEffect(() => {
    if (puzzleKey > 0) startTimer();
  }, [puzzleKey, startTimer]);

  useEffect(() => {
    if (solved) stopTimer();
  }, [solved, stopTimer]);

  useEffect(() => {
    if (solved && user && levelIndex >= 0) {
      markLevelCompleted(user.uid, levels[levelIndex].name);
    }
  }, [solved, user, levelIndex, levels]);

  const currentLevel = levelIndex >= 0 ? levels[levelIndex] : null;

  const handleLoadLevel = (index: number) => {
    if (index < 0 || index >= levels.length) return;
    const level = levels[index];
    const data = parsePuzzle(level.name);
    if (!data) return;

    const rows = data.walls.length;
    const cols = data.walls[0].length;
    rmTypeRef.current = createReverseMinesweeperType(rows, cols);

    setLevelIndex(index);
    setPuzzleState(data);
    originalStateRef.current = deepCopy(data);
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    setSolved(false);
    setMode('Normal');
    setPuzzleKey(k => k + 1);
  };

  const handleReset = () => {
    if (!originalStateRef.current) return;
    setPuzzleState(deepCopy(originalStateRef.current));
    setLogs([]);
    setLogCounter(0);
    setSnapshots(new Map());
    setSolved(false);
    startTimer();
  };

  const handleAction = (action: RMAction) => {
    const id = logCounter;
    setLogCounter(c => c + 1);

    const label = action.type === 'wallbreak'
      ? `Break (${action.toRow + 1}, ${action.toCol + 1})`
      : `(${action.fromRow + 1}, ${action.fromCol + 1}) ↔ (${action.toRow + 1}, ${action.toCol + 1})`;

    setSnapshots(prev => {
      const next = new Map(prev);
      next.set(id, action.snapshot);
      return next;
    });

    setLogs(prev => [...prev, {
      id,
      label,
      actionType: 'place' as const,
      row: action.toRow,
      col: action.toCol,
      value: null,
      previousValue: null,
    }]);

    setSolved(action.solved);
  };

  const handleRevert = (targetId: number) => {
    const snapshot = snapshots.get(targetId);
    if (!snapshot) return;

    setPuzzleState(deepCopy(snapshot));

    setLogs(prev => {
      const targetIndex = prev.findIndex(e => e.id === targetId);
      if (targetIndex === -1) return prev;
      return prev.slice(0, targetIndex + 1);
    });

    setSnapshots(prev => {
      const next = new Map<number, RMSnapshot>();
      for (const [key, value] of prev) {
        if (key <= targetId) next.set(key, value);
      }
      return next;
    });

    setSolved(false);
  };

  const handleSolvedChange = useCallback((isSolved: boolean) => {
    setSolved(isSolved);
  }, []);

  const rmt = rmTypeRef.current;

  return (
    <div className="pq-page">
      <TopNav activeTab="play" />
      <div className="pq-puzzle-shell">
        <RulesSidebar rules={[...rmt.rules]} />

        <main className={`pq-puzzle-main pq-puzzle-main--${rmt.id}`}>
          <div className="pq-puzzle-header">
            <h1 className="pq-puzzle-title">
              {currentLevel
                ? `${currentLevel.id}: ${currentLevel.name.toUpperCase()}`
                : 'REVERSE MINESWEEPER'}
            </h1>
            <span className="pq-puzzle-timer">{timerDisplay}</span>
          </div>
          <hr className="pq-puzzle-divider" />
          {solved && <p className="pq-puzzle-complete">Puzzle Complete</p>}

          <div className="pq-puzzle-board">
            {puzzleState && (
              <ReverseMinesweeperGrid
                walls={puzzleState.walls}
                blocks={puzzleState.blocks}
                values={puzzleState.values}
                operations={puzzleState.operations}
                blockTypes={puzzleState.blockTypes}
                blockPlanes={puzzleState.blockPlanes}
                mode={mode}
                onAction={handleAction}
                onSolvedChange={handleSolvedChange}
              />
            )}
          </div>

          <div className="pq-puzzle-actions">
            <button
              className="pq-btn"
              onClick={() => handleLoadLevel(levelIndex - 1)}
              disabled={levelIndex <= 0}
            >
              Previous
            </button>
            <label className="pq-size-selector">
              Level:
              <select
                value={levelIndex}
                onChange={e => handleLoadLevel(Number(e.target.value))}
                className="pq-size-select"
              >
                <option value={-1} disabled>Select a level</option>
                {levels.map((level, idx) => (
                  <option
                    key={level.id}
                    value={idx}
                    style={{ color: level.difficulty < 5 ? DIFFICULTY_COLORS[level.difficulty] : undefined }}
                    className={level.difficulty === 5 ? 'rainbow-text' : ''}
                  >
                    {level.id}: {level.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="pq-btn"
              onClick={() => handleLoadLevel(levelIndex + 1)}
              disabled={levelIndex < 0 || levelIndex >= levels.length - 1}
            >
              Next
            </button>
            <button className="pq-btn" onClick={handleReset} disabled={!puzzleState}>
              Reset
            </button>
            <button
              className="pq-btn"
              onClick={() => setMode(m => m === 'Normal' ? 'Value' : 'Normal')}
            >
              Mode: {mode}
            </button>
          </div>
        </main>

        <LogsSidebar entries={logs} onRevert={handleRevert} />
      </div>
    </div>
  );
}
