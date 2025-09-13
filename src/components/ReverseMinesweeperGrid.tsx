'use client';

import { useState, useEffect } from 'react';
import ReverseMinesweeperSquare from './ReverseMinesweeperSquare';
import { markLevelCompleted } from '../firebaseUser';

interface Props {
    level_id?: string;
    user_id?: string;
    walls: number[][];
    blocks: (number[] | null)[][];
    values: (number | null)[][];
    operations: (string[] | null)[][];
}

function initializeCorrectness(blocks: (number[] | null)[][], values: (number | null)[][], operations: (string[] | null)[][]): number[][] {
    // console.log(`Initialize correctness`)
    let correct: number[][] = []
    // console.log(operations);
    const dirs = [[0, 0],[-1, -1],[-1, 0],[-1, 1],[0, -1],[0, 1],[1, -1],[1, 0],[1, 1]];
    function backtrack(i: number, j: number, mines: number, index: number) {
        if (index === 9) {
            // console.log(`Checking cell (${i}, ${j}): found ${mines} mines, needs ${values[i][j]}`);
            if (mines === values[i][j]) {
                correct.push([i, j]);
            }
            return;
        }
        if (values[i][j] === null) return;
        let [dr, dc] = dirs[index];
        let x = i + dr;
        let y = j + dc;
        if ((x >= 0 && x < values.length && y >= 0 && y < values[0].length) && blocks[x][y] !== null) {
            blocks[x][y].forEach((b, idx) => {
                let tempMines = mines;
                // console.log(`At cell (${i}, ${j}), direction (${dr}, ${dc}), considering block value ${b} at index ${idx}`);
                if (correct.some(c => c[0] === i && c[1] === j)) return;
                // Use operation on mine count
                if (operations && operations[x][y][idx] === 'x') {
                    mines *= b;
                } else if (operations && operations[x][y][idx] === '/') {
                    mines /= b;
                } else if (operations && operations[x][y][idx] === '-') {
                    mines -= b;
                } else {
                    mines += b;
                }
                backtrack(i, j, mines, index + 1);
                // Undo operation
                mines = tempMines;
            });
        } else {
            backtrack(i, j, mines, index + 1);
        }
    }
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < values[0].length; j++) {
            backtrack(i, j, 0, 0);
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
    const [blockGrid, setBlockGrid] = useState<(number[] | null)[][]>(
        props.blocks
    );
    const [valueGrid, setValueGrid] = useState<(number | null)[][]>(
        props.values
    );
    const [operationsGrid, setOperationsGrid] = useState<(string[] | null)[][]>(
        props.operations
    );
    const [correctGrid, setCorrectGrid] = useState<(number[][])>(
        []
    )
    const [draggedIdx, setDraggedIdx] = useState<number[] | null>(null)
    const [solved, setSolved] = useState<boolean>(false)

    useEffect(() => {
        setCorrectGrid(initializeCorrectness(props.blocks, props.values, props.operations));
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
    useEffect(() => {
        setOperationsGrid(props.operations);
    }, [props.operations]);

    function handleDragStart(idx: number[]) {
        if (wallGrid[idx[0]][idx[1]] !== 1) {
            setDraggedIdx(idx);
        }
    }

    async function handleDrop(idx: number[]) {
        console.log(`Handle drop: Starting idx: ${draggedIdx}, ending idx: ${idx}`)
        if (draggedIdx === null || draggedIdx === idx || wallGrid[idx[0]][idx[1]] === 3 || (wallGrid[idx[0]][idx[1]] === 1 && wallGrid[draggedIdx[0]][draggedIdx[1]] !== 2)) return;
        const newBlockGrid = [...blockGrid];
        const newValueGrid = [...valueGrid];
        const newWallGrid = [...wallGrid];
        const newOperationsGrid = [...operationsGrid];
        // console.log(newWallGrid);

        // Drag wallbreaker onto wall
        if (wallGrid[idx[0]][idx[1]] === 1 && wallGrid[draggedIdx[0]][draggedIdx[1]] === 2) {
            console.log(`Breaking wall at: ${idx}`);
            newWallGrid[idx[0]][idx[1]] = 0;
            newWallGrid[draggedIdx[0]][draggedIdx[1]] = 0;
            newBlockGrid[idx[0]][idx[1]] = newBlockGrid[idx[0]][idx[1]] === null ? (newValueGrid[idx[0]][idx[1]] === null ? null : [0]) : newBlockGrid[idx[0]][idx[1]];
            newBlockGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newValueGrid[draggedIdx[0]][draggedIdx[1]] = null;
        } else {
            // Normal swapping behavior onto empty space
            [newBlockGrid[draggedIdx[0]][draggedIdx[1]], newBlockGrid[idx[0]][idx[1]]] = [newBlockGrid[idx[0]][idx[1]], newBlockGrid[draggedIdx[0]][draggedIdx[1]]];
            [newValueGrid[draggedIdx[0]][draggedIdx[1]], newValueGrid[idx[0]][idx[1]]] = [newValueGrid[idx[0]][idx[1]], newValueGrid[draggedIdx[0]][draggedIdx[1]]];
            [newWallGrid[draggedIdx[0]][draggedIdx[1]], newWallGrid[idx[0]][idx[1]]] = [newWallGrid[idx[0]][idx[1]], newWallGrid[draggedIdx[0]][draggedIdx[1]]];
            [newOperationsGrid[draggedIdx[0]][draggedIdx[1]], newOperationsGrid[idx[0]][idx[1]]] = [newOperationsGrid[idx[0]][idx[1]], newOperationsGrid[draggedIdx[0]][draggedIdx[1]]];
        }
        setBlockGrid(newBlockGrid);
        setValueGrid(newValueGrid);
        setWallGrid(newWallGrid);
        const newCorrectGrid = initializeCorrectness(newBlockGrid, newValueGrid, newOperationsGrid);
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
        const solvedNow = count === newCorrectGrid.length;
        setSolved(solvedNow);
        setDraggedIdx(null);
        // Mark level as complete in Firebase if solved
        if (solvedNow && props.user_id && props.level_id) {
            await markLevelCompleted(props.user_id, props.level_id);
        }
        console.log(newBlockGrid);
        console.log(newValueGrid);
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
                        operation={operationsGrid[rowIndex][colIndex]}
                        onDragStart={() => handleDragStart([rowIndex, colIndex])}
                        onDrop={() => handleDrop([rowIndex, colIndex])}
                        onDragOver={e => e.preventDefault()}
                        draggable={cell !== 1}
                        correct={correctGrid.some(c => c[0] === rowIndex && c[1] === colIndex)}
                        hidden={false}
                    />
                )
            )}
        </div>
    )

}