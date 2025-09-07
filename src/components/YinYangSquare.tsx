interface Props {
    value: number;
    locked: boolean;
    onClick: () => void;
    onRightClick: () => void;
}

export default function YinYangSquare(props: Props) {
    const { value, locked, onClick, onRightClick } = props;
    return (
        <div className={`square yin-yang-square${locked ? ' locked' : ''}`}
            onClick={onClick}
            onContextMenu={(e) => {
                e.preventDefault();
                onRightClick();
            }}
            style={{
                width: 80,
                height: 80,
                background: '#BDBDBD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #000',
                cursor: locked ? 'not-allowed' : 'pointer'
            }}
        >
            <div style={{
                width: '75%',
                height: '75%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: value === 1 ? '#000' : value === 2 ? '#fff' : 'transparent',
                borderRadius: '100%'
            }}>
                {locked && <span style={{ backgroundColor: '#BDBDBD', width: '10%', height: '10%', borderRadius: '100%' }}></span>}
            </div>
        </div>
    );
}