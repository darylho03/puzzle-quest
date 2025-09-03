'use client';

import { useState, useEffect } from 'react';
import AreaSquare from './AreaSquare';

interface Props {
    grid: number[][];
    values: (number | null)[][];
    locked: boolean[][];
}

// Returns true if the Area puzzle is solved according to Nurikabe rules
function isAreaPuzzleSolved(grid: number[][], values: (number | null)[][]): boolean {
    const r = grid.length;
    const c = grid[0]?.length || 0;
    // 1. All black cells are connected
    function isBlackConnected(): boolean {
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
    // 2. No 2x2 or larger solid black rectangle
    for (let i = 0; i < r - 1; i++) {
        for (let j = 0; j < c - 1; j++) {
            if (
                grid[i][j] === 1 &&
                grid[i+1][j] === 1 &&
                grid[i][j+1] === 1 &&
                grid[i+1][j+1] === 1
            ) {
                return false;
            }
        }
    }
    // 3 & 4. All white cells form islands, each island has exactly one numbered cell, and matches its size
    const visited = Array.from({ length: r }, () => Array(c).fill(false));
    let islandId = 1;
    let cellToIsland: number[][] = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (grid[i][j] === 2 && !visited[i][j]) {
                // BFS to find island
                let island: [number, number][] = [];
                let queue: [number, number][] = [[i, j]];
                visited[i][j] = true;
                cellToIsland[i][j] = islandId;
                while (queue.length) {
                    const [row, col] = queue.shift()!;
                    island.push([row, col]);
                    for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                        const nr = row + dr, nc = col + dc;
                        if (
                            nr >= 0 && nr < r && nc >= 0 && nc < c &&
                            grid[nr][nc] === 2 && !visited[nr][nc]
                        ) {
                            visited[nr][nc] = true;
                            cellToIsland[nr][nc] = islandId;
                            queue.push([nr, nc]);
                        }
                    }
                }
                // Check for exactly one numbered cell
                const numbered = island.filter(([row, col]) => values[row][col]);
                if (numbered.length !== 1) return false;
                // Check island size matches number
                const num = values[numbered[0][0]][numbered[0][1]];
                if (num !== island.length) return false;
                islandId++;
            }
        }
    }
    // Check that no two numbered cells are in the same island
    let numberedCells: [number, number, number][] = [];
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (values[i][j]) {
                numberedCells.push([i, j, cellToIsland[i][j]]);
            }
        }
    }
    let islandNumbers = new Set<number>();
    for (const [i, j, id] of numberedCells) {
        if (islandNumbers.has(id)) return false;
        islandNumbers.add(id);
    }
    return isBlackConnected();
}

export default function AreaGrid(props: Props) {
    const [grid, setGrid] = useState<number[][]>(props.grid);
    const [values, setValues] = useState<(number | null)[][]>(props.values);
    const [locked, setLocked] = useState<boolean[][]>(props.locked);
    const [solved, setSolved] = useState<boolean>(false);

    const handleSquareClick = (row: number, col: number, reverse: boolean) => {
        if (locked[row][col]) return;
        const newGrid = [...grid];
        newGrid[row][col] = (reverse ? (newGrid[row][col] + 3 - 1) % 3 : (newGrid[row][col] + 1) % 3);
        setGrid(newGrid);
        setSolved(isAreaPuzzleSolved(newGrid, values));
    };

    useEffect(() => {
        setGrid(props.grid);
        setValues(props.values);
        setLocked(props.locked);
        setSolved(false);
    }, [props.grid, props.values]);

    return (
        <div
            className="area-grid"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${grid.length}, 80px)`,
                gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 80px)`,
                gap: 2,
                background: solved ? '#3cff00ff' : '#000',
                padding: 10,
                width: grid[0].length * 82
            }}
        >
            {grid.map((row, rowIndex) =>
                row.map((square, colIndex) => (
                    <AreaSquare
                        key={`${rowIndex}-${colIndex}`}
                        value={values[rowIndex][colIndex] ? values[rowIndex][colIndex] : null}
                        square={square}
                        onClick={() => handleSquareClick(rowIndex, colIndex, false)}
                        onRightClick={() => handleSquareClick(rowIndex, colIndex, true)}
                    />
                ))
            )}
        </div>
    );
}
