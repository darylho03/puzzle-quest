'use client';

import { useState, useRef } from 'react';
import QueensSquare from './QueensSquare';

interface Props {
    regions: number[][];
}

const GRID_SIZE = 6;

export default function QueensGrid(props: Props) {
    const { regions } = props;
    const [grid, setGrid] = useState<number[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    const regionGrid: number[][] = regions || Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [draggedCells, setDraggedCells] = useState<{row: number, col: number}[]>([]);
    const dragStarted = useRef(false);
    const [startDragState, setStartDragState] = useState(0);

    // Mouse event handlers
    const handleSquareMouseDown = (row: number, col: number) => {
        let currentDragState = grid[row][col];
        setStartDragState(currentDragState);
        setIsDragging(true);
        setDraggedCells([{row, col}]);
        dragStarted.current = true;
        if (currentDragState === 0) {
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
        setDraggedCells([]);
        dragStarted.current = false;
    };

    // // Regular click handler (cycle value)
    // const handleSquareClick = (row: number, col: number) => {
    //     const clicked = { row, col };
    //     const newGrid = grid.map((r, rowIndex) =>
    //         r.map((cell, colIndex) => {
    //             if (rowIndex === clicked.row && colIndex === clicked.col) {
    //                 return (cell + 1) % 3;
    //             }
    //             return cell;
    //         })
    //     );
    //     setGrid(newGrid);
    // };

    return (
        <div
            className="queens-grid"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${GRID_SIZE}, 80px)`,
                gridTemplateColumns: `repeat(${GRID_SIZE}, 80px)`,
                gap: 2,
                background: '#000',
                padding: 10,
                width: GRID_SIZE * 82,
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
        >
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <QueensSquare
                        key={`${rowIndex}-${colIndex}`}
                        value={cell}
                        region={regionGrid[rowIndex][colIndex]}
                        onMouseDown={() => handleSquareMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleSquareMouseEnter(rowIndex, colIndex)}
                    />
                ))
            )}
        </div>
    );
}