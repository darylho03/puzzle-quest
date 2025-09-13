import { useState, useEffect, useRef } from 'react';

const colors = {
    '0': 'rgba(102, 102, 102, 1)',
    '1': 'rgb(165, 165, 255)',
    '2': 'rgb(168, 255, 168)',
    '3': 'rgba(255, 128, 125, 1)',
    '4': 'rgb(123, 123, 179)',
    '5': 'rgb(123, 67, 67)',
    '6': 'rgba(0, 194, 194, 1)',
    '7': 'rgba(73, 73, 73, 1)',
    '8': 'rgba(164, 164, 164, 1)',
    '9': 'rgba(255, 255, 255, 1)',
    '-1': 'rgb(90, 90, 0)',
    '-2': 'rgb(87, 0, 87)',
    '-3': 'rgba(0, 127, 130, 1)',
    '-4': 'rgb(132, 132, 76)',
    '-5': 'rgb(132, 188, 188)',
    '-6': 'rgba(255, 61, 61, 1)',
    '-7': 'rgb(182, 182, 182)',
    '-8': 'rgb(91, 91, 91)',
    '-9': 'rgb(0, 0, 0)',
};

interface Props {
    wall: number;
    block: number[] | null;
    value: number | null;
    operation: string[] | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    draggable: boolean;
    correct: boolean;
    hidden: boolean;
}

export default function ReverseMinesweeperSquare(props: Props) {
    const { wall, block, value, operation, onDragStart, onDrop, onDragOver, draggable, correct, hidden } = props;
    const [popup, setPopup] = useState<{ x: number, y: number } | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    function handleContextMenu(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        setPopup({ x: e.clientX, y: e.clientY });
    }

    function handleClosePopup() {
        setPopup(null);
    }

    useEffect(() => {
        if (!popup) return;
        function handleClickOutside(e: MouseEvent) {
            if (popupRef.current && popupRef.current.contains(e.target as Node)) {
                // Click inside the popup, do nothing
                return;
            }
            setPopup(null);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popup]);

    return (
        <div
            className={`reverse-minesweeper-square wall-${wall}`}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onContextMenu={handleContextMenu}
            style={{
                width: 80,
                height: 80,
                fontSize: 40,
                position: 'relative',
            }}
        >
            {/* Render block backgrounds as separate divs for extensibility */}
            {block && block.length > 0 && (
                <div
                    className={`reverse-minesweeper-blocks-container${wall === 2 ? ' zig-zag-box' : ''}`}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        flexDirection: 'row',
                        borderRadius: wall === 2 ? 20 : 20,
                        background: wall === 2 ? 'black' : 'transparent',
                        borderColor: wall === 2 ? 'black' : 'black',
                        border: wall === 2 ? '2px solid' : '2px solid',
                        overflow: 'hidden',
                        cursor: draggable ? 'move' : 'default',
                    }}
                    draggable={draggable}
                >
                    {block.map((b, i) => (
                        <div
                            key={i}
                            className={`reverse-minesweeper-block-bg`}
                            style={{
                                background: colors[b],
                                width: `${100 / block.length}%`,
                                height: '100%',
                                display: 'flex',
                                fontSize: 15,
                                fontFamily: 'monospace',
                                justifyContent: 'center',
                                color: b < 0 ? 'white' : 'black',
                                position: 'relative',
                            }}
                        >
                            {operation && (operation[i] === '+' ? ' ' : operation[i])}
                        </div>
                    ))}
                    {/* Overlay the value, centered */}
                    {value !== null && (
                        <span
                            className={`reverse-minesweeper-value ${correct ? 'correct' : ''}`}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                // zIndex: 2,
                                // Color is white if block value is negative
                                color: correct ? 'rgb(60, 255, 0)' : (block && block.every(b => b < 0) ? 'white' : 'black'),
                                pointerEvents: 'none',
                                fontSize: value < 99 ? 28 : (value < 999 ? 24 : 20)
                            }}
                        >
                            {hidden ? '?' : value}
                        </span>
                    )}
                </div>
            )}
            {/* If no block, just show the value centered */}
            {block === null && value !== null && (
                <span
                    className={`reverse-minesweeper-value ${correct ? 'correct' : ''}`}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        // zIndex: 2,
                        fontSize: value < 99 ? 28 : (value < 999 ? 24 : 20)
                    }}
                >
                    {hidden ? '?' : value}
                </span>
            )}
            {/* Popup for block info */}
            {popup && (value || block) && (
                <div
                    ref={popupRef}
                    style={{
                        position: 'fixed',
                        left: popup.x,
                        top: popup.y,
                        background: '#fff',
                        border: '1px solid #333',
                        borderRadius: 8,
                        padding: '8px 16px',
                        zIndex: 2000,
                        fontSize: 16,
                    }}
                    onClick={handleClosePopup}
                >
                    {wall === 2 && <><span>Wall breaker</span><br /></>}
                    {block && <span>Block: {block.map((b, index) => (
                        <span key={index}>{operation[index] ? operation[index] : (b > 0 ? `+` : ``)}{b < 0 ? `-${b * -1}` : `${b}`}{index < block.length - 1 ? ' or ' : ''}</span>
                    ))}<br /></span>}
                    {value !== null && <span>Value: {hidden ? '?' : (value !== null ? value : 'N/A')}</span>}
                </div>
            )}
        </div>
    );
}