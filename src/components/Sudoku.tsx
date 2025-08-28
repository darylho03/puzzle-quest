'use client';

import { useState } from 'react';
import SudokuGrid from './SudokuGrid';

function generateValidSudoku(): (number | null)[][] {
    const GRID_SIZE = 9;
    let grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
    );
    console.log('Starting Sudoku generation');

    // Helper to check if grid is full
    function checkGrid(grid: number[][]): boolean {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === 0) return false;
            }
        }
        return true;
    }

    // Helper to shuffle an array
    function shuffle(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Fill grid recursively
    function fillGrid(grid: number[][]): boolean {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            if (grid[row][col] === 0) {
                let numberList = [1,2,3,4,5,6,7,8,9];
                shuffle(numberList);
                for (const value of numberList) {
                    if (!grid[row].includes(value) &&
                        !grid.some(r => r[col] === value)) {
                        // Check 3x3 square
                        const startRow = Math.floor(row / 3) * 3;
                        const startCol = Math.floor(col / 3) * 3;
                        let found = false;
                        for (let r = startRow; r < startRow + 3; r++) {
                            for (let c = startCol; c < startCol + 3; c++) {
                                if (grid[r][c] === value) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }
                        if (!found) {
                            grid[row][col] = value;
                            // Debug: Placing value
                            console.log(`fillGrid: Placed ${value} at (${row},${col})`);
                            if (checkGrid(grid)) {
                                console.log('fillGrid: Grid filled');
                                return true;
                            }
                            else if (fillGrid(grid)) return true;
                        }
                    }
                }
                grid[row][col] = 0;
                // Debug: Backtracking
                console.log(`fillGrid: Backtracking at (${row},${col})`);
                return false;
            }
        }
        return true;
    }

    // Solve grid recursively and count solutions
    function solveGrid(grid: number[][], counter: { count: number }): boolean {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            if (grid[row][col] === 0) {
                for (let value = 1; value <= 9; value++) {
                    if (!grid[row].includes(value) &&
                        !grid.some(r => r[col] === value)) {
                        // Check 3x3 square
                        const startRow = Math.floor(row / 3) * 3;
                        const startCol = Math.floor(col / 3) * 3;
                        let found = false;
                        for (let r = startRow; r < startRow + 3; r++) {
                            for (let c = startCol; c < startCol + 3; c++) {
                                if (grid[r][c] === value) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }
                        if (!found) {
                            grid[row][col] = value;
                            // Debug: Trying value in solveGrid
                            // console.log(`solveGrid: Trying ${value} at (${row},${col})`);
                            if (checkGrid(grid)) {
                                counter.count += 1;
                                // Debug: Found a solution
                                console.log('solveGrid: Found a solution');
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

    // Generate a fully solved grid
    console.log('Filling grid...');
    fillGrid(grid);
    console.log('Grid filled. Removing numbers...');

    // Remove numbers while ensuring unique solution
    let attempts = 5;
    while (attempts > 0) {
        let row = Math.floor(Math.random() * GRID_SIZE);
        let col = Math.floor(Math.random() * GRID_SIZE);
        while (grid[row][col] === 0) {
            row = Math.floor(Math.random() * GRID_SIZE);
            col = Math.floor(Math.random() * GRID_SIZE);
        }
        const backup = grid[row][col];
        grid[row][col] = 0;

        // Debug: Attempting to remove a number
        console.log(`Trying to remove value at (${row},${col})`);

        // Copy grid
        const copyGrid = grid.map(r => r.slice());
        const counter = { count: 0 };
        solveGrid(copyGrid, counter);

        // If not unique, restore and decrement attempts
        if (counter.count !== 1) {
            grid[row][col] = backup;
            attempts -= 1;
            console.log(`Removal at (${row},${col}) failed, restoring value. Attempts left: ${attempts}`);
        } else {
            console.log(`Removal at (${row},${col}) succeeded.`);
        }
    }

    console.log('Sudoku grid ready');
    // Convert 0s to nulls for empty cells
    return grid.map(r => r.map(cell => (cell === 0 ? null : cell)));
}

export default function Sudoku() {
    const [pencilMode, setPencilMode] = useState(false);
    const [generatedSudoku, setGeneratedSudoku] = useState<(number | null)[][]>(
        Array.from({ length: 9 }, () => Array(9).fill(null))
    );
    // Debug: Log when grid is generated
    function handleGenerateSudoku() {
        console.log('Generate Sudoku button clicked');
        const sudoku = generateValidSudoku();
        console.log('Generated Sudoku:', sudoku);
        setGeneratedSudoku(sudoku);
    }
    return (
        <div className="sudoku">
            <h1>Sudoku</h1>
            <button onClick={() => setPencilMode(pm => !pm)}>
                {pencilMode ? 'Pencil Mode: ON' : 'Pencil Mode: OFF'}
            </button>
            <button onClick={handleGenerateSudoku}>
                Generate Sudoku
            </button>
            <SudokuGrid
                pencilMode={pencilMode}
                generatedSudoku={generatedSudoku}
            />
        </div>
    );
}