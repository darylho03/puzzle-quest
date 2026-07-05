'use client';

import TopNav from './TopNav';
import PuzzleCard, { CategoryColor } from './PuzzleCard';
import MiniGrid from './MiniGrid';

interface Entry {
  title: string;
  to?: string;
  preview: React.ReactNode;
}

interface Category {
  title: string;
  color: CategoryColor;
  entries: Entry[];
}

const sudokuMiniValues = [
  [1, 2, 4],
  [9, 5, 7],
  [8, 3, 6],
];

const jigsawMiniValues = [
  [3, 2, 5],
  [7, 1, 4],
  [9, 6, 8],
];

const kropkiMiniValues = [
  [1, 7, 5],
  [2, 3, 8],
  [4, 6, 9],
];

const killerMiniValues = [
  [1, 2, 4],
  [9, 6, 7],
  [8, 3, 5],
];

const thermoMiniValues = [
  [1, 2, 4],
  [9, 5, 7],
  [8, 3, 6],
];

const nurikabeBlacks = [
  { row: 0, col: 2 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
];
const nurikabeValues: (number | null)[][] = [
  [null, 2, null],
  [null, null, null],
  [null, 3, null],
];

const kuromasuBlacks = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
];
const kuromasuValues: (number | null)[][] = [
  [1, null, 3],
  [null, null, null],
  [null, 4, null],
];

const CATEGORIES: Category[] = [
  {
    title: 'SUDOKU',
    color: 'sudoku',
    entries: [
      {
        title: 'Sudoku',
        to: '/sudoku',
        preview: <MiniGrid rows={3} cols={3} values={sudokuMiniValues} />,
      },
      {
        title: 'Jigsaw',
        to: '/jigsaw',
        preview: <MiniGrid rows={3} cols={3} values={jigsawMiniValues} />,
      },
      {
        title: 'Kropki',
        preview: <MiniGrid rows={3} cols={3} values={kropkiMiniValues} />,
      },
      {
        title: 'Killer',
        preview: <MiniGrid rows={3} cols={3} values={killerMiniValues} />,
      },
      {
        title: 'Thermo',
        preview: <MiniGrid rows={3} cols={3} values={thermoMiniValues} />,
      },
    ],
  },
  {
    title: 'NUMBER LOGIC',
    color: 'number',
    entries: [
      {
        title: 'Nurikabe',
        to: '/area',
        preview: (
          <MiniGrid
            rows={3}
            cols={3}
            values={nurikabeValues}
            blackCells={nurikabeBlacks}
          />
        ),
      },
      {
        title: 'Kurodoku',
        to: '/kurodoku',
        preview: (
          <MiniGrid
            rows={3}
            cols={3}
            values={kuromasuValues}
            blackCells={kuromasuBlacks}
          />
        ),
      },
      {
        title: 'Sweepminer',
        to: '/reverse-minesweeper',
        preview: <MiniGrid rows={3} cols={3} />,
      },
      {
        title: 'Puzzle',
        preview: <MiniGrid rows={3} cols={3} />,
      },
      {
        title: 'Puzzle',
        preview: <MiniGrid rows={3} cols={3} />,
      },
    ],
  },
  {
    title: 'SHAPE LOGIC',
    color: 'shape',
    entries: [
      {
        title: 'Yin-Yang',
        to: '/yin-yang',
        preview: <MiniGrid rows={3} cols={3} />,
      },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
    ],
  },
  {
    title: 'LINE LOGIC',
    color: 'line',
    entries: [
      {
        title: 'Queens',
        to: '/queens',
        preview: <MiniGrid rows={3} cols={3} />,
      },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
      { title: 'Puzzle', preview: <MiniGrid rows={3} cols={3} /> },
    ],
  },
];

export default function PuzzleHome() {
  return (
    <div className="pq-page">
      <TopNav activeTab="play" />
      <main className="pq-home">
        {CATEGORIES.map(cat => (
          <section className="pq-category" key={cat.title}>
            <h2 className="pq-category-title">{cat.title}</h2>
            <div className="pq-category-row">
              {cat.entries.map((entry, i) => (
                <PuzzleCard
                  key={`${cat.title}-${entry.title}-${i}`}
                  title={entry.title}
                  to={entry.to}
                  color={cat.color}
                  preview={entry.preview}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
