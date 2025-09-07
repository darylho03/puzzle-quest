import Sudoku from '../../components/Sudoku';

export default function HomePage() {
    return (
        <div className="app">
            <div className="description">
                <p>Sudoku Rules:</p>
                <p>Fill the grid with numbers 1-9 while following these rules:</p>
                <ul>
                    <li>Each row must contain the numbers 1-9 without repetition.</li>
                    <li>Each column must contain the numbers 1-9 without repetition.</li>
                    <li>Each 3x3 box must contain the numbers 1-9 without repetition.</li>
                </ul>
            </div>
            <Sudoku />
        </div>
    );
}