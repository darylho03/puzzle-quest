'use client';

import { useState, useEffect, use } from 'react';
import ReverseMinesweeperSquare from './ReverseMinesweeperSquare';
import { markLevelCompleted } from '../firebaseUser';

interface Props {
    level_id?: string;
    user_id?: string;
    mode?: string;
    walls: number[][];
    blocks: (number[][] | null)[][];
    values: (number | null)[][];
    operations: (string[][] | null)[][];
    blockTypes: (number | null)[][];
}

function initializeCorrectness(blocks: (number[][] | null)[][], values: (number | null)[][], operations: (string[][] | null)[][]): number[][] {
    // console.log(`Initialize correctness`)
    let correct: number[][] = []
    // console.log(operations);
    const dirs = [[0, 0],[-1, -1],[-1, 0],[-1, 1],[0, -1],[0, 1],[1, -1],[1, 0],[1, 1]];
    function backtrack(i: number, j: number, mines: number, index: number) {
        if (index === 9) {
            // console.log(`Checking cell (${i}, ${j}): found ${mines} mines, needs ${values[i][j]}`);
            if (mines === values[i][j]) {
                if (!correct.some(c => c[0] === i && c[1] === j)) {
                    correct.push([i, j]);
                }
            }
            return;
        }
        if (values[i][j] === null) return;
        let [dr, dc] = dirs[index];
        let x = i + dr;
        let y = j + dc;
        if ((x >= 0 && x < values.length && y >= 0 && y < values[0].length) && blocks[x][y] !== null) {
            // Helper to get all combinations of picking one element from each sublist
            function getCombinations(arr) {
                if (arr.length === 0) return [[]];
                const [first, ...rest] = arr;
                const combos = getCombinations(rest);
                return first.flatMap(val => combos.map(combo => [val, ...combo]));
            }
            // Helper for operations
            function getOpCombinations(arr) {
                if (arr.length === 0) return [[]];
                const [first, ...rest] = arr;
                const combos = getOpCombinations(rest);
                return first.flatMap(val => combos.map(combo => [val, ...combo]));
            }
            const blockCombos = getCombinations(blocks[x][y]);
            const opCombos = (operations && operations[x][y]) ? getOpCombinations(operations[x][y]) : blockCombos.map(() => []);
            blockCombos.forEach((blockCombo, comboIdx) => {
                let tempMines = mines;
                blockCombo.forEach((b, idx) => {
                    const op = opCombos[comboIdx] && opCombos[comboIdx][idx] ? opCombos[comboIdx][idx] : '+';
                    if (op === 'x') tempMines *= b;
                    else if (op === '/') tempMines /= b;
                    else if (op === '-') tempMines -= b;
                    else if (op === '^') tempMines = Math.pow(tempMines, b);
                    else if (op === '%') tempMines %= b;
                    else if (op === '=') tempMines = b;
                    else if (op === '<') tempMines = Math.min(tempMines, b);
                    else if (op === '>') tempMines = Math.max(tempMines, b);
                    else tempMines += b;
                });
                backtrack(i, j, tempMines, index + 1);
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
    const [blockGrid, setBlockGrid] = useState<(number[][] | null)[][]>(
        props.blocks
    );
    const [valueGrid, setValueGrid] = useState<(number | null)[][]>(
        props.values
    );
    const [operationsGrid, setOperationsGrid] = useState<(string[][] | null)[][]>(
        props.operations
    );
    const [blockTypesGrid, setBlockTypesGrid] = useState<(number | null)[][]>(
        props.blockTypes
    );
    // Grid of coordinates [i, j] that are correct
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
    useEffect(() => {
        setBlockTypesGrid(props.blockTypes);
    }, [props.blockTypes]);

    function handleDragStart(idx: number[]) {
        if (wallGrid[idx[0]][idx[1]] !== 1) {
            setDraggedIdx(idx);
        }
    }

    async function handleDrop(idx: number[]) {
        // console.log(`Handle drop: Starting idx: ${draggedIdx}, ending idx: ${idx}`)
        if (draggedIdx === null || draggedIdx === idx || (wallGrid[idx[0]][idx[1]] > 0 && blockTypesGrid[draggedIdx[0]][draggedIdx[1]] !== wallGrid[idx[0]][idx[1]] * -1)) return;
        const newBlockGrid = [...blockGrid];
        const newValueGrid = [...valueGrid];
        const newWallGrid = [...wallGrid];
        const newOperationsGrid = [...operationsGrid];
        const newBlockTypesGrid = [...blockTypesGrid];
        // console.log(newWallGrid);

        // Drag wallbreaker onto wall
        if (newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]] < 0 && newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]] * -1 === wallGrid[idx[0]][idx[1]]) {
            // console.log(`Breaking wall at: ${idx}`);
            newWallGrid[idx[0]][idx[1]] = 0;
            // newWallGrid[draggedIdx[0]][draggedIdx[1]] = 0;
            newBlockGrid[idx[0]][idx[1]] = newBlockGrid[idx[0]][idx[1]] === null ? (newValueGrid[idx[0]][idx[1]] === null ? null : [[0]]) : newBlockGrid[idx[0]][idx[1]];
            newBlockGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newValueGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newOperationsGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newOperationsGrid[idx[0]][idx[1]] = newOperationsGrid[idx[0]][idx[1]] === null ? (newBlockGrid[idx[0]][idx[1]] === null ? null : newBlockGrid[idx[0]][idx[1]].map((b) => (b.map(() => '+')))) : newOperationsGrid[idx[0]][idx[1]];
        } else {
            // Normal swapping behavior onto empty space
            // console.log(`Swapping cells: ${draggedIdx} and ${idx}`);
            [newBlockGrid[draggedIdx[0]][draggedIdx[1]], newBlockGrid[idx[0]][idx[1]]] = [newBlockGrid[idx[0]][idx[1]], newBlockGrid[draggedIdx[0]][draggedIdx[1]]];
            [newValueGrid[draggedIdx[0]][draggedIdx[1]], newValueGrid[idx[0]][idx[1]]] = [newValueGrid[idx[0]][idx[1]], newValueGrid[draggedIdx[0]][draggedIdx[1]]];
            [newWallGrid[draggedIdx[0]][draggedIdx[1]], newWallGrid[idx[0]][idx[1]]] = [newWallGrid[idx[0]][idx[1]], newWallGrid[draggedIdx[0]][draggedIdx[1]]];
            [newOperationsGrid[draggedIdx[0]][draggedIdx[1]], newOperationsGrid[idx[0]][idx[1]]] = [newOperationsGrid[idx[0]][idx[1]], newOperationsGrid[draggedIdx[0]][draggedIdx[1]]];
            [newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]], newBlockTypesGrid[idx[0]][idx[1]]] = [newBlockTypesGrid[idx[0]][idx[1]], newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]]];
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
        // console.log(newBlockGrid);
        // console.log(newValueGrid);
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
                        mode={props.mode}
                        wall={cell}
                        block={blockGrid[rowIndex][colIndex]}
                        value={valueGrid[rowIndex][colIndex]}
                        operation={operationsGrid[rowIndex][colIndex]}
                        blockType={blockTypesGrid[rowIndex][colIndex]}
                        onDragStart={() => handleDragStart([rowIndex, colIndex])}
                        onDrop={() => handleDrop([rowIndex, colIndex])}
                        onDragOver={e => e.preventDefault()}
                        draggable={cell <= 0}
                        correct={correctGrid.some(c => c[0] === rowIndex && c[1] === colIndex)}
                        hidden={false}
                    />
                )
            )}
        </div>
    )

}