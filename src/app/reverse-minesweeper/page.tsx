import ReverseMinesweeper from '../../components/ReverseMinesweeper';

export default function HomePage() {
    return (
        <div className="app">
            <ReverseMinesweeper />
            <div className="description" style={{
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            }}>
                <p>Reverse Minesweeper Rules:</p>
                <p>Drag and drop mines while following these rules:</p>
                <ul>
                    <li>All numbers must see the correct number of mines in their cell and their adjacent cells (orthogonally and diagonally).</li>
                </ul>
                <p>All levels are unlocked, but I still recommend looking at the worlds in order since each world introduces a new mechanic.</p>
                <p>The difficulty of each puzzle is indicated by its color:</p>
                <ul>
                    <li style={{ color: 'green' }}>Easy</li>
                    <li style={{ color: '#ffe734' }}>Medium</li>
                    <li style={{ color: 'red' }}>Hard</li>
                    <li style={{ color: '#bc00ac' }}>Expert</li>
                    <li style={{ color: 'black' }} className="rainbow-text">Insane</li>
                </ul>
                <p>Controls:</p>
                <ul>
                    <li>Drag and drop mines with left mouse button.</li>
                    <li>Right clicking a cell will reveal more information about the cell.</li>
                    <li>Toggling the mode to "Value" will show the current value of each number and additional information for each mine.</li>
                </ul>
                <p>Inspiration:</p>
                <ul>
                    <li>The concept of "Reverse Minesweeper" is obviously inspired by the classic game Minesweeper.</li>
                    <li>The puzzles and mechanics are also inspired by the Baba is You custom levelpack "Sokoban x Minesweeper" by proamateur.</li>
                    <li>I couldn't find the original source, but I was inspired to make this because of Icely Puzzles and their playthrough.</li>
                    <a href="https://www.youtube.com/watch?v=3yNbV9A48Xo&list=PLg5Ta3CWcYX4bPpCMoRRyHeMNyeq9VnY4">
                    <img src="/baba_reverse_minesweeper.png" alt="Icely Puzzles Video Showcase" style={{ width: 200, marginTop: 10 }} />
                    </a>
                </ul>
            </div>
        </div>
    );
}