interface Props {
    wall: number;
    block: number | null;
    value: number | null;
    onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDrop: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLButtonElement>) => void;
    draggable: boolean;
    correct: boolean;
}

export default function ReverseMinesweeperSquare(props: Props) {
    const { wall, block, value, onDragStart, onDrop, onDragOver, draggable, correct } = props;
    return (
        <button
            className={`reverse-minesweeper-square wall-${wall}`}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
            draggable={draggable}
            style={{
                width: 80,
                height: 80,
                fontSize: 40,
                cursor: 'pointer',
            }}
            
        >
            {block && <div
                className={`reverse-minesweeper-block block-value-${block}`}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {value && <span className={`reverse-minesweeper-value ${correct ? "correct" : ""}`}>{value}</span>}
            </div>}
            {!block && value && <span className={`reverse-minesweeper-value ${correct ? "correct" : ""}`}>{value}</span>}
        </button>

    )
}