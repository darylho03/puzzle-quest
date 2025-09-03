interface Props {
    value: number | null;
    square: number;
    onClick: () => void;
    onRightClick?: () => void;
}

export default function RangeSquare(props: Props) {
    const { value, onClick, onRightClick } = props;
    return (
        <div
            className={`range-square range-color-${props.square}`}
            style={{
                width: 80,
                height: 80,
                fontSize: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
