
export interface QueensSquareProps {
    value: number;
    region: number;
    onMouseDown?: () => void;
    onMouseEnter?: () => void;
}

export default function QueensSquare(props: QueensSquareProps) {
    const { value, region, onMouseDown, onMouseEnter } = props;
    return (
        <button 
            className={`queens-square region-${region}`} 
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            style={{
                width: 80,
                height: 80,
                fontSize: 20,
                cursor: 'pointer',
            }}
        >
            {value === 1 && <img src="/dot.svg" alt="Dot" draggable={false} />}
            {value === 2 && <img src="/queen.svg" alt="Queen" draggable={false} />}
        </button>
    );
}

