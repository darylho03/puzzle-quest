import { buildSudokuGroups, solveWithTrace } from '../puzzles/sudoku/sudoku-solver';

const GRID_SIZE = 9;
const SUDOKU_GROUPS = buildSudokuGroups();

function shuffle(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkGrid(grid: number[][]): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 0) return false;
        }
    }
    return true;
}

export function generateSolvedSudoku(): number[][] {
    const grid: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

    function fillGrid(grid: number[][]): boolean {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            if (grid[row][col] === 0) {
                const numberList = Array.from({ length: GRID_SIZE }, (_, k) => k + 1);
                shuffle(numberList);
                for (const value of numberList) {
                    if (!grid[row].includes(value) && !grid.some(r => r[col] === value)) {
                        const startRow = Math.floor(row / 3) * 3;
                        const startCol = Math.floor(col / 3) * 3;
                        let found = false;
                        for (let r = startRow; r < startRow + 3 && !found; r++) {
                            for (let c = startCol; c < startCol + 3 && !found; c++) {
                                if (grid[r][c] === value) found = true;
                            }
                        }
                        if (!found) {
                            grid[row][col] = value;
                            if (checkGrid(grid)) return true;
                            if (fillGrid(grid)) return true;
                        }
                    }
                }
                grid[row][col] = 0;
                return false;
            }
        }
        return true;
    }

    fillGrid(grid);
    return grid;
}

export function generateValidSudoku(grid: number[][]): { puzzle: (number | null)[][]; solution: (number | null)[][] } {
    const solution: (number | null)[][] = grid.map(r => r.map(v => v));
    function solveGrid(grid: number[][], counter: { count: number }): boolean {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            if (grid[row][col] === 0) {
                for (let value = 1; value <= 9; value++) {
                    if (!grid[row].includes(value) && !grid.some(r => r[col] === value)) {
                        const startRow = Math.floor(row / 3) * 3;
                        const startCol = Math.floor(col / 3) * 3;
                        let found = false;
                        for (let r = startRow; r < startRow + 3 && !found; r++) {
                            for (let c = startCol; c < startCol + 3 && !found; c++) {
                                if (grid[r][c] === value) found = true;
                            }
                        }
                        if (!found) {
                            grid[row][col] = value;
                            if (checkGrid(grid)) {
                                counter.count += 1;
                                break;
                            } else if (solveGrid(grid, counter)) {
                                return true;
                            }
                        }
                    }
                }
                grid[row][col] = 0;
                return false;
            }
        }
        return true;
    }

    let attempts = 20;
    while (attempts > 0) {
        let row = Math.floor(Math.random() * GRID_SIZE);
        let col = Math.floor(Math.random() * GRID_SIZE);
        while (grid[row][col] === 0) {
            row = Math.floor(Math.random() * GRID_SIZE);
            col = Math.floor(Math.random() * GRID_SIZE);
        }
        const backup = grid[row][col];
        grid[row][col] = 0;
        const copyGrid = grid.map(r => r.slice());
        const counter = { count: 0 };
        solveGrid(copyGrid, counter);
        if (counter.count !== 1) {
            grid[row][col] = backup;
            attempts -= 1;
        } else {
            const puzzleGrid: (number | null)[][] = grid.map(r => r.map(cell => (cell === 0 ? null : cell)));
            const trace = solveWithTrace(puzzleGrid, SUDOKU_GROUPS);
            let emptyCount = 0;
            for (let r = 0; r < GRID_SIZE; r++)
                for (let c = 0; c < GRID_SIZE; c++)
                    if (grid[r][c] === 0) emptyCount++;
            if (trace.length < emptyCount) {
                grid[row][col] = backup;
                attempts -= 1;
            }
        }
    }

    return {
        puzzle: grid.map(r => r.map(cell => (cell === 0 ? null : cell))),
        solution,
    };
}
