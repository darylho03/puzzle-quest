import { useState, useEffect, useRef } from 'react';

interface Props {
    wall: number;
    block: number | null;
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
        >
            {block !== null && <div
                className={`reverse-minesweeper-block block-value-${block < 0 ? `minus-${block * -1}` : block}`}
                draggable={draggable}
                onContextMenu={handleContextMenu}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 25,
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
                    Block value: {`${block < 0 ? `-${block * -1}` : `+${block}`}`}
                </div>
            )}
        </div>
    );
}