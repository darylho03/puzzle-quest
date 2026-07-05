export interface KurodokuPuzzle {
  readonly values: (number | null)[][];
  readonly solution: number[][];
}

// Count non-black cells visible from (row,col) in 4 directions (including self).
// Blank cells count as visible (they're not blockers).
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

// Count WHITE cells connected to (row,col) in straight lines, stopping at non-white.
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

// Check if all non-black cells (white + blank) form one connected component.
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

// Validate a fully-filled grid (no blanks) as a correct Kurodoku solution.
function isValidComplete(
  clues: (number | null)[][],
  grid: number[][], rows: number, cols: number,
): boolean {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 0) return false;
      if (grid[i][j] === 1) {
        for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
          const ni = i + dr, nj = j + dc;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] === 1) return false;
        }
      }
    }
  }
  let start: [number, number] | null = null;
  let totalWhite = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) { totalWhite++; if (!start) start = [i, j]; }
    }
  }
  if (start && totalWhite > 1) {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue: [number, number][] = [start];
    visited[start[0]][start[1]] = true;
    let count = 1;
    while (queue.length) {
      const [r, c] = queue.shift()!;
      for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 2 && !visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
          count++;
        }
      }
    }
    if (count !== totalWhite) return false;
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (clues[i][j] && grid[i][j] === 2) {
        if (countMaxVisible(i, j, grid, rows, cols) !== clues[i][j]) return false;
      }
    }
  }
  return true;
}

// Apply constraint propagation rules. Mutates grid. Returns false on contradiction.
function propagate(
  clues: (number | null)[][],
  grid: number[][], rows: number, cols: number,
): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    // Rule 1: Cells with clues must be white
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (clues[i][j]) {
          if (grid[i][j] === 1) return false;
          if (grid[i][j] === 0) { grid[i][j] = 2; changed = true; }
        }
      }
    }

    // Rule 2: Neighbors of black cells must be white
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] !== 1) continue;
        for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
          const ni = i + dr, nj = j + dc;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
            if (grid[ni][nj] === 1) return false;
            if (grid[ni][nj] === 0) { grid[ni][nj] = 2; changed = true; }
          }
        }
      }
    }

    // Rule 3: If max visible == clue value, all visible blanks must be white
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!clues[i][j] || grid[i][j] !== 2) continue;
        const maxVis = countMaxVisible(i, j, grid, rows, cols);
        if (maxVis < clues[i][j]!) return false;
        if (maxVis === clues[i][j]!) {
          const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of dirs) {
            let r = i + dr, c = j + dc;
            while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== 1) {
              if (grid[r][c] === 0) { grid[r][c] = 2; changed = true; }
              r += dr; c += dc;
            }
          }
        }
      }
    }

    // Rule 4: If white run == clue value, block the next blank in each direction
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!clues[i][j] || grid[i][j] !== 2) continue;
        const whiteRun = countWhiteRun(i, j, grid, rows, cols);
        if (whiteRun > clues[i][j]!) return false;
        if (whiteRun === clues[i][j]!) {
          const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of dirs) {
            let r = i + dr, c = j + dc;
            while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 2) {
              r += dr; c += dc;
            }
            if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 0) {
              grid[r][c] = 1;
              changed = true;
            }
          }
        }
      }
    }

    // Rule 5: Non-black cells must stay connected
    if (!areNonBlacksConnected(grid, rows, cols)) return false;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] !== 0) continue;
        grid[i][j] = 1;
        const connected = areNonBlacksConnected(grid, rows, cols);
        grid[i][j] = 0;
        if (!connected) { grid[i][j] = 2; changed = true; }
      }
    }

    // Rule 6: If making a blank white would cause a visible clue's white run to exceed
    // its value, the blank must be black
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] !== 0) continue;
        grid[i][j] = 2;
        let mustBeBlack = false;

        const scanClue = (r: number, c: number, dr: number, dc: number) => {
          let cr = r + dr, cc = c + dc;
          while (cr >= 0 && cr < rows && cc >= 0 && cc < cols) {
            if (grid[cr][cc] === 1) break;
            if (clues[cr][cc] && grid[cr][cc] === 2) {
              if (countWhiteRun(cr, cc, grid, rows, cols) > clues[cr][cc]!) {
                mustBeBlack = true;
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
          changed = true;
        } else {
          grid[i][j] = 0;
        }
      }
    }
  }
  return true;
}

