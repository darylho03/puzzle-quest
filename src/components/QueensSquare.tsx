
interface QueensSquareProps {
    value: number;
    region: number;
    onMouseDown?: () => void;
    onMouseEnter?: () => void;
    invalid: boolean;
}

export default function QueensSquare(props: QueensSquareProps) {
    const { value, region, onMouseDown, onMouseEnter, invalid } = props;
    return (
        <div 
            className={`square queens-square region-${region}`} 
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            style={{
                width: 80,
                height: 80,
                display: 'flex',
                userSelect: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 20,
                cursor: 'pointer',
            }}
        >
            {value === 1 && <img src="/dot.svg" alt="Dot" draggable={false} />}
            {value === 2 && !invalid && <img src="/queen.svg" alt="Queen" draggable={false} />}
            {value === 2 && invalid && <img src="/iqueen.svg" alt="Invalid Queen" draggable={false} />}
        </div>
    );
}

