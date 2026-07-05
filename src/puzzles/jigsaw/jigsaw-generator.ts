import { buildJigsawGroups, solveWithTrace } from '../sudoku/sudoku-solver';

const GRID_SIZE = 9;

function shuffle(array: number[]): number[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildFlatPeers(regionMap: number[][]): number[][] {
  const regionCells: number[][] = Array.from({ length: 9 }, () => []);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      regionCells[regionMap[r][c]].push(r * GRID_SIZE + c);
    }
  }

  const flatPeers: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const seen = new Set<number>();
      const pos = r * GRID_SIZE + c;
      seen.add(pos);
      const peerList: number[] = [];
      const add = (idx: number) => {
        if (!seen.has(idx)) { seen.add(idx); peerList.push(idx); }
      };
      for (let i = 0; i < GRID_SIZE; i++) {
        add(r * GRID_SIZE + i);
        add(i * GRID_SIZE + c);
      }
      for (const idx of regionCells[regionMap[r][c]]) {
        add(idx);
      }
      flatPeers.push(peerList);
    }
  }
  return flatPeers;
}

export function generateSolvedJigsaw(regionMap: number[][]): number[][] | null {
  const flat = new Int8Array(81);
  const flatPeers = buildFlatPeers(regionMap);
  let nodes = 0;
  const maxNodes = 500000;

  function fill(pos: number): boolean {
    if (pos === 81) return true;
    if (++nodes > maxNodes) return false;
    const candidates = shuffle(Array.from({ length: 9 }, (_, k) => k + 1));
    for (const value of candidates) {
      let valid = true;
      for (const peer of flatPeers[pos]) {
        if (flat[peer] === value) { valid = false; break; }
      }
      if (valid) {
        flat[pos] = value;
        if (fill(pos + 1)) return true;
      }
    }
    flat[pos] = 0;
    return false;
  }

  if (!fill(0)) return null;
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid.push(Array.from(flat.slice(r * GRID_SIZE, (r + 1) * GRID_SIZE)));
  }
  return grid;
}

function propagate(
  grid: Int8Array,
  cands: Uint16Array,
  flatPeers: number[][]
): boolean {
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < 81; i++) {
      if (grid[i] !== 0) continue;
      if (cands[i] === 0) return false;
      const bits = cands[i];
      if ((bits & (bits - 1)) === 0) {
        let val = 0;
        let tmp = bits;
        while (tmp > 1) { tmp >>= 1; val++; }
        val += 1;
        grid[i] = val;
        cands[i] = 0;
        const mask = ~(1 << (val - 1));
        for (const peer of flatPeers[i]) {
          if (cands[peer] & (1 << (val - 1))) {
            cands[peer] &= mask;
            if (cands[peer] === 0 && grid[peer] === 0) return false;
            changed = true;
          }
        }
      }
    }
  }
  return true;
}

function bitCount(n: number): number {
  let count = 0;
  while (n) { count++; n &= n - 1; }
  return count;
}

function countSolutionsBounded(
  grid: Int8Array,
  cands: Uint16Array,
  flatPeers: number[][],
  limit: number,
  nodeLimit: { remaining: number }
): number {
  if (nodeLimit.remaining <= 0) return 0;
  nodeLimit.remaining--;

  const g = new Int8Array(grid);
  const c = new Uint16Array(cands);

  if (!propagate(g, c, flatPeers)) return 0;

  let minPos = -1;
  let minCount = 10;
  for (let i = 0; i < 81; i++) {
    if (g[i] !== 0) continue;
    const bc = bitCount(c[i]);
    if (bc < minCount) {
      minCount = bc;
      minPos = i;
    }
  }

  if (minPos === -1) return 1;

  let total = 0;
  let bits = c[minPos];
  while (bits && nodeLimit.remaining > 0) {
    const bit = bits & (-bits);
    bits &= bits - 1;

    let val = 0;
    let tmp = bit;
    while (tmp > 1) { tmp >>= 1; val++; }
    val += 1;

    const gCopy = new Int8Array(g);
    const cCopy = new Uint16Array(c);
    gCopy[minPos] = val;
    cCopy[minPos] = 0;
    const mask = ~bit;
    for (const peer of flatPeers[minPos]) {
      cCopy[peer] &= mask;
    }

    total += countSolutionsBounded(gCopy, cCopy, flatPeers, limit - total, nodeLimit);
    if (total >= limit) return total;
  }
  return total;
}

function initCandidates(grid: Int8Array, flatPeers: number[][]): Uint16Array {
  const cands = new Uint16Array(81);
  for (let i = 0; i < 81; i++) {
    if (grid[i] === 0) {
      cands[i] = 0x1FF;
    }
  }
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) {
      const mask = ~(1 << (grid[i] - 1));
      for (const peer of flatPeers[i]) {
        cands[peer] &= mask;
      }
    }
  }
  return cands;
}

function flatToGrid(flat: Int8Array): (number | null)[][] {
  const grid: (number | null)[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: (number | null)[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const v = flat[r * GRID_SIZE + c];
      row.push(v === 0 ? null : v);
    }
    grid.push(row);
  }
  return grid;
}

export function generateValidJigsaw(
  solved: number[][],
  regionMap: number[][]
): (number | null)[][] | null {
  const flatPeers = buildFlatPeers(regionMap);
  const groups = buildJigsawGroups(regionMap);

  const flat = new Int8Array(81);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      flat[r * GRID_SIZE + c] = solved[r][c];
    }
  }

  let attempts = 20;
  while (attempts > 0) {
    let pos = Math.floor(Math.random() * 81);
    while (flat[pos] === 0) {
      pos = Math.floor(Math.random() * 81);
    }
    const backup = flat[pos];
    flat[pos] = 0;

    const copy = new Int8Array(flat);
    const cands = initCandidates(copy, flatPeers);
    const nodeLimit = { remaining: 50000 };
    const solutions = countSolutionsBounded(copy, cands, flatPeers, 2, nodeLimit);

    if (nodeLimit.remaining <= 0 || solutions !== 1) {
      flat[pos] = backup;
      attempts--;
    } else {
      const puzzleGrid = flatToGrid(flat);
      const trace = solveWithTrace(puzzleGrid, groups);
      let emptyCount = 0;
      for (let i = 0; i < 81; i++) { if (flat[i] === 0) emptyCount++; }
      if (trace.length < emptyCount) {
        flat[pos] = backup;
        attempts--;
      }
    }
  }

  return flatToGrid(flat);
}

export function generateJigsawPuzzle(regionMap: number[][]): {
  puzzle: (number | null)[][];
  regionMap: number[][];
  solution: (number | null)[][];
} {
  for (let attempt = 0; attempt < 10; attempt++) {
    const solved = generateSolvedJigsaw(regionMap);
    if (!solved) continue;
    const solution: (number | null)[][] = solved.map(r => r.map(v => v));
    const puzzle = generateValidJigsaw(solved, regionMap);
    if (puzzle) return { puzzle, regionMap, solution };
  }
  throw new Error('Failed to generate jigsaw puzzle');
}
