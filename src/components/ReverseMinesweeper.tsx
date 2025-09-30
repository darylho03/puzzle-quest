'use client';

import { useState, useEffect } from 'react';
import { getUnlockedLevels } from '../firebaseUser';
import ReverseMinesweeperGrid from './ReverseMinesweeperGrid';
import puzzles from '../data/puzzles.json'
import puzzle_order from '../data/reverse_minesweeper_puzzle_order.json'
import Select from 'react-select';
import { useUser } from '../UserContext';

const GRID_SIZE = 5;
let ROW = 10;
let COL = 10;

function parseBlockInput(blocks: (string)[][], i: number, j: number): number[][] | null {
    const block = blocks[i][j];
    if (block === " ") return null;
    return block.split("&").map((b) => (b.split("|").map(Number)));
}

function parseOperationsInput(blocks: (string)[][], operations: (string)[][], i: number, j: number): string[][] | null {
    const operation = operations[i][j];
    // If the operation is empty, return a default operation with length equal to number of blocks
    if ((operation === " " && blocks[i][j])) return blocks[i][j].split("&").map((b) => (b.split("|").map(() => '+')));
    return operation.split("&").map((op) => op.split("|"));
}

export default function ReverseMinesweeper() {
    const { user, setUser } = useUser();
    const [walls, setWalls] = useState<number[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    const [blocks, setBlocks] = useState<(number[][] | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    const [values, setValues] = useState<(number | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    const [operations, setOperations] = useState<(string[][] | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    const [blockTypes, setBlockTypes] = useState<(number | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    const [mode, setMode] = useState<string>('Normal');

    function handleOnClick(name: string) {
        const puzzle = puzzles.find((p) => p.name !== undefined && p.name === name);
        if (!puzzle) return <div>Project not found</div>;
        ROW = puzzle.walls.length;
        COL = puzzle.walls[0].length;
        const newWalls: number[][] = Array(ROW).fill(null).map(() => Array(COL).fill(0));
        const newBlocks: (number[][] | null)[][] = Array(ROW).fill(null).map(() => Array(COL).fill(0));
        const newValues: (number | null)[][] = Array(ROW).fill(null).map(() => Array(COL).fill(0));
        const newOperations: (string[][] | null)[][] = Array(ROW).fill(null).map(() => Array(COL).fill(null));
        const newBlockTypes: (number | null)[][] = Array(ROW).fill(null).map(() => Array(COL).fill(null));

        for (let i = 0; i < puzzle.walls.length; i++) {
            for (let j = 0; j < puzzle.walls[0].length; j++) {
                newWalls[i][j] = puzzle.walls[i][j] === " " ? 0 : Number(puzzle.walls[i][j]);
                newBlocks[i][j] = parseBlockInput(puzzle.blocks, i, j);
                newValues[i][j] = puzzle.values[i][j] === " " ? null : Number(puzzle.values[i][j]);
                newOperations[i][j] = puzzle.operations ? parseOperationsInput(puzzle.blocks, puzzle.operations, i, j) : newBlocks[i][j] ? newBlocks[i][j].map((b) => b.map(() => '+')) : null;
                newBlockTypes[i][j] = puzzle.block_types ? (puzzle.block_types[i][j] === " " ? (newBlocks[i][j] !== null ? 0 : null) : Number(puzzle.block_types[i][j])) : newBlocks[i][j] !== null ? 0 : null;
            }
        }
        setWalls(newWalls);
        setBlocks(newBlocks);
        setValues(newValues);
        setOperations(newOperations);
        setBlockTypes(newBlockTypes);
    }

    // Track signed-in user (assume passed in as prop or managed globally)
    // const [user, setUser] = useState<any>(null);
    // Track unlocked level ids
    const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
    // Track selected option
    const [selectedOption, setSelectedOption] = useState<any>(null);



    // You should call getUnlockedLevels(user.uid) when user is available
    // Example:
    useEffect(() => {
      if (user) {
        console.log("Fetching unlocked levels for user:", user.uid);
        getUnlockedLevels(user.uid).then(setUnlockedLevels);
      }
    }, [user]);

    // Only show unlocked levels
    const options = puzzle_order.puzzles
        // .filter((p: { id: string }) => unlockedLevels.includes(p.id))
        .map((p: { id: string, name: string, difficulty: number }, idx: number) => ({
            value: p.name,
            label: `${p.id}: ${p.name}`,
            color: p.difficulty < 5 && ["green", "#ffe734", "red", "#bc00ac"][p.difficulty - 1],
            zIndex: 100,
            className: p.difficulty === 5 ? 'rainbow-text' : ''
        }));

    // Custom styles for React Select
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? state.data.color : state.isFocused ? '#eee' : undefined,
            color: state.data.className === "rainbow-text" ? undefined : (state.isSelected ? '#fff' : state.data.color),
            cursor: 'pointer',
            zIndex: 100
        }),
        singleValue: (provided: any, state: any) => ({
            ...provided,
            color: state.data.className === "rainbow-text" ? undefined : state.data.color,
        }),
    };

    // Helper to get current index
    const currentIndex = selectedOption ? options.findIndex(opt => opt.value === selectedOption.value) : -1;

    // Handlers for previous/next
    function goToLevel(idx: number) {
        if (idx >= 0 && idx < options.length) {
            setSelectedOption(options[idx]);
            handleOnClick(options[idx].value);
        }
    }

    function changeViewMode() {
        if (mode === "Normal") {
            setMode("Value");
        } else {
            setMode("Normal");
        }
    }

    return (
        <div className='reverse-minesweeper'>
            <h1>Sweepminer (Reverse Minesweeper)</h1>
            <label htmlFor="level-select">Select Puzzle Level: </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
                <button
                    type="button"
                    onClick={() => goToLevel(currentIndex > 0 ? currentIndex - 1 : 0)}
                    disabled={currentIndex <= 0}
                    style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: currentIndex <= 0 ? '#eee' : '#fff', cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer' }}
                >
                    Previous
                </button>
                <div style={{ width: 300 }}>
                    <Select
                        inputId="level-select"
                        options={options}
                        value={selectedOption}
                        onChange={option => {
                            setSelectedOption(option);
                            if (option) handleOnClick(option.value);
                        }}
                        formatOptionLabel={(option) => (
                            <span className={option.className}>{option.label}</span>
                        )}
                        placeholder="Select a level"
                        styles={customStyles}
                        isSearchable={false}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => goToLevel(currentIndex < options.length - 1 ? currentIndex + 1 : options.length - 1)}
                    disabled={currentIndex < 0 || currentIndex >= options.length - 1}
                    style={{ padding: '6px 12px', width: '120px', borderRadius: 4, border: '1px solid #ccc', background: currentIndex < 0 || currentIndex >= options.length - 1 ? '#eee' : '#fff', cursor: currentIndex < 0 || currentIndex >= options.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                    Next
                </button>
                {
                    <button
                        type="button"
                        onClick={() => changeViewMode()}
                        style={{ padding: '6px 12px', width: '120px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                    >
                        Mode: {mode}
                    </button>
                }
            </div>
            <ReverseMinesweeperGrid 
                level_id={selectedOption?.value}
                user_id={user?.uid}
                mode={mode}
                walls={walls}
                blocks={blocks}
                values={values}
                operations={operations}
                blockTypes={blockTypes}
            />
        </div>
    )
}