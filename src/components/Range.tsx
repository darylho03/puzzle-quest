'use client';

import { useState, useRef } from 'react';
import RangeGrid from './RangeGrid';

function generateRangePuzzle(r: number, c: number): number[][] {
    console.log('generateRangePuzzle called with', r, c);
    // Step 1: Start with all white cells
    let grid: number[][] = Array.from({ length: r }, () => Array(c).fill(2));

    // Step 2: Randomly place black cells
    function canPlaceBlack(row: number, col: number): boolean {
        console.log('canPlaceBlack called', row, col);
        if (grid[row][col] !== 2) return false;
        for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 1) {
                return false;
            }
        }
        return true;
    }

    function isWhiteConnected(): boolean {
    console.log('isWhiteConnected called');
        // BFS to check all white cells are connected
        const visited = Array.from({ length: r }, () => Array(c).fill(false));
        let found = false;
        let start: [number, number] | null = null;
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (grid[i][j] === 2) {
                    start = [i, j];
                    found = true;
                    break;
                }
            }
            if (found) break;
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
        // Check all white cells visited
        let totalWhite = 0;
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (grid[i][j] === 2) totalWhite++;
            }
        }
        return count === totalWhite;
    }

    // Place a reasonable number of black cells
    let attempts = 0;
    let maxBlacks = Math.floor(r * c * 0.3); // up to 30% black
    while (attempts < r * c * 5 && maxBlacks > 0) {
    console.log('Starting black cell placement');
        const row = Math.floor(Math.random() * r);
        const col = Math.floor(Math.random() * c);
        if (canPlaceBlack(row, col)) {
            grid[row][col] = 1;
            if (!isWhiteConnected()) {
                grid[row][col] = 2; // revert
            } else {
                maxBlacks--;
            }
        }
        attempts++;
    }

    // Step 3: Fill numbers for white cells
    function countVisible(row: number, col: number): number {
    console.log('countVisible called', row, col);
        let count = 1;
        // Up
        for (let i = row - 1; i >= 0; i--) {
            if (grid[i][col] === 1) break;
            count++;
        }
        // Down
        for (let i = row + 1; i < r; i++) {
            if (grid[i][col] === 1) break;
            count++;
        }
        // Left
        for (let j = col - 1; j >= 0; j--) {
            if (grid[row][j] === 1) break;
            count++;
        }
        // Right
        for (let j = col + 1; j < c; j++) {
            if (grid[row][j] === 1) break;
            count++;
        }
        return count;
    }

    let puzzle: number[][] = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (grid[i][j] === 2) {
                console.log('Filling number for white cell', i, j);
                puzzle[i][j] = countVisible(i, j);
            } else {
                puzzle[i][j] = 0;
            }
        }
    }
    // Step 4: Remove clues while ensuring uniqueness
    function solveRangePuzzle(puzzle: number[][]): number {
        console.log('solveRangePuzzle called');
        // Brute-force solver: counts number of valid black/white arrangements
        // that match the clues and rules
        let count = 0;
        const grid = Array.from({ length: r }, () => Array(c).fill(2));

        function isValidBlack(row: number, col: number): boolean {
            // console.log('isValidBlack called', row, col);
            // console.log('solver isWhiteConnected called');
            // console.log('solver countVisible called', row, col);
            for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 1) {
                    return false;
                }
            }
            return true;
        }

        function isWhiteConnected(): boolean {
            // BFS to check all white cells are connected
            const visited = Array.from({ length: r }, () => Array(c).fill(false));
            let found = false;
            let start: [number, number] | null = null;
            for (let i = 0; i < r; i++) {
                for (let j = 0; j < c; j++) {
                    if (grid[i][j] === 2) {
                        start = [i, j];
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (!start) return true;
            const queue: [number, number][] = [start];
            visited[start[0]][start[1]] = true;
            let countWhite = 1;
            while (queue.length) {
                const [row, col] = queue.shift()!;
                for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                    const nr = row + dr, nc = col + dc;
                    if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 2 && !visited[nr][nc]) {
                        visited[nr][nc] = true;
                        queue.push([nr, nc]);
                        countWhite++;
                    }
                }
            }
            let totalWhite = 0;
            for (let i = 0; i < r; i++) {
                for (let j = 0; j < c; j++) {
                    if (grid[i][j] === 2) totalWhite++;
                }
            }
            return countWhite === totalWhite;
        }

        function countVisible(row: number, col: number): number {
            let count = 1;
            for (let i = row - 1; i >= 0; i--) {
                if (grid[i][col] === 1) break;
                count++;
            }
            for (let i = row + 1; i < r; i++) {
                if (grid[i][col] === 1) break;
                count++;
            }
            for (let j = col - 1; j >= 0; j--) {
                if (grid[row][j] === 1) break;
                count++;
            }
            for (let j = col + 1; j < c; j++) {
                if (grid[row][j] === 1) break;
                count++;
            }
            return count;
        }

        function backtrack(row: number, col: number) {
            if (row === 0 && col === 0) console.log('solver backtrack called');
            if (row === r) {
                // Check clues
                for (let i = 0; i < r; i++) {
                    for (let j = 0; j < c; j++) {
                        if (puzzle[i][j] > 0 && grid[i][j] === 2) {
                            if (countVisible(i, j) !== puzzle[i][j]) return;
                        }
                        if (grid[i][j] === 1 && !isValidBlack(i, j)) return;
                    }
                }
                if (!isWhiteConnected()) return;
                count++;
                return;
            }
            if (col === c) {
                backtrack(row + 1, 0);
                return;
            }
            // Try white
            grid[row][col] = 2;
            backtrack(row, col + 1);
            // Try black
            grid[row][col] = 1;
            if (isValidBlack(row, col)) backtrack(row, col + 1);
            grid[row][col] = 2;
        }

        backtrack(0, 0);
        return count;
    }

    // Try removing clues one by one
    let clueCells: [number, number][] = [];
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (puzzle[i][j] > 0) clueCells.push([i, j]);
        }
    }
    // Shuffle clues
    for (let i = clueCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clueCells[i], clueCells[j]] = [clueCells[j], clueCells[i]];
    }
    for (const [row, col] of clueCells) {
        console.log('Trying to remove clue at', row, col);
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;
        if (solveRangePuzzle(puzzle) !== 1) {
            console.log('Restoring clue at', row, col);
            puzzle[row][col] = backup; // restore
        }
    }
    return puzzle;
}

