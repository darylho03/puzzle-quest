interface Props {
    value: number | null;
    square: number;
    invalid: boolean;
    onClick: () => void;
    onRightClick?: () => void;
}

export default function RangeSquare(props: Props) {
    const { value, onClick, onRightClick } = props;
    return (
        <div
            className={`range-square range-color-${props.square}${props.invalid ? ' range-invalid' : ''}`}
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
