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

    return grid;
}

export default function YinYang() {
    const rowRef = useRef<HTMLInputElement>(null);
    const colRef = useRef<HTMLInputElement>(null);
    const [grid, setGrid] = useState<number[][]>(Array.from({ length: 9 }, () => Array(9).fill(0)));
    const [locked, setLocked] = useState<boolean[][]>(Array.from({ length: 9 }, () => Array(9).fill(false)));

    const handleGenerate = () => {
        const numRows = Math.max(1, parseInt(rowRef.current?.value || '5', 10));
        const numCols = Math.max(1, parseInt(colRef.current?.value || '5', 10));
        const newGrid = generateYinYangPuzzle(numRows, numCols);
        console.log(newGrid);
        setGrid(newGrid);
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