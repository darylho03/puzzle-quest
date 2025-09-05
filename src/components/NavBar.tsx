'use client';

import { useState } from 'react';
import Card from './Card';

const PUZZLE_TABS = [
  {
    label: 'Sudoku',
    dropdown: [
      { label: 'Classic Sudoku', to: '/sudoku', img: '/sudoku.png', hover_img: '/sudoku-solved.png' },
    ],
  },
  {
    label: 'Queens',
    dropdown: [
      { label: 'Queens', to: '/queens', img: '/queens.png', hover_img: '/queens-solved.png' },
    ],
  },
  {
    label: 'Logic Grids',
    dropdown: [
      { label: 'Range (Kuromasu)', to: '/range', img: '/range.png', hover_img: '/range-solved.png' },
      { label: 'Area (Nurikabe)', to: '/area', img: '/area.png', hover_img: '/area-solved.png' },
    ],
  },
  {
    label: 'Daryl\'s Puzzles',
    dropdown: [
      { label: 'Reverse Minesweeper', to: '/reverse-minesweeper', img: '/reverse-minesweeper.png', hover_img: '/reverse-minesweeper-solved.png' },
    ],
  },
];

export default function NavBar() {
  const [openTab, setOpenTab] = useState<number | null>(null);

  const handleTabClick = (idx: number) => {
    setOpenTab(openTab === idx ? null : idx);
  };

  return (
    <div className="navbar">
      <ul className="navbar-tabs">
        {PUZZLE_TABS.map((tab, idx) => (
          <li className="navbar-tab" key={tab.label}>
            <button
              className={`navbar-tab-btn${openTab === idx ? ' active' : ''}`}
              onClick={() => handleTabClick(idx)}
              aria-expanded={openTab === idx}
            >
              {tab.label}
            </button>
            {openTab === idx && (
              <ul className="navbar-dropdown">
                {tab.dropdown.map((item) => (
                  <Card key={item.label} title={item.label} image={item.img} hover_image={item.hover_img} link={item.to} />
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}