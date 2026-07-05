'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

export type CategoryColor = 'sudoku' | 'number' | 'shape' | 'line';

interface Props {
  title: string;
  to?: string;
  color: CategoryColor;
  preview: ReactNode;
}

export default function PuzzleCard({ title, to, color, preview }: Props) {
  const content = (
    <div className={`pq-card pq-card--${color}`}>
      <div className="pq-card-preview">{preview}</div>
      <div className="pq-card-title">{title}</div>
    </div>
  );

  if (!to) {
    return <div className="pq-card-wrap pq-card-wrap--disabled">{content}</div>;
  }

  return (
    <Link href={to} className="pq-card-wrap">
      {content}
    </Link>
  );
}
