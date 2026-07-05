import PuzzleSquare, { CssLayer } from './PuzzleSquare';

interface SudokuSquareProps {
  value: number | null;
  tlnotes: number[];
  isSelected: boolean;
  onClick: () => void;
  onChange: (value: number | null, tlnotes: number[] | null) => void;
  pencilMode: boolean;
  invalid: boolean;
  related: boolean;
  tile: CssLayer;
  selectedValue?: number | null;
  locked: boolean;
  cellSize: number;
  reveal?: boolean;
  hint?: boolean;
  solved?: boolean;
  logPrimary?: boolean;
  logHighlight?: boolean;
  logError?: boolean;
}

export default function SudokuSquare({
  value,
  tlnotes,
  isSelected,
  onClick,
  onChange,
  pencilMode,
  invalid,
  related,
  tile,
  selectedValue,
  locked,
  cellSize,
  reveal,
  hint,
  solved,
  logPrimary,
  logHighlight,
  logError,
}: SudokuSquareProps) {
  const hasRegionColor = !!tile.background;
  const isSameNumber = !!(value && selectedValue === value);

  const solvedClass = solved && !reveal && !hint ? ' solved' : '';
  const logClass = logPrimary ? ' log-primary' : logHighlight ? ' log-highlight' : logError ? ' log-error' : '';
  const highlightClassName = hasRegionColor
    ? `square sudoku-square${!value ? '-pencil-mode' : ''}${reveal ? ' reveal' : ''}${hint ? ' hint' : ''}${solvedClass}${logClass}`
    : `square sudoku-square${!value ? '-pencil-mode' : ''}${reveal ? ' reveal' : ''}${hint ? ' hint' : ''}${isSelected ? ' selected' : ''}${related ? ' related' : ''}${isSameNumber ? ' same-number' : ''}${solvedClass}${logClass}`;

  const highlightOverlays: CssLayer[] = [];
  if (reveal) {
    highlightOverlays.push({ background: 'rgba(255, 60, 60, 0.45)' });
  } else if (hint) {
    highlightOverlays.push({ background: 'rgba(255, 210, 60, 0.45)' });
  } else if (solved && hasRegionColor) {
    highlightOverlays.push({
      borders: {
        top: { width: 2.5, color: '#2a9d2a' },
        bottom: { width: 2.5, color: '#2a9d2a' },
        left: { width: 2.5, color: '#2a9d2a' },
        right: { width: 2.5, color: '#2a9d2a' },
      },
    });
  }
  if (!reveal && !hint && logPrimary && hasRegionColor) {
    highlightOverlays.push({ background: 'rgba(140, 140, 255, 0.4)' });
  } else if (!reveal && !hint && logHighlight && hasRegionColor) {
    highlightOverlays.push({ background: 'rgba(100, 160, 255, 0.4)' });
  } else if (!reveal && !hint && logError && hasRegionColor) {
    highlightOverlays.push({ background: 'rgba(255, 80, 80, 0.4)' });
  }
  if (!reveal && !hint && !logPrimary && !logHighlight && !logError && hasRegionColor) {
    if (isSameNumber) {
      highlightOverlays.push({ background: 'rgba(120, 120, 255, 0.45)' });
    } else if (isSelected) {
      highlightOverlays.push({ background: 'rgba(140, 140, 255, 0.4)' });
    } else if (related) {
      highlightOverlays.push({ background: 'rgba(160, 160, 255, 0.25)' });
    }
  }

  return (
    <PuzzleSquare
      cssBase={tile}
      cssOverlays={highlightOverlays}
      size={cellSize}
      className={highlightClassName}
      style={{
        fontSize: 20,
        cursor: locked ? 'default' : 'pointer',
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (locked) return;
        if (isSelected && pencilMode && !value) {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 9) {
            const next = tlnotes.includes(num)
              ? tlnotes.filter(n => n !== num)
              : [...tlnotes, num].sort();
            onChange(value, next);
          }
          if (e.key === 'Backspace' || e.key === 'Delete') {
            onChange(value, null);
          }
        } else if (isSelected && !pencilMode) {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 9 && num !== value) {
            onChange(num, tlnotes);
          }
          if (num >= 1 && num <= 9 && num === value) {
            onChange(null, tlnotes);
          }
          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            onChange(null, tlnotes);
          }
        }
      }}
      tabIndex={0}
    >
      {!value && tlnotes.map((note) => (
        <span key={note} className={`sudoku-square-tlnotes${note === selectedValue ? ' same-number' : ''}`}>{note}</span>
      ))}
      {value && <span className={`sudoku-square-value${invalid ? ' invalid' : ''}${locked ? ' locked' : ''}`}>{value ?? ''}</span>}
    </PuzzleSquare>
  );
}
