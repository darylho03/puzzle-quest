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
}

interface Props {
    wall: number;
    block: number[] | null;
    value: number | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    draggable: boolean;
    correct: boolean;
    hidden: boolean;
}

export default function ReverseMinesweeperSquare(props: Props) {
    const { wall, block, value, onDragStart, onDrop, onDragOver, draggable, correct, hidden } = props;
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
            style={{
                width: 80,
                height: 80,
                fontSize: 40,
            }}
        > { block && block.length > 0 && <div
                className={`reverse-minesweeper-block`}
                draggable={draggable}
                onContextMenu={handleContextMenu}
                style={{
                    background: block && block.length > 0
                        ? (block.length === 1
                            ? colors[block[0]]
                            : `linear-gradient(to right, ${block
                                .map((b, i) => {
                                    const percentStart = Math.round((i / block.length) * 100);
                                    const percentEnd = Math.round(((i + 1) / block.length) * 100);
                                    return `${colors[b]} ${percentStart}%, ${colors[b]} ${percentEnd}%`;
                                })
                                .join(', ')})`
                            )
                        : undefined,
                    color: block && block.length > 0 && block[0] < 0 ? 'white' : 'black',
                    width: 60,
                    height: 60,
                    borderRadius: 20,
                    border: `2px solid black`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: `${draggable ? 'move' : 'default'}`,
                    }}
            >
            
            {value !== null && <span className={`reverse-minesweeper-value ${correct ? "correct" : ""}`}>{hidden ? "?" : value}</span>}
            </div>}

            {block === null && value !== null && <span className={`reverse-minesweeper-value ${correct ? "correct" : ""}`}>{hidden ? "?" : value}</span>}
            {popup && (
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
                    Block value: {block.map((b, index) => (
                        <span key={index}>{b < 0 ? `-${b * -1}` : `+${b}`}{index < block.length - 1 ? ', ' : ''}</span>
                    ))}
                </div>
            )}
        </div>
    );
}