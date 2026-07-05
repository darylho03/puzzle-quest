'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  activeTab?: 'play' | 'quest';
}

export default function TopNav({ activeTab }: Props) {
  const pathname = usePathname();
  const inferredTab: 'play' | 'quest' =
    activeTab ?? (pathname?.startsWith('/quest') ? 'quest' : 'play');

  return (
    <header className="pq-topnav">
      <Link href="/" className="pq-logo">PUZZLE_QUEST</Link>

      <nav className="pq-tabs">
        <Link
          href="/"
          className={`pq-tab${inferredTab === 'play' ? ' is-active' : ''}`}
        >
          PLAY
        </Link>
        <Link
          href="/quest"
          className={`pq-tab${inferredTab === 'quest' ? ' is-active' : ''}`}
        >
          QUEST
        </Link>
      </nav>

      <button className="pq-menu" aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
