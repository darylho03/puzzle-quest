'use client';

import { useState, useEffect } from 'react';
import YinYangSquare from './YinYangSquare';

interface Props {
    grid: number[][];
    locked: boolean[][];
}

function isYinYangPuzzleSolved(grid: number[][]): boolean {
    // Check if all black cells (1) are connected
    const visited = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));
    let foundBlack = false;

    function dfs(row: number, col: number) {
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length || visited[row][col] || grid[row][col] !== 1) {
            return;
        }
        visited[row][col] = true;
        dfs(row - 1, col);
        dfs(row + 1, col);
        dfs(row, col - 1);
        dfs(row, col + 1);
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 1 && !visited[i][j]) {
                if (foundBlack) {
                    // If we found another black region, it's not solved
                    return false;
                }
                foundBlack = true;
                dfs(i, j);
            }
        }
    }

    // Check if all white cells (2) are connected
    const visitedWhite = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));
    let foundWhite = false;

    function dfsWhite(row: number, col: number) {
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length || visitedWhite[row][col] || grid[row][col] !== 2) {
            return;
        }
        visitedWhite[row][col] = true;
        dfsWhite(row - 1, col);
        dfsWhite(row + 1, col);
        dfsWhite(row, col - 1);
        dfsWhite(row, col + 1);
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 2 && !visitedWhite[i][j]) {
                if (foundWhite) {
                    // If we found another white region, it's not solved
                    return false;
                }
                foundWhite = true;
                dfsWhite(i, j);
            }
        }
    }

    // Check if all cells are filled
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }

    // Check if there are any 2x2 squares of the same color
    for (let i = 0; i < grid.length - 1; i++) {
        for (let j = 0; j < grid[0].length - 1; j++) {
            const colors = [grid[i][j], grid[i][j + 1], grid[i + 1][j], grid[i + 1][j + 1]];
            if (colors.every(color => color === 1) || colors.every(color => color === 2)) {
                return false;
            }
        }
    }

    return foundBlack && foundWhite;
}

export default function YinYangGrid(props: Props) {
    const [grid, setGrid] = useState<number[][]>(
        props.grid
    );
    const [locked, setLocked] = useState<boolean[][]>(
        props.locked
    );
    const [solved, setSolved] = useState<boolean>(false);

    useEffect(() => {
        setGrid(props.grid);
        setLocked(props.locked);
        setSolved(false);
    }, [props.grid, props.locked]);

    const handleSquareClick = (row: number, col: number, isRightClick: boolean) => {
        if (locked[row][col]) return;
        const newGrid = [...grid];
        newGrid[row][col] = isRightClick ? (newGrid[row][col] + 3 - 1) % 3 : (newGrid[row][col] + 1) % 3;
        setGrid(newGrid);
        setSolved(isYinYangPuzzleSolved(newGrid));
    };

    return (
        <div className="yin-yang-grid"
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
                row.map((value, colIndex) => (
                    <YinYangSquare
                        key={`${rowIndex}-${colIndex}`}
                        value={value}
                        locked={locked[rowIndex][colIndex]}
                        onClick={() => handleSquareClick(rowIndex, colIndex, false)}
                        onRightClick={() => handleSquareClick(rowIndex, colIndex, true)}
                    />
                ))
            )}
        </div>
    );
}