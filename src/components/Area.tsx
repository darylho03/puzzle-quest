'use client';

import { useState, useRef } from 'react';
import AreaGrid from './AreaGrid';

function generateAreaPuzzle(r: number, c: number): number[][] {
    // Step 1: Start with all cells white
    let grid: number[][] = Array.from({ length: r }, () => Array(c).fill(2)); // 2: white, 1: black
    // Step 2: Pick a random cell to make black
    let blackCells: [number, number][] = [];
    let blacklist: Set<string> = new Set();
    let frontier: Set<string> = new Set();
    let visited: Set<string> = new Set();
    let startRow = Math.floor(Math.random() * r);
    let startCol = Math.floor(Math.random() * c);
    grid[startRow][startCol] = 1;
    blackCells.push([startRow, startCol]);
    // Add valid neighbors to frontier
    for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
        const nr = startRow + dr, nc = startCol + dc;
        if (nr >= 0 && nr < r && nc >= 0 && nc < c) {
            frontier.add(`${nr},${nc}`);
        }
    }

    console.log(`Starting frontier: ${Array.from(frontier)}`);

    // Add a random limit to the number of black cells
    // const minBlacks = Math.floor(r * c * 0.15);
    // const maxBlacks = Math.floor(r * c * 0.35) + Math.floor(Math.random() * Math.floor(r * c * 0.15));
    while (frontier.size > 0) {
        // Pick a random cell from the frontier
        const frontierArr = Array.from(frontier);
        console.log(`Frontier cells: ${frontierArr}`);
        const idx = Math.floor(Math.random() * frontierArr.length);
        const [row, col] = frontierArr[idx].split(',').map(Number);
        frontier.delete(frontierArr[idx]);
        if (blacklist.has(`${row},${col}`) || visited.has(`${row},${col}`)) continue;
        grid[row][col] = 1;
        blackCells.push([row, col]);
        visited.add(`${row},${col}`);
        // Add new valid neighbors to frontier
        for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const nr = row + dr, nc = col + dc;
            if (nr < 0 || nr >= r || nc < 0 || nc >= c) continue;
            for (const [dr2, dc2] of [[-1,-1],[-1,0],[0,-1],[0,0]]) {
                const nnr = nr + dr2, nnc = nc + dc2;
                if (blacklist.has(`${nnr},${nnc}`)) continue;
                let count = 0;
                for (const [dr3, dc3] of [[0,0],[0,1],[1,0],[1,1]]) {
                    const nnnr = nnr + dr3, nnnc = nnc + dc3;
                    if (nnnr >= 0 && nnnr < r && nnnc >= 0 && nnnc < c && grid[nnnr][nnnc] === 1) {
                        count++;
                    }
                }
                if (count >= 3 && !visited.has(`${nr},${nc}`)) {
                    blacklist.add(`${nr},${nc}`);
                } else if (!visited.has(`${nr},${nc}`)) {
                    frontier.add(`${nr},${nc}`);
                }
            }
        }
    }

    console.log(`Final black cells: ${blackCells}`);
    console.log(`Total black cells: ${blackCells.length}`);
    
    console.log('Generated Area Puzzle Values:', blackCells);
    let values: number[][] = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (grid[i][j] === 1) {
                values[i][j] = 1;
            }
        }
    }

    // Randomly try to remove as many black cells as possible while all the black cells remain connected

    const isConnected = (row: number, col: number) => {
        const visited = new Set<string>();
        const newBlackCells = blackCells.filter(cell => !(cell[0] === row && cell[1] === col));
        const dfs = (r: number, c: number) => {
            visited.add(`${r},${c}`);
            for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) continue;
                if (grid[nr][nc] === 1 && !visited.has(`${nr},${nc}`)) {
                    dfs(nr, nc);
                }
            }
        };
        // Start DFS from the first black cell
        const [startRow, startCol] = newBlackCells[0];
        dfs(startRow, startCol);
        console.log(`Visited black cells: ${Array.from(visited)}`);
        console.log(`Visited black cells length: ${visited.size}`);
        console.log(`All black cells: ${blackCells.map(([r, c]) => `${r},${c}`)}`);
        console.log(`All black cells length: ${newBlackCells.length}`);

        console.log(`Difference: ${newBlackCells.length - visited.size}`);
        // Check if all black cells were visited
        return newBlackCells.every(([r, c]) => visited.has(`${r},${c}`));
    };

    const removeBlackCells = () => {
        const shuffled = blackCells.sort(() => 0.5 - Math.random());
        for (const [row, col] of shuffled) {
            grid[row][col] = 0;
            if (!isConnected(row, col)) {
                console.log(`Removing black cell at (${row}, ${col}) would disconnect the region.`);
                grid[row][col] = 1;
            } else if (Math.random() < 0.5) {
                console.log(`Removing black cell at (${row}, ${col}) would keep the region connected.`);
                blackCells = blackCells.filter(cell => !(cell[0] === row && cell[1] === col));
            } else {
                grid[row][col] = 1;
                console.log(`Keeping black cell at (${row}, ${col}) to add variability.`);
            }
        }
    };

    removeBlackCells();
    console.log(`Reduced black cells: ${blackCells}`);
    console.log(`Reduced black cells length: ${blackCells.length}`);

    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (grid[i][j] === 1) {
                values[i][j] = 1;
            } else {
                values[i][j] = 0;
            }
        }
    }

    return values;
}

export default function Area() {
    const rowRef = useRef<HTMLInputElement>(null);
    const colRef = useRef<HTMLInputElement>(null);
    const [values, setValues] = useState<number[][]>([[0]]);
    const [grid, setGrid] = useState<number[][]>(values.map(row => row.map(value => value ? 2 : 1)));
    const [locked, setLocked] = useState<boolean[][]>(values.map(row => row.map(value => value ? true : false)));

    const handleGenerate = () => {
        const numRows = Math.max(1, parseInt(rowRef.current?.value || '5', 10));
        const numCols = Math.max(1, parseInt(colRef.current?.value || '5', 10));
        const newValues = generateAreaPuzzle(numRows, numCols);
        setValues(newValues);
        setGrid(newValues.map(row => row.map(value => value ? 2 : 0)));
        setLocked(newValues.map(row => row.map(value => value ? true : false)));
    };

    return (
        <div className="area">
            <h1>Area (Nurikabe)</h1>
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
            <AreaGrid
                grid={grid}
                values={values}
                locked={locked}
            />
        </div>
    );
}
