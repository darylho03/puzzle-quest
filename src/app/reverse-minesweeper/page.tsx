import ReverseMinesweeper from '../../components/ReverseMinesweeper';

export default function HomePage() {
    return (
        <div className="app">
            <div className="description">
                <p>Reverse Minesweeper Rules:</p>
                <p>Drag and drop mines while following these rules:</p>
                <ul>
                    <li>All numbers must see the correct number of mines in their cell and their adjacent cells (orthogonally and diagonally).</li>
                </ul>
            </div>
            <ReverseMinesweeper />
        </div>
    );
}