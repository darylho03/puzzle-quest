import Queens from '../../components/Queens';

export default function HomePage() {
    return (
        <div className="app">
            <div className="description">
                <p>Queens Rules:</p>
                <p>Place 1 queen in each row and column while following these rules:</p>
                <ul>
                    <li>Each row, column, and colored region must contain exactly 1 queen.</li>
                    <li>No two queens can touch each other (orthogonally and diagonally).</li>
                </ul>
            </div>
            <Queens />
        </div>
    );
}