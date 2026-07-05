import PuzzleSquare, { CssLayer } from './PuzzleSquare';

interface QueensSquareProps {
  value: number; // 0=empty, 1=dot, 2=queen
  tile: CssLayer;
  isSelected: boolean;
  related: boolean;
  invalid: boolean;
  reveal?: boolean;
  hint?: boolean;
  cellSize: number;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

export default function QueensSquare({
  value,
  tile,
  isSelected,
  related,
  invalid,
  reveal,
  hint,
  cellSize,
  onMouseDown,
  onMouseEnter,
}: QueensSquareProps) {
  const highlightOverlays: CssLayer[] = [];
  if (reveal) {
    highlightOverlays.push({
      background: 'rgba(255, 60, 60, 0.45)',
      borders: {
        top: { width: 2, color: 'rgba(220, 40, 40, 0.8)' },
        bottom: { width: 2, color: 'rgba(220, 40, 40, 0.8)' },
        left: { width: 2, color: 'rgba(220, 40, 40, 0.8)' },
        right: { width: 2, color: 'rgba(220, 40, 40, 0.8)' },
      },
    });
  } else if (hint) {
    highlightOverlays.push({
      background: 'rgba(255, 210, 60, 0.45)',
      borders: {
        top: { width: 2, color: 'rgba(200, 160, 20, 0.8)' },
        bottom: { width: 2, color: 'rgba(200, 160, 20, 0.8)' },
        left: { width: 2, color: 'rgba(200, 160, 20, 0.8)' },
        right: { width: 2, color: 'rgba(200, 160, 20, 0.8)' },
      },
    });
  } else if (isSelected) {
    highlightOverlays.push({ background: 'rgba(140, 140, 255, 0.4)' });
  } else if (related) {
    highlightOverlays.push({ background: 'rgba(160, 160, 255, 0.25)' });
  }

  const iconSize = Math.floor(cellSize * 0.6);

  return (
    <PuzzleSquare
      cssBase={tile}
      cssOverlays={highlightOverlays}
      size={cellSize}
      className="square queens-square-new"
      style={{ cursor: 'pointer' }}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(); }}
      onMouseEnter={() => onMouseEnter()}
      tabIndex={0}
    >
      {value === 1 && (
        <img src="/dot.svg" alt="Dot" draggable={false} width={iconSize} height={iconSize} />
      )}
      {value === 2 && !invalid && (
        <img src="/queen.svg" alt="Queen" draggable={false} width={iconSize} height={iconSize} />
      )}
      {value === 2 && invalid && (
        <img src="/iqueen.svg" alt="Invalid Queen" draggable={false} width={iconSize} height={iconSize} />
      )}
    </PuzzleSquare>
  );
}
