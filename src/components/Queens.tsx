'use client';

// import { useState } from 'react';
import QueensGrid from './QueensGrid';

function generateRegions(queens : number[][]): number[][] {
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
        // Use row, col, and region here as needed
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

export default function Queens() {
    return (
        <div className="queens">
            <h1>Queens</h1>
            <QueensGrid 
                regions={generateRegions([[0, 0], [1, 3], [2, 1], [3, 4], [4, 2], [5, 5]])}
            />
        </div>
    );
}