
'use client';

import { useState, useContext } from 'react';
import { UserContext } from '../UserContext';
import { signInWithGoogle } from '../firebaseUser';
import Card from './Card';

const PUZZLE_TABS = [
  {
    label: 'Daryl\'s Puzzles',
    dropdown: [
      { label: 'Sweepminer (Reverse Minesweeper)', to: '/reverse-minesweeper', img: '/reverse-minesweeper.png', hover_img: '/reverse-minesweeper-solved.png' },
    ],
  },
  {
    label: 'Daryl\'s Recreations',
    dropdown: [
      { label: 'Classic Sudoku', to: '/sudoku', img: '/sudoku.png', hover_img: '/sudoku-solved.png' },
      { label: 'Queens', to: '/queens', img: '/queens.png', hover_img: '/queens-solved.png' },
      { label: 'Range (Kuromasu)', to: '/range', img: '/range.png', hover_img: '/range-solved.png' },
      { label: 'Area (Nurikabe) [Unfinished]', to: '/area', img: '/area.png', hover_img: '/area-solved.png' },
      { label: 'Yin-Yang', to: '/yin-yang', img: '/yin-yang.png', hover_img: '/yin-yang-solved.png' },
    ],
  }
];

export default function NavBar() {
  const [openTab, setOpenTab] = useState<number | null>(null);
  const context = useContext(UserContext);
  const user = context?.user;
  const setUser = context?.setUser;

  const handleTabClick = (idx: number) => {
    const newOpenTab = openTab === idx ? null : idx;
    setOpenTab(newOpenTab);
  };

  const handleSignIn = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (err) {
      alert('Sign in failed');
    }
  };

  return (
    <div className="navbar">
      <ul className="navbar-tabs">
        {PUZZLE_TABS.map((tab, idx) => (
          <li className="navbar-tab" key={tab.label}>
            <button
              className={`navbar-tab-btn${openTab !== null && openTab === idx ? ' active' : ''}`}
              onClick={() => handleTabClick(idx)}
              aria-expanded={openTab === idx}
            >
              {tab.label}
            </button>
            {openTab === idx && (
              <ul className="navbar-dropdown"
                style={{
                    gridTemplateColumns: `repeat(${Math.floor(tab.dropdown.length / 2)}, 1fr)`,
                }}
              >
                {tab.dropdown.map((item) => (
                  <Card
                    key={item.label}
                    title={item.label}
                    image={item.img}
                    hover_image={item.hover_img}
                    link={item.to}
                    onClick={() => handleTabClick(null)}
                  />
                ))}
              </ul>
            )}
          </li>
        ))}
        {/* <button onClick={handleSignIn} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
          {user ? `Signed in as ${user.displayName}` : 'Sign in with Google'}
        </button> */}
      </ul>
    </div>
  );
}