export default function Range() {
    const rowRef = useRef<HTMLInputElement>(null);
    const colRef = useRef<HTMLInputElement>(null);
    const [values, setValues] = useState<number[][]>([[0]]);
    const [grid, setGrid] = useState<number[][]>(values.map(row => row.map(value => value ? 2 : 0)));
    const [locked, setLocked] = useState<boolean[][]>(values.map(row => row.map(value => value ? true : false)));

    const handleGenerate = () => {
        const numRows = Math.max(1, parseInt(rowRef.current?.value || '5', 10));
        const numCols = Math.max(1, parseInt(colRef.current?.value || '5', 10));
        const newValues = generateRangePuzzle(numRows, numCols);
        setValues(newValues);
        setGrid(newValues.map(row => row.map(value => value ? 2 : 0)));
        setLocked(newValues.map(row => row.map(value => value ? true : false)));
    };

    return (
        <div className="range">
            <h1>Range</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input
                    type="number"
                    min={1}
                    defaultValue={5}
                    ref={rowRef}
                    placeholder="Rows"
                    style={{ width: 60 }}
                />
                <input
                    type="number"
                    min={1}
                    defaultValue={5}
                    ref={colRef}
                    placeholder="Cols"
                    style={{ width: 60 }}
                />
                <button onClick={handleGenerate}>
                    Generate Puzzle
                </button>
            </div>
            <RangeGrid
                grid={grid}
                values={values}
                locked={locked}
            />
        </div>
    );
}