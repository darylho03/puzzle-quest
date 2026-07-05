'use client';

import { useEffect, useRef, useState } from 'react';
import { Coordinate } from '../puzzles/core/types';

export interface LogEntry {
  id: number;
  label: string;
  actionType?: 'place' | 'replace' | 'delete';
  row: number;
  col: number;
  value: number | null;
  previousValue: number | null;
  errors?: string[];
  details?: string[];
  relatedCoords?: Coordinate[];
  errorCoords?: Coordinate[];
}

interface Props {
  entries: LogEntry[];
  onRevert?: (id: number) => void;
  selectedLogId?: number | null;
  onLogClick?: (id: number) => void;
}

export default function LogsSidebar({ entries, onRevert, selectedLogId, onLogClick }: Props) {
  const [openErrors, setOpenErrors] = useState<Set<number>>(new Set());
  const [openDetails, setOpenDetails] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [entries.length]);

  const toggle = (id: number) => {
    setOpenErrors(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleDetails = (id: number) => {
    setOpenDetails(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <aside className="pq-sidebar pq-sidebar--logs">
      <h3 className="pq-sidebar-title">LOGS</h3>
      <div className="pq-sidebar-list" ref={listRef}>
        {entries.length === 0 && (
          <div className="pq-log pq-log--empty">No actions yet.</div>
        )}
        {entries.map(entry => {
          const hasErrors = entry.errors && entry.errors.length > 0;
          const isErrorOpen = openErrors.has(entry.id);
          const hasDetails = entry.details && entry.details.length > 0;
          const isDetailOpen = openDetails.has(entry.id);
          const isSelected = selectedLogId === entry.id;
          return (
            <div className={`pq-log-group${isSelected ? ' pq-log-group--selected' : ''}`} key={entry.id}>
              <div
                className="pq-log"
                onClick={() => onLogClick?.(entry.id)}
                style={{ cursor: onLogClick ? 'pointer' : undefined }}
              >
                <span className="pq-log-label">
                  {entry.actionType === 'delete' ? (
                    <><span className="pq-log-deleted-value">{entry.label.split(' (')[0]}</span>{' ('}{entry.label.split(' (').slice(1).join(' (')}</>
                  ) : entry.label}
                </span>
                {onRevert && entry.actionType && (
                  <button
                    className="pq-log-revert"
                    onClick={(e) => { e.stopPropagation(); onRevert(entry.id); }}
                    title="Revert to this state"
                    aria-label={`Revert to state after: ${entry.label}`}
                  >
                    &#x21A9;
                  </button>
                )}
              </div>
              {hasErrors && (
                <button
                  className="pq-log-error-toggle"
                  onClick={(e) => { e.stopPropagation(); toggle(entry.id); }}
                  aria-expanded={isErrorOpen}
                >
                  <span className="pq-log-error-badge">!</span>
                  <span className="pq-log-error-count">
                    {entry.errors!.length} {entry.errors!.length === 1 ? 'Error' : 'Errors'}
                  </span>
                  <span className={`pq-log-chevron${isErrorOpen ? ' is-open' : ''}`}>v</span>
                </button>
              )}
              {hasErrors && isErrorOpen && (
                <ul className="pq-log-errors">
                  {entry.errors!.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              {hasDetails && (
                <button
                  className="pq-log-detail-toggle"
                  onClick={(e) => { e.stopPropagation(); toggleDetails(entry.id); }}
                  aria-expanded={isDetailOpen}
                >
                  <span className="pq-log-detail-badge">i</span>
                  <span className="pq-log-detail-count">Details</span>
                  <span className={`pq-log-chevron${isDetailOpen ? ' is-open' : ''}`}>v</span>
                </button>
              )}
              {hasDetails && isDetailOpen && (
                <ul className="pq-log-details">
                  {entry.details!.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
