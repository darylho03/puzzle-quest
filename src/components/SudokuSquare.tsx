interface SudokuSquareProps {
  value: number | null;
  tlnotes: number[];
  isSelected: boolean;
  onClick: () => void;
  onChange: (value: number | null, tlnotes: number[] | null) => void;
  pencilMode: boolean;
  invalid: boolean;
  related: boolean;
  sameNumber: boolean;
  borderClass: string;
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
  sameNumber,
  borderClass,
}: SudokuSquareProps) {
  return (
    <button
      className={`sudoku-square${!value ? '-pencil-mode' : ''}${isSelected ? ' selected' : ''}${related ? ' related' : ''}${sameNumber ? ' same-number' : ''}${borderClass ? ` ${borderClass}` : ''}`}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        fontSize: 20,
        cursor: 'pointer',
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (isSelected && pencilMode && !value) {
          const num = parseInt(e.key, 10);
            if (num >= 1 && num <= 9) {
              if (!tlnotes.includes(num)) {
                tlnotes.push(num);
              } else {
                const index = tlnotes.indexOf(num);
                if (index > -1) {
                  tlnotes.splice(index, 1);
                }
              }
              tlnotes.sort();
              onChange(value, tlnotes); // Trigger re-render
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
    >
      {!value && tlnotes.map((note) => (
        <span key={note} className="sudoku-square-tlnotes">{note}</span>
      ))}
      {value && <span className={`sudoku-square-value${invalid ? ' invalid' : ''}`}>{value ?? ''}</span>}
    </button>
  );
}