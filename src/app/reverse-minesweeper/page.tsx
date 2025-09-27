import ReverseMinesweeper from '../../components/ReverseMinesweeper';

export default function HomePage() {
    return (
        <div className="app">
            <ReverseMinesweeper />
            <div className="description">
                <p>Reverse Minesweeper Rules:</p>
                <p>Drag and drop mines while following these rules:</p>
                <ul>
                    <li>All numbers must see the correct number of mines in their cell and their adjacent cells (orthogonally and diagonally).</li>
                </ul>
                <p>The difficulty of each puzzle is indicated by its color:</p>
                <ul>
                    <li style={{ color: 'green' }}>Easy</li>
                    <li style={{ color: '#ffe734' }}>Medium</li>
                    <li style={{ color: 'red' }}>Hard</li>
                    <li style={{ color: '#bc00ac' }}>Expert</li>
                    <li style={{ color: 'black' }} className="rainbow-text">Insane</li>
                </ul>
            </div>
        </div>
    );
}