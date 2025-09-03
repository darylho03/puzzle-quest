'use client';

import { useState, useRef, useEffect } from 'react';
import RangeSquare from './RangeSquare';

interface Props {
    grid: number[][];
    values: (number | null)[][];
    locked: boolean[][];
}


// Returns true if the puzzle is solved: no adjacent blacks, all whites connected, all values correct
function isRangePuzzleSolved(grid: number[][], values: (number | null)[][]): boolean {
    const r = grid.length;
    const c = grid[0]?.length || 0;
    // 1. No adjacent black cells
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (grid[i][j] === 1) {
                for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                    const ni = i + dr, nj = j + dc;
                    if (ni >= 0 && ni < r && nj >= 0 && nj < c && grid[ni][nj] === 1) {
                        return false;
                    }
                }
            }
        }
    }
    // 2. All white cells are connected
    function isWhiteConnected(): boolean {
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
    if (!isWhiteConnected()) return false;
    // 3. All values are correct
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
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            if (values[i][j] && grid[i][j] === 2) {
                if (countVisible(i, j) !== values[i][j]) {
                    return false;
                }
            }
        }
    }
    return true;
}

export default function RangeGrid(props: Props) {
    const [grid, setGrid] = useState<number[][]>(
        props.grid
    );
    const [values, setValues] = useState<(number | null)[][]>(
        props.values
    );
    const [locked, setLocked] = useState<boolean[][]>(
        props.locked
    );
    const [solved, setSolved] = useState<boolean>(false);

    const handleSquareClick = (row: number, col: number, reverse: boolean) => {
        if (locked[row][col]) return; // Ignore clicks on locked squares
        const newGrid = [...grid];
        newGrid[row][col] = (reverse ? (newGrid[row][col] + 3 - 1) % 3 : (newGrid[row][col] + 1) % 3);
        setGrid(newGrid);
        setSolved(isRangePuzzleSolved(newGrid, values));
    };

    useEffect(() => {
        setGrid(props.grid);
        setValues(props.values);
        setLocked(props.locked);
        setSolved(false);
    }, [props.grid, props.values]);

    return (
        <div
            className="range-grid"
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
                    <RangeSquare 
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
