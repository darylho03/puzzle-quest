'use client';

import { useState, useRef } from 'react';
import YinYangGrid from './YinYangGrid';

function generateYinYangPuzzle(r: number, c: number): number[][] {
    console.log(`Generating a ${r}x${c} Yin Yang puzzle`);
    // Step 1: Start with an empty grid
    let grid: number[][] = Array.from({ length: r }, () => Array(c).fill(0));

    // Step 2: Generate the border of the yin-yang puzzle
    let candidateArray = Array.from({ length: ((r - 1) * 2) + ((c - 1) * 2) }, (_, i) => i);

    let odd = r % 2 === 0 && c % 2 === 0;
    let val_parity = 0;
    let value = 0;
    let randomIndex = 0;
    // Randomly choose from candidate array
    do {
        randomIndex = Math.floor(Math.random() * candidateArray.length);
        value = candidateArray[randomIndex];
        // console.log(`Value: ${value}`);
        val_parity = (value + (value >= (c - 1) ? 1 : 0) + (value >= (c - 1) + (r - 1) ? 1 : 0) + (value >= (c - 1) + (r - 1) + (c - 1) ? 1 : 0) + (value >= (c - 1) + (c - 1) + (r - 1) + (r - 1) ? 1 : 0)) % 2;

    } while (odd && val_parity !== 0);

    const start = (value < (c - 1) ? [0, value + 1] : (value < (c - 1) + (r - 1) ? [value - (c - 2), c] : (value < (c - 1) + (c - 1) + (r - 1) ? [r, (c - 1) + (c - 1) + (r - 1) - value] : [(r - 1) + (r - 1) + (c - 1) + (c - 1) - value, 0])));

    // console.log(`Start: ${start}`);
    let visited: string[] = [];

    function dfs(row: number, col: number) {
        visited.push(`${row},${col}`);
        // console.log(Array.from(visited));
        if (visited.length >= (((r - 1) * (c - 1)) + 2)) {
            return;
        }
        // Explore neighbors
        const directions = [
            [0, 1],  // Right
            [1, 0],  // Down
            [0, -1], // Left
            [-1, 0]  // Up
        ];
        // Shuffle random order of directions
        directions.sort(() => Math.random() - 0.5);
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (!visited.includes(`${newRow},${newCol}`) && ((newRow > 0 && newRow < r && newCol > 0 && newCol < c) || ((newRow === 0 || newRow === r || newCol === 0 || newCol === c) && visited.length === (r - 1) * (c - 1) + 1))) {
                dfs(newRow, newCol);
            }
            if (visited.length >= (((r - 1) * (c - 1)) + 2)) {
                return;
            }
        }

        // Remove current cell from visited
        visited.pop();
        return;
    }

    dfs(start[0], start[1]);

    // console.log(visited);

    let parity = Math.random() < 0.5 ? 1 : 2;

    for (let i = 0; i < visited.length - 1; i++) {
        let coords1 = visited[i].split(',').map(Number);
        let coords2 = visited[i + 1].split(',').map(Number);
        console.log(coords1, coords2);
        let diff: [number, number] = [coords2[0] - coords1[0], coords2[1] - coords1[1]];
        console.log(diff);
        if (diff[0] === 0 && diff[1] === 1) {
            // Right move
            grid[coords1[0] - 1][coords1[1]] = parity;
            grid[coords1[0]][coords1[1]] = 3 - parity;
        } else if (diff[0] === 1 && diff[1] === 0) {
            // Down move
            grid[coords1[0]][coords1[1]] = parity;
            grid[coords1[0]][coords1[1] - 1] = 3 - parity;
        } else if (diff[0] === 0 && diff[1] === -1) {
            // Left move
            grid[coords2[0]][coords2[1]] = parity;
            grid[coords2[0] - 1][coords2[1]] = 3 - parity;
        } else {
            // Up move
            grid[coords2[0]][coords2[1] - 1] = parity;
            grid[coords2[0]][coords2[1]] = 3 - parity;
        }
    }

    console.log(grid);

    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (grid[i][j] === 0) {
                for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                    const newX = i + dx;
                    const newY = j + dy;
                    if (newX >= 0 && newX < r && newY >= 0 && newY < c) {
                        grid[i][j] = grid[newX][newY];
                        break;
                    }
                }
            }
        }
    }

    // Remove cells while ensuring uniqueness
    function solveYinYangPuzzle(grid: number[][]): number {
        // Brute-force solver: count number of valid black/white configurations
        // that match the rules
        let count = 0;

        function isBlackConnected(): boolean {
            // BFS to check all black cells are connected
            const visited = Array.from({ length: r }, () => Array(c).fill(false));
            let found = false;
            let start: [number, number] | null = null;
            for (let i = 0; i < r; i++) {
                for (let j = 0; j < c; j++) {
                    if (grid[i][j] === 1) {
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
            let countBlack = 1;
            while (queue.length) {
                const [row, col] = queue.shift()!;
                for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                    const nr = row + dr, nc = col + dc;
                    if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 1 && !visited[nr][nc]) {
                        visited[nr][nc] = true;
                        queue.push([nr, nc]);
                        countBlack++;
                    }
                }
            }
            let totalBlack = 0;
            for (let i = 0; i < r; i++) {
                for (let j = 0; j < c; j++) {
                    if (grid[i][j] === 1) totalBlack++;
                }
            }
            return countBlack === totalBlack;
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

        function is2x2SquareCreated(row: number, col: number): boolean {

            const directions: [[number, number], [number, number][]][] = [
                [[-1, -1], [[0, 0],[0, 1],[1, 0],[1, 1]]],
                [[-1, 1], [[0, 0],[0, 1],[-1, 0],[-1, 1]]],
                [[1, -1], [[0, 0],[0, 1],[1, 0],[1, 1]]],
                [[1, 1], [[0, 0],[0, 1],[1, 0],[1, 1]]]
            ];
            for (const [[dr, dc], cells] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < r && newCol >= 0 && newCol < c) {
                    // Check if all cells in the cell square are the same
                    const cellValue = grid[newRow][newCol];
                    if (cells.every(([ddr, ddc]) => grid[newRow + ddr]?.[newCol + ddc] === cellValue)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function is2x2CheckeredSquareCreated(row: number, col: number): boolean {
            const directions: [[number, number], [number, number][]][] = [
                [[-1, -1], [[0, 0],[0, 1],[1, 0],[1, 1]]],
                [[-1, 1], [[0, 0],[0, 1],[-1, 0],[-1, 1]]],
                [[1, -1], [[0, 0],[0, 1],[1, 0],[1, 1]]],
                [[1, 1], [[0, 0],[0, 1],[1, 0],[1, 1]]]
            ];
            for (const [[dr, dc], cells] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < r && newCol >= 0 && newCol < c) {
                    // Check if all cells in the cell square are the same
                    const cellValue = grid[newRow][newCol];
                    if (grid[newRow + cells[0][0]]?.[newCol + cells[0][1]] === cellValue &&
                        grid[newRow + cells[1][0]]?.[newCol + cells[1][1]] !== cellValue &&
                        grid[newRow + cells[2][0]]?.[newCol + cells[2][1]] !== cellValue &&
                        grid[newRow + cells[3][0]]?.[newCol + cells[3][1]] === cellValue) {
                        return true;
                    }
                }
            }
            return false;
        }

        function backtrack(row: number, col: number) {
            if (row === r) {
                if (isBlackConnected() && isWhiteConnected()) {
                    count++;
                }
                return;
            }
            const nextRow = col === c - 1 ? row + 1 : row;
            const nextCol = col === c - 1 ? 0 : col + 1;
            if (grid[row][col] !== 0) {
                backtrack(nextRow, nextCol);
            } else {
                // Try black
                grid[row][col] = 1;
                if (!is2x2SquareCreated(row, col) && !is2x2CheckeredSquareCreated(row, col)) {
                    backtrack(nextRow, nextCol);
                }
                // Try white
                grid[row][col] = 2;
                if (!is2x2SquareCreated(row, col) && !is2x2CheckeredSquareCreated(row, col)) {
                    backtrack(nextRow, nextCol);
                }
                // Reset
                grid[row][col] = 0;
            }
        }
        backtrack(0, 0);
        return count;
    }

    
    let candidateCells: [number, number][] = [];
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            candidateCells.push([i, j]);
        }
    }

    // Shuffle candidates
    candidateCells.sort(() => Math.random() - 0.5);

    console.log(`candidate cells: ${JSON.stringify(candidateCells)}`);

    for (const [row, col] of candidateCells) {
        // Try both colors
        let temp = grid[row][col];
        console.log('Trying to remove cell at', row, col);
        grid[row][col] = 0;
        if (solveYinYangPuzzle(grid) !== 1) {
            console.log('Backtracking from', row, col);
            grid[row][col] = temp;
        }
    }

    return grid;
}

export default function YinYang() {
    const rowRef = useRef<HTMLInputElement>(null);
    const colRef = useRef<HTMLInputElement>(null);
    const [grid, setGrid] = useState<number[][]>(Array.from({ length: 5 }, () => Array(5).fill(0)));
    const [locked, setLocked] = useState<boolean[][]>(grid.map(row => row.map(value => value !== 0 ? true : false)));

    const handleGenerate = () => {
        const numRows = Math.max(1, parseInt(rowRef.current?.value || '5', 10));
        const numCols = Math.max(1, parseInt(colRef.current?.value || '5', 10));
        const newGrid = generateYinYangPuzzle(numRows, numCols);
        console.log(newGrid);
        setGrid(newGrid);
        setLocked(newGrid.map(row => row.map(value => value !== 0 ? true : false)));
    };

    return (
        <div className="yin-yang">
            <h1>Yin Yang</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input
                    type="number"
                    min={1}
                    defaultValue={5}
                    ref={rowRef}
                    placeholder="Rows"
                    style={{ width: '60px' }}
                />
                <input
                    type="number"
                    min={1}
                    defaultValue={5}
                    ref={colRef}
                    placeholder="Columns"
                    style={{ width: '60px' }}
                />
                <button onClick={handleGenerate}>
                    Generate Puzzle
                </button>
            </div>
            <YinYangGrid 
                grid={grid}    
                locked={locked} 
            />
        </div>
    );
}