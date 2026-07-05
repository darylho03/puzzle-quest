'use client';

import { ReactNode } from 'react';

type Cell = number | string | null;

interface Props {
  rows: number;
  cols: number;
  values?: (Cell | ReactNode)[][];
  blackCells?: { row: number; col: number }[];
  /** Indices of the columns where a thicker box border is drawn on the right of that column. */
  boxColLines?: number[];
  /** Indices of the rows where a thicker box border is drawn at the bottom of that row. */
  boxRowLines?: number[];
}

export default function MiniGrid({
  rows,
  cols,
  values,
  blackCells = [],
  boxColLines = [],
  boxRowLines = [],
}: Props) {
  return (
    <div
      className="pq-mini-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const isBlack = blackCells.some(b => b.row === r && b.col === c);
          const v = values?.[r]?.[c];
          const classes = [
            'pq-mini-cell',
            isBlack ? 'pq-mini-cell--black' : '',
            boxColLines.includes(c) ? 'pq-mini-cell--bcol' : '',
            boxRowLines.includes(r) ? 'pq-mini-cell--brow' : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={`${r}-${c}`} className={classes}>
              {!isBlack && v !== null && v !== undefined ? v : ''}
            </div>
          );
        })
      )}
    </div>
  );
}