// Count valid solutions up to maxCount via constraint propagation + backtracking.
function countSolutions(
  clues: (number | null)[][],
  startGrid: number[][],
  rows: number, cols: number,
  maxCount: number,
): number {
  const grid = startGrid.map(r => [...r]);
  if (!propagate(clues, grid, rows, cols)) return 0;

  let blankCell: [number, number] | null = null;
  for (let i = 0; i < rows && !blankCell; i++) {
    for (let j = 0; j < cols && !blankCell; j++) {
      if (grid[i][j] === 0) blankCell = [i, j];
    }
  }

  if (!blankCell) {
    return isValidComplete(clues, grid, rows, cols) ? 1 : 0;
  }

  const [bi, bj] = blankCell;
  let count = 0;

  const g1 = grid.map(r => [...r]);
  g1[bi][bj] = 1;
  count += countSolutions(clues, g1, rows, cols, maxCount);
  if (count >= maxCount) return count;

  const g2 = grid.map(r => [...r]);
  g2[bi][bj] = 2;
  count += countSolutions(clues, g2, rows, cols, maxCount - count);

  return count;
}

// --- Generator ---

function generateSolution(r: number, c: number): number[][] {
  const grid: number[][] = Array.from({ length: r }, () => Array(c).fill(2));

  function canPlaceBlack(row: number, col: number): boolean {
    if (grid[row][col] !== 2) return false;
    for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 1) return false;
    }
    return true;
  }

  function isWhiteConnected(): boolean {
    const visited = Array.from({ length: r }, () => Array(c).fill(false));
    let start: [number, number] | null = null;
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        if (grid[i][j] === 2) { start = [i, j]; break; }
      }
      if (start) break;
    }
    if (!start) return true;
    const queue: [number, number][] = [start];
    visited[start[0]][start[1]] = true;
    let count = 1;
    while (queue.length) {
      const [row, col] = queue.shift()!;
      for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 2 && !visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
          count++;
        }
      }
    }
    let totalWhite = 0;
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) { if (grid[i][j] === 2) totalWhite++; }
    }
    return count === totalWhite;
  }

  let attempts = 0;
  let maxBlacks = Math.floor(r * c * 0.3);
  while (attempts < r * c * 5 && maxBlacks > 0) {
    const row = Math.floor(Math.random() * r);
    const col = Math.floor(Math.random() * c);
    if (canPlaceBlack(row, col)) {
      grid[row][col] = 1;
      if (!isWhiteConnected()) { grid[row][col] = 2; } else { maxBlacks--; }
    }
    attempts++;
  }
  return grid;
}

export function generateKurodokuPuzzle(r: number, c: number): KurodokuPuzzle {
  const solution = generateSolution(r, c);

  const allClues: (number | null)[][] = Array.from({ length: r }, () => Array(c).fill(null));
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      if (solution[i][j] === 2) {
        allClues[i][j] = countMaxVisible(i, j, solution, r, c);
      }
    }
  }

  const clues = allClues.map(row => [...row]);

  let clueCells: [number, number][] = [];
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      if (clues[i][j]) clueCells.push([i, j]);
    }
  }
  for (let i = clueCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clueCells[i], clueCells[j]] = [clueCells[j], clueCells[i]];
  }

  for (const [row, col] of clueCells) {
    const backup = clues[row][col];
    clues[row][col] = null;
    const initial = clues.map(r => r.map(v => v ? 2 : 0));
    if (countSolutions(clues, initial, r, c, 2) !== 1) {
      clues[row][col] = backup;
    }
  }

  return { values: clues, solution };
}
