'use client';

import { useState, useRef, useEffect } from 'react';
import QueensSquare from './QueensSquare';

interface Props {
    regions: number[][];
    grid: number[][];
}

function checkInvalidCells(grid: number[][], regionGrid: number[][], setInvalidCells: (cells: {row: number, col: number}[]) => void) {
    const invalid: {row: number, col: number}[] = [];

    function isInvalidPlacement(row: number, col: number, grid: number[][], regionGrid: number[][]): boolean {
        // Check the column & row
        for (let i = 0; i < grid.length; i++) {
            if (i !== row && grid[i][col] === 2) {
                return true;
            }
            if (i !== col && grid[row][i] === 2) {
                return true;
            }
        }

        // Check the adjacent diagonals and regions
        const region = regionGrid[row][col];
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid.length; j++) {
                if (grid[i][j] === 2 && Math.abs(i - row) === 1 && Math.abs(j - col) === 1) {
                    return true;
                }
                if (!(i === row && j === col) && regionGrid[i][j] === region && grid[i][j] === 2) {
                    return true;
                }
            }
        }

        return false;
    }

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid.length; col++) {
            if (grid[row][col] === 2) {
                // Check for invalid placements
                if (isInvalidPlacement(row, col, grid, regionGrid)) {
                    invalid.push({row, col});
                }
            }
        }
    }
    setInvalidCells(invalid);
}

function checkAutoDots(grid: number[][], regionGrid: number[][], setAutoDots: (cells: {row: number, col: number}[]) => void) {
    const autoDots: {row: number, col: number}[] = [];

    function isInvalidPlacement(row: number, col: number, grid: number[][], regionGrid: number[][]): boolean {
        // Check the column & row
        for (let i = 0; i < grid.length; i++) {
            if (i !== row && grid[i][col] === 2) {
                return true;
            }
            if (i !== col && grid[row][i] === 2) {
                return true;
            }
        }

        // Check the adjacent diagonals and regions
        const region = regionGrid[row][col];
        for (let i = 0; i <  grid.length; i++) {
            for (let j = 0; j <  grid.length; j++) {
                if (grid[i][j] === 2 && Math.abs(i - row) === 1 && Math.abs(j - col) === 1) {
                    return true;
                }
                if (!(i === row && j === col) && regionGrid[i][j] === region && grid[i][j] === 2) {
                    return true;
                }
            }
        }

        return false;
    }

    for (let row = 0; row <  grid.length; row++) {
        for (let col = 0; col <  grid.length; col++) {
            if (grid[row][col] !== 2) {
                // Check for invalid placements
                if (isInvalidPlacement(row, col, grid, regionGrid)) {
                    autoDots.push({row, col});
                }
            }
        }
    }
    setAutoDots(autoDots);
}

export default function QueensGrid(props: Props) {
    const [grid, setGrid] = useState<number[][]>(
        props.grid
    );
    const [regionGrid, setRegionGrid] = useState<number[][]>(
        props.regions
    );

    useEffect(() => {
        setRegionGrid(props.regions);
    }, [props.regions]);

    useEffect(() => {
        setGrid(props.grid);
        setAutoDots(Array<{row: number, col: number}>());
        setSolved(false);
    }, [props.grid]);
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [draggedCells, setDraggedCells] = useState<{row: number, col: number}[]>([]);
    const dragStarted = useRef(false);
    const [startDragState, setStartDragState] = useState(0);
    const [invalidCells, setInvalidCells] = useState<{row: number, col: number}[]>([]);
    const [solved, setSolved] = useState(false);
    const [autoDots, setAutoDots] = useState<{row: number, col: number}[]>([]);

    // Mouse event handlers
    const handleSquareMouseDown = (row: number, col: number) => {
        let currentDragState = grid[row][col];
        setStartDragState(currentDragState);
        setIsDragging(true);
        setDraggedCells([{row, col}]);
        dragStarted.current = true;
        if (currentDragState === 0 && !autoDots.some(c => c.row === row && c.col === col)) {
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => row.slice());
                newGrid[row][col] = 1;
                return newGrid;
            });
        } else {
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => row.slice());
                newGrid[row][col] = 0;
                return newGrid;
            });
        }
    };

    const handleSquareMouseEnter = (row: number, col: number) => {
        if (isDragging && grid[row][col] === 0 && startDragState === 0) {
            setDraggedCells(prev => {
                if (!prev.some(cell => cell.row === row && cell.col === col)) {
                    // Update grid immediately
                    setGrid(prevGrid => {
                        const newGrid = prevGrid.map(rowArr => rowArr.slice());
                        newGrid[row][col] = 1;
                        return newGrid;
                    });
                    return [...prev, {row, col}];
                }
                return prev;
            });
        } else if (isDragging && grid[row][col] === 1 && startDragState === 1) {
            setDraggedCells(prev => {
                if (!prev.some(cell => cell.row === row && cell.col === col)) {
                    // Update grid immediately
                    setGrid(prevGrid => {
                        const newGrid = prevGrid.map(rowArr => rowArr.slice());
                        newGrid[row][col] = 0;
                        return newGrid;
                    });
                    return [...prev, {row, col}];
                }
                return prev;
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (draggedCells.length === 1 && startDragState === 1) {
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(rowArr => rowArr.slice());
                newGrid[draggedCells[0].row][draggedCells[0].col] = 2;
                return newGrid;
            });
        }

        setGrid(prevGrid => {
            const newGrid = prevGrid.map(rowArr => rowArr.slice());
            checkInvalidCells(newGrid, regionGrid, setInvalidCells);
            checkAutoDots(newGrid, regionGrid, setAutoDots);
            setSolved(invalidCells.length === 0 && newGrid.flat().filter(v => v === 2).length ===  grid.length);
            return newGrid;
        });

        setDraggedCells([]);
        dragStarted.current = false;
    };

    return (
        <div
            className="queens-grid"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${ grid.length}, 80px)`,
                gridTemplateColumns: `repeat(${ grid.length}, 80px)`,
                gap: 2,
                background: solved ? '#3cff00ff' : '#000',
                padding: 10,
                width: grid.length * 82,
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
        >
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <QueensSquare
                        key={`${rowIndex}-${colIndex}`}
                        value={autoDots.some(c => c.row === rowIndex && c.col === colIndex) ? 1 : cell}
                        region={regionGrid[rowIndex][colIndex]}
                        onMouseDown={() => handleSquareMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleSquareMouseEnter(rowIndex, colIndex)}
                        invalid={invalidCells.some(c => c.row === rowIndex && c.col === colIndex)}
                    />
                ))
            )}
        </div>
    );
}