'use client';

import { useState, useEffect } from 'react';
import ReverseMinesweeperSquare from './ReverseMinesweeperSquare';

interface Props {
    walls: number[][];
    blocks: (number | null)[][];
    values: (number | null)[][];
}

function initializeCorrectness(blocks: (number | null)[][], values: (number | null)[][]) {
    let correct: number[][] = []
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < values[0].length; j++) {
            if (values[i][j] === null) continue;
            let mines = 0;
            for (const [dr, dc] of [[-1, -1],[-1, 0],[-1, 1],[0, -1],[0, 0],[0, 1],[1, -1],[1, 0],[1, 1]]) {
                let x = i + dr;
                let y = j + dc;
                if ((x >= 0 && x < values.length && y >= 0 && y < values[0].length) && blocks[x][y] !== null) {
                    mines += blocks[x][y];
                }
            }
            if (values[i][j] === mines) {
                correct.push([i, j]);
            }

        }
    }
    return correct
}

let ROWS = 10;
let COLS = 10;

export default function ReverseMinesweeperGrid(props: Props) {
    const [wallGrid, setWallGrid] = useState<number[][]>(
        props.walls
    );
    const [blockGrid, setBlockGrid] = useState<(number | null)[][]>(
        props.blocks
    );
    const [valueGrid, setValueGrid] = useState<(number | null)[][]>(
        props.values
    );
    const [correctGrid, setCorrectGrid] = useState<(number[][])>(
        []
    )
    const [draggedIdx, setDraggedIdx] = useState<number[] | null>(null)
    const [solved, setSolved] = useState<boolean>(false)

    useEffect(() => {
        setCorrectGrid(initializeCorrectness(props.blocks, props.values));
    }, [props.blocks, props.values]);

    useEffect(() => {
        setWallGrid(props.walls);
        ROWS = props.walls.length;
        COLS = props.walls[0].length;
        setSolved(false);
    }, [props.walls]);
    useEffect(() => {
        setBlockGrid(props.blocks);
    }, [props.blocks]);
    useEffect(() => {
        setValueGrid(props.values);
    }, [props.values]);

    function handleDragStart(idx: number[]) {
        if (!wallGrid[idx[0]][idx[1]]) {
            setDraggedIdx(idx);
        }
    }

    function handleDrop(idx: number[]) {
        if (draggedIdx === null || draggedIdx === idx || wallGrid[idx[0]][idx[1]] === 1) return;
        const newBlockGrid = [...blockGrid];
        const newValueGrid = [...valueGrid];
        [newBlockGrid[draggedIdx[0]][draggedIdx[1]], newBlockGrid[idx[0]][idx[1]]] = [newBlockGrid[idx[0]][idx[1]], newBlockGrid[draggedIdx[0]][draggedIdx[1]]];
        [newValueGrid[draggedIdx[0]][draggedIdx[1]], newValueGrid[idx[0]][idx[1]]] = [newValueGrid[idx[0]][idx[1]], newValueGrid[draggedIdx[0]][draggedIdx[1]]];
        setBlockGrid(newBlockGrid);
        setValueGrid(newValueGrid);
        const newCorrectGrid = initializeCorrectness(newBlockGrid, newValueGrid);
        setCorrectGrid(newCorrectGrid);
        let count = 0;
        for (let i = 0; i < newValueGrid.length; i++) {
            for (let j = 0; j < newValueGrid[0].length; j++) {
                if (newValueGrid[i][j] !== null) {
                    count++;
                }
            }
        }
        // console.log(newValueGrid.filter(val => val !== null));
        // console.log(count, newCorrectGrid.length);
        setSolved(count === newCorrectGrid.length);
        setDraggedIdx(null);
    }

    return (
        <div
            className="reverse-minesweeper-grid"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${ROWS}, 80px)`,
                gridTemplateColumns: `repeat(${COLS}, 80px)`,
                gap: 2,
                background: solved ? '#3cff00ff' : '#000',
                padding: 10,
                width: COLS * 82
            }}
        >
            {wallGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) =>
                    <ReverseMinesweeperSquare
                        key={`${rowIndex}-${colIndex}`}
                        wall={cell}
                        block={blockGrid[rowIndex][colIndex]}
                        value={valueGrid[rowIndex][colIndex]}
                        onDragStart={() => handleDragStart([rowIndex, colIndex])}
                        onDrop={() => handleDrop([rowIndex, colIndex])}
                        onDragOver={e => e.preventDefault()}
                        draggable={cell === 0}
                        correct={correctGrid.some(c => c[0] === rowIndex && c[1] === colIndex)}
                    />
                )
            )}
        </div>
    )

}