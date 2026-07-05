const GRID_SIZE = 9;

const DIRECTIONS: readonly [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isRegionContiguous(regionMap: number[][], regionId: number): boolean {
  const cells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regionMap[r][c] === regionId) cells.push([r, c]);
    }
  }
  if (cells.length <= 1) return true;

  const set = new Set(cells.map(([r, c]) => `${r},${c}`));
  const visited = new Set<string>();
  const queue: [number, number][] = [cells[0]];
  visited.add(`${cells[0][0]},${cells[0][1]}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (set.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return visited.size === cells.length;
}

function initStandardBoxes(): number[][] {
  const regionMap: number[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      regionMap[r][c] = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    }
  }
  return regionMap;
}

function getBorderCellsForPair(
  regionMap: number[][],
  regionA: number,
  regionB: number
): { fromA: [number, number][]; fromB: [number, number][] } {
  const fromA: [number, number][] = [];
  const fromB: [number, number][] = [];
  const seenA = new Set<string>();
  const seenB = new Set<string>();

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const id = regionMap[r][c];
      if (id !== regionA && id !== regionB) continue;

      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
        const nid = regionMap[nr][nc];
        if (id === regionA && nid === regionB) {
          const key = `${r},${c}`;
          if (!seenA.has(key)) { seenA.add(key); fromA.push([r, c]); }
        }
        if (id === regionB && nid === regionA) {
          const key = `${r},${c}`;
          if (!seenB.has(key)) { seenB.add(key); fromB.push([r, c]); }
        }
      }
    }
  }
  return { fromA, fromB };
}

function getAdjacentRegionPairs(regionMap: number[][]): [number, number][] {
  const pairs = new Set<string>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
        if (regionMap[r][c] < regionMap[nr][nc]) {
          pairs.add(`${regionMap[r][c]},${regionMap[nr][nc]}`);
        }
      }
    }
  }
  return [...pairs].map(p => {
    const [a, b] = p.split(',').map(Number);
    return [a, b] as [number, number];
  });
}

export function generateRegionMap(): number[][] {
  const regionMap = initStandardBoxes();
  const targetSwaps = 40 + Math.floor(Math.random() * 30);
  let swapped = 0;

  for (let attempt = 0; attempt < targetSwaps * 20 && swapped < targetSwaps; attempt++) {
    const pairs = shuffle(getAdjacentRegionPairs(regionMap));
    if (pairs.length === 0) break;

    const [regionA, regionB] = pairs[0];
    const { fromA, fromB } = getBorderCellsForPair(regionMap, regionA, regionB);
    if (fromA.length === 0 || fromB.length === 0) continue;

    const shuffledA = shuffle(fromA);
    const shuffledB = shuffle(fromB);

    let found = false;
    for (const [r1, c1] of shuffledA) {
      for (const [r2, c2] of shuffledB) {
        if (r1 === r2 && c1 === c2) continue;

        regionMap[r1][c1] = regionB;
        regionMap[r2][c2] = regionA;

        if (
          isRegionContiguous(regionMap, regionA) &&
          isRegionContiguous(regionMap, regionB)
        ) {
          swapped++;
          found = true;
          break;
        }

        regionMap[r1][c1] = regionA;
        regionMap[r2][c2] = regionB;
      }
      if (found) break;
    }
  }

  return regionMap;
}
