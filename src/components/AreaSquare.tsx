interface Props {
    value: number | null;
    square: number;
    onClick: () => void;
    onRightClick?: () => void;
}

export default function AreaSquare(props: Props) {
    const { value, square, onClick, onRightClick } = props;
    return (
        <div
            className={`area-square area-color-${square}`}
            style={{
                width: 80,
                height: 80,
                fontSize: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #000',
                cursor: 'pointer'
            }}
            onClick={onClick}
            onContextMenu={e => {
                e.preventDefault();
                if (onRightClick) onRightClick();
            }}
        >
            {value}
        </div>
    );
}
