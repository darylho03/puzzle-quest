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
    function bruteForceSolveRangePuzzle(puzzle: number[][]): number {
        console.log('bruteForceSolveRangePuzzle called');
        
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

    function efficientlySolveRangePuzzle(puzzle: number[][], g: number[][]): number {
        let grid: number[][] = g.map(row => [...row]);
        // Apply the logical steps to solve a range puzzle
        // console.log('efficientlySolveRangePuzzle called');
        // console.log('Current puzzle state:');
        // for (let i = 0; i < r; i++) {
        //     console.log(puzzle[i].join(" "));
        // }
        // console.log('Current grid state:');
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }
        let numSolutions = 0;

        // puzzle is the grid with all the values
        // grid is the grid with the colored cells (0 = blank, 1 = black, 2 = white)

        // Method -1: Since 2's are sensitive, all cells diagonal to 2's must be white

        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] === 2) {
                    // Mark all diagonal cells as white
                    for (let d = -1; d <= 1; d += 2) {
                        if (i + d >= 0 && i + d < r && j + d >= 0 && j + d < c) {
                            grid[i + d][j + d] = 2;
                        }
                    }
                }
            }
        }

        // Method 0 only works if unique solution is guaranteed, since it isn't, don't use it.
        // // Method 0 (Used once at the beginning): Make all blank cells that cannot be reached by numbered cells white
        
        // // Create a temporary copy of the puzzle
        // const tempPuzzle = puzzle.map(row => [...row]);
        // const markGrid = grid.map(row => [...row]);

        // // For each numbered cell, mark all reachable blank cells as white
        // // Perform a BFS/DFS from each numbered cell to mark reachable blank cells
        // const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        // for (let i = 0; i < r; i++) {
        //     for (let j = 0; j < c; j++) {
        //         if (tempPuzzle[i][j] > 0) {
        //             const queue: [number, number][] = [[i, j]];
        //             while (queue.length) {
        //                 const [x, y] = queue.shift()!;
        //                 for (const [dx, dy] of directions) {
        //                     const nx = x + dx;
        //                     const ny = y + dy;
        //                     if (nx >= 0 && nx < r && ny >= 0 && ny < c && markGrid[nx][ny] === 0) {
        //                         markGrid[nx][ny] = 2;
        //                         queue.push([nx, ny]);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        // // On the real grid, make all cells that weren't marked into white cells
        // for (let i = 0; i < r; i++) {
        //     for (let j = 0; j < c; j++) {
        //         if (markGrid[i][j] === 0) {
        //             grid[i][j] = 2;
        //         }
        //     }
        // }

        // Method 1: Check if any numbered cells can be completed with its visible blank cells

        function countVisible(row: number, col: number, grid: number[][]): number {
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

        function canCompleteNumberedCell(row: number, col: number, grid: number[][]): boolean {
            const visibleCount = countVisible(row, col, grid);
            // console.log(`Visible count for cell (${row}, ${col}): ${visibleCount}`);
            return visibleCount === puzzle[row][col];
        }

        function fillVisible(row: number, col: number, grid: number[][]): void {
            for (let i = row - 1; i >= 0; i--) {
                if (grid[i][col] === 1) break;
                grid[i][col] = 2;
            }
            for (let i = row + 1; i < r; i++) {
                if (grid[i][col] === 1) break;
                grid[i][col] = 2;
            }
            for (let j = col - 1; j >= 0; j--) {
                if (grid[row][j] === 1) break;
                grid[row][j] = 2;
            }
            for (let j = col + 1; j < c; j++) {
                if (grid[row][j] === 1) break;
                grid[row][j] = 2;
            }
        }

        // For each numbered cell, apply Method 1
        // console.log("Method 1 started");
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] && canCompleteNumberedCell(i, j, grid)) {
                    // console.log(`Can complete numbered cell: Filling visible cells for numbered cell (${i}, ${j})`);
                    fillVisible(i, j, grid);
                }
            }
        }
        // console.log("Method 1 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        // Method 2: Check if any numbered cells are already completed and add black cells to block its view of any more cells

        function countConnectedWhites(row: number, col: number, grid: number[][]): number {
            let count = 1;
            for (let i = row - 1; i >= 0; i--) {
                if (grid[i][col] !== 2) break;
                count++;
            }
            for (let i = row + 1; i < r; i++) {
                if (grid[i][col] !== 2) break;
                count++;
            }
            for (let j = col - 1; j >= 0; j--) {
                if (grid[row][j] !== 2) break;
                count++;
            }
            for (let j = col + 1; j < c; j++) {
                if (grid[row][j] !== 2) break;
                count++;
            }
            return count;
        }

        function isCompleteNumberedCell(row: number, col: number, grid: number[][]): boolean {
            const connectedCount = countConnectedWhites(row, col, grid);
            return connectedCount === puzzle[row][col];
        }

        // For each numbered cell, apply Method 2
        // console.log("Method 2 started");
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] && isCompleteNumberedCell(i, j, grid)) {
                    // Mark the next blank cells in all directions black
                    for (let k = i - 1; k >= 0; k--) {
                        if (grid[k][j] === 0) grid[k][j] = 1;
                        if (grid[k][j] === 1) break;
                    }
                    for (let k = i + 1; k < r; k++) {
                        if (grid[k][j] === 0) grid[k][j] = 1;
                        if (grid[k][j] === 1) break;
                    }
                    for (let k = j - 1; k >= 0; k--) {
                        if (grid[i][k] === 0) grid[i][k] = 1;
                        if (grid[i][k] === 1) break;
                    }
                    for (let k = j + 1; k < c; k++) {
                        if (grid[i][k] === 0) grid[i][k] = 1;
                        if (grid[i][k] === 1) break;
                    }
                }
            }
        }
        // console.log("Method 2 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        // Method 3: Make all cells adjacent to black cells white
        // console.log("Method 3 started");
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (grid[i][j] === 1) {
                    // Make adjacent cells white
                    if (i > 0) grid[i - 1][j] = 2;
                    if (i < r - 1) grid[i + 1][j] = 2;
                    if (j > 0) grid[i][j - 1] = 2;
                    if (j < c - 1) grid[i][j + 1] = 2;
                }
            }
        }
        // console.log("Method 3 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        // Method 4: Set blank cells that if white would invalidate numbered cells black
        // console.log("Method 4 started");
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] === 0) continue;
                for (let k = i - 1; k >= 0; k--) {
                    if (grid[k][j] === 0) {
                        grid[k][j] = 2;
                        if (countConnectedWhites(i, j, grid) > puzzle[i][j]) {
                            // console.log(`Clue ${puzzle[k][j]} sees too many whites set to 1`);
                            grid[k][j] = 1;
                        } else {
                            grid[k][j] = 0;
                        }
                    }
                    if (grid[k][j] === 1) break;
                }
                for (let k = i + 1; k < r; k++) {
                    if (grid[k][j] === 0) {
                        grid[k][j] = 2;
                        if (countConnectedWhites(i, j, grid) > puzzle[i][j]) {
                            grid[k][j] = 1;
                        } else {
                            grid[k][j] = 0;
                        }
                    }
                    if (grid[k][j] === 1) break;
                }
                for (let k = j - 1; k >= 0; k--) {
                    if (grid[i][k] === 0) {
                        grid[i][k] = 2;
                        if (countConnectedWhites(i, j, grid) > puzzle[i][j]) {
                            grid[i][k] = 1;
                        } else {
                            grid[i][k] = 0;
                        }
                    }
                    if (grid[i][k] === 1) break;
                }
                for (let k = j + 1; k < c; k++) {
                    if (grid[i][k] === 0) {
                        grid[i][k] = 2;
                        if (countConnectedWhites(i, j, grid) > puzzle[i][j]) {
                            grid[i][k] = 1;
                        } else {
                            grid[i][k] = 0;
                        }
                    }
                    if (grid[i][k] === 1) break;
                }
            }
        }
        // console.log("Method 4 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        function countFixedSides(row: number, col: number, grid: number[][]): number {
            let count = 4;
            for (let i = row - 1; i >= 0; i--) {
                if (grid[i][col] === 0) {
                    count--;
                    break;
                }
            }
            for (let i = row + 1; i < grid.length; i++) {
                if (grid[i][col] === 0) {
                    count--;
                    break;
                }
            }
            for (let i = col - 1; i >= 0; i--) {
                if (grid[row][i] === 0) {
                    count--;
                    break;
                }
            }
            for (let i = col + 1; i < grid[0].length; i++) {
                if (grid[row][i] === 0) {
                    count--;
                    break;
                }
            }
            return count;
        }

        function fillFourthSide(row: number, col: number, grid: number[][]): void {
            let whiteCells = puzzle[row][col];
            let visibleWhiteCells = countConnectedWhites(row, col, grid);
            for (let i = row - 1; i >= 0; i--) {
                if (grid[i][col] === 0 && visibleWhiteCells < whiteCells) {
                    grid[i][col] = 2;
                    visibleWhiteCells++;
                }
                if (grid[i][col] === 1 || visibleWhiteCells === whiteCells) break;
            }
            if (visibleWhiteCells === whiteCells) return;
            for (let i = row + 1; i < grid.length; i++) {
                if (grid[i][col] === 0 && visibleWhiteCells < whiteCells) {
                    grid[i][col] = 2;
                    visibleWhiteCells++;
                }
                if (grid[i][col] === 1 || visibleWhiteCells === whiteCells) break;
            }
            if (visibleWhiteCells === whiteCells) return;
            for (let i = col - 1; i >= 0; i--) {
                if (grid[row][i] === 0 && visibleWhiteCells < whiteCells) {
                    grid[row][i] = 2;
                    visibleWhiteCells++;
                }
                if (grid[row][i] === 1 || visibleWhiteCells === whiteCells) break;
            }
            if (visibleWhiteCells === whiteCells) return;
            for (let i = col + 1; i < grid[0].length; i++) {
                if (grid[row][i] === 0 && visibleWhiteCells < whiteCells) {
                    grid[row][i] = 2;
                    visibleWhiteCells++;
                }
                if (grid[row][i] === 1 || visibleWhiteCells === whiteCells) break;
            }
        }

        // Method 5: Check if numbered cells have 3 fixed sides and fill out the 4th
        // console.log("Method 5 started");
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] > 0) {
                    const fixedSides = countFixedSides(i, j, grid);
                    if (fixedSides === 3) {
                        fillFourthSide(i, j, grid);
                    }
                }
            }
        }
        // console.log("Method 5 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        // Method 6: Ensure all white cells are connected

        function dfsCount(row: number, col: number, visited: boolean[][], grid: number[][]): number {
            if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return 0;
            if (visited[row][col] || grid[row][col] === 1) return 0;
            visited[row][col] = true;
            let count = 1;
            count += dfsCount(row - 1, col, visited, grid);
            count += dfsCount(row + 1, col, visited, grid);
            count += dfsCount(row, col - 1, visited, grid);
            count += dfsCount(row, col + 1, visited, grid);
            return count;
        }

        function isAllWhiteConnected(row: number, col: number, grid: number[][]): boolean {
            // console.log('isAllWhiteConnected called');
            let blackCellCount = 0;
            let coords: [number, number] = [0, 0];

            for (let i = 0; i < r; i++) {
                for (let j = 0; j < c; j++) {
                    if (grid[i][j] === 1) {
                        blackCellCount++;
                    } else if (grid[i][j] === 0) {
                        coords = [i, j];
                    }
                }
            }

            return dfsCount(coords[0], coords[1], Array.from({ length: r }, () => Array(c).fill(false)), grid) + blackCellCount === (r * c);
        }

        // Check each blank cell and see if making it black would disconnect all white cells
        // console.log("Method 6 started");
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (grid[i][j] === 0) {
                    grid[i][j] = 1;
                    if (!isAllWhiteConnected(i, j, grid)) {
                        grid[i][j] = 2;
                    } else {
                        grid[i][j] = 0;
                    }
                }
            }
        }
        // console.log("Method 6 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        // Method 7: Try all black cells individually, if all positions of black cells except for 1 result in an unsatisfiable numbered cell, set that position to black

        function findValidBlackPlacements(row: number, col: number, grid: number[][]): [number, number][] {
            const validPlacements: [number, number][] = [];
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                    if (grid[i][j] === 0) {
                        grid[i][j] = 1;
                        if (countVisible(row, col, grid) < puzzle[row][col]) {
                            validPlacements.push([i, j]);
                        }
                        grid[i][j] = 0;
                    }
                }
            }
            return validPlacements;
        }
        // console.log("Method 7 started");

        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (countConnectedWhites(i, j, grid) !== puzzle[i][j]) {
                    let validBlackPlacements = findValidBlackPlacements(i, j, grid);
                    if (validBlackPlacements.length === 1) {
                        const [br, bc] = validBlackPlacements[0];
                        grid[br][bc] = 1;
                    }
                }
            }
        }
        // console.log("Method 7 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        function countVisibleInDirection(row: number, col: number, dr: number, dc: number): number {
                let count = 0;
                while (row >= 0 && row < r && col >= 0 && col < c) {
                    if (grid[row][col] !== 1) count++;
                    row += dr;
                    col += dc;
                }
                return count;
            }

        function addMinimumWhites(row: number, col: number, grid: number[][]): void {
            // console.log(`Adding minimum whites for cell (${row}, ${col})`);
            let directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            // console.log(`For loop started`);
            for (let rounds = 0; rounds < 4; rounds++) {
                let count = 1;
                // console.log(directions);
                for (let d = 0; d < 4; d++) {
                    const [dr, dc] = directions[d];
                    let rw = row;
                    let cl = col;
                    if (d === 3 && count < puzzle[row][col]) {
                        // console.log(`Filling direction (${dr}, ${dc}) to meet requirement`);
                        while (rw >= 0 && rw < r && cl >= 0 && cl < c && count < puzzle[rw][cl]) {
                            // console.log(`Filling cell (${rw}, ${cl})`);
                            if (grid[rw][cl] === 0) {
                                grid[rw][cl] = 1;
                                count++;
                            }
                            // console.log(`Filled cell (${rw}, ${cl})`);
                            rw += dr;
                            cl += dc;
                        }
                    } else {
                        count += countVisibleInDirection(rw + dr, cl + dc, dr, dc);
                    }
                    // console.log(`Direction (${dr}, ${dc}) counted, current count: ${count}`);
                }
                // Rotate the directions
                directions = directions.map(([dr, dc]) => [dc, -dr]);
            }
        }

        // Method 8: Handle big numbered cells by adding their minimum white cells required
        // console.log("Method 8 started");

        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] > 0) {
                    addMinimumWhites(i, j, grid);
                }
            }
        }
        // console.log("Method 8 applied");
        // for (let i = 0; i < r; i++) {
        //     console.log(`Row ${i + 1}: ${grid[i].join(" ")}`);
        // }

        // Last Method: Guess empty cells by sorting which are the closest to filled cells
        // console.log("Last Method guessing started");

        function countEndings(row: number, col: number, grid: number[][]): number {
            let count = 4;
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                let r = row + dr;
                let c = col + dc;
                while (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
                    if (grid[r][c] === 0) {
                        count--;
                        break;
                    } else if (grid[r][c] === 1) {
                        break;
                    }
                    r += dr;
                    c += dc;
                }
            }
            return count;
        }

        const visited: boolean[][] = Array.from({ length: r }, () => Array(c).fill(false));
        const queue: [[number, number], number, number][] = [];

        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (puzzle[i][j] > 0) {
                    const count = countEndings(i, j, grid);
                    queue.push([[i, j], count, puzzle[i][j] - countConnectedWhites(i, j, grid)]);
                }
            }
        }

        // Sort the queue based on the number of endings, secondarily sorted by the number of needed white cells
        queue.sort((a, b) => a[1] - b[1] || a[2] - b[2]);

        // One by one, guess black for all blank cells that are neighbors of the filled cells

        function guessBlackCells(row: number, col: number, grid: number[][], visited: boolean[][], queue: [[number, number], number, number][]): number {
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            let count = 0;
            for (const [dr, dc] of directions) {
                let r = row + dr;
                let c = col + dc;
                while (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
                    if (grid[r][c] === 0 && !visited[r][c]) {
                        // Guess black for the cell
                        grid[r][c] = 1;
                        visited[r][c] = true;
                        count += efficientlySolveRangePuzzle(puzzle, grid);
                        // Restore the cell to its original state
                        grid[r][c] = 0;
                    }
                    r += dr;
                    c += dc;
                }
            }
            return count;
        }
        for (const [[row, col], ,] of queue) {
            numSolutions += guessBlackCells(row, col, grid, visited, queue);
        }

        // console.log("Last Method guessing applied");

        // Check if the grid is fully solved
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (grid[i][j] === 0) {
                    // console.log('Grid is not fully solved');
                    return numSolutions;
                }
            }
        }
        // console.log('Grid is fully solved');
        return numSolutions + 1;
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
        // let bruteForceSols = bruteForceSolveRangePuzzle(puzzle);
        // let efficientSols = efficientlySolveRangePuzzle(puzzle, puzzle.map(row => row.map(value => value ? 2 : 0)));
        // console.log(`Brute force result: ${bruteForceSols}`);
        // console.log(`Efficient result: ${efficientSols}`);
        // if (bruteForceSols !== efficientSols) {
        //     console.log('Inconsistent results found');
        //     break;
        // }
        // if (bruteForceSols !== 1) {
        //     console.log('Restoring clue at', row, col);
        //     puzzle[row][col] = backup; // restore
        // }
        if (efficientlySolveRangePuzzle(puzzle, puzzle.map(row => row.map(value => value ? 2 : 0))) !== 1) {
            console.log('Restoring clue at', row, col);
            puzzle[row][col] = backup; // restore
        }
    }
    console.log('Output puzzle:');
    console.table(puzzle);
    return puzzle;
}

export default function Range() {
    const rowRef = useRef<HTMLInputElement>(null);
    const colRef = useRef<HTMLInputElement>(null);
    const [values, setValues] = useState<number[][]>(Array(5).fill(null).map(() => Array(5).fill(0)));
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