'use client';

import { useState, useEffect } from 'react';
import YinYangSquare from './YinYangSquare';

interface Props {
    grid: number[][];
    locked: boolean[][];
}

export default function YinYangGrid(props: Props) {
    const [grid, setGrid] = useState<number[][]>(
        props.grid
    );
    const [locked, setLocked] = useState<boolean[][]>(
        props.locked
    );

    useEffect(() => {
        setGrid(props.grid);
        setLocked(props.locked);
    }, [props.grid, props.locked]);

    const handleSquareClick = (row: number, col: number, isRightClick: boolean) => {
        if (locked[row][col]) return;
        const newGrid = [...grid];
        newGrid[row][col] = isRightClick ? (newGrid[row][col] + 3 - 1) % 3 : (newGrid[row][col] + 1) % 3;
        setGrid(newGrid);
    };

    return (
        <div className="yin-yang-grid"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${grid.length}, 80px)`,
                gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 80px)`,
                gap: 2,
                background: '#000',
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