'use client';

import { useState, useRef } from 'react';
import QueensGrid from './QueensGrid';

function generateValidQueens(n: number): [number, number][] {
    let solution: number[] | null = null;

    function isValid(row: number, col: number, board: number[]): boolean {
        for (let i = 0; i < row; i++) {
            // Same column
            if (board[i] === col) {
                return false;
            }
            // Only adjacent diagonals (range 1)
            if (Math.abs(i - row) === 1 && Math.abs(board[i] - col) === 1) {
                return false;
            }
        }
        return true;
    }

    function backtrack(row: number, board: number[]): boolean {
        if (row === n) {
            solution = [...board];
            return true;
        }
        // Shuffle columns for randomness
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
    // Convert to [row, col] pairs
    return (solution as number[]).map((col: number, row: number) => [row, col]);
}

function generateValidRegions(n: number): number[][] {
    // Helper to count N-Queens solutions for a given region grid
    function countNQueensSolutions(n: number, regionGrid: number[][]): number {
        let count = 0;
        function isValid(row: number, col: number, board: number[]): boolean {
            for (let i = 0; i < row; i++) {
                // Same column
                if (board[i] === col) {
                    return false;
                }
                // Only adjacent diagonals (range 1)
                if (Math.abs(i - row) === 1 && Math.abs(board[i] - col) === 1) {
                    return false;
                }
                // Region constraint: no two queens in the same region
                if (regionGrid[row][col] === regionGrid[i][board[i]]) {
                    return false;
                }
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

    function generateRegions(queens: number[][]): number[][] {
        let grid = Array.from({ length: queens.length }, () => Array.from({ length: queens.length }, () => 0));
        let frontier: [number, number, number][] = [];
        for (let r = 0; r < queens.length; r++) {
            grid[queens[r][0]][queens[r][1]] = r + 1;
            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                if (grid[queens[r][0] + dr]?.[queens[r][1] + dc] === 0) {
                    frontier.splice(Math.floor(Math.random() * (frontier.length + 1)), 0, [queens[r][0] + dr, queens[r][1] + dc, r + 1]);
                }
            }
        }
        while (frontier.length > 0) {
            const [row, col, region] = frontier.pop()!;
            if (grid[row][col] !== 0) {
                continue;
            }
            grid[row][col] = region;
            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                if (grid[row + dr]?.[col + dc] === 0) {
                    frontier.splice(Math.floor(Math.random() * (frontier.length + 1)), 0, [row + dr, col + dc, region]);
                }
            }
        }
        return grid;
    }

    // Try generating regions until only one N-Queens solution exists
    let regionGrid: number[][];
    let queens: number[][];
    let tries = 0;
    let found: boolean;
    do {
        found = true;
        tries = 0;
        queens = generateValidQueens(n);
        do {
            regionGrid = generateRegions(queens);
            tries++;
        } while (countNQueensSolutions(n, regionGrid) !== 1 && tries < 100);
        // Optionally, warn if unique solution not found after many tries
        if (tries >= 100) {
            console.warn('Could not find a region grid with a unique N-Queens solution after 100 tries.');
            found = false;
        }
    } while (!found);

    console.log(regionGrid);
    return regionGrid;
}

export default function Queens() {
    const [regions, setRegions] = useState<number[][]>(Array(5).fill(null).map(() => Array(5).fill(0)));
    const [grid, setGrid] = useState<number[][]>(Array(5).fill(null).map(() => Array(5).fill(0)));
    const grid_size = useRef<HTMLInputElement>(null);

    function handleGenerateValidRegions() {
        const validRegions = generateValidRegions(parseInt(grid_size.current!.value));
        setRegions(validRegions);
        setGrid(Array(parseInt(grid_size.current!.value)).fill(null).map(() => Array(parseInt(grid_size.current!.value)).fill(0)));
    }

    return (
        <div className="queens">
            <h1>Queens</h1>
            <input
                type="number"
                min={1}
                defaultValue={5}
                ref={grid_size}
                placeholder="Rows"
                style={{ width: 60 }}
            />
            <button onClick={handleGenerateValidRegions}>
                Generate Queens
            </button>
            <QueensGrid 
                grid={grid}
                regions={regions} 
            />
        </div>
    );
}