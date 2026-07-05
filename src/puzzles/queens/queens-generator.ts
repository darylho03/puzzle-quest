export interface QueensPuzzle {
  readonly regionMap: number[][];
  readonly solution: [number, number][];
}

function generateQueenPlacement(n: number): [number, number][] {
  let solution: number[] | null = null;

  function isValid(row: number, col: number, board: number[]): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i] === col) return false;
      if (Math.abs(i - row) === 1 && Math.abs(board[i] - col) === 1) return false;
    }
    return true;
  }

  function backtrack(row: number, board: number[]): boolean {
    if (row === n) {
      solution = [...board];
      return true;
    }
    const cols = Array.from({ length: n }, (_, i) => i);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }
    for (const col of cols) {
      if (isValid(row, col, board)) {
        board[row] = col;
        if (backtrack(row + 1, board)) return true;
        board[row] = -1;
      }
    }
    return false;
  }

  backtrack(0, Array(n).fill(-1));
  if (!solution) return [];
  return (solution as number[]).map((col: number, row: number) => [row, col]);
}

function countSolutions(n: number, regionGrid: number[][]): number {
  let count = 0;

  function isValid(row: number, col: number, board: number[]): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i] === col) return false;
      if (Math.abs(i - row) === 1 && Math.abs(board[i] - col) === 1) return false;
      if (regionGrid[row][col] === regionGrid[i][board[i]]) return false;
    }
    return true;
  }

  function backtrack(row: number, board: number[]): void {
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isValid(row, col, board)) {
        board[row] = col;
        backtrack(row + 1, board);
        board[row] = -1;
      }
    }
  }

  backtrack(0, Array(n).fill(-1));
  return count;
}

function generateRegions(queens: [number, number][], n: number): number[][] {
  const grid = Array.from({ length: n }, () => Array(n).fill(-1));
  const frontier: [number, number, number][] = [];

  for (let r = 0; r < queens.length; r++) {
    const [qr, qc] = queens[r];
    grid[qr][qc] = r;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = qr + dr;
      const nc = qc + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === -1) {
        frontier.splice(Math.floor(Math.random() * (frontier.length + 1)), 0, [nr, nc, r]);
      }
    }
  }

  while (frontier.length > 0) {
    const [row, col, region] = frontier.pop()!;
    if (grid[row][col] !== -1) continue;
    grid[row][col] = region;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === -1) {
        frontier.splice(Math.floor(Math.random() * (frontier.length + 1)), 0, [nr, nc, region]);
      }
    }
  }

  return grid;
}

export function generateQueensPuzzle(n: number): QueensPuzzle {
  let regionMap: number[][];
  let queens: [number, number][];

  for (;;) {
    queens = generateQueenPlacement(n);
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      regionMap = generateRegions(queens, n);
      if (countSolutions(n, regionMap) === 1) {
        found = true;
        break;
      }
    }
    if (found) break;
  }

  return { regionMap: regionMap!, solution: queens };
}
