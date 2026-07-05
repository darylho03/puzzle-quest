import PuzzleSquare, { CssLayer } from './PuzzleSquare';

const CELL_COLORS: Record<number, string> = {
  0: '#BDBDBD',
  1: '#000000',
  2: '#FFFFFF',
};

interface KurodokuSquareProps {
  cellState: number; // 0=blank, 1=black, 2=white
  clueValue: number | null;
  tile: CssLayer;
  isSelected: boolean;
  related: boolean;
  invalid: boolean;
  reveal?: boolean;
  hint?: boolean;
  solved?: boolean;
  logPrimary?: boolean;
  logHighlight?: boolean;
  logError?: boolean;
  cellSize: number;
  onClick: () => void;
  onRightClick: () => void;
}

export default function KurodokuSquare({
  cellState,
  clueValue,
  tile,
  isSelected,
  related,
  invalid,
  reveal,
  hint,
  solved,
  logPrimary,
  logHighlight,
  logError,
  cellSize,
  onClick,
  onRightClick,
}: KurodokuSquareProps) {
  const baseLayer: CssLayer = {
    ...tile,
    background: CELL_COLORS[cellState] ?? CELL_COLORS[0],
  };

  const highlightOverlays: CssLayer[] = [];
  if (invalid) {
    highlightOverlays.push({
      borders: {
        top: { width: 3, color: 'red' },
        bottom: { width: 3, color: 'red' },
        left: { width: 3, color: 'red' },
        right: { width: 3, color: 'red' },
      },
    });
  }
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
  } else if (solved) {
    highlightOverlays.push({
      borders: {
        top: { width: 2.5, color: '#2a9d2a' },
        bottom: { width: 2.5, color: '#2a9d2a' },
        left: { width: 2.5, color: '#2a9d2a' },
        right: { width: 2.5, color: '#2a9d2a' },
      },
    });
  }
  if (!reveal && !hint) {
    if (logPrimary) {
      highlightOverlays.push({ background: 'rgba(140, 140, 255, 0.4)' });
    } else if (logHighlight) {
      highlightOverlays.push({ background: 'rgba(100, 160, 255, 0.4)' });
    } else if (logError) {
      highlightOverlays.push({ background: 'rgba(255, 80, 80, 0.4)' });
    } else if (isSelected) {
      highlightOverlays.push({ background: 'rgba(140, 140, 255, 0.4)' });
    } else if (related) {
      highlightOverlays.push({ background: 'rgba(160, 160, 255, 0.25)' });
    }
  }

  const fontSize = Math.floor(cellSize * 0.55);
  const textColor = cellState === 1 ? '#fff' : '#000';

  return (
    <PuzzleSquare
      cssBase={baseLayer}
      cssOverlays={highlightOverlays}
      size={cellSize}
      className="square kurodoku-square"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onContextMenu={(e) => { e.preventDefault(); onRightClick(); }}
      tabIndex={0}
    >
      {clueValue && (
        <span style={{ fontSize, fontWeight: 'bold', color: textColor, userSelect: 'none' }}>
          {clueValue}
        </span>
      )}
    </PuzzleSquare>
  );
}
