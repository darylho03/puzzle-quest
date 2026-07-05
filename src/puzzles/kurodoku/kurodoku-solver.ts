import { Coordinate, SolverStep } from '../core/types';

function countMaxVisible(
  row: number, col: number,
  grid: number[][], rows: number, cols: number,
): number {
  let count = 1;
  for (let i = row - 1; i >= 0; i--) { if (grid[i][col] === 1) break; count++; }
  for (let i = row + 1; i < rows; i++) { if (grid[i][col] === 1) break; count++; }
  for (let j = col - 1; j >= 0; j--) { if (grid[row][j] === 1) break; count++; }
  for (let j = col + 1; j < cols; j++) { if (grid[row][j] === 1) break; count++; }
  return count;
}

function countWhiteRun(
  row: number, col: number,
  grid: number[][], rows: number, cols: number,
): number {
  if (grid[row][col] !== 2) return 0;
  let count = 1;
  for (let i = row - 1; i >= 0; i--) { if (grid[i][col] !== 2) break; count++; }
  for (let i = row + 1; i < rows; i++) { if (grid[i][col] !== 2) break; count++; }
  for (let j = col - 1; j >= 0; j--) { if (grid[row][j] !== 2) break; count++; }
  for (let j = col + 1; j < cols; j++) { if (grid[row][j] !== 2) break; count++; }
  return count;
}

function areNonBlacksConnected(grid: number[][], rows: number, cols: number): boolean {
  let start: [number, number] | null = null;
  let total = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] !== 1) {
        total++;
        if (!start) start = [i, j];
      }
    }
  }
  if (!start || total <= 1) return true;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue: [number, number][] = [start];
  visited[start[0]][start[1]] = true;
  let count = 1;
  while (queue.length) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== 1 && !visited[nr][nc]) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
        count++;
      }
    }
  }
  return count === total;
}

function collectVisibleCells(
  row: number, col: number,
  grid: number[][], rows: number, cols: number,
): Coordinate[] {
  const cells: Coordinate[] = [];
  for (let i = row - 1; i >= 0; i--) { if (grid[i][col] === 1) break; cells.push({ row: i, col }); }
  for (let i = row + 1; i < rows; i++) { if (grid[i][col] === 1) break; cells.push({ row: i, col }); }
  for (let j = col - 1; j >= 0; j--) { if (grid[row][j] === 1) break; cells.push({ row, col: j }); }
  for (let j = col + 1; j < cols; j++) { if (grid[row][j] === 1) break; cells.push({ row, col: j }); }
  return cells;
}

export function solveKurodokuWithTrace(
  values: (number | null)[][],
  rows: number,
  cols: number,
): SolverStep[] {
  const trace: SolverStep[] = [];
  const grid: number[][] = values.map(row => row.map(v => v ? 2 : 0));
  const assigned = new Set<string>();

  function record(row: number, col: number, val: number, technique: string, related: Coordinate[]) {
    const key = `${row},${col}`;
    if (assigned.has(key)) return;
    assigned.add(key);
    trace.push({ cell: { row, col }, value: val, technique, relatedCells: related });
  }

  let changed = true;
  while (changed) {
    changed = false;

    // Rule 1: Clue cells must be white
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (values[i][j] && grid[i][j] === 0) {
          grid[i][j] = 2;
          record(i, j, 2, 'Clue Cell', []);
          changed = true;
        }
      }
    }

    // Rule 2: Neighbors of black cells must be white
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] !== 1) continue;
        for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]] as [number,number][]) {
          const ni = i + dr, nj = j + dc;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] === 0) {
            grid[ni][nj] = 2;
            record(ni, nj, 2, 'Adjacent to Black', [{ row: i, col: j }]);
            changed = true;
          }
        }
      }
    }

    // Rule 3: If max visible == clue value, all visible blanks must be white
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!values[i][j] || grid[i][j] !== 2) continue;
        const maxVis = countMaxVisible(i, j, grid, rows, cols);
        if (maxVis === values[i][j]!) {
          const clueCell: Coordinate = { row: i, col: j };
          for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
            let r = i + dr, c = j + dc;
            while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== 1) {
              if (grid[r][c] === 0) {
                grid[r][c] = 2;
                record(r, c, 2, 'Full Visibility', [clueCell]);
                changed = true;
              }
              r += dr; c += dc;
            }
          }
        }
      }
    }

    // Rule 4: If white run == clue value, block the next blank in each direction
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!values[i][j] || grid[i][j] !== 2) continue;
        const whiteRun = countWhiteRun(i, j, grid, rows, cols);
        if (whiteRun === values[i][j]!) {
          const clueCell: Coordinate = { row: i, col: j };
          const runCells = collectVisibleCells(i, j, grid, rows, cols)
            .filter(c => grid[c.row][c.col] === 2);
          for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
            let r = i + dr, c = j + dc;
            while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 2) {
              r += dr; c += dc;
            }
            if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 0) {
              grid[r][c] = 1;
              record(r, c, 1, 'Run Complete', [clueCell, ...runCells]);
              changed = true;
            }
          }
        }
      }
    }

    // Rule 5: Non-black cells must stay connected
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] !== 0) continue;
        grid[i][j] = 1;
        const connected = areNonBlacksConnected(grid, rows, cols);
        grid[i][j] = 0;
        if (!connected) {
          grid[i][j] = 2;
          const neighbors: Coordinate[] = [];
          for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]] as [number,number][]) {
            const nr = i + dr, nc = j + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== 1) {
              neighbors.push({ row: nr, col: nc });
            }
          }
          record(i, j, 2, 'Connectivity', neighbors);
          changed = true;
        }
      }
    }

    // Rule 6: If making a blank white would exceed a clue's visibility, must be black
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] !== 0) continue;
        grid[i][j] = 2;
        let mustBeBlack = false;
        let triggerClue: Coordinate | null = null;

        const scanClue = (r: number, c: number, dr: number, dc: number) => {
          let cr = r + dr, cc = c + dc;
          while (cr >= 0 && cr < rows && cc >= 0 && cc < cols) {
            if (grid[cr][cc] === 1) break;
            if (values[cr][cc] && grid[cr][cc] === 2) {
              if (countWhiteRun(cr, cc, grid, rows, cols) > values[cr][cc]!) {
                mustBeBlack = true;
                triggerClue = { row: cr, col: cc };
              }
            }
            cr += dr; cc += dc;
          }
        };
        scanClue(i, j, -1, 0);
        if (!mustBeBlack) scanClue(i, j, 1, 0);
        if (!mustBeBlack) scanClue(i, j, 0, -1);
        if (!mustBeBlack) scanClue(i, j, 0, 1);

        if (mustBeBlack) {
          grid[i][j] = 1;
          record(i, j, 1, 'Over-Visibility', triggerClue ? [triggerClue] : []);
          changed = true;
        } else {
          grid[i][j] = 0;
        }
      }
    }
  }

  return trace;
}
