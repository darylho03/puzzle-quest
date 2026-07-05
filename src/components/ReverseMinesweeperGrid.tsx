'use client';

import { useState, useEffect } from 'react';
import ReverseMinesweeperSquare from './ReverseMinesweeperSquare';

export interface RMSnapshot {
    walls: number[][];
    blocks: (number[][] | null)[][];
    values: (number | "NaN" | null)[][];
    operations: (string[][] | null)[][];
    blockTypes: (number | null)[][];
    blockPlanes: (number | null)[][];
}

export interface RMAction {
    type: 'swap' | 'wallbreak';
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    snapshot: RMSnapshot;
    solved: boolean;
}

interface Props {
    mode?: string;
    walls: number[][];
    blocks: (number[][] | null)[][];
    values: (number | "NaN" | null)[][];
    operations: (string[][] | null)[][];
    blockTypes: (number | null)[][];
    blockPlanes: (number | null)[][];
    onAction?: (action: RMAction) => void;
    onSolvedChange?: (solved: boolean) => void;
}

function initializeCorrectness(blocks: (number[][] | null)[][], values: (number | "NaN" | null)[][], operations: (string[][] | null)[][]): [number[][], number[][], (number[] | null)[][]] {
    // console.log(`Initialize correctness`)
    let correct: number[][] = []
    let incorrect: number[][] = []
    let currentValues: (number[] | null)[][] = Array(values.length).fill(null).map(() => Array(values[0].length).fill(null).map(() => []));
    // console.log(operations);
    const dirs = [[0, 0],[-1, -1],[-1, 0],[-1, 1],[0, -1],[0, 1],[1, -1],[1, 0],[1, 1]];
    function backtrack(i: number, j: number, mines: number, index: number) {
        if (index === 9) {
            // console.log(`Checking cell (${i}, ${j}): found ${mines} mines, needs ${values[i][j]}`);
            if (values[i][j] === null) return;

            currentValues[i][j]?.push(mines);
            if (String(mines) === String(values[i][j])) {
                if (!correct.some(c => c[0] === i && c[1] === j)) {
                    correct.push([i, j]);
                }
            }
            return;
        }
        // if (values[i][j] === null) return;
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
                    if (isNaN(b)) return;
                    if (op === 'x') tempMines *= b;
                    else if (op === '/') tempMines /= b;
                    else if (op === '+') tempMines += b;
                    else if (op === '-') tempMines -= b;
                    else if (op === '^') tempMines = Math.pow(tempMines, b);
                    else if (op === '%') tempMines %= b;
                    else if (op === '=') tempMines = b;
                    else if (op === '←') tempMines = Math.min(tempMines, b);
                    else if (op === '→') tempMines = Math.max(tempMines, b);
                    else if (op === '√') tempMines = Math.pow(tempMines, 1 / b);
                    else if (op === '==' && tempMines !== b) incorrect.push([i, j]);
                    else if (op === '!=' && tempMines === b) incorrect.push([i, j]);
                    else if (op === '<' && tempMines >= b) incorrect.push([i, j]);
                    else if (op === '>' && tempMines <= b) incorrect.push([i, j]);
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

    // Sort each list of current values and remove duplicates
    for (let i = 0; i < currentValues.length; i++) {
        for (let j = 0; j < currentValues[0].length; j++) {
            if (currentValues[i][j] !== null) {
                // Sort and remove duplicates
                currentValues[i][j] = Array.from(new Set(currentValues[i][j])).sort((a, b) => a - b);
                // If list is empty, set to null
                if (currentValues[i][j].length === 0) currentValues[i][j] = null;
            }
        }
    }

    // Remove any cells without values from correct and incorrect
    correct = correct.filter(c => values[c[0]][c[1]] !== null);
    incorrect = incorrect.filter(inc => values[inc[0]][inc[1]] !== null);

    // Remove any incorrect cells from correct
    correct = correct.filter(c => !incorrect.some(inc => inc[0] === c[0] && inc[1] === c[1]));
    // Remove duplicates from incorrect
    incorrect = incorrect.filter((inc, idx) => idx === incorrect.findIndex(i => i[0] === inc[0] && i[1] === inc[1]));
    // console.log(`Incorrect cells: ${incorrect}`);
    // console.log(`Correct cells: ${correct}`);
    return [correct, incorrect, currentValues];
}

let ROWS = 10;
let COLS = 10;

function deepCopySnapshot(
    walls: number[][],
    blocks: (number[][] | null)[][],
    values: (number | "NaN" | null)[][],
    operations: (string[][] | null)[][],
    blockTypes: (number | null)[][],
    blockPlanes: (number | null)[][],
): RMSnapshot {
    return {
        walls: walls.map(r => [...r]),
        blocks: blocks.map(r => r.map(b => b ? b.map(row => [...row]) : null)),
        values: values.map(r => [...r] as (number | "NaN" | null)[]),
        operations: operations.map(r => r.map(o => o ? o.map(row => [...row]) : null)),
        blockTypes: blockTypes.map(r => [...r]),
        blockPlanes: blockPlanes.map(r => [...r]),
    };
}

export default function ReverseMinesweeperGrid(props: Props) {
    const [wallGrid, setWallGrid] = useState<number[][]>(
        props.walls
    );
    const [blockGrid, setBlockGrid] = useState<(number[][] | null)[][]>(
        props.blocks
    );
    const [valueGrid, setValueGrid] = useState<(number | "NaN" | null)[][]>(
        props.values
    );
    const [currentValues, setCurrentValues] = useState<(number[] | null)[][]>(
        Array(props.values.length).fill(null).map(() => Array(props.values[0].length).fill(null))
    );
    const [operationsGrid, setOperationsGrid] = useState<(string[][] | null)[][]>(
        props.operations
    );
    const [blockTypesGrid, setBlockTypesGrid] = useState<(number | null)[][]>(
        props.blockTypes
    );
    const [blockPlanesGrid, setBlockPlanesGrid] = useState<(number | null)[][]>(
        props.blockPlanes
    );
    // Grid of coordinates [i, j] that are correct
    const [correctGrid, setCorrectGrid] = useState<(number[][])>(
        []
    )
    const [incorrectGrid, setIncorrectGrid] = useState<(number[][])>(
        []
    )
    // Index of currently dragged cell
    const [draggedIdx, setDraggedIdx] = useState<number[] | null>(null)
    const [solved, setSolved] = useState<boolean>(false)

    useEffect(() => {
        const [newCorrectGrid, newIncorrectGrid, newCurrentValues] = initializeCorrectness(props.blocks, props.values, props.operations);
        setCorrectGrid(newCorrectGrid);
        setIncorrectGrid(newIncorrectGrid);
        setCurrentValues(newCurrentValues);
        let count = 0;
        for (let i = 0; i < props.values.length; i++) {
            for (let j = 0; j < props.values[0].length; j++) {
                if (props.values[i][j] !== null) count++;
            }
        }
        const isSolved = count > 0 && count === newCorrectGrid.length;
        setSolved(isSolved);
    }, [props.blocks, props.values]);

    useEffect(() => {
        props.onSolvedChange?.(solved);
    }, [solved, props.onSolvedChange]);

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
    useEffect(() => {
        setBlockPlanesGrid(props.blockPlanes);
    }, [props.blockPlanes]);

    function handleDragStart(idx: number[]) {
        if (blockGrid[idx[0]][idx[1]] !== null) {
            setDraggedIdx(idx);
        }
    }

    function handleDrop(idx: number[]) {
        if (draggedIdx === null || draggedIdx === idx || (valueGrid[idx[0]][idx[1]] !== null && blockGrid[idx[0]][idx[1]] === null && blockTypesGrid[draggedIdx[0]][draggedIdx[1]] === null) || (wallGrid[idx[0]][idx[1]] !== blockPlanesGrid[draggedIdx[0]][draggedIdx[1]] && (blockTypesGrid[draggedIdx[0]][draggedIdx[1]] === 0 || blockTypesGrid[draggedIdx[0]][draggedIdx[1]] !== wallGrid[idx[0]][idx[1]] * -1))) return;
        const newBlockGrid = [...blockGrid];
        const newValueGrid = [...valueGrid];
        const newWallGrid = [...wallGrid];
        const newOperationsGrid = [...operationsGrid];
        const newBlockTypesGrid = [...blockTypesGrid];
        const newBlockPlanesGrid = [...blockPlanesGrid];

        let isWallbreak = false;

        // Drag wallbreaker onto wall
        if (newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]] < 0 && newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]] * -1 === wallGrid[idx[0]][idx[1]]) {
            isWallbreak = true;
            newBlockGrid[idx[0]][idx[1]] = newBlockGrid[idx[0]][idx[1]] === null ? (newValueGrid[idx[0]][idx[1]] === null ? null : [[wallGrid[idx[0]][idx[1]] - 1]]) : newBlockGrid[idx[0]][idx[1]];
            newWallGrid[idx[0]][idx[1]] = newBlockPlanesGrid[draggedIdx[0]][draggedIdx[1]];
            newBlockGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newValueGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newOperationsGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]] = null;
            newOperationsGrid[idx[0]][idx[1]] = newOperationsGrid[idx[0]][idx[1]] === null ? (newBlockGrid[idx[0]][idx[1]] === null ? null : newBlockGrid[idx[0]][idx[1]].map((b) => (b.map(() => '+')))) : newOperationsGrid[idx[0]][idx[1]];
            newBlockTypesGrid[idx[0]][idx[1]] = newBlockTypesGrid[idx[0]][idx[1]] === null ? (newBlockGrid[idx[0]][idx[1]] === null ? null : 0) : newBlockTypesGrid[idx[0]][idx[1]];
            newBlockPlanesGrid[idx[0]][idx[1]] = newBlockPlanesGrid[draggedIdx[0]][draggedIdx[1]];
        } else {
            [newBlockGrid[draggedIdx[0]][draggedIdx[1]], newBlockGrid[idx[0]][idx[1]]] = [newBlockGrid[idx[0]][idx[1]], newBlockGrid[draggedIdx[0]][draggedIdx[1]]];
            [newValueGrid[draggedIdx[0]][draggedIdx[1]], newValueGrid[idx[0]][idx[1]]] = [newValueGrid[idx[0]][idx[1]], newValueGrid[draggedIdx[0]][draggedIdx[1]]];
            [newWallGrid[draggedIdx[0]][draggedIdx[1]], newWallGrid[idx[0]][idx[1]]] = [newWallGrid[idx[0]][idx[1]], newWallGrid[draggedIdx[0]][draggedIdx[1]]];
            [newOperationsGrid[draggedIdx[0]][draggedIdx[1]], newOperationsGrid[idx[0]][idx[1]]] = [newOperationsGrid[idx[0]][idx[1]], newOperationsGrid[draggedIdx[0]][draggedIdx[1]]];
            [newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]], newBlockTypesGrid[idx[0]][idx[1]]] = [newBlockTypesGrid[idx[0]][idx[1]], newBlockTypesGrid[draggedIdx[0]][draggedIdx[1]]];
            [newBlockPlanesGrid[draggedIdx[0]][draggedIdx[1]], newBlockPlanesGrid[idx[0]][idx[1]]] = [newBlockPlanesGrid[idx[0]][idx[1]], newBlockPlanesGrid[draggedIdx[0]][draggedIdx[1]]];
        }
        setBlockGrid(newBlockGrid);
        setValueGrid(newValueGrid);
        setWallGrid(newWallGrid);
        setOperationsGrid(newOperationsGrid);
        setBlockTypesGrid(newBlockTypesGrid);
        setBlockPlanesGrid(newBlockPlanesGrid);
        const [newCorrectGrid, newIncorrectGrid, newCurrentValues] = initializeCorrectness(newBlockGrid, newValueGrid, newOperationsGrid);
        setCorrectGrid(newCorrectGrid);
        setIncorrectGrid(newIncorrectGrid);
        setCurrentValues(newCurrentValues);

        let count = 0;
        for (let i = 0; i < newValueGrid.length; i++) {
            for (let j = 0; j < newValueGrid[0].length; j++) {
                if (newValueGrid[i][j] !== null) count++;
            }
        }
        const solvedNow = count === newCorrectGrid.length;
        setSolved(solvedNow);
        setDraggedIdx(null);

        if (props.onAction) {
            props.onAction({
                type: isWallbreak ? 'wallbreak' : 'swap',
                fromRow: draggedIdx[0],
                fromCol: draggedIdx[1],
                toRow: idx[0],
                toCol: idx[1],
                snapshot: deepCopySnapshot(newWallGrid, newBlockGrid, newValueGrid, newOperationsGrid, newBlockTypesGrid, newBlockPlanesGrid),
                solved: solvedNow,
            });
        }
    }

    return (
        <div
            className="reverse-minesweeper-grid"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${ROWS}, 64px)`,
                gridTemplateColumns: `repeat(${COLS}, 64px)`,
                gap: 2,
                background: solved ? '#3cff00ff' : '#000',
                padding: 10,
                width: COLS * 66
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
                        currentValue={currentValues[rowIndex][colIndex]}
                        operation={operationsGrid[rowIndex][colIndex]}
                        blockType={blockTypesGrid[rowIndex][colIndex]}
                        blockPlane={blockPlanesGrid[rowIndex][colIndex]}
                        onDragStart={() => handleDragStart([rowIndex, colIndex])}
                        onDrop={() => handleDrop([rowIndex, colIndex])}
                        onDragOver={e => e.preventDefault()}
                        draggable={cell === blockPlanesGrid[rowIndex][colIndex]}
                        correct={correctGrid.some(c => c[0] === rowIndex && c[1] === colIndex)}
                        incorrect={incorrectGrid.some(c => c[0] === rowIndex && c[1] === colIndex)}
                        hidden={false}
                    />
                )
            )}
        </div>
    )

}