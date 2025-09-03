'use client';

import { useState } from 'react';
import ReverseMinesweeperGrid from './ReverseMinesweeperGrid';
import puzzles from '../data/puzzles.json'
const GRID_SIZE = 10;
let ROW = 10;
let COL = 10;

export default function ReverseMinesweeper() {
    const [walls, setWalls] = useState<number[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    const [blocks, setBlocks] = useState<(number | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    const [values, setValues] = useState<(number | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));

    function handleOnClick(id: number) {
        const puzzle = puzzles.find((p: any) => p.id === id);
        if (!puzzle) return <div>Project not found</div>;
        ROW = puzzle.walls.length;
        COL = puzzle.walls[0].length;
        const newWalls: number[][] = Array(ROW).fill(null).map(() => Array(COL).fill(0));
        const newBlocks: (number | null)[][] = Array(ROW).fill(null).map(() => Array(COL).fill(0));
        const newValues: (number | null)[][] = Array(ROW).fill(null).map(() => Array(COL).fill(0));
        for (let i = 0; i < puzzle.walls.length; i++) {
            for (let j = 0; j < puzzle.walls[0].length; j++) {
                newWalls[i][j] = puzzle.walls[i][j] === " " ? 0 : 1;
                newBlocks[i][j] = puzzle.blocks[i][j] === " " ? null : Number(puzzle.blocks[i][j]);
                newValues[i][j] = puzzle.values[i][j] === " " ? null : Number(puzzle.values[i][j]);
            }
        }
        setWalls(newWalls);
        setBlocks(newBlocks);
        setValues(newValues);
    }

    return (
        <div className='reverse-minesweeper'>
            <h1>Reverse Minesweeper</h1>
            <label htmlFor="level-select">Select Puzzle Level: </label>
            <select
                id="level-select"
                onChange={e => handleOnClick(Number(e.target.value))}
                defaultValue={""}
                style={{ marginBottom: 16 }}
            >
                <option value="" disabled>Select a level</option>
                {puzzles.map((p: any) => (
                    <option key={p.id} value={p.id}>Puzzle {p.id}</option>
                ))}
            </select>
            <ReverseMinesweeperGrid 
                walls={walls}
                blocks={blocks}
                values={values}
            />
        </div>
    )
}