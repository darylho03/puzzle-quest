import { CssLayer } from './PuzzleSquare';

const BLACK = 'black';
const GRAY = '#BBBBBB';
const W = 2;

export function getSudokuTile(row: number, col: number): CssLayer {
  return {
    borders: {
      top:    { width: W, color: row % 3 === 0 ? BLACK : GRAY },
      bottom: { width: W, color: (row + 1) % 3 === 0 ? BLACK : GRAY },
      left:   { width: W, color: col % 3 === 0 ? BLACK : GRAY },
      right:  { width: W, color: (col + 1) % 3 === 0 ? BLACK : GRAY },
    },
  };
}
