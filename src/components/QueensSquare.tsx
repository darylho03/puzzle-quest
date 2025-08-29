
export interface QueensSquareProps {
    value: number;
    region: number;
    onMouseDown?: () => void;
    onMouseEnter?: () => void;
    invalid: boolean;
}

export default function QueensSquare(props: QueensSquareProps) {
    const { value, region, onMouseDown, onMouseEnter, invalid } = props;
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
            {value === 2 && !invalid && <img src="/queen.svg" alt="Queen" draggable={false} />}
            {value === 2 && invalid && <img src="/iqueen.svg" alt="Invalid Queen" draggable={false} />}
        </button>
    );
}

