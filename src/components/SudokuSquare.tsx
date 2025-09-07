interface SudokuSquareProps {
  value: number | null;
  tlnotes: number[];
  isSelected: boolean;
  onClick: () => void;
  onChange: (value: number | null, tlnotes: number[] | null) => void;
  pencilMode: boolean;
  invalid: boolean;
  related: boolean;
  borderClass: string;
  selectedValue?: number | null;
  locked: boolean;
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
  borderClass,
  selectedValue,
  locked,
}: SudokuSquareProps) {
  return (
    <button
      className={`square sudoku-square${!value ? '-pencil-mode' : ''}${isSelected ? ' selected' : ''}${related ? ' related' : ''}${value && selectedValue === value ? ' same-number' : ''}${borderClass ? ` ${borderClass}` : ''}`}
      onClick={onClick}
      style={{
        width: 80,
        height: 80,
        fontSize: 20,
        cursor: locked ? 'default' : 'pointer',
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (locked) return; // Prevent changes if the cell is locked
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
        <span key={note} className={`sudoku-square-tlnotes${note === selectedValue ? ' same-number' : ''}`}>{note}</span>
      ))}
      {value && <span className={`sudoku-square-value${invalid ? ' invalid' : ''}${locked ? ' locked' : ''}`}>{value ?? ''}</span>}
    </button>
  );
}