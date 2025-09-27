import { transcode } from 'buffer';
import { useState, useEffect, useRef } from 'react';

const colors = {
    '0': 'rgba(102, 102, 102, 1)',
    '1': 'rgb(165, 165, 255)',
    '2': 'rgb(168, 255, 168)',
    '3': 'rgba(255, 128, 125, 1)',
    '4': 'rgb(123, 123, 179)',
    '5': 'rgb(132, 91, 91)',
    '6': 'rgba(0, 194, 194, 1)',
    '7': 'rgba(73, 73, 73, 1)',
    '8': 'rgba(164, 164, 164, 1)',
    '9': 'rgba(255, 255, 255, 1)',
    '-1': 'rgb(90, 90, 0)',
    '-2': 'rgb(87, 0, 87)',
    '-3': 'rgba(0, 127, 130, 1)',
    '-4': 'rgb(132, 132, 76)',
    '-5': 'rgb(23, 164, 164)',
    '-6': 'rgba(255, 61, 61, 1)',
    '-7': 'rgb(182, 182, 182)',
    '-8': 'rgb(91, 91, 91)',
    '-9': 'rgb(0, 0, 0)',
};

const wallColors = {
    '0': '#BDBDBD', // empty
    '1': '#666666', // wall
    '2': '#222222', // wall 2
}

interface Props {
    mode?: string;
    wall: number;
    block: number[][] | null;
    value: number | null;
    operation: string[][] | null;
    blockType: number | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    draggable: boolean;
    correct: boolean;
    hidden: boolean;
}

