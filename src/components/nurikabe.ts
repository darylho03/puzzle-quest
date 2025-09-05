// nurikabe.ts
// TypeScript refactor of Nurikabe generator/solver logic from solverGenerator.js

export type Cell = '-' | '#' | number; // '-' empty, '#' wall, number = clue
export type NurikabeGrid = Cell[][];
export interface NurikabePuzzle {
    grid: NurikabeGrid;
    clues: { row: number, col: number, size: number }[];
}

// Utility functions
function shuffle<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function inBounds(r: number, c: number, rows: number, cols: number): boolean {
    return r >= 0 && r < rows && c >= 0 && c < cols;
}

// Group detection (for clues/areas)
function getGroups(grid: NurikabeGrid): number[][][] {
    const rows = grid.length, cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const groups: number[][][] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!visited[r][c] && typeof grid[r][c] === 'number') {
                const group: number[][] = [];
                const stack = [[r, c]];
                visited[r][c] = true;
                while (stack.length) {
                    const [cr, cc] = stack.pop()!;
                    group.push([cr, cc]);
                    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                        const nr = cr + dr, nc = cc + dc;
                        if (inBounds(nr, nc, rows, cols) && !visited[nr][nc] && typeof grid[nr][nc] === 'number') {
                            stack.push([nr, nc]);
                            visited[nr][nc] = true;
                        }
                    }
                }
                groups.push(group);
            }
        }
    }
    return groups;
}

// Prevent 2x2 wall blocks
function has2x2Block(grid: NurikabeGrid): boolean {
    const rows = grid.length, cols = grid[0].length;
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
            if (grid[r][c] === '#' && grid[r + 1][c] === '#' && grid[r][c + 1] === '#' && grid[r + 1][c + 1] === '#') {
                return true;
            }
        }
    }
    return false;
}

// Wall connectivity check
function isWallConnected(grid: NurikabeGrid): boolean {
    const rows = grid.length, cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    let found = false;
    let start: [number, number] | null = null;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '#') {
                start = [r, c];
                found = true;
                break;
            }
        }
        if (found) break;
    }
    if (!start) return true;
    const stack = [start];
    visited[start[0]][start[1]] = true;
    let count = 1;
    while (stack.length) {
        const [cr, cc] = stack.pop()!;
        for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
            const nr = cr + dr, nc = cc + dc;
            if (inBounds(nr, nc, rows, cols) && grid[nr][nc] === '#' && !visited[nr][nc]) {
                stack.push([nr, nc]);
                visited[nr][nc] = true;
                count++;
            }
        }
    }
    // Count total walls
    let totalWalls = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === '#') totalWalls++;
    return count === totalWalls;
}

// Main generator (simplified)
export function generateNurikabePuzzle(rows: number, cols: number): NurikabePuzzle {
    // Start with all empty
    let grid: NurikabeGrid = Array.from({ length: rows }, () => Array(cols).fill('-'));
    // Place clues (numbers) randomly
    const clues: { row: number, col: number, size: number }[] = [];
    // For demo, place 3 random clues
    for (let i = 0; i < 3; i++) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (typeof grid[r][c] === 'number') continue;
        grid[r][c] = 3 + Math.floor(Math.random() * 3); // clue size 3-5
        clues.push({ row: r, col: c, size: grid[r][c] as number });
    }
    // Fill walls
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '-') {
                grid[r][c] = Math.random() < 0.3 ? '#' : '-';
            }
        }
    }
    // Validate
    if (has2x2Block(grid) || !isWallConnected(grid)) {
        // Retry or fix
        return generateNurikabePuzzle(rows, cols);
    }
    return { grid, clues };
}

// Solver stub
export function solveNurikabePuzzle(puzzle: NurikabePuzzle): boolean {
    // Implement full Nurikabe rules here
    // For now, just check wall connectivity and no 2x2 blocks
    return isWallConnected(puzzle.grid) && !has2x2Block(puzzle.grid);
}
