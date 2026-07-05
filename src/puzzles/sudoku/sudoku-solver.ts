import { Coordinate, SolverStep } from '../core/types';

export interface ConstraintGroup {
  readonly label: string;
  readonly cells: readonly Coordinate[];
}

export function buildSudokuGroups(gridSize: number = 9): ConstraintGroup[] {
  const groups: ConstraintGroup[] = [];
  for (let r = 0; r < gridSize; r++) {
    const cells: Coordinate[] = [];
    for (let c = 0; c < gridSize; c++) cells.push({ row: r, col: c });
    groups.push({ label: `Row ${r + 1}`, cells });
  }
  for (let c = 0; c < gridSize; c++) {
    const cells: Coordinate[] = [];
    for (let r = 0; r < gridSize; r++) cells.push({ row: r, col: c });
    groups.push({ label: `Col ${c + 1}`, cells });
  }
  const boxSize = Math.floor(Math.sqrt(gridSize));
  for (let br = 0; br < boxSize; br++) {
    for (let bc = 0; bc < boxSize; bc++) {
      const cells: Coordinate[] = [];
      for (let r = 0; r < boxSize; r++) {
        for (let c = 0; c < boxSize; c++) {
          cells.push({ row: br * boxSize + r, col: bc * boxSize + c });
        }
      }
      groups.push({ label: `Box ${br * boxSize + bc + 1}`, cells });
    }
  }
  return groups;
}

export function buildJigsawGroups(regionMap: number[][], gridSize: number = 9): ConstraintGroup[] {
  const groups: ConstraintGroup[] = [];
  for (let r = 0; r < gridSize; r++) {
    const cells: Coordinate[] = [];
    for (let c = 0; c < gridSize; c++) cells.push({ row: r, col: c });
    groups.push({ label: `Row ${r + 1}`, cells });
  }
  for (let c = 0; c < gridSize; c++) {
    const cells: Coordinate[] = [];
    for (let r = 0; r < gridSize; r++) cells.push({ row: r, col: c });
    groups.push({ label: `Col ${c + 1}`, cells });
  }
  const regionCells = new Map<number, Coordinate[]>();
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const id = regionMap[r][c];
      const list = regionCells.get(id) ?? [];
      list.push({ row: r, col: c });
      regionCells.set(id, list);
    }
  }
  let regionIdx = 1;
  for (const cells of regionCells.values()) {
    groups.push({ label: `Region ${regionIdx++}`, cells });
  }
  return groups;
}

function eliminateFromPeers(
  idx: number,
  value: number,
  candidates: Set<number>[],
  cellToGroups: ConstraintGroup[][],
  gridSize: number,
) {
  const groups = cellToGroups[idx];
  for (const group of groups) {
    for (const cell of group.cells) {
      const peerIdx = cell.row * gridSize + cell.col;
      if (peerIdx !== idx) {
        candidates[peerIdx].delete(value);
      }
    }
  }
}

export function solveWithTrace(
  puzzle: (number | null)[][],
  groups: ConstraintGroup[],
  gridSize: number = 9,
): SolverStep[] {
  const trace: SolverStep[] = [];
  const total = gridSize * gridSize;

  const grid: (number | null)[] = new Array(total);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      grid[r * gridSize + c] = puzzle[r][c];
    }
  }

  const candidates: Set<number>[] = new Array(total);
  for (let i = 0; i < total; i++) {
    candidates[i] = grid[i] === null
      ? new Set(Array.from({ length: gridSize }, (_, k) => k + 1))
      : new Set();
  }

  const cellToGroups: ConstraintGroup[][] = new Array(total);
  for (let i = 0; i < total; i++) cellToGroups[i] = [];
  for (const group of groups) {
    for (const cell of group.cells) {
      cellToGroups[cell.row * gridSize + cell.col].push(group);
    }
  }

  for (let i = 0; i < total; i++) {
    if (grid[i] !== null) {
      eliminateFromPeers(i, grid[i]!, candidates, cellToGroups, gridSize);
    }
  }

  let progress = true;
  while (progress) {
    progress = false;

    for (let i = 0; i < total; i++) {
      if (grid[i] !== null || candidates[i].size !== 1) continue;
      const value = candidates[i].values().next().value as number;
      grid[i] = value;
      candidates[i].clear();
      eliminateFromPeers(i, value, candidates, cellToGroups, gridSize);

      const cell = { row: Math.floor(i / gridSize), col: i % gridSize };
      const relatedCells: Coordinate[] = [];
      const needed = new Set<number>();
      for (let w = 1; w <= gridSize; w++) { if (w !== value) needed.add(w); }
      for (const group of cellToGroups[i]) {
        for (const gc of group.cells) {
          const peerIdx = gc.row * gridSize + gc.col;
          if (peerIdx !== i && grid[peerIdx] !== null && needed.has(grid[peerIdx] as number)) {
            needed.delete(grid[peerIdx] as number);
            relatedCells.push(gc);
          }
        }
        if (needed.size === 0) break;
      }
      trace.push({ cell, value, technique: 'Naked Single', relatedCells });
      progress = true;
    }

    for (const group of groups) {
      for (let val = 1; val <= gridSize; val++) {
        let alreadyPlaced = false;
        const possibleIndices: number[] = [];
        for (const cell of group.cells) {
          const idx = cell.row * gridSize + cell.col;
          if (grid[idx] === val) { alreadyPlaced = true; break; }
          if (candidates[idx].has(val)) possibleIndices.push(idx);
        }
        if (alreadyPlaced || possibleIndices.length !== 1) continue;

        const idx = possibleIndices[0];
        const cell = { row: Math.floor(idx / gridSize), col: idx % gridSize };
        grid[idx] = val;
        candidates[idx].clear();
        eliminateFromPeers(idx, val, candidates, cellToGroups, gridSize);

        const relatedCells: Coordinate[] = [];
        const addedKeys = new Set<string>();
        for (const gc of group.cells) {
          const cellIdx = gc.row * gridSize + gc.col;
          for (const peerGroup of cellToGroups[cellIdx]) {
            for (const pc of peerGroup.cells) {
              const peerIdx = pc.row * gridSize + pc.col;
              if (peerIdx === idx) continue;
              const key = `${pc.row},${pc.col}`;
              if (addedKeys.has(key)) continue;
              if (grid[peerIdx] === val) {
                addedKeys.add(key);
                relatedCells.push(pc);
              }
            }
          }
        }
        trace.push({
          cell,
          value: val,
          technique: `Hidden Single in ${group.label}`,
          relatedCells,
        });
        progress = true;
      }
    }
  }

  return trace;
}