export default function ReverseMinesweeperSquare(props: Props) {
    const { mode, wall, block, value, operation, blockType, onDragStart, onDrop, onDragOver, draggable, correct, hidden } = props;
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
            className={`reverse-minesweeper-square`}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onContextMenu={handleContextMenu}
            style={{
                width: 80,
                height: 80,
                fontSize: 40,
                position: 'relative',
                backgroundColor: wall ? wallColors[wall] : '#BDBDBD',
            }}
        >
            {/* Render block backgrounds as separate divs for extensibility */}
            {block && block.length > 0 && blockType === 0 && (
                <div
                    // className={`reverse-minesweeper-blocks-container${blockType < 0 ? ' zig-zag-box' : ''}`}
                    className={`reverse-minesweeper-blocks-container`}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        flexDirection: 'column', // stack rows vertically
                        borderRadius: blockType < 0 ? 20 : 20,
                        cursor: draggable ? 'move' : 'default',
                        overflow: 'hidden',
                        border: `2px solid`,
                        // background: blockType < 0 ? wallColors[String(-blockType)] : 'transparent',
                        // border: blockType < 0 ? '2px solid' : '2px solid',
                        // borderColor: blockType < 0 ? wallColors[String(-blockType)] : 'black',
                        // width: blockType < 0 ? '60px' : '60px',
                        // height: blockType < 0 ? '60px' : '60px',
                        // objectFit: blockType < 0 ? 'cover' : 'none',
                        // padding: blockType < 0 ? '6px' : '0px',
                        // boxSizing: 'border-box',
                        // mask: blockType < 0 ? `repeating-conic-gradient(from 63.43deg at 50% 3px, #0000 0 63.43deg, ${wallColors[String(-blockType)]} 0 50%) 6px -3px / 12px 100% intersect, repeating-conic-gradient(from -26.56deg at 3px, #0000 0 63.43deg, ${wallColors[String(-blockType)]} 0 50%) -3px 6px / 100% 12px` : 'none',
                        // WebkitMask: blockType < 0 ? `repeating-conic-gradient(from 63.43deg at 50% 3px, #0000 0 63.43deg, ${wallColors[String(-blockType)]} 0 50%) 6px -3px / 12px 100% intersect, repeating-conic-gradient(from -26.56deg at 3px, #0000 0 63.43deg, ${wallColors[String(-blockType)]} 0 50%) -3px 6px / 100% 12px` : 'none',
                    }}
                    draggable={draggable}
                >
                    {block.map((r, idx) => (
                        <div
                            key={idx}
                            className={`reverse-minesweeper-row`}
                            style={{
                                height: `${100 / block.length}%`,
                                display: 'flex',
                                flexDirection: 'row', // columns inside each row
                                width: '100%',
                                borderTop: idx > 0 ? '1px solid black' : 'none',
                                borderBottom: idx < block.length - 1 ? '1px solid black' : 'none',
                                boxSizing: 'border-box',
                            }}
                        >
                            {r.map((b, i) => (
                                <div
                                    key={i}
                                    className={`reverse-minesweeper-block-bg`}
                                    style={{
                                        background: colors[b],
                                        width: `${100 / r.length}%`,
                                        height: '100%',
                                        display: 'flex',
                                        fontSize: 15 - (mode === 'Value' ? 4 : 0),
                                        fontFamily: 'monospace',
                                        justifyContent: 'center',
                                        color: b < 0 ? 'white' : 'black',
                                        position: 'relative',
                                        borderLeft: i > 0 ? '1px solid black' : 'none',
                                        borderRight: i < r.length - 1 ? '1px solid black' : 'none',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {mode === 'Normal'
                                        ? (operation && operation[idx] && operation[idx][i] === '+' ? '' : operation && operation[idx] ? operation[idx][i] : '')
                                        : (
                                            operation && operation[idx]
                                                ? `${operation[idx][i] !== '+' ? operation[idx][i] : (b > 0 ? '+' : '')}${b < 0 ? `-${b * -1}` : `${b}`}`
                                                : `${b}`
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* Overlay the value, centered */}
                    {(
                        <span
                            className={`reverse-minesweeper-value ${correct ? 'correct' : ''}`}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                // zIndex: 2,
                                // Color is white if block value is negative
                                // color: (block && block.every(b => b < 0) ? (mode === "Value" ? '#76FFFF' : (correct ? '#00FF00' :'white')) : mode === "Value" ? '#760000' : (correct ? '#00FF00' : 'black')),
                                color: (block && block.every(r => r.every(b => b < 0)) ? (correct ? '#00FF00' : 'white') : (correct ? '#00FF00' : 'black')),
                                // textShadow: (block && block.every(b => b < 0) || correct)
                                //     ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                                //     : '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
                                WebkitTextStrokeWidth: block.length > 1 || block[0].length > 1 ? '1px' : '0',
                                WebkitTextStrokeColor: (block && block.every(r => r.every(b => b < 0)) || correct) ? 'black' : 'white',
                                pointerEvents: 'none',
                                fontSize: (String(value).length < 3 ? 32 : (String(value).length < 4 ? 28 : 24)),
                                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                                // fontSize: mode === 'Normal' ? "0.8em" : "0.5em"
                            }}
                        >
                            {/* {mode === 'Normal'
                                ? value
                                : block
                                    .map((b, index) => {
                                        // console.log(b);
                                        // console.log(operation[index]);
                                        let op = operation[index] !== '+' ? operation[index] : (b > 0 ? '+' : '');
                                        // let num = b < 0 ? `-${b * -1}` : `${b}`;
                                        let num = `${b}`;
                                        let sep = index < block.length - 1 ? '|' : '';
                                        return `${op}${num}${sep}`;
                                    })
                                    .join('')} */}
                            {value}
                        </span>
                    )}
                </div>
            )}
            {/* Render block backgrounds as separate divs for extensibility, ensure for wallbreaker that they appear inside of the SVG */}
            {block && block.length > 0 && blockType < 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        
                    }}
                    draggable={draggable}
                >
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="f1dd9480">
                        <path id="c975e88e" d="M28.9111 12.8369H10.748L19.8291 3.3916L28.9111 12.8369Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="891badfd" d="M49.5137 11.4922H31.1709L40.3418 0.761719L49.5137 11.4922Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="513147a4" d="M69.9355 12.8252H51.7725L60.8535 3.37988L69.9355 12.8252Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="24fdaabc" d="M68.876 29.4727V11.8438L77.917 20.6582L68.876 29.4727Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="28d1728c" d="M70.2432 49.4727V31.8438L79.2842 40.6582L70.2432 49.4727Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="ae757788" d="M68.876 69.4727V51.8438L77.917 60.6582L68.876 69.4727Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="6545e336" d="M51.7725 68.4912H69.9355L60.8545 77.9365L51.7725 68.4912Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="36c6c722" d="M31.2598 69.8252H49.4229L40.3418 79.2705L31.2598 69.8252Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="ded50d4a" d="M10.748 68.4912H28.9111L19.8301 77.9365L10.748 68.4912Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="a0bbc178" d="M11.8076 51.792V69.5244L2.10742 60.6582L11.8076 51.792Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="5281440c" d="M10.4404 31.792V49.5244L0.740234 40.6582L10.4404 31.792Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <path id="611b4901" d="M11.8076 11.792V29.5244L2.10742 20.6582L11.8076 11.792Z" fill={wallColors[-blockType]} stroke="black"></path>
                        <g id="09033e3f">
                        <rect id="52645a94" x="10.0732" y="11.1582" width="60.5385" height="59" rx="3.5" fill={wallColors[-blockType]} stroke="black"></rect>
                        </g>
                    </g>
                    </svg>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '55px',
                            height: '55px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            borderRadius: 20,
                            overflow: 'hidden',
                            zIndex: 2,
                            pointerEvents: 'auto',
                            border: `2px solid black`,
                        }}
                    >
                        {block.map((r, idx) => (
                            <div
                                key={idx}
                                className={`reverse-minesweeper-row`}
                                style={{
                                    height: `${100 / block.length}%`,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    borderTop: idx > 0 ? '1px solid black' : 'none',
                                    borderBottom: idx < block.length - 1 ? '1px solid black' : 'none',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {r.map((b, i) => (
                                    <div
                                        key={i}
                                        className={`reverse-minesweeper-block-bg`}
                                        style={{
                                            background: colors[b],
                                            width: `${100 / r.length}%`,
                                            height: '100%',
                                            display: 'flex',
                                            fontSize: 15 - (mode === 'Value' ? 4 : 0),
                                            fontFamily: 'monospace',
                                            justifyContent: 'center',
                                            color: b < 0 ? 'white' : 'black',
                                            position: 'relative',
                                            borderLeft: i > 0 ? '1px solid black' : 'none',
                                            borderRight: i < r.length - 1 ? '1px solid black' : 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        {mode === 'Normal'
                                            ? (operation && operation[idx] && operation[idx][i] === '+' ? '' : operation && operation[idx] ? operation[idx][i] : '')
                                            : (
                                                operation && operation[idx]
                                                    ? `${operation[idx][i] !== '+' ? operation[idx][i] : (b > 0 ? '+' : '')}${b < 0 ? `-${b * -1}` : `${b}`}`
                                                    : `${b}`
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                        {/* Overlay the value, centered */}
                        <span
                            className={`reverse-minesweeper-value ${correct ? 'correct' : ''}`}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: (block && block.every(r => r.every(b => b < 0)) ? (correct ? '#00FF00' : 'white') : (correct ? '#00FF00' : 'black')),
                                WebkitTextStrokeWidth: block.length > 1 || block[0].length > 1 ? '1px' : '0',
                                WebkitTextStrokeColor: (block && block.every(r => r.every(b => b < 0)) || correct) ? 'black' : 'white',
                                pointerEvents: 'none',
                                fontSize: (String(value).length < 3 ? 32 : (String(value).length < 4 ? 28 : 24)),
                                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            }}
                        >
                            {value}
                        </span>
                    </div>
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
                        fontSize: (value < 99 ? 32 : (value < 999 ? 28 : 24)),
                        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    }}
                >
                    {value}
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
                        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    }}
                    onClick={handleClosePopup}
                >
                    {blockType < 0 && <><span>Wall breaker</span><br /></>}
                    {block && (
                        <span>
                            Block: {
                                block.map((r, rowIdx) => (
                                    <span key={`row-${rowIdx}`}>
                                        {r.map((b, i) => (
                                            <span key={`block-${rowIdx}-${i}`}>
                                                {operation && operation[rowIdx] && operation[rowIdx][i] !== '+' ? operation[rowIdx][i] : (b > 0 ? '+' : '')}
                                                {b < 0 ? `-${b * -1}` : `${b}`}
                                                {i < r.length - 1 ? ' or ' : ''}  
                                            </span>
                                        ))}
                                        {<br />}{rowIdx < block.length - 1 && <>then </>}
                                    </span>
                                ))
                            }
                        </span>
                    )}
                    {value !== null && <span>Value: {hidden ? '?' : (value !== null ? value : 'N/A')}</span>}
                </div>
            )}
        </div>
    );
}